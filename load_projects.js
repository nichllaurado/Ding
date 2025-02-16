document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("token"); // Get user token
    if (!token) return (window.location.href = "login.html");

    try {
        const response = await fetch("/api/projects", {
            headers: { Authorization: `Bearer ${token}` }
        });
        const projects = await response.json();

        const container = document.getElementById("projects-container");
        container.innerHTML = projects.length
            ? projects.map(proj => `<div class="project-card">
                <h2>${proj.title}</h2>
                <p>${proj.description}</p>
                <button onclick="navigate('project.html?id=${proj.id}')">View Project</button>
            </div>`).join("")
            : "<p>No projects found.</p>";
    } catch (error) {
        console.error(error);
        document.getElementById("projects-container").innerHTML = "<p>Error loading projects.</p>";
    }
});