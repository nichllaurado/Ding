import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://ldumvdowufraqlnxzism.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkdW12ZG93dWZyYXFsbnh6aXNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAyOTY1OTgsImV4cCI6MjA1NTg3MjU5OH0.9-tmroLirvetUJNPhRBvpc2D7g26FtoqCbtQgWrlLOI";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.getElementById("userForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        // Send form data to the server
        const response = await fetch("/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || "Failed to register");
        }

        alert("You're Signed Up!");
        window.location.href = "home.html"; // Redirect after signup
    } catch (error) {
        document.getElementById("errorMessage").innerText = error.message;
    }
});
