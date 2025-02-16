document.addEventListener("DOMContentLoaded", async function () {
    const projectsContainer = document.getElementById("projects-container");

    try {
        const response = await fetch("http://localhost:3000/api/projects");
        if (!response.ok) throw new Error("Failed to fetch projects");

        const projects = await response.json();
        projectsContainer.innerHTML = ""; // Clear "Loading projects..."

        if (projects.length === 0) {
            projectsContainer.innerHTML = "<p>No projects found.</p>";
        } else {
            projects.forEach(project => {
                const projectElement = document.createElement("div");
                projectElement.classList.add("project");
                projectElement.innerHTML = `
                    <h3>${project.title}</h3>
                    <p>${project.description}</p>
                `;
                projectsContainer.appendChild(projectElement);
            });
        }
    } catch (error) {
        console.error("Error loading projects:", error);
        projectsContainer.innerHTML = "<p>Error loading projects.</p>";
    }
});