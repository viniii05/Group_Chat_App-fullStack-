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
// async function fetchGroups() {
//     try {
//         const response = await fetch("/groups", {
//             headers: { Authorization: `Bearer ${token}` },
//         });

//         if (!response.ok) throw new Error("Failed to fetch groups");

//         const groups = await response.json();
//         const groupList = document.getElementById("group-list");
//         groupList.innerHTML = "";

//         groups.forEach((group, index) => {
//             const li = document.createElement("li");
//             li.innerText = group.name;
//             li.setAttribute("data-group-id", group.id);
//             li.classList.add("group");

//             if (index === 0) {
//                 li.classList.add("active");
//                 joinGroup(group.id, group.name);
//             }

//             li.addEventListener("click", () => {
//                 document.querySelectorAll(".group").forEach(g => g.classList.remove("active"));
//                 li.classList.add("active");
//                 joinGroup(group.id, group.name);
//             });

//             groupList.appendChild(li);
//         });
//     } catch (error) {
//         console.error("Error fetching groups:", error);
//     }
// }
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

            // ✅ Set first group as active by default
            if (index === 0) {
                li.classList.add("active");
                localStorage.setItem("activeGroupId", group.id); // ✅ Store group ID
                joinGroup(group.id, group.name);
            }

            li.addEventListener("click", () => {
                document.querySelectorAll(".group").forEach(g => g.classList.remove("active"));
                li.classList.add("active");

                localStorage.setItem("activeGroupId", group.id); // ✅ Store group ID when clicked
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
            displayMessage(msg.message, msg.User.name || "Unknown");
        });

    } catch (error) {
        console.error("Error fetching group messages:", error);
    }
}

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
//         const members = data.members;

//         console.log("Fetched members:", members);

//         if (!Array.isArray(members)) {
//             console.error("Error: members is not an array!", members);
//             return;
//         }

//         const membersList = document.getElementById("group-members");
//         if (!membersList) {
//             console.error("Error: group-members element not found in DOM!");
//             return;
//         }

//         membersList.innerHTML = ""; // Clear previous list

//         const currentUserId = parseInt(localStorage.getItem("userId")); // Get logged-in user's ID
//         let currentUserIsAdmin = false;

//         members.forEach(memberData => {
//             const { id, isAdmin, User } = memberData;
//             if (!User) return; // Ensure User object exists

//             const li = document.createElement("li");
//             li.innerHTML = `<strong>${User.name}</strong> ${isAdmin ? "(Admin)" : ""}`;

//             // ✅ Correctly check if the logged-in user is an admin
//             if (User.id === currentUserId && isAdmin) {
//                 currentUserIsAdmin = true;
//             }
//             console.log("Backend says currentUserIsAdmin:", data.currentUserIsAdmin);

//             if (!isAdmin) {
//                 const promoteBtn = document.createElement("button");
//                 promoteBtn.innerText = "Make Admin";
//                 promoteBtn.onclick = () => promoteToAdmin(id, li, promoteBtn);
//                 li.appendChild(promoteBtn);
//             } else if (User.id !== currentUserId) {
//                 const removeAdminBtn = document.createElement("button");
//                 removeAdminBtn.innerText = "Remove Admin";
//                 removeAdminBtn.onclick = () => removeAdmin(id, li, removeAdminBtn);
//                 li.appendChild(removeAdminBtn);
//             }

//             membersList.appendChild(li);
//         });

//         // ✅ Manually check if the logged-in user is an admin from backend response
//         if (!currentUserIsAdmin && data.currentUserIsAdmin !== undefined) {
//             currentUserIsAdmin = data.currentUserIsAdmin; // Use backend response
//         }

//         // ✅ Enable the Invite button ONLY if the logged-in user is an admin
//         const inviteBtn = document.getElementById("inviteBtn");
//         if (inviteBtn) {
//             if (currentUserIsAdmin) {
//                 inviteBtn.removeAttribute("disabled"); // Enable button for admins
//             } else {
//                 inviteBtn.setAttribute("disabled", "true"); // Disable for non-admins
//             }
//         }

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
        const members = data.members;

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

        const currentUserId = parseInt(localStorage.getItem("userId")); // Get logged-in user's ID
        let currentUserIsAdmin = false;

        members.forEach(memberData => {
            const { id, isAdmin, User } = memberData;
            if (!User) return; // Ensure User object exists

            const li = document.createElement("li");
            li.innerHTML = `<strong>${User.name}</strong> ${isAdmin ? "<span class='admin-badge'>Admin</span>" : ""}`;

            // ✅ Correctly check if the logged-in user is an admin
            if (User.id === currentUserId && isAdmin) {
                currentUserIsAdmin = true;
            }

            console.log("Backend says currentUserIsAdmin:", data.currentUserIsAdmin);

            // ✅ Admin Promotion & Removal Buttons
            if (!isAdmin) {
                const promoteBtn = document.createElement("button");
                promoteBtn.innerText = "Make Admin";
                promoteBtn.classList.add("promote-btn");
                promoteBtn.onclick = () => promoteToAdmin(id, li, promoteBtn);
                li.appendChild(promoteBtn);
            } else if (User.id !== currentUserId) {
                const removeAdminBtn = document.createElement("button");
                removeAdminBtn.innerText = "Remove Admin";
                removeAdminBtn.classList.add("remove-btn");
                removeAdminBtn.onclick = () => removeAdmin(id, li, removeAdminBtn);
                li.appendChild(removeAdminBtn);
            }

            membersList.appendChild(li);
        });

        // ✅ Manually check if the logged-in user is an admin from backend response
        if (!currentUserIsAdmin && data.currentUserIsAdmin !== undefined) {
            currentUserIsAdmin = data.currentUserIsAdmin; // Use backend response
        }

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


