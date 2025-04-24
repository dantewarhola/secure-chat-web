const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const sodium = require('libsodium-wrappers');

const app = express();
app.use(cors());           
app.use(express.json());   

const users = new Map();


app.post('/signup', async (req, res) => {
  console.log('🔐 Signup request body:', req.body);
  const { userId, publicKey } = req.body;
  if (!userId || !publicKey) {
    return res.status(400).json({ error: 'userId and publicKey required' });
  }
  users.set(userId, publicKey);
  return res.json({ ok: true });
});


app.get('/publicKey/:userId', (req, res) => {
  const pk = users.get(req.params.userId);
  if (!pk) return res.status(404).json({ error: 'User not found' });
  return res.json({ publicKey: pk });
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
});

io.on('connection', async (socket) => {
  console.log('Client connected:', socket.id);
  await sodium.ready;

  socket.on('encrypted_message', ({ nonce, cipher }) => {
    console.log('🔄 Echoing encrypted_message:', { nonce, cipher });
    socket.emit('encrypted_message', { nonce, cipher });
  });
});

const PORT = 4000;
server.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
