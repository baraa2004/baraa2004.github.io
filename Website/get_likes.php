<?php
include 'db.php';
session_start();
header('Content-Type: application/json');

$meme_url = $_GET['meme_url'] ?? '';

$stmt = $conn->prepare("SELECT COUNT(*) FROM likes WHERE meme_url = ?");
$stmt->bind_param("s", $meme_url);
$stmt->execute();
$stmt->bind_result($count);
$stmt->fetch();
echo json_encode(["likes" => $count]);
?>
