const API_BASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_KEY;
const SUPABASE_STORAGE_BUCKET = "profile_picture";

function changePicture() {
    document.getElementById("fileInput").click();
}

function previewImage(event) {
    const file = event.target.files[0]; // Get the selected file
    if (file) {
        const reader = new FileReader();

        // Read the file and set it as the image source
        reader.onload = function(e) {
            document.getElementById("profileImage").src = e.target.result;
        };

        reader.readAsDataURL(file); // Convert image to data URL
        uploadImage(file);
    }
}

async function uploadImage(file) {
    const fileName = `pfp-${Date.now()}-${file.name}`;
    const filePath = `${SUPABASE_STORAGE_BUCKET}/${fileName}`;
    
    try {
        const response = await fetch(`${API_BASE_URL}/storage/v1/object/${filePath}`, {
            method: "POST",
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': file.type
            },
            body: file
        });

        if (!response.ok) throw new Error("Failed to upload image");

        const imageUrl = `${API_BASE_URL}/storage/v1/object/public/${filePath}`;
        await updateProfileImageInDB(imageUrl);
    } catch (error) {
        console.error("Error uploading image:", error);
    }
}

async function updateProfileImageInDB(imageUrl) {
    try {
        const response = await fetch(`${API_BASE_URL}/rest/v1/users`, {
            method: "PATCH",
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({ profile_picture: imageUrl })
        });

        if (!response.ok) throw new Error("Failed to update profile picture in DB");
        document.getElementById("profileImage").src = imageUrl;
    } catch (error) {
        console.error("Error updating profile picture in DB:", error);
    }
}

async function loadProfilePicture() {
    try {
        const response = await fetch(`${API_BASE_URL}/rest/v1/users?select=profile_picture`, {
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        if (data.length > 0 && data[0].profile_picture) {
            document.getElementById("profileImage").src = data[0].profile_picture;
        }
    } catch (error) {
        console.error("Error fetching profile picture:", error);
    }
}

window.onload = function() {
    loadProfilePicture();
};
