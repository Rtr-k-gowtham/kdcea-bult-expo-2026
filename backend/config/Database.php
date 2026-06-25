<?php
class Database {
    // These will be overridden by Hostinger environment, but we provide defaults for local testing
    private $host = "localhost";
    private $db_name = "u589483802_kcea";
    private $username = "u589483802_kcea";
    private $password = "Kcea@2026";
    public $conn;

    public function getConnection() {
        $this->conn = null;

        try {
            $this->conn = new PDO("mysql:host=" . $this->host . ";dbname=" . $this->db_name, $this->username, $this->password);
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->conn->exec("set names utf8");
        } catch(PDOException $exception) {
            echo "Connection error: " . $exception->getMessage();
        }

        return $this->conn;
    }
}
