document.getElementById("userForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    // Object containing user info
    const user = {
      name,
      email,
      password
    };

    const response = await fetch("/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user)
    });

    const result = await response.json();

    if (response.ok) {
      alert("You're Signed Up!");
      window.location.href = "home.html"; // Redirect user
    } else {
      document.getElementById("errorMessage").innerText = result.error;
    }
  });
  