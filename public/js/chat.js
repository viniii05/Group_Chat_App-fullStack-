const socket = io("http://localhost:3000");

// Retrieve username from localStorage
const userName = localStorage.getItem("userName") || "Guest";

// Emit "join" event when the user connects
socket.emit("join", userName);

// Select elements
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const messagesContainer = document.getElementById("messages");
const usersList = document.getElementById("users");

const token = localStorage.getItem("token");


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

async function fetchMessages() {
    try {
      const response = await fetch("http://localhost:3000/chat", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const messages = await response.json();
  
      messagesContainer.innerHTML = "";
      messages.forEach((msg) => {
        displayMessage(msg.User.name, msg.message);
      });
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  }
  
  // Display messages
  function displayMessage(user, text) {
    const messageElement = document.createElement("div");
    messageElement.classList.add("message");
    messageElement.innerHTML = `<strong>${user}:</strong> ${text}`;
    messagesContainer.appendChild(messageElement);
  }
  
  // Send message on button click
  sendBtn.addEventListener("click", async () => {
    const message = messageInput.value.trim();
    if (message) {
      socket.emit("sendMessage", { message });
  
      // Save message in DB
      await fetch("http://localhost:3000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message }),
      });
  
      messageInput.value = "";
    }
  });
  
  // Listen for messages from server
  socket.on("message", (data) => {
    displayMessage(data.user, data.text);
  });
  
  // Fetch previous messages on load
  fetchMessages();

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

// const token = localStorage.getItem("token");  // ✅ Retrieve stored token
// const userName = localStorage.getItem("userName") || "Guest";

// if (!token) {
//     alert("Unauthorized access! Please log in.");
//     window.location.href = "/login.html";  // Redirect if not logged in
// }

// // ✅ Connect to WebSocket with authentication
// const socket = io("http://localhost:3000", {
//     transports: ["websocket"],
//     auth: { token }
// });

// // ✅ Emit event when user joins
// socket.emit("join", userName);

// // ✅ Listen for messages from the server
// socket.on("message", (data) => {
//     const messageElement = document.createElement("div");
//     messageElement.classList.add("message");
//     messageElement.innerHTML = `<strong>${data.user}:</strong> ${data.text}`;
//     document.getElementById("messages").appendChild(messageElement);
// });

// // ✅ Listen for updated user list
// socket.on("userList", (users) => {
//     const usersList = document.getElementById("users");
//     usersList.innerHTML = "";
//     users.forEach(user => {
//         const userElement = document.createElement("li");
//         userElement.innerText = user;
//         usersList.appendChild(userElement);
//     });
// });

// // ✅ Send message on button click
// document.getElementById("sendBtn").addEventListener("click", () => {
//     const messageInput = document.getElementById("messageInput");
//     const message = messageInput.value.trim();
//     if (message) {
//         socket.emit("sendMessage", { user: userName, text: message });
//         messageInput.value = "";
//     }
// });

// // ✅ Send message on 'Enter' key press
// document.getElementById("messageInput").addEventListener("keypress", (event) => {
//     if (event.key === "Enter") {
//         document.getElementById("sendBtn").click();
//     }
// });

