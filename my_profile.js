
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

// NEED TO UPDATE WITH AWS API KEY AND PUT "apikey": "key" IN headers FOR ALL FETCH REQS (GET AND POST)
function uploadImage(file) {
    let formData = new FormData();
    formData.append("profileImage", file); // Append file as 'profileImage'

    fetch("/upload-pfp", {
        method: "POST",
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.imageUrl) {
            document.getElementById("profileImage").src = data.imageUrl;
            localStorage.setItem("profilePic", data.imageUrl); // Store the image URL
        }
    })
    .catch(error => console.error("Error uploading image:", error));
}

function toggleEdit() {
    let box = document.getElementById("biographyBox");
    if (box.contentEditable === "true") {
        box.contentEditable = "false";
    } else {
        box.contentEditable = "true";
        box.focus();
    }
}

window.onload = function() {
    const savedImage = localStorage.getItem("profilePic");
    if (savedImage) {
        document.getElementById("profileImage").src = savedImage;
    }
};

function addItem() {
    let list = document.getElementById("list");
    let newItem = document.createElement("li");
    let itemText = prompt("Enter new item:");
    
    if (itemText) {
        newItem.innerHTML = `<span>${itemText}</span> <button onclick="editItem(this)">Edit</button>`;
        list.appendChild(newItem);
    }
}

function editItem(button) {
    let listItem = button.parentElement;
    let newText = prompt("Edit item:", listItem.firstElementChild.textContent);
    
    if (newText !== null) {
        listItem.firstElementChild.textContent = newText;
    }
}