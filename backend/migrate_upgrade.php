<?php
require_once __DIR__ . '/config/Database.php';

$db = new Database();
$conn = $db->getConnection();

echo "Starting Database Migration...\n";

try {
    // 1. Alter halls table
    $conn->exec("ALTER TABLE halls ADD COLUMN IF NOT EXISTS hall_code VARCHAR(20) DEFAULT NULL AFTER hall_name");
    $conn->exec("ALTER TABLE halls ADD COLUMN IF NOT EXISTS description TEXT DEFAULT NULL AFTER hall_code");
    $conn->exec("ALTER TABLE halls ADD COLUMN IF NOT EXISTS status ENUM('Active', 'Inactive') DEFAULT 'Active' AFTER description");
    echo "Halls table updated.\n";

    // 2. Alter categories table
    $conn->exec("ALTER TABLE categories ADD COLUMN IF NOT EXISTS description TEXT DEFAULT NULL AFTER category_name");
    $conn->exec("ALTER TABLE categories ADD COLUMN IF NOT EXISTS status ENUM('Active', 'Inactive') DEFAULT 'Active' AFTER description");
    echo "Categories table updated.\n";

    // 3. Alter stalls table
    $conn->exec("ALTER TABLE stalls ADD COLUMN IF NOT EXISTS stall_size VARCHAR(50) DEFAULT '3m x 3m' AFTER stall_no");
    $conn->exec("ALTER TABLE stalls ADD COLUMN IF NOT EXISTS tariff_amount DECIMAL(10,2) DEFAULT '50000.00' AFTER stall_size");
    echo "Stalls table updated.\n";

    echo "Migration Completed Successfully!\n";
} catch (Exception $e) {
    echo "Migration Failed: " . $e->getMessage() . "\n";
}
