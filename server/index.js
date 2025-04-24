// server/index.js
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const sodium = require('libsodium-wrappers');

const app = express();
app.use(cors());
app.use(express.json());

// In-memory publicKey store
const users = new Map();

app.post('/signup', async (req, res) => {
  const { userId, publicKey } = req.body;
  users.set(userId, publicKey);
  return res.json({ ok: true });
});

app.get('/publicKey/:userId', (req, res) => {
  const pk = users.get(req.params.userId);
  if (!pk) return res.status(404).json({ error: 'User not found' });
  return res.json({ publicKey: pk });
});

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join', ({ chatId }) => {
    console.log(`Socket ${socket.id} joining room ${chatId}`);
    socket.join(chatId);
  });

  socket.on('encrypted_message', ({ chatId, nonce, cipher }) => {
    console.log(`Message in ${chatId}:`, { nonce, cipher });
    // broadcast to others in the room
    socket.to(chatId).emit('encrypted_message', { nonce, cipher });
  });
});

const PORT = 4000;
server.listen(PORT, () => console.log(`Server listening on ${PORT}`));
