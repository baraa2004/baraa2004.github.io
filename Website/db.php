<?php
// Database connection
$servername = "localhost";
$username = "meme";
$password = "BaraaandAli";
$dbname = "memewebsite";
$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>