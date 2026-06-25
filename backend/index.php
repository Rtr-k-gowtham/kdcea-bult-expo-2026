<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: OPTIONS,GET,POST,PUT,DELETE");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

ini_set('display_errors', 1);
error_reporting(E_ALL);

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// We don't need composer autoload anymore
require_once 'utils/JWT.php';
require_once 'controllers/AuthController.php';
require_once 'controllers/MasterController.php';
require_once 'controllers/BookingController.php';
require_once 'controllers/PaymentController.php';

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri = str_replace('/backend', '', $uri);
$uriParts = explode('/', trim($uri, '/'));

// Fallback to simplistic routing
$action = $_GET['action'] ?? '';

$auth = new AuthController();
$master = new MasterController();
$booking = new BookingController();
$payment = new PaymentController();

if ($action === 'login') {
    $data = json_decode(file_get_contents("php://input"));
    $auth->login($data);
} elseif ($action === 'halls') {
    $master->getHalls();
} elseif ($action === 'categories') {
    $master->getCategories();
} elseif ($action === 'stalls' && isset($_GET['hall_id'])) {
    $master->getAvailableStalls($_GET['hall_id']);
} elseif ($action === 'all_stalls') {
    $master->getStalls();
} elseif ($action === 'book') {
    $booking->createBooking();
} elseif ($action === 'bookings') {
    if (!$auth->verifyToken()) {
        http_response_code(401);
        echo json_encode(["status" => "error", "message" => "Unauthorized"]);
        exit;
    }
    $booking->getBookings();
} elseif ($action === 'approve') {
    if (!$auth->verifyToken()) {
        http_response_code(401);
        echo json_encode(["status" => "error", "message" => "Unauthorized"]);
        exit;
    }
    $data = json_decode(file_get_contents("php://input"));
    $booking->approveBooking($data);
} elseif ($action === 'reject') {
    if (!$auth->verifyToken()) {
        http_response_code(401);
        echo json_encode(["status" => "error", "message" => "Unauthorized"]);
        exit;
    }
    $data = json_decode(file_get_contents("php://input"));
    $booking->rejectBooking($data);
} elseif ($action === 'stats') {
    if (!$auth->verifyToken()) {
        http_response_code(401);
        echo json_encode(["status" => "error", "message" => "Unauthorized"]);
        exit;
    }
    $booking->getDashboardStats();
} elseif ($action === 'admin_halls') {
    if (!$auth->verifyToken()) { http_response_code(401); echo json_encode(["status" => "error", "message" => "Unauthorized"]); exit; }
    if ($_SERVER['REQUEST_METHOD'] === 'GET') $master->getAllHalls();
    elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $data = json_decode(file_get_contents("php://input"));
        if(isset($_GET['subaction'])) {
            if($_GET['subaction'] === 'add') $master->addHall($data);
            elseif($_GET['subaction'] === 'edit') $master->updateHall($data);
            elseif($_GET['subaction'] === 'delete') $master->deleteHall($data);
        }
    }
} elseif ($action === 'admin_categories') {
    if (!$auth->verifyToken()) { http_response_code(401); echo json_encode(["status" => "error", "message" => "Unauthorized"]); exit; }
    if ($_SERVER['REQUEST_METHOD'] === 'GET') $master->getCategories();
    elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $data = json_decode(file_get_contents("php://input"));
        if(isset($_GET['subaction'])) {
            if($_GET['subaction'] === 'add') $master->addCategory($data);
            elseif($_GET['subaction'] === 'edit') $master->updateCategory($data);
            elseif($_GET['subaction'] === 'delete') $master->deleteCategory($data);
        }
    }
} elseif ($action === 'admin_stalls') {
    if (!$auth->verifyToken()) { http_response_code(401); echo json_encode(["status" => "error", "message" => "Unauthorized"]); exit; }
    if ($_SERVER['REQUEST_METHOD'] === 'GET') $master->getStalls();
    elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $data = json_decode(file_get_contents("php://input"));
        if(isset($_GET['subaction'])) {
            if($_GET['subaction'] === 'add') $master->addStall($data);
            elseif($_GET['subaction'] === 'edit') $master->updateStall($data);
            elseif($_GET['subaction'] === 'delete') $master->deleteStall($data);
            elseif($_GET['subaction'] === 'bulk') $master->bulkImportStalls($data);
        }
    }
} elseif ($action === 'payments') {
    if (!$auth->verifyToken()) {
        http_response_code(401);
        echo json_encode(["status" => "error", "message" => "Unauthorized"]);
        exit;
    }
    if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['booking_id'])) {
        $payment->getPayments($_GET['booking_id']);
    }
} elseif ($action === 'add_payment') {
    if (!$auth->verifyToken()) {
        http_response_code(401);
        echo json_encode(["status" => "error", "message" => "Unauthorized"]);
        exit;
    }
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $data = json_decode(file_get_contents("php://input"));
        $payment->addPayment($data);
    }
} else {
    http_response_code(404);
    echo json_encode(["status" => "error", "message" => "Endpoint not found"]);
}
