import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

document.getElementById("userForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const { user, error } = await supabase.auth.signUp({ email, password });

    if (error) {
        document.getElementById("errorMessage").innerText = error.message;
        return;
    }

    await supabase.from("users").insert([{ id: user.id, name, email, profile_picture: null }]);

    alert("You're Signed Up!");
    window.location.href = "home.html";
});
