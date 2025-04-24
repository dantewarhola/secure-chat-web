// server/index.js
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
app.use(cors());
app.use(express.json());

// In-memory rooms registry
// Map<roomId, { password: string, capacity: number, members: Set<socket.id> }>
const rooms = new Map();

// 1) List existing rooms with counts & capacity
app.get('/rooms', (_req, res) => {
  const list = Array.from(rooms.entries()).map(([roomId, room]) => ({
    roomId,
    count: room.members.size,
    capacity: room.capacity,
  }));
  res.json({ rooms: list });
});

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join', ({ roomId, password }) => {
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
  });

  socket.on('encrypted_message', ({ roomId, nonce, cipher, sender }) => {
    socket.to(roomId).emit('encrypted_message', { nonce, cipher, sender });
  });

  socket.on('disconnect', () => {
    for (const [rid, room] of rooms.entries()) {
      if (room.members.delete(socket.id)) {
        socket.leave(rid);
        console.log(`❌ ${socket.id} left ${rid}`);
        if (room.members.size === 0) {
          rooms.delete(rid);
          console.log(`🗑 Deleted empty room ${rid}`);
        }
      }
    }
  });
});

server.listen(4000, () => console.log(`🚀 Server listening on port 4000`));
