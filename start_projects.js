document.getElementById('projectForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    const user_id = localStorage.getItem('user_id'); // Assuming user_id is stored after login
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const video = document.getElementById('video').files[0];
    const tags = document.getElementById('tags').value;

    const formData = new FormData();
    formData.append('user_id', user_id);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('tags', tags);

    if (video) {
        const videoUrl = await uploadVideo(video); // Function to handle video uploads
        formData.append('video_url', videoUrl);
    }

    const response = await fetch('http://localhost:3000/projects', {
        method: 'POST',
        body: formData
    });

    if (response.ok) {
        alert('Project created successfully!');
        window.location.href = 'my_projects.html';
    } else {
        alert('Error creating project.');
    }
});