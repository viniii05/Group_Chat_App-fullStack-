const socket = io("http://localhost:3000", { transports: ['websocket'] });

const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const messagesContainer = document.getElementById("messages");
const usersList = document.getElementById("users");

// Retrieve user details from local storage
const userName = localStorage.getItem("userName") || "Guest";

// Emit event when user joins
socket.emit("join", userName);

// Listen for messages from server
socket.on("message", (data) => {
    const messageElement = document.createElement("div");
    messageElement.classList.add("message");
    messageElement.innerHTML = `<strong>${data.user}:</strong> ${data.text}`;
    messagesContainer.appendChild(messageElement);
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

// Send message on button click
sendBtn.addEventListener("click", () => {
    const message = messageInput.value.trim();
    if (message) {
        socket.emit("sendMessage", { user: userName, text: message });
        messageInput.value = "";
    }
});

// Send message on 'Enter' key
messageInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        sendBtn.click();
    }
});
