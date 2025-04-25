
# 🔒 Secure Chat App

A lightweight, end-to-end encrypted chat web application where users can create or join password-protected rooms and exchange encrypted messages in real time.

Built with **React**, **Node.js (Express)**, **Socket.IO**, and **custom encryption** for secure peer-to-peer communication.

---

## 🚀 Features

- **User Authentication:** Simple username login
- **Create Rooms:** Start a new chat room by providing a custom Room ID and password
- **Join Rooms:** Join an existing room by entering the correct Room ID and password
- **Password Protection:** Rooms require a password for access
- **End-to-End Encryption:** Messages are encrypted in the browser before being sent over the network
- **Real-Time Messaging:** Built with Socket.IO for instant updates
- **Multiple Rooms Supported:** Can create and manage many active rooms at once
- **LocalStorage/SessionStorage:** Automatically saves user info between page reloads
- **Enter Key Navigation:** Pressing `Enter` triggers buttons like "Next" and "Send" for a smoother UX
- **Responsive Design:** Clean, centered UI with dark crypto theme
- **Deployed Publicly:** Can be hosted and shared with friends using free services like Render

---

## 🛠 Technologies Used

- **Frontend:** React + React Router
- **Backend:** Express.js (Node.js)
- **WebSockets:** Socket.IO
- **Encryption:** Custom client-side encryption (AES-GCM based)
- **Hosting:** Render.com (both frontend and backend)

---

## ⚙️ Setup Instructions

### 1. Clone the Project

```bash
git clone https://github.com/your-username/secure-chat-app.git
cd secure-chat-app
```

### 2. Install Dependencies

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 3. Run Locally

Open two terminals:

```bash
# Terminal 1: Start backend server
cd server
node index.js

# Terminal 2: Start frontend client
cd client
npm start
```

- Server runs at `http://localhost:4000`
- Client runs at `http://localhost:3000`

---

## 🌍 Deployment

### Deploy Backend

- Host the `/server` folder as a **Web Service** on [Render](https://render.com/)
- Set the start command to:
  ```bash
  node index.js
  ```

### Deploy Frontend

- Build the frontend:

```bash
cd client
npm run build
```

- Host the `/client/build/` folder as a **Static Site** on Render
- Set:
  - Root Directory: `client`
  - Build Command: `npm run build`
  - Publish Directory: `build`

✅ Update the `SERVER` URL in the client code to match your Render backend URL.

---

## 🧩 Folder Structure

```
/server
  index.js         (Express + Socket.IO backend)

/client
  /src
    /pages         (React pages: Login, Ask, Lobby, Join, Create, Chat)
    /socket.ts     (Socket.IO client connection)
    /crypto.ts     (Custom encryption functions)
    App.tsx        (Router setup)
    styles.css     (Global styles)
  package.json
```

---

## 💬 How It Works

1. User logs in with a username
2. User chooses to create a new room or join an existing one
3. Room is protected by a password
4. Password-derived key is used to encrypt all messages locally
5. Messages are decrypted only in the receiver's browser
6. No plaintext messages ever leave the user's device
7. Pressing `Enter` submits forms (login, send message)

---

## 📈 Future Enhancements (Ideas)

- Add message timestamps
- Show "User is typing..." indicator
- Add room capacity selection (more than 2 users)
- Add file/image sharing with encryption
- Build a landing page and better error pages (like 404 handling)
- Deploy backend + frontend together as a monorepo

---

## 🛡️ Security Notes

- Messages are encrypted end-to-end between clients
- Passwords are never sent to the server directly
- Room encryption keys are derived using browser-side crypto
- This app is for **learning and educational use** — for production-grade secure messaging, further cryptographic auditing would be needed.

---

# ✨ Live Demo

>

```
Frontend: https://encrypted-messaging.onrender.com
```
## 🧑‍💻 Author

**Dante Warhola**  
University of Pittsburgh — Computer Science  
Pi Kappa Phi Risk Manager | Cybersecurity Enthusiast  
[LinkedIn](https://www.linkedin.com/in/dante-warhola/) | [GitHub](https://github.com/dantewarhola)

---

# 📜 License

This project is open-source and free to use for educational and personal purposes.

---
