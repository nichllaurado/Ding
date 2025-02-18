document.getElementById("userForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const response = await fetch("/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password })
    });

    const result = await response.json();

    if (response.ok) {
      alert("Signup successful! Redirecting...");
      window.location.href = "dashboard.html"; // Redirect user
    } else {
      document.getElementById("errorMessage").innerText = result.error;
    }
  });