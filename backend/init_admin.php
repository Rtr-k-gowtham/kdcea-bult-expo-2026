<?php
require_once 'config/Database.php';

$db = new Database();
$conn = $db->getConnection();

$username = 'admin';
$password = 'admin123';
$hash = password_hash($password, PASSWORD_BCRYPT);

try {
    // Delete existing admin if any
    $conn->exec("DELETE FROM admins WHERE username = 'admin'");
    
    $query = "INSERT INTO admins (username, password_hash) VALUES (:username, :hash)";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':username', $username);
    $stmt->bindParam(':hash', $hash);
    
    if($stmt->execute()) {
        echo "<h1>Admin account initialized successfully!</h1>";
        echo "<p>Username: <strong>admin</strong></p>";
        echo "<p>Password: <strong>admin123</strong></p>";
        echo "<p style='color:red'>SECURITY WARNING: Please delete this init_admin.php file from your server immediately after running it.</p>";
    } else {
        echo "Failed to initialize admin.";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
