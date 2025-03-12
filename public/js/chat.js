const socket = io("http://localhost:3000");
const token = localStorage.getItem("token");

if (!token) {
    alert("Unauthorized access! Please log in.");
    window.location.href = "/login.html";
}

// Fetch and store user details
async function fetchUserDetails() {
    try {
        const response = await fetch("http://localhost:3000/user", {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error("Failed to fetch user details");

        const user = await response.json();
        localStorage.setItem("userId", user.id);
        localStorage.setItem("userName", user.name);
        return user;
    } catch (error) {
        console.error("Error fetching user details:", error);
        return { id: null, name: "Guest" };
    }
}

// Fetch groups and display them
async function fetchGroups() {
    try {
        const response = await fetch("http://localhost:3000/groups", {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error("Failed to fetch groups");

        const groups = await response.json();
        const groupList = document.getElementById("group-list");
        groupList.innerHTML = "";

        groups.forEach((group, index) => {
            const li = document.createElement("li");
            li.innerText = group.name;
            li.setAttribute("data-group-id", group.id);
            li.classList.add("group");

            // Set the first group as active by default
            if (index === 0) {
                li.classList.add("active");
                joinGroup(group.id, group.name);
            }

            li.addEventListener("click", () => {
                document.querySelectorAll(".group").forEach((g) => g.classList.remove("active"));
                li.classList.add("active");
                joinGroup(group.id, group.name);
            });

            groupList.appendChild(li);
        });
    } catch (error) {
        console.error("Error fetching groups:", error);
    }
}
function getCurrentGroupId() {
    const activeGroup = document.querySelector(".group.active"); // ✅ Get the active group
    return activeGroup ? activeGroup.getAttribute("data-group-id") : null; // ✅ Return group ID or null
}



// Join a group chat
function joinGroup(groupId, groupName) {
    // Remove 'active' class from all groups
    document.querySelectorAll("#group-list li").forEach(li => li.classList.remove("active"));

    // Set clicked group as active
    const selectedGroup = document.querySelector(`[data-group-id="${groupId}"]`);
    if (selectedGroup) selectedGroup.classList.add("active");

    localStorage.setItem("currentGroupId", groupId);
    document.getElementById("groupTitle").innerText = groupName;

    // ✅ Enable message input and send button
    messageInput.removeAttribute("disabled");
    sendBtn.removeAttribute("disabled");

    // ✅ Enable the Invite button when a group is selected
    const inviteBtn = document.getElementById("inviteBtn");
    if (inviteBtn) inviteBtn.removeAttribute("disabled"); 

    socket.emit("joinGroup", groupId);
    fetchGroupMessages(groupId);
}


const messagesContainer = document.getElementById("messagesContainer"); 


// Fetch previous messages of a group
async function fetchGroupMessages(groupId) {
    try {
        const response = await fetch(`http://localhost:3000/chat/group/${groupId}`, {
            method: "GET",
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });

        if (!response.ok) throw new Error("Failed to fetch messages");

        const messages = await response.json();
        const messagesContainer = document.getElementById("messagesContainer");

        if (!messagesContainer) {
            console.error("Error: messagesContainer element not found in DOM!");
            return;  // Prevent setting innerHTML on null
        }

        messagesContainer.innerHTML = ""; // Clear old messages

        messages.forEach(msg => {
            displayMessage(msg.message, msg.UserDatum?.name || "Unknown");
        });

    } catch (error) {
        console.error("Error fetching group messages:", error);
    }
}


// Display messages in chat
function displayMessage(message, senderName) {
    const messagesContainer = document.getElementById("messagesContainer");  // ✅ Ensure it's defined
    if (!messagesContainer) {
        console.error("messagesContainer not found in DOM!");
        return;
    }

    const messageElement = document.createElement("div");
    messageElement.innerHTML = `<strong>${senderName}:</strong> ${message}`;
    messagesContainer.appendChild(messageElement);
}


// Send a message to the group
async function sendMessage() {
    const messageInput = document.getElementById("messageInput").value;
    const groupId = getCurrentGroupId();
    const token = localStorage.getItem("token");

    console.log("JWT Token:", token); // ✅ Debug: Check if token exists

    if (!messageInput) {
        console.error("Message is missing");
        return;
    }
    if (!groupId) {
        console.log("Group ID missing");
        return;
    }
    if (!token) {
        console.log("Authentication token is missing!");
        return;
    }

    try {
        const response = await fetch("http://localhost:3000/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}` // ✅ Ensure token is included
            },
            body: JSON.stringify({ message: messageInput, groupId }),
        });

        if (!response.ok) {
            throw new Error(`Failed to send message. Status: ${response.status}`);
        }

        document.getElementById("messageInput").value = ""; // Clear input after sending
    } catch (error) {
        console.error("Error sending message:", error);
    }
}

  
//   function getCurrentGroupId() {
//     const activeGroup = document.querySelector(".group.active"); // Adjust selector as per your UI
//     return activeGroup ? activeGroup.dataset.groupId : null;
//   }
  


// Update online user list
socket.on("userList", (users) => {
    usersList.innerHTML = "";
    users.forEach((user) => {
        const userElement = document.createElement("li");
        userElement.innerText = user;
        usersList.appendChild(userElement);
    });
});

// Receive new group messages
socket.on("groupMessage", (data) => {
    displayMessage(data.user, data.text);
});

// Event listeners
sendBtn.addEventListener("click", sendMessage);
messageInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        sendMessage();
    }
});

