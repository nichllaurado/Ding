// Add active state to navigation buttons
document.querySelectorAll('.nav-btn').forEach(button => {
    button.addEventListener('click', () => {
        // Remove active class from all buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        // Add active class to clicked button
        button.classList.add('active');
    });
});

// Search bar functionality
const searchBar = document.querySelector('.search-bar');
searchBar.addEventListener('input', (e) => {
    // Add your search functionality here
    console.log('Searching for:', e.target.value);
});

// Create button click handler
document.querySelector('.create-btn').addEventListener('click', () => {
    // Add your create functionality here
    console.log('Create button clicked');
});