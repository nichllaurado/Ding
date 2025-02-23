const API_BASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_KEY;

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

    // NEED TO UPDATE WITH AWS API KEY AND PUT "apikey": "key" IN headers FOR ALL FETCH REQS (GET AND POST)
    const response = await fetch(`${API_BASE_URL}/signup`, {
      method: "POST",
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json' },
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
  