// Connect to WebSocket server
const socket = io("http://localhost:3000");

const token = localStorage.getItem("token");

//Ensure the user is logged in
if (!token) {
    alert("Unauthorized access! Please log in.");
    window.location.href = "/login.html";
}

//Function to fetch and store username from backend
async function fetchUserName() {
    try {
        const response = await fetch("http://localhost:3000/user", {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
            throw new Error("Failed to fetch user details");
        }

        const user = await response.json();
        localStorage.setItem("userName", user.name);
        return user.name;
    } catch (error) {
        console.error("Error fetching user details:", error);
        return "Guest";
    }
}

fetchUserName().then((name) => {
    socket.emit("join", name);
});

const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const messagesContainer = document.getElementById("messages");
const usersList = document.getElementById("users");

//Function to fetch previous chat messages
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

        messagesContainer.innerHTML = "";

        messages.forEach((msg) => {
            const username = msg.UserDatum?.name || "Unknown";
            displayMessage(username, msg.message);
        });
    } catch (error) {
        console.error("Error fetching messages:", error);
    }
}

//function to display a message in chat
function displayMessage(user, text) {
    const messageElement = document.createElement("div");
    messageElement.classList.add("message");
    messageElement.innerHTML = `<strong>${user}:</strong> ${text}`;
    messagesContainer.appendChild(messageElement);

    // Auto-scroll to the latest message
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

//Function to send a message
async function sendMessage() {
    const message = messageInput.value.trim();
    if (!message) return;

    const userName = localStorage.getItem("userName") || "Guest";

    //Emit message through WebSocket
    socket.emit("sendMessage", { user: userName, text: message });

    //Save message in the database
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

    //Clear input field after sending
    messageInput.value = "";
}

//Event listeners for sending messages
sendBtn.addEventListener("click", sendMessage);
messageInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        sendMessage();
    }
});

//Listen for new messages from WebSocket server
socket.on("message", (data) => {
    displayMessage(data.user, data.text);
});

//Listen for updated user list
socket.on("userList", (users) => {
    usersList.innerHTML = "";
    users.forEach((user) => {
        const userElement = document.createElement("li");
        userElement.innerText = user;
        usersList.appendChild(userElement);
    });
});

// Fetch previous messages when the page loads
fetchMessages();
