function search() {
    let query = document.getElementById("searchInput").value;
    if (query.trim() !== "") {
        alert("Searching for: " + query);
        // You can replace the alert with actual search functionality later
    }
}