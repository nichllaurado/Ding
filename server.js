const AWS = require('aws-sdk');
const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const multer = require('multer');
const multerS3 = require('multer-s3');
const http = require('http');
const socketIo = require('socket.io');
const asyncHandler = require('express-async-handler'); // For clean error handling

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: '*' } });

app.use(express.json());
app.use(cors());

// ====================== DATABASE CONNECTION ======================
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// ====================== AUTHENTICATION ======================
// User registration
app.post('/register', asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'All fields required' });

    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) return res.status(400).json({ error: 'Email already in use' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await pool.query(
        'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email',
        [name, email, hashedPassword]
    );

    const token = jwt.sign({ user_id: newUser.rows[0].id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: newUser.rows[0] });
}));

// User login
app.post('/login', asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (userResult.rows.length === 0) return res.status(400).json({ error: 'Invalid credentials' });

    const user = userResult.rows[0];
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ user_id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
}));

// ====================== VIDEO UPLOAD (AWS S3) ======================
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    region: 'us-east-1',
});
const s3 = new AWS.S3();

const upload = multer({
    storage: multerS3({
        s3,
        bucket: 'ding-videos',
        acl: 'public-read',
        key: (req, file, cb) => {
            cb(null, `uploads/${Date.now()}_${file.originalname}`);
        }
    })
});

// Upload video endpoint
app.post('/upload', upload.single('video'), (req, res) => {
    res.json({ videoUrl: req.file.location });
});

// ====================== PROJECT FEED ======================
// Create project
app.post('/projects', upload.single('video'), asyncHandler(async (req, res) => {
    const { user_id, title, description, tags } = req.body;
    const video_url = req.file ? req.file.location : null;

    await pool.query(
        'INSERT INTO projects (user_id, title, description, video_url, tags) VALUES ($1, $2, $3, $4, $5)',
        [user_id, title, description, video_url, tags]
    );
    res.json({ message: 'Project created' });
}));

// Get paginated feed
app.get('/feed', asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 5;
    const offset = parseInt(req.query.offset) || 0;

    const result = await pool.query(
        'SELECT projects.*, users.name FROM projects JOIN users ON projects.user_id = users.id ORDER BY projects.created_at DESC LIMIT $1 OFFSET $2',
        [limit, offset]
    );

    res.json({ feed: result.rows });
}));

// ====================== REAL-TIME CHAT ======================
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('chatMessage', async (data) => {
        const { sender_id, receiver_id, message } = data;

        try {
            const result = await pool.query(
                'INSERT INTO messages (sender_id, receiver_id, content) VALUES ($1, $2, $3) RETURNING *',
                [sender_id, receiver_id, message]
            );

            io.emit('chatMessage', { sender_id, receiver_id, message: result.rows[0].content });
        } catch (error) {
            console.error('Error sending message:', error);
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Get chat history
app.get('/messages/:user1/:user2', asyncHandler(async (req, res) => {
    const { user1, user2 } = req.params;

    const result = await pool.query(
        'SELECT * FROM messages WHERE (sender_id = $1 AND receiver_id = $2) OR (sender_id = $2 AND receiver_id = $1) ORDER BY created_at ASC',
        [user1, user2]
    );
    res.json(result.rows);
}));

// ====================== SERVER START ======================
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));