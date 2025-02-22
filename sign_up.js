document.getElementById("userForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

<<<<<<< HEAD
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
=======
    const response = await fetch("/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password })
>>>>>>> 76edf4a7d0c407b7cec8efa6d58ce0313bf08d17
    });

    const result = await response.json();

    if (response.ok) {
      alert("You're Signed Up!");
      window.location.href = "home.html"; // Redirect user
    } else {
      document.getElementById("errorMessage").innerText = result.error;
    }
  });