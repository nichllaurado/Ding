const API_BASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_KEY;

// NEED TO UPDATE WITH AWS API KEY AND PUT "apikey": "key" IN headers FOR ALL FETCH REQS (GET AND POST)
document.getElementById('projectForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    const user_id = localStorage.getItem('user_id'); // Get logged-in user ID
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const tags = document.getElementById('tags').value.split(',').map(tag => tag.trim()); // Convert tags to array
    const invites = getInvitedUsers(); // Get invited users
    const videoFile = document.getElementById('videoUpload').files[0];

    let videoUrl = null;

    // If a video is selected, upload it and get the URL
    if (videoFile) {
        videoUrl = await uploadVideo(videoFile);
    }

    // Prepare project data
    const projectData = {
        user_id,
        title,
        description,
        tags,
        invites,
        video_url: videoUrl
    };

    // Send request to create the project
    const response = await fetch(`${API_BASE_URL}/projects`, {
        method: 'POST',
        headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json' },
        body: JSON.stringify(projectData)
    });

    if (response.ok) {
        alert('Project created successfully!');
        window.location.href = 'my_projects.html';
    } else {
        alert('Error creating project.');
    }
});

// NEED TO UPDATE WITH AWS API KEY AND PUT "apikey": "key" IN headers FOR ALL FETCH REQS (GET AND POST)
async function uploadVideo(file) {
    let formData = new FormData();
    formData.append("video", file); // Append file as 'video'

    try {
        const response = await fetch(`${API_BASE_URL}/upload-video`, {
            method: "POST",
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json' },
            body: formData
        });

        const data = await response.json();
        if (data.videoUrl) {
            return data.videoUrl; // Return video URL for use in project creation
        } else {
            throw new Error("Video upload failed");
        }
    } catch (error) {
        console.error("Error uploading video:", error);
        return null;
    }
}

function previewVideo(event) {
    const file = event.target.files[0]; // Get the selected file
    if (file) {
        console.log("Video selected:", file.name);
    }
}

// Handle user invitations
let invitedUsers = [];

document.getElementById('inviteUsers').addEventListener('click', function () {
    const email = prompt("Enter email of user to invite:");
    if (email) {
        invitedUsers.push(email);
        alert(`User ${email} invited!`);
    }
});

// Retrieve invited users
function getInvitedUsers() {
    return invitedUsers;
}