async function inviteUserToGroup() {
    const groupId = localStorage.getItem("activeGroupId");
    console.log("Stored activeGroupId:", groupId); // ✅ Debugging

    if (!groupId || groupId === "null") {
        alert("Please select a group first before inviting users.");
        return;
    }

    const email = prompt("Enter the email of the user to invite:");
    if (!email || email.trim() === "") {
        alert("User email is required!");
        return;
    }

    try {
        console.log("Inviting user to group:", groupId, email); // ✅ Debugging

        const response = await fetch(`/groups/${groupId}/invite`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({ groupId, searchQuery: email }), // ✅ Fix: Ensure correct key
        });

        const data = await response.json();
        console.log("Invite API Response:", data); // ✅ Debugging

        if (!response.ok) throw new Error(data.message || "Failed to invite user");

        alert("User invited successfully!");
        fetchGroupMembers(groupId); // ✅ Refresh group members list
    } catch (error) {
        console.error("Error inviting user:", error);
        alert(`Error: ${error.message}`);
    }
}

// async function inviteUserToGroup() {
//     const groupId = localStorage.getItem("activeGroupId");
    
//     if (!groupId || groupId === "null") { // ✅ Prevent calling API with null
//         alert("Please select a group first before inviting users.");
//         return;
//     }

//     const email = prompt("Enter the email of the user to invite:");
//     if (!email) {
//         alert("User email is required!");
//         return;
//     }

//     try {
//         console.log("Inviting user to group:", groupId, email); // ✅ Debugging
//         const response = await fetch(`/groups/${groupId}/invite`, {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json",
//                 Authorization: `Bearer ${localStorage.getItem("token")}`,
//             },
//             body: JSON.stringify({ email }),
//         });

//         const data = await response.json();
//         console.log("Invite API Response:", data); // ✅ Debugging

//         if (!response.ok) throw new Error(data.message || "Failed to invite user");

//         alert("User invited successfully!");
//         fetchGroupMembers(groupId); // ✅ Refresh group members list
//     } catch (error) {
//         console.error("Error inviting user:", error);
//         alert(`Error: ${error.message}`);
//     }
// }



// Promote user to admin
async function promoteToAdmin(userId, listItem, promoteBtn) {
    const groupId = getCurrentGroupId();
    if (!groupId) return;

    try {
        const response = await fetch("/groups/change-admin", {
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
        const response = await fetch("/groups/remove-user", {
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
    document.getElementById("messageInput").removeAttribute("disabled");
document.getElementById("sendBtn").removeAttribute("disabled");

    document.querySelectorAll(".group").forEach(li => li.classList.remove("active"));

    const selectedGroup = document.querySelector(`[data-group-id="${groupId}"]`);
    if (selectedGroup) selectedGroup.classList.add("active");

    localStorage.setItem("currentGroupId", groupId);
    document.getElementById("groupTitle").innerText = groupName;

    document.getElementById("messageInput").removeAttribute("disabled");
    document.getElementById("sendBtn").removeAttribute("disabled");

    socket.emit("joinGroup", `group_${groupId}`);
    fetchGroupMessages(groupId);
    fetchGroupMembers(groupId);
}
function setActiveGroup(groupId) {
    localStorage.setItem("activeGroupId", groupId);
}

document.querySelectorAll(".group").forEach((groupItem) => {
    groupItem.addEventListener("click", () => {
        document.querySelectorAll(".group").forEach((g) => g.classList.remove("active"));
        groupItem.classList.add("active");
        setActiveGroup(groupItem.getAttribute("data-group-id")); // ✅ Store group ID
        joinGroup(groupItem.getAttribute("data-group-id"), groupItem.innerText);
        console.log(localStorage.getItem("activeGroupId"));

    });
});

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
socket.on("receiveMessage", (data) => {
    displayMessage(data.text, data.user);
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

document.addEventListener("DOMContentLoaded", () => {
    const createGroupBtn = document.getElementById("createGroupBtn");
    const createGroupModal = document.getElementById("createGroupModal");
    const closeModalBtn = document.querySelector(".create-close");
    const confirmGroupBtn = document.getElementById("createGroupConfirmBtn");

    // ✅ Open modal when clicking "Create Group" button
    createGroupBtn.addEventListener("click", () => {
        createGroupModal.style.display = "block";
    });

    // ✅ Close modal when clicking "X" button
    closeModalBtn.addEventListener("click", () => {
        createGroupModal.style.display = "none";
    });

    // ✅ Create group when clicking confirm
    confirmGroupBtn.addEventListener("click", async () => {
        const groupName = document.getElementById("groupNameInput").value.trim();
        if (!groupName) {
            alert("Group name cannot be empty!");
            return;
        }

        try {
            console.log("Creating group:", groupName);
            const token = localStorage.getItem("token");
            const response = await fetch("/groups", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ name: groupName }),
            });

            const data = await response.json();
            console.log("Server Response:", data);

            if (response.ok) {
                alert("Group created successfully!");
                createGroupModal.style.display = "none"; // ✅ Close modal
                fetchGroups(); // ✅ Refresh groups list
            } else {
                alert(data.message || "Failed to create group.");
            }
        } catch (error) {
            console.error("Error creating group:", error);
            alert("Server error. Please try again.");
        }
    });
    document.getElementById("inviteBtn").addEventListener("click", () => {
        console.log("Invite button clicked!");
        inviteUserToGroup();
    });
    
});


