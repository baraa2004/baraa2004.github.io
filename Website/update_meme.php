<?php
session_start();
include 'db.php';

if (!isset($_SESSION['user_id'])) {
    header('Location: loginpage.php');
    exit;
}

$user_id = $_SESSION['user_id'];
$meme_id = $_POST['id'];
$title = trim($_POST['title']);
$url = trim($_POST['url']);

$stmt = $conn->prepare("UPDATE memes SET title = ?, url = ? WHERE id = ? AND user_id = ?");
$stmt->bind_param("ssii", $title, $url, $meme_id, $user_id);
$stmt->execute();

header("Location: feed.php");
exit;
?>
