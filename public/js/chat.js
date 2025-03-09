const socket = io("http://localhost:3000");
const token = localStorage.getItem("token");

if (!token) {
    alert("Unauthorized access! Please log in.");
    window.location.href = "/login.html";
}

// Fetch and store username
async function fetchUserName() {
    try {
        const response = await fetch("http://localhost:3000/user", {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error("Failed to fetch user details");

        const user = await response.json();
        localStorage.setItem("userName", user.name);
        return user.name;
    } catch (error) {
        console.error("Error fetching user details:", error);
        return "Guest";
    }
}

// Fetch username and join chat
fetchUserName().then((name) => {
    socket.emit("join", name);
});

const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const messagesContainer = document.getElementById("messages");
const usersList = document.getElementById("users");

// Load messages from Local Storage 
function loadMessagesFromLocalStorage() {
    const storedMessages = JSON.parse(localStorage.getItem("chatMessages")) || [];
    messagesContainer.innerHTML = "";  // Clear previous messages

    storedMessages.forEach(({ user, text }) => displayMessage(user, text));
}

// Save message to Local Storage
function saveMessagesToLocalStorage(newMessage) {
    let messages = JSON.parse(localStorage.getItem("chatMessages")) || [];

    const exists = messages.some(msg => msg.user === newMessage.user && msg.text === newMessage.text);
    if (!exists) {
        if (messages.length >= 10) {
            messages.shift();
        }

        messages.push(newMessage);
        localStorage.setItem("chatMessages", JSON.stringify(messages));
    }
}

//Fetch only NEW messages from backend
async function fetchNewMessages() {
    try {
        let lastMessageTime = localStorage.getItem("lastMessageTime") || 0;

        const response = await fetch(`http://localhost:3000/chat?since=${lastMessageTime}`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 403) {
            alert("Session expired! Please log in again.");
            localStorage.removeItem("token");
            window.location.href = "/login.html";
            return;
        }

        const messages = await response.json();

        if (messages.length > 0) {
            messages.forEach((msg) => {
                const username = msg.UserDatum?.name || "Unknown";

                const exists = document.querySelector(`.message[data-user="${username}"][data-text="${msg.message}"]`);
                if (!exists) {
                    displayMessage(username, msg.message);
                    saveMessagesToLocalStorage({ user: username, text: msg.message });
                }
            });

            //Update last message timestamp
            const latestMessageTime = messages[messages.length - 1].createdAt;
            localStorage.setItem("lastMessageTime", latestMessageTime);
        }
    } catch (error) {
        console.error("Error fetching new messages:", error);
    }
}

//Display message in chat
function displayMessage(user, text) {
    const messageElement = document.createElement("div");
    messageElement.classList.add("message");
    messageElement.setAttribute("data-user", user);
    messageElement.setAttribute("data-text", text); 
    messageElement.innerHTML = `<strong>${user}:</strong> ${text}`;
    messagesContainer.appendChild(messageElement);

    messagesContainer.scrollTop = messagesContainer.scrollHeight; 
}

//Send message
async function sendMessage() {
    const message = messageInput.value.trim();
    if (!message) return;

    const userName = localStorage.getItem("userName") || "Guest";

    socket.emit("sendMessage", { user: userName, text: message });

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

    saveMessagesToLocalStorage({ user: userName, text: message });
    messageInput.value = "";
}

//Event listeners
sendBtn.addEventListener("click", sendMessage);
messageInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        sendMessage();
    }
});

//Listen for WebSocket messages (avoid duplicates)
socket.on("message", (data) => {
    const exists = document.querySelector(`.message[data-user="${data.user}"][data-text="${data.text}"]`);
    if (!exists) {
        displayMessage(data.user, data.text);
        saveMessagesToLocalStorage(data);
    }
});

//Listen for user list update
socket.on("userList", (users) => {
    usersList.innerHTML = "";
    users.forEach((user) => {
        const userElement = document.createElement("li");
        userElement.innerText = user;
        usersList.appendChild(userElement);
    });
});

//Load messages from Local Storage & fetch new ones
loadMessagesFromLocalStorage();
fetchNewMessages();
