<?php
session_start();
include 'db.php';

if (!isset($_SESSION['user_id'])) {
    header('Location: loginpage.php');
    exit;
}

$user_id = $_SESSION['user_id'];
$meme_id = $_GET['id'] ?? null;

if (!$meme_id) {
    echo "No meme ID provided.";
    exit;
}

$stmt = $conn->prepare("SELECT title, url FROM memes WHERE id = ? AND user_id = ?");
$stmt->bind_param("ii", $meme_id, $user_id);
$stmt->execute();
$stmt->bind_result($title, $url);
if (!$stmt->fetch()) {
    echo "Meme not found or not yours.";
    exit;
}
$stmt->close();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Edit Meme</title>
    <link rel="stylesheet" href="styles.css">
    <link rel="stylesheet" href="profile_feed.css">
</head>
<body>
    <nav>
        <a href="explore.php">Explore</a>
        <a href="saves.php">Saved</a>
        <a href="feed.php" class="active">Feed</a>
        <a href="profile.php">Profile</a>
        <a href="logout.php">Logout</a>
    </nav>
    <div class="profile-container">
        <h1>Edit Your Meme</h1>
        <form action="update_meme.php" method="POST">
            <input type="hidden" name="id" value="<?php echo htmlspecialchars($meme_id); ?>">
            <input type="text" name="title" value="<?php echo htmlspecialchars($title); ?>" required>
            <input type="text" name="url" value="<?php echo htmlspecialchars($url); ?>" required>
            <button type="submit">Save Changes</button>
        </form>
    </div>
</body>
</html>
