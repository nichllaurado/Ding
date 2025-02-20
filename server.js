const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const multer = require('multer');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const http = require('http');
const socketIo = require('socket.io');
const asyncHandler = require('express-async-handler');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: '*' } });

app.use(express.json());
app.use(cors());

// ====================== DATABASE CONNECTION ======================
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// ====================== AUTHENTICATION ======================
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
const s3 = new S3Client({
    region: 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_KEY
    }
});

const upload = multer({ storage: multer.memoryStorage() });

app.post('/upload', upload.single('video'), async (req, res) => {
    const file = req.file;
    const fileName = `uploads/${Date.now()}_${file.originalname}`;

    const params = {
        Bucket: 'ding-videos',
        Key: fileName,
        Body: file.buffer,
        ACL: 'public-read',
        ContentType: file.mimetype,
    };

    try {
        await s3.send(new PutObjectCommand(params));
        res.json({ videoUrl: `https://ding-videos.s3.amazonaws.com/${fileName}` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to upload video' });
    }
});

// ====================== PROJECT FEED ======================
app.post('/projects', upload.single('video'), asyncHandler(async (req, res) => {
    const { user_id, title, description, tags } = req.body;
    const video_url = req.file ? req.file.location : null;

    await pool.query(
        'INSERT INTO projects (user_id, title, description, video_url, tags) VALUES ($1, $2, $3, $4, $5)',
        [user_id, title, description, video_url, tags]
    );
    res.json({ message: 'Project created' });
}));

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