
// ==========================================
// STUDYBOT - FRONTEND JAVASCRIPT
// ==========================================

// Current conversation
let conversationId = crypto.randomUUID();

// HTML elements
const chatMessages = document.getElementById("chatMessages");
const userInput = document.getElementById("userInput");
const sendButton = document.getElementById("sendButton");
const newChatButton = document.getElementById("newChat");

// Local Storage
const STORAGE_KEY = "studybot_conversations";

let conversations = {};

try {
    conversations = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
} catch (error) {
    console.error("Could not load saved conversations:", error);
    conversations = {};
}

// ==========================================
// PREVIOUS CHATS SECTION
// ==========================================

const historySection = document.createElement("div");
historySection.id = "conversationList";
historySection.innerHTML = "<h3>Previous Chats</h3>";

newChatButton.insertAdjacentElement("afterend", historySection);

// ==========================================
// SAVE CONVERSATIONS
// ==========================================

function saveConversations() {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(conversations)
    );
}

// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHTML(text) {
    return text.replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[char]);
}

// ==========================================
// MARKDOWN FORMATTER
// ==========================================

function formatMarkdown(text) {
    const lines = text.split("\n");

    let html = "";
    let inCode = false;
    let codeLines = [];
    let inList = false;
    let listType = "";

    function closeList() {
        if (inList) {
            html += `</${listType}>`;
            inList = false;
        }
    }

    function inlineFormat(text) {
        return text
            .replace(/`([^`]+)`/g, "<code>$1</code>")
            .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
            .replace(/\*(.*?)\*/g, "<em>$1</em>");
    }

    for (const line of lines) {

        // Code blocks
        if (line.trim().startsWith("```")) {
            closeList();

            if (!inCode) {
                inCode = true;
                codeLines = [];
            } else {
                html += `<pre><code>${codeLines.join("\n")}</code></pre>`;
                inCode = false;
            }

            continue;
        }

        if (inCode) {
            codeLines.push(escapeHTML(line));
            continue;
        }

        // Headings and lists
        const heading = line.match(/^(#{1,3})\s+(.+)/);
        const bullet = line.match(/^\s*[-*]\s+(.+)/);
        const numbered = line.match(/^\s*\d+\.\s+(.+)/);

        if (heading) {
            closeList();

            const level = heading[1].length;

            html += `<h${level}>${inlineFormat(
                escapeHTML(heading[2])
            )}</h${level}>`;

        } else if (bullet || numbered) {

            const type = bullet ? "ul" : "ol";

            if (!inList || listType !== type) {
                closeList();
                listType = type;
                html += `<${type}>`;
                inList = true;
            }

            const content = bullet ? bullet[1] : numbered[1];

            html += `<li>${inlineFormat(
                escapeHTML(content)
            )}</li>`;

        } else {
            closeList();

            if (line.trim() === "") {
                html += "<br>";
            } else {
                html += `<p>${inlineFormat(
                    escapeHTML(line)
                )}</p>`;
            }
        }
    }

    closeList();

    if (inCode) {
        html += `<pre><code>${codeLines.join("\n")}</code></pre>`;
    }

    return html;
}

// ==========================================
// DISPLAY MESSAGES
// ==========================================

function addMessage(message, sender) {

    const messageDiv = document.createElement("div");

    messageDiv.classList.add("message", sender);

    // Special welcome screen
    if (
        sender === "bot" &&
        message.startsWith("Hi! 👋 I'm StudyBot.")
    ) {
        messageDiv.classList.add("welcome-screen");

        messageDiv.innerHTML = `
            <h1>What can I help you learn?</h1>
            <p>Your personal AI study assistant</p>
        `;

    } else if (sender === "bot") {

        messageDiv.innerHTML = formatMarkdown(message);

    } else {

        messageDiv.textContent = message;

    }

    chatMessages.appendChild(messageDiv);

    chatMessages.scrollTop = chatMessages.scrollHeight;

    return messageDiv;
}

