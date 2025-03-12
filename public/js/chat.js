const socket = io("http://localhost:3000");
const token = localStorage.getItem("token");

if (!token) {
    alert("Unauthorized access! Please log in.");
    window.location.href = "/login.html";
}

// ====== UTILITY FUNCTIONS ======
// Get the active group ID
function getCurrentGroupId() {
    const activeGroup = document.querySelector(".group.active");
    return activeGroup ? activeGroup.getAttribute("data-group-id") : null;
}

// Display messages in chat
function displayMessage(message, senderName) {
    const messagesContainer = document.getElementById("messagesContainer");
    if (!messagesContainer) {
        console.error("Error: messagesContainer not found in DOM!");
        return;
    }

    const messageElement = document.createElement("div");
    messageElement.innerHTML = `<strong>${senderName}:</strong> ${message}`;
    messagesContainer.appendChild(messageElement);
}

// ====== API CALLS ======
// Fetch user details and store them
async function fetchUserDetails() {
    try {
        const response = await fetch("/user", {
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

// Fetch and display groups
async function fetchGroups() {
    try {
        const response = await fetch("/groups", {
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

            if (index === 0) {
                li.classList.add("active");
                joinGroup(group.id, group.name);
            }

            li.addEventListener("click", () => {
                document.querySelectorAll(".group").forEach(g => g.classList.remove("active"));
                li.classList.add("active");
                joinGroup(group.id, group.name);
            });

            groupList.appendChild(li);
        });
    } catch (error) {
        console.error("Error fetching groups:", error);
    }
}

// Fetch and display group messages
async function fetchGroupMessages(groupId) {
    try {
        const response = await fetch(`/chat/group/${groupId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error("Failed to fetch messages");

        const messages = await response.json();
        const messagesContainer = document.getElementById("messagesContainer");

        if (!messagesContainer) {
            console.error("Error: messagesContainer element not found in DOM!");
            return;
        }

        messagesContainer.innerHTML = ""; // Clear old messages

        messages.forEach(msg => {
            displayMessage(msg.message, msg.UserDatum?.name || "Unknown");
        });

    } catch (error) {
        console.error("Error fetching group messages:", error);
    }
}

// Fetch and display group members
// async function fetchGroupMembers(groupId) {
//     if (!groupId) {
//         console.warn("No active group ID found.");
//         return;
//     }

//     try {
//         const response = await fetch(`/groups/${groupId}/members`, {
//             headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
//         });

//         if (!response.ok) throw new Error("Failed to fetch group members");

//         const data = await response.json(); 
//         const members = data.members; // ✅ Correctly access the array

//         console.log("Fetched members:", members); // ✅ Debugging: Ensure we have the right array

//         if (!Array.isArray(members)) {
//             console.error("Error: members is not an array!", members);
//             return;
//         }

//         const membersList = document.getElementById("membersList");
//         if (!membersList) {
//             console.error("Error: membersList element not found in DOM!");
//             return;
//         }

//         membersList.innerHTML = ""; // Clear previous list

//         members.forEach(memberData => {
//             const { id, isAdmin, User } = memberData;
//             if (!User) return; // Ensure User object exists

//             const li = document.createElement("li");
//             li.innerHTML = `<strong>${User.name}</strong> ${isAdmin ? "(Admin)" : ""}`;

//             // If user is not an admin, add "Make Admin" button
//             if (!isAdmin) {
//                 const promoteBtn = document.createElement("button");
//                 promoteBtn.innerText = "Make Admin";
//                 promoteBtn.onclick = () => promoteToAdmin(id);
//                 li.appendChild(promoteBtn);
//             }

//             membersList.appendChild(li);
//         });

//     } catch (error) {
//         console.error("Error fetching group members:", error);
//     }
// }

async function fetchGroupMembers(groupId) {
    if (!groupId) {
        console.warn("No active group ID found.");
        return;
    }

    try {
        const response = await fetch(`/groups/${groupId}/members`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        if (!response.ok) throw new Error("Failed to fetch group members");

        const data = await response.json();
        const members = data.members; // ✅ Ensure correct structure

        console.log("Fetched members:", members);

        if (!Array.isArray(members)) {
            console.error("Error: members is not an array!", members);
            return;
        }

        const membersList = document.getElementById("group-members");
        if (!membersList) {
            console.error("Error: group-members element not found in DOM!");
            return;
        }

        membersList.innerHTML = ""; // Clear previous list

        let currentUserIsAdmin = false;
        const currentUserId = parseInt(localStorage.getItem("userId")); // Get logged-in user's ID

        members.forEach(memberData => {
            const { id, isAdmin, User } = memberData;
            if (!User) return; // Ensure User object exists

            const li = document.createElement("li");
            li.innerHTML = `<strong>${User.name}</strong> ${isAdmin ? "(Admin)" : ""}`;

            // ✅ If the logged-in user is an admin, allow them to invite others
            if (isAdmin && User.id === currentUserId) {
                currentUserIsAdmin = true;
            }

            // ✅ If the user is not an admin, show "Make Admin" button
            if (!isAdmin) {
                const promoteBtn = document.createElement("button");
                promoteBtn.innerText = "Make Admin";
                promoteBtn.onclick = () => promoteToAdmin(id, li, promoteBtn); // Pass elements to update UI
                li.appendChild(promoteBtn);
            } else if (User.id !== currentUserId) {
                // ✅ If the user is already an admin, add a "Remove Admin" button
                const removeAdminBtn = document.createElement("button");
                removeAdminBtn.innerText = "Remove Admin";
                removeAdminBtn.onclick = () => removeAdmin(id, li, removeAdminBtn);
                li.appendChild(removeAdminBtn);
            }

            membersList.appendChild(li);
        });

        // ✅ Enable the Invite button ONLY if the logged-in user is an admin
        const inviteBtn = document.getElementById("inviteBtn");
        if (inviteBtn) {
            if (currentUserIsAdmin) {
                inviteBtn.removeAttribute("disabled"); // Enable button for admins
            } else {
                inviteBtn.setAttribute("disabled", "true"); // Disable for non-admins
            }
        }

    } catch (error) {
        console.error("Error fetching group members:", error);
    }
}



// Promote user to admin
async function promoteToAdmin(userId, listItem, promoteBtn) {
    const groupId = getCurrentGroupId();
    if (!groupId) return;

    try {
        const response = await fetch("/groups/make-admin", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ groupId, userId }),
        });

        const result = await response.json();
        if (response.ok) {
            alert("User promoted to admin!");

            // ✅ Update UI instantly
            promoteBtn.remove(); // Remove "Make Admin" button
            listItem.innerHTML += " (Admin)"; // Show "Admin" next to name

            // ✅ Add "Remove Admin" button
            const removeAdminBtn = document.createElement("button");
            removeAdminBtn.innerText = "Remove Admin";
            removeAdminBtn.onclick = () => removeAdmin(userId, listItem, removeAdminBtn);
            listItem.appendChild(removeAdminBtn);

        } else {
            alert(result.message || "Failed to promote user.");
        }
    } catch (error) {
        console.error("Error promoting user:", error);
        alert("Server error. Please try again.");
    }
}

async function removeAdmin(userId, listItem, removeAdminBtn) {
    const groupId = getCurrentGroupId();
    if (!groupId) return;

    try {
        const response = await fetch("/groups/remove-admin", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ groupId, userId }),
        });

        const result = await response.json();
        if (response.ok) {
            alert("Admin rights removed!");

            // ✅ Update UI instantly
            removeAdminBtn.remove(); // Remove "Remove Admin" button
            listItem.innerHTML = `<strong>${listItem.innerText.replace(" (Admin)", "")}</strong>`; // Remove "Admin" text

            // ✅ Add back "Make Admin" button
            const promoteBtn = document.createElement("button");
            promoteBtn.innerText = "Make Admin";
            promoteBtn.onclick = () => promoteToAdmin(userId, listItem, promoteBtn);
            listItem.appendChild(promoteBtn);

        } else {
            alert(result.message || "Failed to remove admin rights.");
        }
    } catch (error) {
        console.error("Error removing admin:", error);
        alert("Server error. Please try again.");
    }
}

// Send message to group
async function sendMessage() {
    const messageInput = document.getElementById("messageInput");
    const message = messageInput.value.trim();
    const groupId = getCurrentGroupId();

    if (!message || !groupId) return;

    try {
        const response = await fetch("/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ message, groupId }),
        });

        if (!response.ok) throw new Error("Failed to send message");

        messageInput.value = ""; // Clear input after sending
    } catch (error) {
        console.error("Error sending message:", error);
    }
}

// Join a group chat
function joinGroup(groupId, groupName) {
    document.querySelectorAll(".group").forEach(li => li.classList.remove("active"));

    const selectedGroup = document.querySelector(`[data-group-id="${groupId}"]`);
    if (selectedGroup) selectedGroup.classList.add("active");

    localStorage.setItem("currentGroupId", groupId);
    document.getElementById("groupTitle").innerText = groupName;

    document.getElementById("messageInput").removeAttribute("disabled");
    document.getElementById("sendBtn").removeAttribute("disabled");

    socket.emit("joinGroup", groupId);
    fetchGroupMessages(groupId);
    fetchGroupMembers(groupId);
}

// ====== SOCKET LISTENERS ======
socket.on("userList", (users) => {
    const usersList = document.getElementById("usersList");
    usersList.innerHTML = "";
    users.forEach(user => {
        const li = document.createElement("li");
        li.innerText = user;
        usersList.appendChild(li);
    });
});

socket.on("groupMessage", (data) => {
    displayMessage(data.user, data.text);
});

// ====== EVENT LISTENERS ======
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("sendBtn").addEventListener("click", sendMessage);
    document.getElementById("messageInput").addEventListener("keypress", (event) => {
        if (event.key === "Enter") sendMessage();
    });

    const groupId = getCurrentGroupId();
    if (groupId) fetchGroupMembers(groupId); // ✅ Fetch members when page loads

    fetchUserDetails();
    fetchGroups();
});
