<?php
include 'db.php';
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["success" => false, "error" => "Not logged in"]);
    exit;
}

$user_id = $_SESSION['user_id'];
$meme_url = $_POST['meme_url'];

$stmt = $conn->prepare("INSERT INTO likes (user_id, meme_url) VALUES (?, ?)
    ON DUPLICATE KEY UPDATE meme_url = meme_url");
$stmt->bind_param("is", $user_id, $meme_url);

echo $stmt->execute() ?
    json_encode(["success" => true]) :
    json_encode(["success" => false, "error" => $stmt->error]);
?>
