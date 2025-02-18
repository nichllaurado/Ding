require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const multer = require('multer');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: '*' } });

app.use(express.json());
app.use(cors());

// Multer storage for video uploads
const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// ==================== AUTHENTICATION ====================

// Register user
app.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const result = await pool.query(
            'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id',
            [name, email, hashedPassword]
        );

        const token = jwt.sign({ user_id: result.rows[0].id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ token });
    } catch (error) {
        res.status(400).json({ error: 'User already exists' });
    }
});

// Login user
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) return res.status(400).json({ error: 'Invalid credentials' });

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ user_id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token });
});

// ==================== PROJECT FEED ====================

// Create project (post)
app.post('/projects', upload.single('video'), async (req, res) => {
    const { user_id, title, description, tags } = req.body;
    const video_url = req.file ? `/uploads/${req.file.filename}` : null;

    try {
        await pool.query(
            'INSERT INTO projects (user_id, title, description, video_url, tags) VALUES ($1, $2, $3, $4, $5)',
            [user_id, title, description, video_url, tags]
        );
        res.json({ message: 'Project created' });
    } catch (error) {
        res.status(500).json({ error: 'Error creating project' });
    }
});

// Get feed (paginated)
app.get('/feed', async (req, res) => {
    const limit = parseInt(req.query.limit) || 5;
    const offset = parseInt(req.query.offset) || 0;

    try {
        const result = await pool.query(
            'SELECT projects.*, users.name FROM projects JOIN users ON projects.user_id = users.id ORDER BY projects.created_at DESC LIMIT $1 OFFSET $2',
            [limit, offset]
        );
        res.json({ feed: result.rows });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching feed' });
    }
});

// ==================== REAL-TIME CHAT ====================

// Create messages table
pool.query(`
    CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        sender_id INT REFERENCES users(id) ON DELETE CASCADE,
        receiver_id INT REFERENCES users(id) ON DELETE CASCADE,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
`);

// WebSocket connection for chat
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('chatMessage', async (data) => {
        const { sender_id, receiver_id, message } = data;

        try {
            const result = await pool.query(
                'INSERT INTO messages (sender_id, receiver_id, message) VALUES ($1, $2, $3) RETURNING *',
                [sender_id, receiver_id, message]
            );

            io.emit('chatMessage', { sender_id, receiver_id, message: result.rows[0].message });
        } catch (error) {
            console.error('Error sending message:', error);
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Get chat history
app.get('/messages/:user1/:user2', async (req, res) => {
    const { user1, user2 } = req.params;

    try {
        const result = await pool.query(
            'SELECT * FROM messages WHERE (sender_id = $1 AND receiver_id = $2) OR (sender_id = $2 AND receiver_id = $1) ORDER BY created_at ASC',
            [user1, user2]
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching messages' });
    }
});

// ==================== SERVER START ====================
server.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`));


// ===================== USER SIGN UP ====================
const pool = new Pool({ connectionString: "postgresql://user:password@localhost:5432/yourdb" });

app.use(express.json());

app.post("/signup", async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) return res.status(400).json({ error: "All fields required" });

        const existingUser = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
        if (existingUser.rows.length > 0) return res.status(400).json({ error: "Email already in use" });

        const passwordHash = await bcrypt.hash(password, 10);

        const newUser = await pool.query(
            "INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email",
            [name, email, passwordHash]
        );

        res.json({ message: "User created successfully", user: newUser.rows[0] });
    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.listen(3000, () => console.log("Server running on port 3000"));