# FamTalk - Development Checklist

## 1. Project Setup
- [x] **Initialize Project Structure**
    - [x] Create root directory.
    - [x] Initialize Git repository (`git init`).
    - [x] Create `server` and `client` directories.
    - [x] Create `package.json` for server.
    - [x] Scaffold React app for client (`npm create vite@latest`).

## 2. Backend Setup (Node/Express)
- [x] **Install Dependencies**
    - [x] `express`, `socket.io`, `cors`, `dotenv`, `jsonwebtoken`, `bcryptjs`, `@prisma/client`.
    - [x] Dev dependencies: `nodemon`, `prisma`.
- [x] **Configure Server**
    - [x] Create `index.js` entry point.
    - [x] Setup Express middleware (CORS, JSON).
    - [x] Configure basic Socket.io server.

## 3. Database Setup (Prisma/SQLite)
- [x] **Initialize Prisma**
    - [x] Run `npx prisma init`.
    - [x] Configure `schema.prisma` provider to `sqlite`.
- [x] **Define Schema**
    - [x] Create `User` model (email, password, username, onlineStatus).
    - [x] Create `Message` model (content, sender, receiver, timestamps).
- [x] **Migrate**
    - [x] Run `npx prisma db push` to create local database file.

## 4. Authentication Implementation (API)
- [x] **Register Endpoint**
    - [x] Validate input.
    - [x] Hash password with `bcrypt`.
    - [x] Create user in DB.
    - [x] Generate and return JWT.
- [x] **Login Endpoint**
    - [x] Find user by email.
    - [x] Compare password with hash.
    - [x] Return JWT on success.
- [x] **Me Endpoint**
    - [x] Middleware to verify JWT.
    - [x] Return current user data.

## 5. Backend Logic (Messaging & Users)
- [x] **User Search API**
    - [x] Endpoint to query users by name/email (excluding self).
- [x] **Message API**
    - [x] Endpoint to fetch chat history between two users.
- [x] **Socket.io Events**
    - [x] `connection`: log user.
    - [x] `join`: map userId to socketId, update presence to Online.
    - [x] `send_message`: save to DB, emit `receive_message` to recipient.
    - [x] `disconnect`: update presence to Offline.

## 6. Frontend Setup (React)
- [x] **Install Dependencies**
    - [x] `axios`, `socket.io-client`, `zustand` (state), `lucide-react` (icons), `react-router-dom`.
- [x] **Configure Tailwind CSS**
    - [x] Install tailwindcss, postcss, autoprefixer.
    - [x] Update `tailwind.config.js` and `index.css`.
- [x] **State Management**
    - [x] Create `useChatStore` with Zustand (Auth state, Messages, Socket instance).

## 7. UI Implementation
- [x] **Auth Pages**
    - [x] Create Login/Signup form component.
    - [x] Integrate with Auth Store/API.
- [x] **Main Layout**
    - [x] Responsive Split View (Sidebar | Chat).
    - [x] Mobile: Sidebar toggles or pushes navigation.
- [x] **Sidebar (Contact List)**
    - [x] Header (User profile, Logout).
    - [x] Search Bar.
    - [x] User List (display name, avatar, online indicator).
- [x] **Chat Area**
    - [x] Chat Header (Selected user info).
    - [x] Message List (Bubbles, scroll to bottom).
    - [x] Input Area (Text input, Send button).

## 8. Integration & Real-time
- [x] **Connect Socket**
    - [x] Establish socket connection on login.
    - [x] Authenticate socket (pass userID/token).
- [x] **Handle Events**
    - [x] Listen for `receive_message`: Append to message list.
    - [x] Listen for `user_status_change`: Update online/offline indicators in sidebar.

## 9. Final Polish & Testing
- [x] **Testing**
    - [x] Verify explicit User A <-> User B messaging.
    - [x] Verify data persistence (refresh page).
- [x] **UI Polish**
    - [x] Check mobile responsiveness.
    - [x] Ensure consistent styling (Tailwind).
