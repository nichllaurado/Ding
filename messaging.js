const API_BASE_URL = "https://ding-ggzr.onrender.com";

const socket = io('http://localhost:3000'); // Connect to WebSocket server
const chatBox = document.getElementById('chat-box');
const messageInput = document.getElementById('messageInput');

// NEED TO UPDATE WITH AWS API KEY AND PUT "apikey": "key" IN headers FOR ALL FETCH REQS (GET AND POST)
// Send messages
async function sendMessage(receiverId) {
    const senderId = localStorage.getItem('user_id');
    const content = document.getElementById('messageInput').value;

    if (!content.trim()) return;

    socket.emit('send_message', { sender_id: senderId, receiver_id: receiverId, content });

    document.getElementById('messageInput').value = '';
}

// Receive and display messages
socket.on('receive_message', (message) => {
    displayMessage(message);
});

function displayMessage(message) {
    const chatBox = document.getElementById('chatBox');
    const messageDiv = document.createElement('div');
    messageDiv.textContent = `${message.sender_id}: ${message.content}`;
    chatBox.appendChild(messageDiv);
}

