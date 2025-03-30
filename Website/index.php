<?php
// Include the database connection file
include 'db.php';
//test the connection
 if ($conn) {
    echo "Connected successfully";
} else {
    echo "Connection failed: " . $conn->connect_error;
}
?>