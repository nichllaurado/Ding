<?php
$servername = "localhost"; // Change if needed
$username = "root"; // MySQL username
$password = ""; // MySQL password (leave empty for default XAMPP)
$database = "formDB"; // Database name

// Create connection
$conn = new mysqli($servername, $username, $password, $database);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>
