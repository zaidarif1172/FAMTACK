# FamTalk 💬

A modern, real-time chat application built with React, Node.js, and WebRTC. FamTalk offers secure messaging, voice/video calling, and a beautiful glassmorphism UI.

![FamTalk](https://img.shields.io/badge/status-active-success.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## ✨ Key Features

### Core Messaging
- 💬 **Real-time Chat** - Instant messaging powered by Socket.IO
- ✍️ **Typing Indicators** - See when someone is typing
- ✓ **Read Receipts** - Know when messages are read
- 👥 **Contact System** - Add contacts by email address

### Communication
- 📞 **Voice Calling** - Crystal-clear audio calls via WebRTC
- 📹 **Video Calling** - Face-to-face video conversations
- 🟢 **Presence System** - Real-time online/offline status

### User Experience
- 🎨 **Glassmorphism UI** - Modern, premium design aesthetic
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- 🌙 **Dark Theme** - Easy on the eyes with elegant dark mode
- ⚡ **Fast & Lightweight** - Optimized performance

## 🛠️ Tech Stack

### Frontend
- **React** - UI framework
- **Zustand** - State management
- **Tailwind CSS** - Styling
- **Socket.IO Client** - Real-time communication
- **WebRTC** - Peer-to-peer audio/video

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **Socket.IO** - WebSocket server
- **Prisma** - Database ORM
- **SQLite** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ installed
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd famtalk
   ```

2. **Setup Backend**
   ```bash
   cd server
   npm install
   npx prisma db push
   ```

3. **Setup Frontend**
   ```bash
   cd ../client
   npm install
   ```

4. **Environment Variables**
   
   Create `server/.env`:
   ```env
   DATABASE_URL="file:./dev.db"
   JWT_SECRET="your-secret-key-here"
   PORT=3001
   ```

### Running the Application

**Option 1: Automated (Windows)**
```bash
# From the project root
.\run_app.bat
```

**Option 2: Manual**

Terminal 1 - Backend:
```bash
cd server
npm run dev
```

Terminal 2 - Frontend:
```bash
cd client
npm run dev
```

The app will be available at `http://localhost:5173`

## 📁 Project Structure

```
famtalk/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── store/         # Zustand state management
│   │   └── index.css      # Global styles
│   └── package.json
├── server/                 # Backend Node.js application
│   ├── routes/            # API routes
│   ├── middleware/        # Auth middleware
│   ├── prisma/            # Database schema
│   ├── socket.js          # Socket.IO handlers
│   └── package.json
└── README.md
```

## 🎯 Usage

1. **Register** - Create a new account with email and password
2. **Add Contacts** - Click the "+" button and enter a friend's email
3. **Start Chatting** - Select a contact and send messages
4. **Make Calls** - Click the phone (📞) or video (📹) icon to call

## 🔒 Security

- Passwords hashed with bcryptjs
- JWT-based authentication
- Secure WebSocket connections
- Input validation and sanitization

## 📝 License

This project is licensed under the MIT License.

## 👨‍💻 Author

Created with ❤️ for the Google Program Submission

---

**Note:** For voice/video calls, ensure your browser has camera and microphone permissions enabled.
