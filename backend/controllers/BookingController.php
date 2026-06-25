<?php
require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../utils/PdfGenerator.php';
require_once __DIR__ . '/../utils/EmailSender.php';

class BookingController {
    private $conn;

    public function __construct() {
        $db = new Database();
        $this->conn = $db->getConnection();
    }

    public function createBooking() {
        if(!isset($_POST['company_name'])) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Invalid data"]);
            return;
        }

        // Handle File Uploads
        $logo_path = "";
        $profile_path = "";
        
        $uploadDir = __DIR__ . '/../uploads/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        if(isset($_FILES['logo']) && $_FILES['logo']['error'] === UPLOAD_ERR_OK) {
            $logo_name = time() . '_' . $_FILES['logo']['name'];
            move_uploaded_file($_FILES['logo']['tmp_name'], $uploadDir . $logo_name);
            $logo_path = 'uploads/' . $logo_name;
        }

        if(isset($_FILES['profile']) && $_FILES['profile']['error'] === UPLOAD_ERR_OK) {
            $profile_name = time() . '_' . $_FILES['profile']['name'];
            move_uploaded_file($_FILES['profile']['tmp_name'], $uploadDir . $profile_name);
            $profile_path = 'uploads/' . $profile_name;
        }

        // Update Stall status to pending
        $stall_id = $_POST['stall_id'];
        $updateStall = "UPDATE stalls SET status = 'Pending' WHERE id = :stall_id AND status = 'Available'";
        $stmtStall = $this->conn->prepare($updateStall);
        $stmtStall->bindParam(':stall_id', $stall_id);
        $stmtStall->execute();

        if($stmtStall->rowCount() === 0) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Stall is no longer available"]);
            return;
        }

        $query = "INSERT INTO bookings (company_name, contact_person, mobile, email, address, category_id, hall_id, stall_id, product_description, logo_path, profile_path) 
                  VALUES (:company_name, :contact_person, :mobile, :email, :address, :category_id, :hall_id, :stall_id, :product_description, :logo_path, :profile_path)";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":company_name", $_POST['company_name']);
        $stmt->bindParam(":contact_person", $_POST['contact_person']);
        $stmt->bindParam(":mobile", $_POST['mobile']);
        $stmt->bindParam(":email", $_POST['email']);
        $stmt->bindParam(":address", $_POST['address']);
        $stmt->bindParam(":category_id", $_POST['category_id']);
        $stmt->bindParam(":hall_id", $_POST['hall_id']);
        $stmt->bindParam(":stall_id", $_POST['stall_id']);
        $stmt->bindParam(":product_description", $_POST['product_description']);
        $stmt->bindParam(":logo_path", $logo_path);
        $stmt->bindParam(":profile_path", $profile_path);

        if($stmt->execute()) {
            http_response_code(201);
            echo json_encode(["status" => "success", "message" => "Application submitted successfully"]);
        } else {
            // Revert stall
            $revert = "UPDATE stalls SET status = 'Available' WHERE id = :stall_id";
            $rstmt = $this->conn->prepare($revert);
            $rstmt->bindParam(':stall_id', $stall_id);
            $rstmt->execute();

            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Failed to submit application"]);
        }
    }

    public function getBookings() {
        $query = "SELECT b.*, h.hall_name, s.stall_no, s.tariff_amount, c.category_name, 
                         IFNULL((SELECT SUM(amount) FROM payments WHERE booking_id = b.id), 0) as amount_paid
                  FROM bookings b 
                  LEFT JOIN halls h ON b.hall_id = h.id 
                  LEFT JOIN stalls s ON b.stall_id = s.id
                  LEFT JOIN categories c ON b.category_id = c.id
                  ORDER BY CAST(s.stall_no AS UNSIGNED) ASC, s.stall_no ASC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        echo json_encode(["status" => "success", "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
    }

    public function approveBooking($data) {
        $id = $data->id;

        // Generate Booking ID KBE26-0001
        $queryStr = "SELECT COUNT(id) as total FROM bookings WHERE status = 'Approved'";
        $stmtCount = $this->conn->prepare($queryStr);
        $stmtCount->execute();
        $row = $stmtCount->fetch(PDO::FETCH_ASSOC);
        $count = $row['total'] + 1;
        $booking_id = "KBE26-" . str_pad($count, 4, "0", STR_PAD_LEFT);

        $query = "UPDATE bookings SET status = 'Approved', booking_id = :booking_id, approved_at = NOW() WHERE id = :id AND status = 'Pending'";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':booking_id', $booking_id);
        $stmt->bindParam(':id', $id);
        
        if($stmt->execute() && $stmt->rowCount() > 0) {
            // Lock Stall
            $stallQuery = "UPDATE stalls SET status = 'Locked' WHERE id = (SELECT stall_id FROM bookings WHERE id = :id)";
            $stallStmt = $this->conn->prepare($stallQuery);
            $stallStmt->bindParam(':id', $id);
            $stallStmt->execute();

            // Fetch Data for PDF & Email (Optional if you need to use later)
            // $fetchQ = "SELECT b.*, h.hall_name, s.stall_no, c.category_name FROM bookings b 
            //            JOIN halls h ON b.hall_id = h.id 
            //            JOIN stalls s ON b.stall_id = s.id 
            //            JOIN categories c ON b.category_id = c.id
            //            WHERE b.id = :id";
            // $fStmt = $this->conn->prepare($fetchQ);
            // $fStmt->bindParam(':id', $id);
            // $fStmt->execute();
            // $bookingData = $fStmt->fetch(PDO::FETCH_ASSOC);

            // Generate PDF (Disabled: Missing Composer)
            // $pdfGen = new PdfGenerator();
            // $pdfPath = $pdfGen->generateBookingSlip($bookingData);

            // Send Email (Disabled: Missing Composer)
            // $emailer = new EmailSender();
            // $emailer->sendApprovalEmail($bookingData['email'], $pdfPath, $bookingData);

            echo json_encode(["status" => "success", "message" => "Booking approved"]);
        } else {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Failed to approve"]);
        }
    }

    public function rejectBooking($data) {
        $id = $data->id;

        $query = "UPDATE bookings SET status = 'Rejected' WHERE id = :id AND status = 'Pending'";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id);
        
        if($stmt->execute() && $stmt->rowCount() > 0) {
            // Free Stall
            $stallQuery = "UPDATE stalls SET status = 'Available' WHERE id = (SELECT stall_id FROM bookings WHERE id = :id)";
            $stallStmt = $this->conn->prepare($stallQuery);
            $stallStmt->bindParam(':id', $id);
            $stallStmt->execute();

            // Fetch Data for Email (Optional)
            // $fetchQ = "SELECT * FROM bookings WHERE id = :id";
            // $fStmt = $this->conn->prepare($fetchQ);
            // $fStmt->bindParam(':id', $id);
            // $fStmt->execute();
            // $bookingData = $fStmt->fetch(PDO::FETCH_ASSOC);

            // Send Email (Disabled: Missing Composer)
            // $emailer = new EmailSender();
            // $emailer->sendRejectionEmail($bookingData['email'], $bookingData);

            echo json_encode(["status" => "success", "message" => "Booking rejected"]);
        } else {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Failed to reject"]);
        }
    }

    public function getDashboardStats() {
        $stats = [
            'total_stalls' => 0,
            'available_stalls' => 0,
            'pending' => 0,
            'approved' => 0,
            'rejected' => 0,
            'total_revenue' => 0
        ];

        // Total stalls and available stalls
        $q1 = "SELECT COUNT(*) as total, SUM(CASE WHEN status = 'Available' THEN 1 ELSE 0 END) as available FROM stalls";
        $stmt1 = $this->conn->prepare($q1);
        $stmt1->execute();
        $stallData = $stmt1->fetch(PDO::FETCH_ASSOC);
        $stats['total_stalls'] = $stallData['total'] ?? 0;
        $stats['available_stalls'] = $stallData['available'] ?? 0;

        // Bookings count by status
        $q2 = "SELECT status, COUNT(*) as cnt FROM bookings GROUP BY status";
        $stmt2 = $this->conn->prepare($q2);
        $stmt2->execute();
        while($row = $stmt2->fetch(PDO::FETCH_ASSOC)) {
            if($row['status'] == 'Pending') $stats['pending'] = $row['cnt'];
            if($row['status'] == 'Approved') $stats['approved'] = $row['cnt'];
            if($row['status'] == 'Rejected') $stats['rejected'] = $row['cnt'];
        }

        // Calculate Revenue from Approved bookings
        $q3 = "SELECT SUM(s.tariff_amount) as total_rev FROM bookings b JOIN stalls s ON b.stall_id = s.id WHERE b.status = 'Approved'";
        $stmt3 = $this->conn->prepare($q3);
        $stmt3->execute();
        $stats['total_revenue'] = $stmt3->fetch(PDO::FETCH_ASSOC)['total_rev'] ?? 0;

        // --- NEW CHARTS DATA ---
        
        // 1. Timeline: Bookings per day (Last 30 Days)
        $q4 = "SELECT DATE(created_at) as date, COUNT(*) as count FROM bookings WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) GROUP BY DATE(created_at) ORDER BY date ASC";
        $stmt4 = $this->conn->prepare($q4);
        $stmt4->execute();
        $stats['timeline'] = $stmt4->fetchAll(PDO::FETCH_ASSOC);

        // 2. Hall Occupancy
        $q5 = "SELECT h.hall_name, 
               SUM(CASE WHEN s.status != 'Available' THEN 1 ELSE 0 END) as booked,
               SUM(CASE WHEN s.status = 'Available' THEN 1 ELSE 0 END) as available
               FROM halls h LEFT JOIN stalls s ON h.id = s.hall_id 
               GROUP BY h.id, h.hall_name";
        $stmt5 = $this->conn->prepare($q5);
        $stmt5->execute();
        $stats['hall_occupancy'] = $stmt5->fetchAll(PDO::FETCH_ASSOC);

        // 3. Category Popularity (Top 5 Categories by bookings)
        $q6 = "SELECT c.category_name as name, COUNT(b.id) as value 
               FROM categories c LEFT JOIN bookings b ON c.id = b.category_id 
               GROUP BY c.id, c.category_name 
               HAVING value > 0
               ORDER BY value DESC LIMIT 5";
        $stmt6 = $this->conn->prepare($q6);
        $stmt6->execute();
        $stats['category_stats'] = $stmt6->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(["status" => "success", "data" => $stats]);
    }
}
