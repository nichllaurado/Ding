<?php
require 'connect.php'; // Include the database connection

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $name = htmlspecialchars($_POST['name']); 
    $email = htmlspecialchars($_POST['email']);

    $sql = "INSERT INTO users (name, email) VALUES ('$name', '$email')";

    if ($conn->query($sql) === TRUE) {
        echo "Data stored successfully!";
    } else {
        echo "Error: " . $conn->error;
    }
}

$conn->close();
?>
