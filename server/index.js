const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.get('/', (req, res) => res.send('API is running'));  // Test endpoint

io.on('connection', socket => {
  console.log('Client connected:', socket.id);
});

server.listen(4000, () => console.log('Server listening on port 4000'));
