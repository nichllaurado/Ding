import { createClient } from '@supabase/supabase-js';

const API_BASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_KEY;
const SUPABASE_STORAGE_BUCKET = "profile_picture";

const supabase = createClient(API_BASE_URL, SUPABASE_ANON_KEY);

function changePicture() {
    document.getElementById("fileInput").click();
}

function previewImage(event) {
    const file = event.target.files[0]; // Get the selected file
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById("profileImage").src = e.target.result;
        };
        reader.readAsDataURL(file);
        uploadImage(file);
    }
}

async function uploadImage(file) {
    const user = supabase.auth.user(); // Get logged-in user
    if (!user) {
        alert("You must be logged in to upload a profile picture.");
        return;
    }

    const fileName = `pfp-${user.id}-${Date.now()}.${file.name.split('.').pop()}`;
    const filePath = `${SUPABASE_STORAGE_BUCKET}/${fileName}`;

    // Upload image to Supabase Storage
    const { error } = await supabase.storage
        .from(SUPABASE_STORAGE_BUCKET)
        .upload(filePath, file, { cacheControl: '3600', upsert: true });

    if (error) {
        console.error("Upload error:", error.message);
        return;
    }

    // Generate public URL
    const { publicURL } = supabase.storage
        .from(SUPABASE_STORAGE_BUCKET)
        .getPublicUrl(filePath);

    if (!publicURL) {
        console.error("Failed to generate public URL.");
        return;
    }

    // Save profile picture URL in DB
    await updateProfileImageInDB(publicURL);
}

async function updateProfileImageInDB(imageUrl) {
    const user = supabase.auth.user();
    if (!user) return;

    const { error } = await supabase
        .from("users")
        .update({ profile_picture: imageUrl })
        .eq("id", user.id);

    if (error) {
        console.error("DB update error:", error.message);
    } else {
        document.getElementById("profileImage").src = imageUrl;
    }
}

async function loadProfilePicture() {
    const user = supabase.auth.user();
    if (!user) return;

    const { data, error } = await supabase
        .from("users")
        .select("profile_picture")
        .eq("id", user.id)
        .single();

    if (error) {
        console.error("Error fetching profile picture:", error.message);
        return;
    }

    if (data.profile_picture) {
        document.getElementById("profileImage").src = data.profile_picture;
    }
}

window.onload = loadProfilePicture;