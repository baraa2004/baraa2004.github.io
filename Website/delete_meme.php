<?php
session_start();
include 'db.php';

if (!isset($_SESSION['user_id'])) {
    header('Location: loginpage.php');
    exit;
}

$meme_id = $_GET['id'] ?? null;
$user_id = $_SESSION['user_id'];

if (!$meme_id) {
    echo "No meme ID specified.";
    exit;
}

$stmt = $conn->prepare("DELETE FROM memes WHERE id = ? AND user_id = ?");
$stmt->bind_param("ii", $meme_id, $user_id);
$stmt->execute();

header("Location: feed.php");
exit;
?>
