# 📚 StudyBot – AI Study Assistant

StudyBot is an AI-powered study assistant designed to help students understand technical concepts, clarify doubts, and learn more effectively through interactive conversations.

It uses Google's Gemini API to generate contextual responses and maintains conversation history so students can continue previous discussions.

## ✨ Features

- **AI-Powered Chat:** Ask questions and receive explanations using Google Gemini.
- **Context-Aware Conversations:** Maintains recent conversation context for follow-up questions.
- **Chat History:** Save and revisit previous conversations using browser Local Storage.
- **New Chat:** Start a fresh conversation whenever needed.
- **Markdown Formatting:** Displays headings, lists, bold text, and code blocks.
- **Responsive Interface:** Simple and user-friendly web interface.
- **Error Handling:** Handles API errors and unsuccessful requests.

## 🛠️ Technologies Used

| Component | Technology |
|---|---|
| Frontend | HTML, CSS, JavaScript |
| Backend | Python, FastAPI |
| AI Model | Google Gemini API |
| API Communication | REST API |
| Conversation Storage | In-memory Python dictionary |
| Browser Chat History | Local Storage |

## 📁 Project Structure

```text
StudyBot/
│
├── backend/
│   ├── main.py
│   └── chatbot.py
│
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
│
├── .gitignore
├── requirements.txt
├── list_models.py
└── test_gemini.py
```

## ⚙️ Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/shahammahi-hash/StudyBot.git
cd StudyBot
```

### 2. Create a virtual environment

```bash
python -m venv venv
```

### 3. Activate the virtual environment

**Windows PowerShell:**

```powershell
.\venv\Scripts\Activate.ps1
```

### 4. Install dependencies

```bash
pip install -r requirements.txt
```

### 5. Configure the Gemini API key

Create a `.env` file in the root directory:

```env
GEMINI_API_KEY=your_gemini_api_key
```

Get your API key from [Google AI Studio](https://aistudio.google.com/).

Never upload your `.env` file or API key to GitHub.

### 6. Start the backend

```bash
python -m uvicorn backend.main:app --reload
```

Backend URL:

```text
http://127.0.0.1:8000
```

API documentation:

```text
http://127.0.0.1:8000/docs
```

### 7. Start the frontend

Open a second terminal:

```bash
python -m http.server 5500 --directory frontend
```

Open the application:

```text
http://127.0.0.1:5500
```

Keep both terminals running while using StudyBot.

## 🔄 How It Works

1. A student enters a question through the frontend.
2. JavaScript sends the question and conversation ID to the FastAPI backend.
3. The backend retrieves the conversation context from its in-memory history.
4. The Gemini API generates a response using the custom StudyBot system prompt.
5. The response is returned to the frontend and displayed with Markdown formatting.
6. Conversation messages are saved in browser Local Storage for revisiting previous chats.

## 🚀 Future Enhancements

- File and image upload support.
- Persistent conversation storage using a database.
- User authentication.
- Improved study recommendations.
- Subject-wise learning and practice quizzes.

## 👩‍💻 Author

**Mahi Shah**

AI-powered learning and software development enthusiast.

## 🔗 GitHub Repository

[StudyBot – AI Study Assistant](https://github.com/shahammahi-hash/StudyBot)