// ==========================================
// SAVE MESSAGE TO CURRENT CONVERSATION
// ==========================================

function saveMessage(role, content) {

    if (!conversations[conversationId]) {

        conversations[conversationId] = {
            id: conversationId,
            title: role === "user" ? content.slice(0, 35) : "New Chat",
            messages: [],
            updatedAt: Date.now()
        };

    }

    conversations[conversationId].messages.push({
        role: role,
        content: content
    });

    conversations[conversationId].updatedAt = Date.now();

    saveConversations();

    renderConversationList();
}

// ==========================================
// DISPLAY PREVIOUS CHATS
// ==========================================

function renderConversationList() {

    historySection.innerHTML = "<h3>Previous Chats</h3>";

    const sortedConversations = Object.values(conversations)
        .sort((a, b) => b.updatedAt - a.updatedAt);

    sortedConversations.forEach(conversation => {

        const chatItem = document.createElement("button");

        chatItem.className = "history-item";

        chatItem.textContent = conversation.title;
        chatItem.title = conversation.title;

        if (conversation.id === conversationId) {
            chatItem.classList.add("active");
        }

        chatItem.addEventListener("click", function() {
            openConversation(conversation.id);
        });

        historySection.appendChild(chatItem);

    });
}

// ==========================================
// OPEN PREVIOUS CONVERSATION
// ==========================================

function openConversation(id) {

    if (!conversations[id]) return;

    conversationId = id;

    chatMessages.innerHTML = "";

    conversations[id].messages.forEach(message => {

        addMessage(
            message.content,
            message.role === "user" ? "user" : "bot"
        );

    });

    renderConversationList();

    userInput.value = "";
    userInput.focus();
}

// ==========================================
// SEND MESSAGE TO GEMINI BACKEND
// ==========================================

async function sendMessage() {

    const message = userInput.value.trim();

    if (!message || sendButton.disabled) return;

    // Display user message
    addMessage(message, "user");

    // Save user message
    saveMessage("user", message);

    userInput.value = "";

    sendButton.disabled = true;
    sendButton.textContent = "Thinking...";

    const loadingMessage = addMessage(
        "StudyBot is thinking...",
        "bot"
    );

    try {

        const response = await fetch(
            "http://127.0.0.1:8000/chat",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    conversation_id: conversationId,
                    message: message
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || "Server error");
        }

        // Display Gemini response
        loadingMessage.innerHTML = formatMarkdown(data.response);

        // Save assistant response
        saveMessage("assistant", data.response);

    } catch (error) {

        loadingMessage.textContent =
            "Sorry, " + error.message + " Please try again.";

        console.error("Chat error:", error);

    } finally {

        sendButton.disabled = false;
        sendButton.textContent = "Send ➤";

        userInput.focus();

    }
}

// ==========================================
// SEND BUTTON
// ==========================================

sendButton.addEventListener("click", sendMessage);

// ==========================================
// ENTER KEY
// ==========================================

userInput.addEventListener("keydown", function(event) {

    if (event.key === "Enter") {
        sendMessage();
    }

});

// ==========================================
// NEW CHAT BUTTON
// ==========================================

newChatButton.addEventListener("click", function() {

    // Generate new conversation ID
    conversationId = crypto.randomUUID();

    // Clear current chat
    chatMessages.innerHTML = "";

    // Display welcome screen
    addMessage(
        "Hi! 👋 I'm StudyBot. Ask me anything about your studies!",
        "bot"
    );

    // Reset input
    userInput.value = "";
    userInput.focus();

    renderConversationList();

});

// ==========================================
// INITIALIZE STUDYBOT
// ==========================================

// Display saved conversations
renderConversationList();

// Display welcome screen on page load
addMessage(
    "Hi! 👋 I'm StudyBot. Ask me anything about your studies!",
    "bot"
);
