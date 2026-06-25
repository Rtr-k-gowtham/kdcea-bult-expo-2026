<?php
require_once __DIR__ . '/../config/Database.php';
// Namespaces removed

class AuthController {
    private $conn;
    private $secret_key = "KBE2026_SECRET_KEY_CHANGE_IN_PROD";

    public function __construct() {
        $db = new Database();
        $this->conn = $db->getConnection();
    }

    public function login($data) {
        if(!isset($data->username) || !isset($data->password)) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Incomplete data."]);
            return;
        }

        $query = "SELECT id, username, password_hash FROM admins WHERE username = :username LIMIT 0,1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':username', $data->username);
        $stmt->execute();
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if($user && password_verify($data->password, $user['password_hash'])) {
            $issuer_claim = "KBE2026";
            $audience_claim = "KBE2026_ADMIN";
            $issuedat_claim = time(); 
            $notbefore_claim = $issuedat_claim; 
            $expire_claim = $issuedat_claim + 86400; // 24 hours

            $token = array(
                "iss" => $issuer_claim,
                "aud" => $audience_claim,
                "iat" => $issuedat_claim,
                "nbf" => $notbefore_claim,
                "exp" => $expire_claim,
                "data" => array(
                    "id" => $user['id'],
                    "username" => $user['username']
                )
            );

            http_response_code(200);
            $jwt = JWT::encode($token, $this->secret_key);
            echo json_encode(
                array(
                    "status" => "success",
                    "message" => "Successful login.",
                    "jwt" => $jwt,
                )
            );
        } else {
            http_response_code(401);
            echo json_encode(["status" => "error", "message" => "Login failed. Incorrect credentials."]);
        }
    }

    public function verifyToken() {
        $headers = apache_request_headers();
        $authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : '';
        if(!$authHeader) return false;

        $arr = explode(" ", $authHeader);
        $jwt = $arr[1] ?? '';

        if($jwt){
            try {
                $decoded = JWT::decode($jwt, $this->secret_key);
                return $decoded->data;
            } catch (Exception $e){
                return false;
            }
        }
        return false;
    }
}
