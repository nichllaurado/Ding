import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

function changePicture() {
    document.getElementById("fileInput").click();
}

function previewImage(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            document.getElementById("profileImage").src = e.target.result;
        };
        reader.readAsDataURL(file);
        uploadImage(file);
    }
}

async function uploadImage(file) {
    const user = supabase.auth.getUser();
    if (!user) {
        alert("You must be logged in to upload a profile picture.");
        return;
    }

    const fileName = `pfp-${user.id}-${Date.now()}.${file.name.split(".").pop()}`;
    const filePath = `profile_picture/${fileName}`;

    const { error } = await supabase.storage.from("profile_picture").upload(filePath, file, { upsert: true });

    if (error) {
        console.error("Upload error:", error.message);
        return;
    }

    const { data } = supabase.storage.from("profile_picture").getPublicUrl(filePath);

    await supabase.from("users").update({ profile_picture: data.publicUrl }).eq("id", user.id);

    document.getElementById("profileImage").src = data.publicUrl;
}

async function loadProfilePicture() {
    const user = supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase.from("users").select("profile_picture").eq("id", user.id).single();

    if (error) {
        console.error("Error fetching profile picture:", error.message);
        return;
    }

    if (data.profile_picture) {
        document.getElementById("profileImage").src = data.profile_picture;
    }
}

window.onload = loadProfilePicture;
