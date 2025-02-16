app.post('/projects', async (req, res) => {
    const { user_id, title, description, video_url, tags } = req.body;
    
    try {
        const result = await pool.query(
            'INSERT INTO projects (user_id, title, description, video_url, tags) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [user_id, title, description, video_url, tags.split(',')]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});