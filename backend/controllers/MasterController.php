<?php
require_once __DIR__ . '/../config/Database.php';

class MasterController {
    private $conn;

    public function __construct() {
        $db = new Database();
        $this->conn = $db->getConnection();
    }

    // ==========================================
    // HALL MANAGEMENT
    // ==========================================
    public function getHalls() {
        $query = "SELECT * FROM halls WHERE status = 'Active' ORDER BY id ASC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        echo json_encode(["status" => "success", "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
    }

    public function getAllHalls() {
        $query = "SELECT * FROM halls ORDER BY id ASC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        echo json_encode(["status" => "success", "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
    }

    public function addHall($data) {
        if(!isset($data->hall_name)) { http_response_code(400); echo json_encode(["status" => "error", "message" => "Hall name required"]); return; }
        
        $query = "INSERT INTO halls (hall_name, hall_code, description, status) VALUES (:name, :code, :desc, :status)";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":name", $data->hall_name);
        $code = $data->hall_code ?? null;
        $desc = $data->description ?? null;
        $status = $data->status ?? 'Active';
        $stmt->bindParam(":code", $code);
        $stmt->bindParam(":desc", $desc);
        $stmt->bindParam(":status", $status);
        
        if($stmt->execute()) {
            echo json_encode(["status" => "success", "message" => "Hall added successfully"]);
        } else {
            http_response_code(500); echo json_encode(["status" => "error", "message" => "Failed to add hall"]);
        }
    }

    public function updateHall($data) {
        $query = "UPDATE halls SET hall_name = :name, hall_code = :code, description = :desc, status = :status WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":name", $data->hall_name);
        $stmt->bindParam(":code", $data->hall_code);
        $stmt->bindParam(":desc", $data->description);
        $stmt->bindParam(":status", $data->status);
        $stmt->bindParam(":id", $data->id);
        
        if($stmt->execute()) {
            echo json_encode(["status" => "success", "message" => "Hall updated successfully"]);
        } else {
            http_response_code(500); echo json_encode(["status" => "error", "message" => "Failed to update hall"]);
        }
    }

    public function deleteHall($data) {
        $query = "DELETE FROM halls WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $data->id);
        if($stmt->execute()) {
            echo json_encode(["status" => "success", "message" => "Hall deleted successfully"]);
        } else {
            http_response_code(500); echo json_encode(["status" => "error", "message" => "Failed to delete hall. It may be in use."]);
        }
    }

    // ==========================================
    // CATEGORY MANAGEMENT
    // ==========================================
    public function getCategories() {
        $query = "SELECT c.*, h.hall_name FROM categories c LEFT JOIN halls h ON c.hall_id = h.id ORDER BY c.id ASC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        echo json_encode(["status" => "success", "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
    }

    public function addCategory($data) {
        if(!isset($data->category_name) || !isset($data->hall_id)) { http_response_code(400); echo json_encode(["status" => "error", "message" => "Category name and Hall required"]); return; }
        
        $query = "INSERT INTO categories (category_name, hall_id, description, status) VALUES (:name, :hall_id, :desc, :status)";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":name", $data->category_name);
        $stmt->bindParam(":hall_id", $data->hall_id);
        $desc = $data->description ?? null;
        $status = $data->status ?? 'Active';
        $stmt->bindParam(":desc", $desc);
        $stmt->bindParam(":status", $status);
        
        if($stmt->execute()) {
            echo json_encode(["status" => "success", "message" => "Category added successfully"]);
        } else {
            http_response_code(500); echo json_encode(["status" => "error", "message" => "Failed to add category"]);
        }
    }

    public function updateCategory($data) {
        $query = "UPDATE categories SET category_name = :name, hall_id = :hall_id, description = :desc, status = :status WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":name", $data->category_name);
        $stmt->bindParam(":hall_id", $data->hall_id);
        $stmt->bindParam(":desc", $data->description);
        $stmt->bindParam(":status", $data->status);
        $stmt->bindParam(":id", $data->id);
        
        if($stmt->execute()) {
            echo json_encode(["status" => "success", "message" => "Category updated successfully"]);
        } else {
            http_response_code(500); echo json_encode(["status" => "error", "message" => "Failed to update category"]);
        }
    }

    public function deleteCategory($data) {
        $query = "DELETE FROM categories WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $data->id);
        if($stmt->execute()) {
            echo json_encode(["status" => "success", "message" => "Category deleted successfully"]);
        } else {
            http_response_code(500); echo json_encode(["status" => "error", "message" => "Failed to delete category."]);
        }
    }

    // ==========================================
    // STALL MANAGEMENT
    // ==========================================
    public function getAvailableStalls($hall_id) {
        $query = "SELECT * FROM stalls WHERE hall_id = :hall_id AND status = 'Available' ORDER BY id ASC";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":hall_id", $hall_id);
        $stmt->execute();
        echo json_encode(["status" => "success", "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
    }

    public function getStalls() {
        $query = "SELECT s.*, h.hall_name FROM stalls s LEFT JOIN halls h ON s.hall_id = h.id ORDER BY s.id ASC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        echo json_encode(["status" => "success", "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
    }

    public function addStall($data) {
        if(!isset($data->stall_no) || !isset($data->hall_id)) { http_response_code(400); echo json_encode(["status" => "error", "message" => "Stall number and Hall required"]); return; }
        
        $query = "INSERT INTO stalls (stall_no, hall_id, stall_size, tariff_amount, status) VALUES (:no, :hall_id, :size, :tariff, :status)";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":no", $data->stall_no);
        $stmt->bindParam(":hall_id", $data->hall_id);
        $size = $data->stall_size ?? '3m x 3m';
        $tariff = $data->tariff_amount ?? 50000;
        $status = $data->status ?? 'Available';
        $stmt->bindParam(":size", $size);
        $stmt->bindParam(":tariff", $tariff);
        $stmt->bindParam(":status", $status);
        
        try {
            if($stmt->execute()) {
                echo json_encode(["status" => "success", "message" => "Stall added successfully"]);
            } else {
                http_response_code(500); echo json_encode(["status" => "error", "message" => "Failed to add stall"]);
            }
        } catch (PDOException $e) {
            http_response_code(400); echo json_encode(["status" => "error", "message" => "Duplicate stall number in this hall"]);
        }
    }

    public function updateStall($data) {
        $query = "UPDATE stalls SET stall_no = :no, hall_id = :hall_id, stall_size = :size, tariff_amount = :tariff, status = :status WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":no", $data->stall_no);
        $stmt->bindParam(":hall_id", $data->hall_id);
        $stmt->bindParam(":size", $data->stall_size);
        $stmt->bindParam(":tariff", $data->tariff_amount);
        $stmt->bindParam(":status", $data->status);
        $stmt->bindParam(":id", $data->id);
        
        try {
            if($stmt->execute()) {
                echo json_encode(["status" => "success", "message" => "Stall updated successfully"]);
            } else {
                http_response_code(500); echo json_encode(["status" => "error", "message" => "Failed to update stall"]);
            }
        } catch (PDOException $e) {
            http_response_code(400); echo json_encode(["status" => "error", "message" => "Duplicate stall number in this hall"]);
        }
    }

    public function deleteStall($data) {
        $query = "DELETE FROM stalls WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $data->id);
        if($stmt->execute()) {
            echo json_encode(["status" => "success", "message" => "Stall deleted successfully"]);
        } else {
            http_response_code(500); echo json_encode(["status" => "error", "message" => "Failed to delete stall. It may be booked."]);
        }
    }

    public function bulkImportStalls($data) {
        if(!isset($data->stalls) || !is_array($data->stalls)) {
            http_response_code(400); echo json_encode(["status" => "error", "message" => "Invalid payload"]); return;
        }

        $imported = 0;
        $updated = 0;
        $failed = 0;

        foreach($data->stalls as $stall) {
            if(!isset($stall->hall_id) || !isset($stall->stall_no)) {
                $failed++;
                continue;
            }

            // Check if exists
            $checkQ = "SELECT id FROM stalls WHERE hall_id = :hall_id AND stall_no = :no";
            $cStmt = $this->conn->prepare($checkQ);
            $cStmt->bindParam(":hall_id", $stall->hall_id);
            $cStmt->bindParam(":no", $stall->stall_no);
            $cStmt->execute();

            $size = $stall->stall_size ?? '3m x 3m';
            $tariff = $stall->tariff_amount ?? 50000;

            if($cStmt->rowCount() > 0) {
                // Update
                $id = $cStmt->fetchColumn();
                $uQ = "UPDATE stalls SET stall_size = :size, tariff_amount = :tariff WHERE id = :id";
                $uStmt = $this->conn->prepare($uQ);
                $uStmt->bindParam(":size", $size);
                $uStmt->bindParam(":tariff", $tariff);
                $uStmt->bindParam(":id", $id);
                if($uStmt->execute()) $updated++; else $failed++;
            } else {
                // Insert
                $iQ = "INSERT INTO stalls (hall_id, stall_no, stall_size, tariff_amount, status) VALUES (:hall_id, :no, :size, :tariff, 'Available')";
                $iStmt = $this->conn->prepare($iQ);
                $iStmt->bindParam(":hall_id", $stall->hall_id);
                $iStmt->bindParam(":no", $stall->stall_no);
                $iStmt->bindParam(":size", $size);
                $iStmt->bindParam(":tariff", $tariff);
                if($iStmt->execute()) $imported++; else $failed++;
            }
        }

        echo json_encode([
            "status" => "success", 
            "data" => [
                "imported" => $imported,
                "updated" => $updated,
                "failed" => $failed,
                "total" => count($data->stalls)
            ]
        ]);
    }
}
