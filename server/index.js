const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors'); // <<== YOU NEED THIS

const app = express();
const server = http.createServer(app);

// 👇 Set up CORS for Express (for /rooms and other HTTP routes)
app.use(cors({
  origin: 'https://encrypted-messaging.onrender.com', // your frontend url
  methods: ['GET', 'POST']
}));

const io = new Server(server, {
  cors: {
    origin: 'https://encrypted-messaging.onrender.com', // your frontend url
    methods: ['GET', 'POST']
  }
});

const rooms = new Map();

// (optional: basic route)
app.get('/', (req, res) => {
  res.send('Server is running');
});

// 👇 YOUR SOCKET CODE (what you posted)
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join', ({ roomId, password, userId }) => { 
    let room = rooms.get(roomId);
    if (!room) {
      room = { password, capacity: 2, members: new Set() };
      rooms.set(roomId, room);
      console.log(`🆕 Created room ${roomId}`);
    }
    if (room.password !== password) {
      return socket.emit('join_error', { message: 'Incorrect password' });
    }
    if (room.members.size >= room.capacity) {
      return socket.emit('join_error', { message: 'Room is full' });
    }
    room.members.add(socket.id);
    socket.join(roomId);

    console.log(`✅ ${socket.id} joined ${roomId} (${room.members.size}/${room.capacity})`);
    socket.emit('join_success', { roomId });

    socket.to(roomId).emit('system_message', { message: `${userId} has joined the room.` });
  });

  socket.on('encrypted_message', ({ roomId, nonce, cipher, sender }) => {
    socket.to(roomId).emit('encrypted_message', { nonce, cipher, sender });
  });

  socket.on('disconnect', () => {
    for (const [roomId, room] of rooms.entries()) {
      if (room.members.delete(socket.id)) {
        socket.leave(roomId);
        console.log(`❌ ${socket.id} left ${roomId}`);
        if (room.members.size === 0) {
          rooms.delete(roomId);
          console.log(`🗑 Deleted empty room ${roomId}`);
        } else {
          io.to(roomId).emit('system_message', { message: `A user has left the room.` });
        }
      }
    }
  });
});

// 👇 SERVER LISTEN (important for Render to expose your port)
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
