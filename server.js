const express = require("express");
const { Pool } = require("pg");

const app = express();
const pool = new Pool({
    user: "your_db_user",
    host: "localhost",
    database: "your_db_name",
    password: "your_db_password",
    port: 5432,
});

app.use(express.json());

// Get all projects
app.get("/api/projects", async (req, res) => {
    try {
        const result = await pool.query("SELECT id, title, description FROM projects");
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Database error" });
    }
});

// Start the server
app.listen(3000, () => console.log("Server running on port 3000"));