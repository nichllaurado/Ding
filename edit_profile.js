

function changePicture() {

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