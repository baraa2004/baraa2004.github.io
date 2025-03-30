<?php
include 'db.php';
session_start();
header('Content-Type: application/json');

$user_id = $_SESSION['user_id'];
$stmt = $conn->prepare("DELETE FROM users WHERE id = ?");
$stmt->bind_param("i", $user_id);
if ($stmt->execute()) {
    session_destroy();
    echo json_encode(["success" => true]);
} else {
    echo json_encode(["success" => false]);
}
?>