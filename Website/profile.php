<?php
session_start();
if (!isset($_SESSION['user_id'])) {
    header('Location: loginpage.php');
    exit;
}
include 'db.php';

$user_id = $_SESSION['user_id'];
$stmt = $conn->prepare("SELECT username, profile_picture FROM users WHERE id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$stmt->bind_result($username, $profile_picture);
$stmt->fetch();
$stmt->close();
$updated = isset($_GET['updated']);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Profile</title>
    <link rel="stylesheet" href="styles.css">
    <link rel="stylesheet" href="profile_feed.css">
    <link href="https://fonts.googleapis.com/css2?family=Lacquer&display=swap" rel="stylesheet">
    <link rel="icon" href="../Data/favicon.ico" type="image/x-icon">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
    <style>
        /* Profile container styles */
        .profile-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 20px;
            padding: 20px;
        }

        .page-title {
            font-size: 2em;
            color: var(--text-color);
            margin-bottom: 20px;
            text-align: center;
        }

        .profile-content {
            display: flex;
            justify-content: center; /* Center both containers horizontally */
            align-items: flex-start; /* Align containers to the top */
            gap: 40px; /* Add spacing between the containers */
            width: 100%;
            max-width: 900px;
        }

        .profile-info {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 15px;
            background-color: var(--background-color);
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }

        .profile-picture {
            width: 100px;
            height: 100px;
            border-radius: 50%;
            object-fit: cover;
            border: 2px solid var(--button-background-color);
        }

        .profile-form input {
            width: 100%;
            max-width: 300px;
            padding: 10px;
            margin: 5px 0;
            border: 1px solid var(--button-background-color);
            border-radius: 5px;
            background-color: var(--input-background-color);
            color: var(--text-color);
        }

        .profile-form button {
            margin-top: 10px;
            width: 100%;
        }

        /* Upload form styles */
        .upload-form {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            background-color: var(--background-color);
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }

        .upload-form h2 {
            margin-bottom: 15px;
            color: var(--text-color);
        }

        .upload-form input {
            width: 100%;
            max-width: 300px;
            padding: 10px;
            margin: 5px 0;
            border: 1px solid var(--button-background-color);
            border-radius: 5px;
            background-color: var(--input-background-color);
            color: var(--text-color);
        }

        .upload-form button {
            margin-top: 10px;
            width: 100%;
        }
    </style>
</head>
<body>
    <div class="app-bar">
        <div class="logo-container">
            <img src="../Data/logo_memes_nocolor.png" alt="Logo" class="logo">
        </div>
        <nav>
            <a href="feed.php">
                <i class="fas fa-rss"></i> Feed
            </a>
            <a href="explore.php">
                <i class="fas fa-search"></i> Explore
            </a>
            <a href="saves.php">
                <i class="fas fa-bookmark"></i> Saves
            </a>
            <a href="profile.php" class="active">
                <i class="fas fa-user"></i> Profile
            </a>
            <a href="logout.php" class="logout">
                <i class="fas fa-sign-out-alt"></i> Logout
            </a>
        </nav>
    </div>

    <div class="container profile-container">
        <h1 class="page-title">Welcome, <?php echo htmlspecialchars($username); ?></h1>

        <?php if ($updated): ?>
        <div class="success-message">✅ Profile updated successfully!</div>
        <?php endif; ?>

        <div class="profile-content">
            <div class="profile-info">
                <img src="<?php echo $profile_picture ? $profile_picture : 'default-avatar.png'; ?>" alt="Profile Picture" class="profile-picture">
                <form action="update_profile.php" method="POST" class="profile-form">
                    <input type="text" name="new_username" placeholder="New Username">
                    <input type="password" name="new_password" placeholder="New Password">
                    <input type="text" name="profile_picture" placeholder="Profile Picture URL">
                    <button type="submit" class="btn">Update Profile</button>
                </form>
            </div>

            <div class="upload-form">
                <h2>Upload a Meme</h2>
                <form action="upload_meme.php" method="POST">
                    <input type="text" name="title" placeholder="Meme Title" required>
                    <input type="text" name="meme_url" placeholder="Meme Image URL" required>
                    <button type="submit" class="btn">Upload Meme</button>
                </form>
            </div>
        </div>
    </div>
</body>
</html>
