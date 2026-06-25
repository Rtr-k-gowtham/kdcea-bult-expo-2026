<?php
/**
 * Migration script: Create the `visitors` table.
 * Run this once via browser: http://yourdomain.com/backend/migrate_visitors.php
 */
require_once 'config/Database.php';

$database = new Database();
$db = $database->getConnection();

if (!$db) {
    die("Database connection failed.");
}

$sql = "CREATE TABLE IF NOT EXISTS visitors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    visitor_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    mobile VARCHAR(20) NOT NULL,
    status ENUM('Pending', 'Checked In') DEFAULT 'Pending',
    entry_staff VARCHAR(255) DEFAULT NULL,
    entry_date DATE DEFAULT NULL,
    entry_time TIME DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)";

try {
    $db->exec($sql);
    echo json_encode(["status" => "success", "message" => "Visitors table created successfully."]);
} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