document.addEventListener("DOMContentLoaded", () => {
    const inviteBtn = document.getElementById("inviteBtn");
    const inviteModal = document.getElementById("inviteModal");
    const closeModal = document.querySelector(".close");
    const sendInviteBtn = document.getElementById("sendInviteBtn");
    const inviteUserIdInput = document.getElementById("inviteUserId");

    // Open modal when clicking Invite
    inviteBtn.addEventListener("click", () => {
        inviteModal.style.display = "block";
    });

    // Close modal when clicking 'X'
    closeModal.addEventListener("click", () => {
        inviteModal.style.display = "none";
    });

    // Close modal when clicking outside of it
    window.addEventListener("click", (e) => {
        if (e.target === inviteModal) {
            inviteModal.style.display = "none";
        }
    });

    // Send Invite
    sendInviteBtn.addEventListener("click", async () => {
        const invitedUserId = inviteUserIdInput.value.trim();
        const groupId = getCurrentGroupId(); // Get active group ID

        if (!invitedUserId || !groupId) {
            alert("Please enter a valid user ID.");
            return;
        }

        try {
            const token = localStorage.getItem("token");
            const response = await fetch("/groups/invite", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ groupId, invitedUserId }),
            });

            const result = await response.json();
            if (response.ok) {
                alert("User invited successfully!");
                inviteModal.style.display = "none";
                inviteUserIdInput.value = ""; // Clear input field
            } else {
                alert(result.message || "Failed to invite user.");
            }
        } catch (error) {
            console.error("Error inviting user:", error);
            alert("Server error. Please try again.");
        }
    });
});

document.addEventListener("DOMContentLoaded", () => {
    const createGroupBtn = document.getElementById("createGroupBtn");
    const createGroupModal = document.getElementById("createGroupModal");
    const createClose = document.querySelector(".create-close");
    const createGroupConfirmBtn = document.getElementById("createGroupConfirmBtn");
    const groupNameInput = document.getElementById("groupNameInput");

    // Open modal when clicking "Create Group"
    createGroupBtn.addEventListener("click", () => {
        createGroupModal.style.display = "block";
    });

    // Close modal when clicking 'X'
    createClose.addEventListener("click", () => {
        createGroupModal.style.display = "none";
    });

    // Close modal when clicking outside of it
    window.addEventListener("click", (e) => {
        if (e.target === createGroupModal) {
            createGroupModal.style.display = "none";
        }
    });

    // Create Group
    createGroupConfirmBtn.addEventListener("click", async () => {
        const groupName = groupNameInput.value.trim();

        if (!groupName) {
            alert("Please enter a group name.");
            return;
        }

        try {
            const token = localStorage.getItem("token");
            console.log("Group Name:", groupName);
            if (!groupName || groupName.length < 3) { 
                alert("Group name is required and must be at least 3 characters long.");
                return;
            }
            
            const response = await fetch("http://localhost:3000/groups", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
    body: JSON.stringify({ name: groupName }), // Ensure correct key name
            });

            const result = await response.json();

            if (response.ok) {
                alert("Group created successfully!");
                createGroupModal.style.display = "none";
                groupNameInput.value = ""; // Clear input field
                fetchGroups(); // Refresh the group list
            } else {
                alert(result.message || "Failed to create group.");
            }
        } catch (error) {
            console.error("Error creating group:", error);
            alert("Server error. Please try again.");
        }
    });
});
document.addEventListener("DOMContentLoaded", () => {
    const inviteBtn = document.getElementById("inviteBtn");
    if (inviteBtn) inviteBtn.setAttribute("disabled", "true"); // ✅ Disabled by default
    fetchUserDetails().then(() => fetchGroups());
});
document.addEventListener("DOMContentLoaded", () => {
    const inviteBtn = document.getElementById("inviteBtn");
    const inviteModal = document.getElementById("inviteModal");
    const closeModal = document.querySelector(".close");
    
    if (inviteBtn) {
        inviteBtn.addEventListener("click", () => {
            inviteModal.style.display = "block"; // ✅ Show modal
        });
    }

    if (closeModal) {
        closeModal.addEventListener("click", () => {
            inviteModal.style.display = "none"; // ✅ Hide modal on close
        });
    }

    window.addEventListener("click", (e) => {
        if (e.target === inviteModal) {
            inviteModal.style.display = "none"; // ✅ Hide modal when clicking outside
        }
    });
});

document.addEventListener("DOMContentLoaded", () => {
    const inviteBtn = document.getElementById("inviteBtn");

    if (!inviteBtn) {
        console.error("Invite button not found in DOM!");
        return;  // Prevent further execution if the button doesn't exist
    }

    inviteBtn.setAttribute("disabled", "true"); // ✅ Disable by default

    fetchUserDetails().then(() => fetchGroups());
});



// Load groups and user details on page load
fetchUserDetails().then(() => fetchGroups());