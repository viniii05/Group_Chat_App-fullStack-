const socket = io("http://localhost:3000");

const userName = localStorage.getItem("userName") || "Guest";
const token = localStorage.getItem("token");

if (!token) {
    alert("Unauthorized access! Please log in.");
    window.location.href = "/login.html";  // Redirect if not logged in
}

socket.emit("join", userName);

const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const messagesContainer = document.getElementById("messages");
const usersList = document.getElementById("users");


async function fetchMessages() {
    try {
        const response = await fetch("http://localhost:3000/chat", {
            headers: { Authorization: `Bearer ${token}` }, 
        });

        if (response.status === 403) {  
            alert("Session expired! Please log in again.");
            localStorage.removeItem("token");
            window.location.href = "/login.html"; 
            return;
        }

        const messages = await response.json();
        console.log("Fetched Messages:", messages);

        if (!Array.isArray(messages)) {  
            throw new Error("Invalid response format. Expected an array.");
        }

        messagesContainer.innerHTML = "";
        messages.forEach((msg) => {
            const username = msg.UserDatum && msg.UserDatum.name ? msg.UserDatum.name : "Unknown"; 
            displayMessage(username, msg.message);
        });
    } catch (error) {
        console.error("Error fetching messages:", error);
    }
}
function displayMessage(user, text) {
    const messageElement = document.createElement("div");
    messageElement.classList.add("message");
    messageElement.innerHTML = `<strong>${user}:</strong> ${text}`;
    messagesContainer.appendChild(messageElement);
}
//function to send message
async function sendMessage() {
    const message = messageInput.value.trim();
    if (!message) return;

    socket.emit("sendMessage", { user: userName, text: message });

    // Save message in the database
    try {
        await fetch("http://localhost:3000/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ message }),
        });
    } catch (error) {
        console.error("Error sending message:", error);
    }

    messageInput.value = "";
}

// Event listener for "send" button
sendBtn.addEventListener("click", sendMessage);

// Event listener for "Enter" key to send messages
messageInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        sendMessage();
    }
});

// Listen for messages from WebSocket server
socket.on("message", (data) => {
    displayMessage(data.user, data.text);
});

// Listen for updated user list
socket.on("userList", (users) => {
    usersList.innerHTML = "";
    users.forEach(user => {
        const userElement = document.createElement("li");
        userElement.innerText = user;
        usersList.appendChild(userElement);
    });
});

// Fetch previous messages on page load
fetchMessages();