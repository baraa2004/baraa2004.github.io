<?php
session_start();
if (!isset($_SESSION['user_id'])) {
    header('Location: loginpage.php');
    exit;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Saved Memes</title>
    <link rel="stylesheet" href="explore.css">
    <link rel="stylesheet" href="saves.css">
    <link href="https://fonts.googleapis.com/css2?family=Lacquer&display=swap" rel="stylesheet">
    <link rel="icon" href="../Data/favicon.ico" type="image/x-icon">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
</head>
<body>
    <div class="app-bar">
        <div class="logo-container">
            <img src="../Data/logo_memes_nocolor.png" alt="Logo" class="logo">
        </div>
        <nav>
            <a href="explore.php" >
                <i class="fas fa-search"></i> Explore
            </a>
            <a href="saves.php"class="active">
                <i class="fas fa-bookmark"></i> Saves
            </a>
            <a href="profile.php">
                <i class="fas fa-user"></i> Profile
            </a>
            <a href="logout.php" class="logout">
                <i class="fas fa-sign-out-alt"></i> Logout
            </a>
        </nav>
        </nav>
    </div>
    
    <div class="container" id="savedMemesContainer">
        <!-- Saved memes will be loaded here -->
    </div>

    <script src="saves.js"></script>
</body>
</html>