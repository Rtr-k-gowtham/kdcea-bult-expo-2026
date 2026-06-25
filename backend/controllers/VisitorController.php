<?php
require_once __DIR__ . '/config/Database.php';

class VisitorController {
    private $db;

    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
    }

    /**
     * Register a new visitor (public endpoint).
     */
    public function register($data) {
        if (empty($data->name) || empty($data->mobile)) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Name and mobile number are required."]);
            return;
        }

        // Check if mobile already registered
        $checkStmt = $this->db->prepare("SELECT id, visitor_id, name, mobile, status, created_at FROM visitors WHERE mobile = :mobile");
        $checkStmt->execute([':mobile' => $data->mobile]);
        if ($checkStmt->rowCount() > 0) {
            $existing = $checkStmt->fetch(PDO::FETCH_ASSOC);
            echo json_encode([
                "status" => "success",
                "message" => "You are already registered!",
                "data" => $existing,
                "already_registered" => true
            ]);
            return;
        }

        // Generate Visitor ID: EVT-2026-XXXX
        $countStmt = $this->db->query("SELECT COUNT(*) as total FROM visitors");
        $count = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];
        $nextId = $count + 1;
        $visitorId = 'EVT-2026-' . str_pad($nextId, 4, '0', STR_PAD_LEFT);

        // Ensure uniqueness
        $uniqueCheck = $this->db->prepare("SELECT id FROM visitors WHERE visitor_id = :vid");
        $uniqueCheck->execute([':vid' => $visitorId]);
        while ($uniqueCheck->rowCount() > 0) {
            $nextId++;
            $visitorId = 'EVT-2026-' . str_pad($nextId, 4, '0', STR_PAD_LEFT);
            $uniqueCheck->execute([':vid' => $visitorId]);
        }

        // Set timezone to IST
        date_default_timezone_set('Asia/Kolkata');

        $stmt = $this->db->prepare("INSERT INTO visitors (visitor_id, name, mobile) VALUES (:visitor_id, :name, :mobile)");
        $stmt->execute([
            ':visitor_id' => $visitorId,
            ':name' => $data->name,
            ':mobile' => $data->mobile,
        ]);

        $insertedId = $this->db->lastInsertId();
        $fetchStmt = $this->db->prepare("SELECT id, visitor_id, name, mobile, status, created_at FROM visitors WHERE id = :id");
        $fetchStmt->execute([':id' => $insertedId]);
        $visitor = $fetchStmt->fetch(PDO::FETCH_ASSOC);

        echo json_encode([
            "status" => "success",
            "message" => "Visitor registered successfully!",
            "data" => $visitor
        ]);
    }

    /**
     * Get dashboard stats for admin (protected).
     */
    public function getVisitorStats() {
        date_default_timezone_set('Asia/Kolkata');
        $today = date('Y-m-d');

        $totalStmt = $this->db->query("SELECT COUNT(*) as total FROM visitors");
        $total = $totalStmt->fetch(PDO::FETCH_ASSOC)['total'];

        $todayStmt = $this->db->prepare("SELECT COUNT(*) as total FROM visitors WHERE DATE(created_at) = :today");
        $todayStmt->execute([':today' => $today]);
        $todayCount = $todayStmt->fetch(PDO::FETCH_ASSOC)['total'];

        $checkedInStmt = $this->db->query("SELECT COUNT(*) as total FROM visitors WHERE status = 'Checked In'");
        $checkedIn = $checkedInStmt->fetch(PDO::FETCH_ASSOC)['total'];

        $pendingStmt = $this->db->query("SELECT COUNT(*) as total FROM visitors WHERE status = 'Pending'");
        $pending = $pendingStmt->fetch(PDO::FETCH_ASSOC)['total'];

        $recentStmt = $this->db->query("SELECT id, visitor_id, name, mobile, status, created_at FROM visitors ORDER BY created_at DESC LIMIT 10");
        $recent = $recentStmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            "status" => "success",
            "data" => [
                "total_visitors" => (int)$total,
                "today_visitors" => (int)$todayCount,
                "checked_in" => (int)$checkedIn,
                "pending" => (int)$pending,
                "recent" => $recent
            ]
        ]);
    }

    /**
     * Search visitors by ID, name, or mobile (protected).
     */
    public function search($query) {
        if (empty($query)) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Search query is required."]);
            return;
        }

        $searchTerm = '%' . $query . '%';
        $stmt = $this->db->prepare("SELECT id, visitor_id, name, mobile, status, entry_staff, entry_date, entry_time, created_at FROM visitors WHERE visitor_id LIKE :q1 OR name LIKE :q2 OR mobile LIKE :q3 ORDER BY created_at DESC");
        $stmt->execute([':q1' => $searchTerm, ':q2' => $searchTerm, ':q3' => $searchTerm]);
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            "status" => "success",
            "data" => $results
        ]);
    }

    /**
     * Get all visitors (protected).
     */
    public function getAllVisitors() {
        $stmt = $this->db->query("SELECT id, visitor_id, name, mobile, status, entry_staff, entry_date, entry_time, created_at FROM visitors ORDER BY created_at DESC");
        $visitors = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            "status" => "success",
            "data" => $visitors
        ]);
    }

    /**
     * Check in a visitor (protected).
     */
    public function checkIn($data) {
        if (empty($data->visitor_id) && empty($data->mobile)) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Visitor ID or mobile number is required."]);
            return;
        }

        // Find visitor
        if (!empty($data->visitor_id)) {
            $stmt = $this->db->prepare("SELECT * FROM visitors WHERE visitor_id = :vid");
            $stmt->execute([':vid' => $data->visitor_id]);
        } else {
            $stmt = $this->db->prepare("SELECT * FROM visitors WHERE mobile = :mobile");
            $stmt->execute([':mobile' => $data->mobile]);
        }

        $visitor = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$visitor) {
            http_response_code(404);
            echo json_encode(["status" => "error", "message" => "Visitor not found."]);
            return;
        }

        // Prevent duplicate check-in
        if ($visitor['status'] === 'Checked In') {
            http_response_code(400);
            echo json_encode([
                "status" => "error",
                "message" => "Visitor has already been checked in.",
                "data" => $visitor
            ]);
            return;
        }

        // Set IST timezone
        date_default_timezone_set('Asia/Kolkata');
        $entryDate = date('Y-m-d');
        $entryTime = date('H:i:s');
        $entryStaff = $data->entry_staff ?? 'Admin';

        $updateStmt = $this->db->prepare("UPDATE visitors SET status = 'Checked In', entry_date = :entry_date, entry_time = :entry_time, entry_staff = :entry_staff WHERE id = :id");
        $updateStmt->execute([
            ':entry_date' => $entryDate,
            ':entry_time' => $entryTime,
            ':entry_staff' => $entryStaff,
            ':id' => $visitor['id']
        ]);

        // Fetch updated record
        $fetchStmt = $this->db->prepare("SELECT id, visitor_id, name, mobile, status, entry_staff, entry_date, entry_time, created_at FROM visitors WHERE id = :id");
        $fetchStmt->execute([':id' => $visitor['id']]);
        $updated = $fetchStmt->fetch(PDO::FETCH_ASSOC);

        echo json_encode([
            "status" => "success",
            "message" => "Visitor checked in successfully!",
            "data" => $updated
        ]);
    }
}
