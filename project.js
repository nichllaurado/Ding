document.getElementById("projectForm").addEventListener("submit", function(event) {
    event.preventDefault();

    let title = document.getElementById("title").value;
    let description = document.getElementById("description").value;
    let video = document.getElementById("video").files[0];
    let invite = document.getElementById("invite").value.split(",");
    let tags = document.getElementById("tags").value.split(",");

    console.log("Project Created:", { title, description, video, invite, tags });

    alert("Project Created Successfully!");
    window.location.href = "projects.html"; // Redirect back to projects page
});