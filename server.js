import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Serve static files (CSS, JS) from root
app.use(express.static(__dirname));

// Serve `index.html` for the root route
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "home.html"));
});

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "home.html"));
});

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
    res.send("Server is running!");
});

// ====================== SUPABASE CONNECTION ======================
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// ====================== AUTHENTICATION ======================
app.post("/register", async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ error: "All fields are required" });
    }

    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    const { error: insertError } = await supabase.from("users").insert([
        { id: data.user.id, name, email, profile_picture: null }
    ]);

    if (insertError) {
        return res.status(500).json({ error: "User created but failed to save profile." });
    }

    res.json({ message: "User registered successfully!", user: data.user });
});

// ====================== FILE UPLOADS (SUPABASE STORAGE) ======================

// Multer configuration
const upload = multer({ storage: multer.memoryStorage() });

// Upload profile picture
app.post("/upload-pfp", upload.single("profileImage"), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const user = supabase.auth.getUser();
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const fileName = `pfp-${user.id}-${Date.now()}.${req.file.mimetype.split("/")[1]}`;
    const filePath = `profile_picture/${fileName}`;

    const { error } = await supabase.storage.from("profile_picture").upload(filePath, req.file.buffer, { upsert: true });

    if (error) return res.status(500).json({ error: "Failed to upload image" });

    const { data } = supabase.storage.from("profile_picture").getPublicUrl(filePath);

    await supabase.from("users").update({ profile_picture: data.publicUrl }).eq("id", user.id);

    res.json({ imageUrl: data.publicUrl });
});

// Upload video
app.post("/upload-video", upload.single("video"), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No video uploaded" });

    const user = supabase.auth.getUser();
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const fileName = `video-${user.id}-${Date.now()}.${req.file.mimetype.split("/")[1]}`;
    const filePath = `video/${fileName}`;

    const { error } = await supabase.storage.from("video").upload(filePath, req.file.buffer, { upsert: true });

    if (error) return res.status(500).json({ error: "Failed to upload video" });

    const { data } = supabase.storage.from("video").getPublicUrl(filePath);

    res.json({ videoUrl: data.publicUrl });
});

// ====================== REAL-TIME CHAT (SUPABASE + SOCKET.IO) ======================
io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("chatMessage", async (data) => {
        const { sender_id, receiver_id, message } = data;
        try {
            const { error } = await supabase.from("messages").insert([{ sender_id, receiver_id, content: message }]);
            if (!error) io.emit("chatMessage", { sender_id, receiver_id, message });
        } catch (error) {
            console.error("Error sending message:", error);
        }
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

// ====================== SERVER START ======================
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
