<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

echo "<h1>Diagnostic Report</h1>";

if (file_exists('vendor/autoload.php')) {
    echo "<p style='color:green'>vendor/autoload.php exists!</p>";
    require_once 'vendor/autoload.php';
    if (class_exists('\Firebase\JWT\JWT')) {
        echo "<p style='color:green'>JWT library loaded successfully!</p>";
    } else {
        echo "<p style='color:red'>JWT library class not found!</p>";
    }
} else {
    echo "<p style='color:red'>vendor/autoload.php DOES NOT EXIST. The vendor folder was not uploaded correctly!</p>";
}

require_once 'config/Database.php';
$db = new Database();
$conn = $db->getConnection();
if ($conn) {
    echo "<p style='color:green'>Database connected successfully!</p>";
} else {
    echo "<p style='color:red'>Database connection failed!</p>";
}
?>
