import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

document.getElementById("userForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    // Sign up the user in Supabase Authentication
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
        document.getElementById("errorMessage").innerText = error.message;
        return;
    }

    // Insert user details into the database
    const { error: insertError } = await supabase.from("users").insert([
        { id: data.user.id, name, email, profile_picture: null }
    ]);

    if (insertError) {
        document.getElementById("errorMessage").innerText = insertError.message;
        return;
    }

    alert("You're Signed Up!");
    window.location.href = "home.html"; // Redirect to home page after signup
});
