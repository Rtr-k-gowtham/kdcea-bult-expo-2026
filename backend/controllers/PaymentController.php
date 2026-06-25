<?php
require_once __DIR__ . '/../config/Database.php';

class PaymentController {
    private $conn;

    public function __construct() {
        $db = new Database();
        $this->conn = $db->getConnection();
    }

    public function getPayments($booking_id) {
        $query = "SELECT * FROM payments WHERE booking_id = :booking_id ORDER BY payment_date DESC, id DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':booking_id', $booking_id);
        $stmt->execute();
        
        echo json_encode([
            "status" => "success", 
            "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)
        ]);
    }

    public function addPayment($data) {
        if (!isset($data->booking_id) || !isset($data->amount) || !isset($data->payment_mode) || !isset($data->payment_date)) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Missing required fields"]);
            return;
        }

        $query = "INSERT INTO payments (booking_id, amount, payment_mode, payment_date, reference_no, remarks) 
                  VALUES (:booking_id, :amount, :payment_mode, :payment_date, :reference_no, :remarks)";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":booking_id", $data->booking_id);
        $stmt->bindParam(":amount", $data->amount);
        $stmt->bindParam(":payment_mode", $data->payment_mode);
        $stmt->bindParam(":payment_date", $data->payment_date);
        
        $ref_no = $data->reference_no ?? '';
        $stmt->bindParam(":reference_no", $ref_no);
        
        $remarks = $data->remarks ?? '';
        $stmt->bindParam(":remarks", $remarks);

        if($stmt->execute()) {
            http_response_code(201);
            echo json_encode(["status" => "success", "message" => "Payment recorded successfully"]);
        } else {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Failed to record payment"]);
        }
    }
}
