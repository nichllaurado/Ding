const socket = io();

        // Function to send a message
        function sendMessage() {
            const input = document.getElementById("messageInput");
            const message = input.value.trim();
            if (message) {
                const username = prompt("Enter your username:");
                socket.emit("chat message", `${username}: ${message}`);
                input.value = "";
            }
        }

        // Listen for incoming messages
        socket.on("chat message", (msg) => {
            const messages = document.getElementById("messages");
            const li = document.createElement("li");
            li.textContent = msg;
            messages.appendChild(li);
        });