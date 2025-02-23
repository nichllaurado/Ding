import { createClient } from '@supabase/supabase-js';

const API_BASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_KEY;

const supabase = createClient(API_BASE_URL, SUPABASE_ANON_KEY);

document.getElementById("userForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    // Sign up the user in Supabase Auth
    const { user, error } = await supabase.auth.signUp({
        email,
        password
    });

    if (error) {
        document.getElementById("errorMessage").innerText = error.message;
        return;
    }

    // Store user data in the database (excluding password)
    const { data, dbError } = await supabase
        .from("users")
        .insert([{ id: user.id, name, email, profile_picture: null }]);

    if (dbError) {
        document.getElementById("errorMessage").innerText = dbError.message;
        return;
    }

    alert("You're Signed Up!");
    window.location.href = "home.html"; // Redirect user to home page
});