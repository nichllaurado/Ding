async function loadProjects() {
    try {
        const response = await fetch('http://localhost:3000/projects');
        const projects = await response.json();

        const container = document.getElementById('projects-container');
        container.innerHTML = ''; // Clear previous content

        projects.forEach(project => {
            const projectElement = document.createElement('div');
            projectElement.classList.add('project-card');
            projectElement.innerHTML = `
                <h2>${project.title}</h2>
                <p>${project.description}</p>
                <video width="300" controls>
                    <source src="${project.video_url}" type="video/mp4">
                    Your browser does not support video playback.
                </video>
                <p><strong>Tags:</strong> ${project.tags.join(', ')}</p>
            `;
            container.appendChild(projectElement);
        });
    } catch (error) {
        console.error('Error loading projects:', error);
    }
}

window.onload = loadProjects;