import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

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
