// NEED TO UPDATE WITH AWS API KEY AND PUT "apikey": "key" IN headers FOR ALL FETCH REQS (GET AND POST)
function search() {
    let query = document.getElementById("searchInput").value;
    if (query.trim() !== "") {
        alert("Searching for: " + query);
        // You can replace the alert with actual search functionality later
    }
}