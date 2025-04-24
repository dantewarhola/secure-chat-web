// client/src/App.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { socket } from './socket';
import { deriveKeyFromPassword, encryptMessage, decryptMessage } from './crypto';

type Step = 'login' | 'ask' | 'lobby' | 'join' | 'create' | 'chat';

interface RoomInfo {
  roomId: string;
  count: number;
  capacity: number;
}

const SERVER = 'http://localhost:4000';

export default function App() {
  // 1) Navigation step
  const [step, setStep] = useState<Step>('login');

  // 2) Form inputs
  const [inputUserId, setInputUserId] = useState('');
  const [inputPassword, setInputPassword] = useState('');

  // 3) Committed values
  const [userId, setUserId] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('');

  // 4) Lobby data
  const [rooms, setRooms] = useState<RoomInfo[]>([]);

  // 5) Chat state
  const [key, setKey] = useState<Uint8Array | null>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [inputMessage, setInputMessage] = useState('');

  // 6) Fetch rooms when entering lobby
  useEffect(() => {
    if (step === 'lobby') {
      axios
        .get<{ rooms: RoomInfo[] }>(`${SERVER}/rooms`)
        .then(res => setRooms(res.data.rooms))
        .catch(err => console.error('Could not fetch rooms', err));
    }
  }, [step]);

  // 7) Socket event handlers
  useEffect(() => {
    socket.on('join_success', async () => {
      const k = await deriveKeyFromPassword(inputPassword);
      setKey(k);
      setStep('chat');
    });
    socket.on('join_error', ({ message }) => {
      alert(`Could not join: ${message}`);
      socket.disconnect();
      setStep('lobby');
    });
    socket.on('encrypted_message', ({ sender, nonce, cipher }) => {
      if (!key) return;
      const text = decryptMessage(cipher, nonce, key);
      setMessages(prev => [...prev, `${sender}: ${text}`]);
    });

    return () => {
      socket.off('join_success');
      socket.off('join_error');
      socket.off('encrypted_message');
    };
  }, [inputPassword, key]);

  // 8) UI handlers
  const handleLogin = () => {
    setUserId(inputUserId);
    setStep('ask');
  };
  const handleAskYes = () => setStep('join');
  const handleAskNo  = () => setStep('lobby');

  const handleJoinRoom = (roomId: string) => {
    setSelectedRoom(roomId);
    setStep('join');
  };

  const performJoin = () => {
    socket.connect();
    socket.emit('join', { roomId: selectedRoom, password: inputPassword });
  };

  const handleCreate = () => {
    setSelectedRoom(''); // clear in case
    setStep('create');
  };
  const handleCreateSubmit = () => {
    if (!selectedRoom || !inputPassword) return;
    socket.connect();
    socket.emit('join', { roomId: selectedRoom, password: inputPassword });
  };

  const handleSend = () => {
    if (!key) return;
    const { nonce, cipher } = encryptMessage(inputMessage, key);
    socket.emit('encrypted_message', {
      roomId: selectedRoom,
      nonce,
      cipher,
      sender: userId,
    });
    setMessages(prev => [...prev, `${userId}: ${inputMessage}`]);
    setInputMessage('');
  };

  // 9) Render per step
  if (step === 'login') {
    return (
      <div style={{ padding: 24 }}>
        <h2>Enter your name</h2>
        <input
          placeholder="Name"
          value={inputUserId}
          onChange={e => setInputUserId(e.target.value)}
          style={{ marginRight: 8 }}
        />
        <button onClick={handleLogin} disabled={!inputUserId}>
          Next
        </button>
      </div>
    );
  }

  if (step === 'ask') {
    return (
      <div style={{ padding: 24 }}>
        <h2>Hello, {userId}!</h2>
        <p>Do you want to join an existing room?</p>
        <button onClick={handleAskYes} style={{ marginRight: 8 }}>
          Yes
        </button>
        <button onClick={handleAskNo}>No, show me rooms</button>
      </div>
    );
  }

  if (step === 'lobby') {
    return (
      <div style={{ padding: 24 }}>
        <h2>Available Rooms</h2>
        {rooms.length === 0 && <p>No rooms yet. Create one!</p>}
        {rooms.map(r => (
          <div
            key={r.roomId}
            style={{
              border: '1px solid #ccc',
              borderRadius: 4,
              padding: 12,
              marginBottom: 12,
              maxWidth: 300,
            }}
          >
            <strong>{r.roomId}</strong><br/>
            {r.count}/{r.capacity} users<br/>
            <button
              onClick={() => handleJoinRoom(r.roomId)}
              style={{ marginTop: 8 }}
            >
              Join Room
            </button>
          </div>
        ))}
        <button onClick={handleCreate}>Create New Room</button>
      </div>
    );
  }

  if (step === 'join') {
    return (
      <div style={{ padding: 24 }}>
        <h2>Join Room: {selectedRoom}</h2>
        <input
          placeholder="Password"
          type="password"
          value={inputPassword}
          onChange={e => setInputPassword(e.target.value)}
          style={{ marginRight: 8 }}
        />
        <button onClick={performJoin} disabled={!inputPassword}>
          Join
        </button>
      </div>
    );
  }

  if (step === 'create') {
    return (
      <div style={{ padding: 24 }}>
        <h2>Create Room</h2>
        <input
          placeholder="Room ID"
          value={selectedRoom}
          onChange={e => setSelectedRoom(e.target.value)}
          style={{ marginRight: 8 }}
        />
        <input
          placeholder="Password"
          type="password"
          value={inputPassword}
          onChange={e => setInputPassword(e.target.value)}
          style={{ marginRight: 8 }}
        />
        <button
          onClick={handleCreateSubmit}
          disabled={!selectedRoom || !inputPassword}
        >
          Create & Join
        </button>
      </div>
    );
  }

  // Chat UI.
  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <h2>
        Room: <em>{selectedRoom}</em> (You: <em>{userId}</em>)
      </h2>
      <div
        style={{
          border: '1px solid #ccc',
          padding: 12,
          height: 300,
          overflowY: 'auto',
          marginBottom: 12,
        }}
      >
        {messages.map((m, i) => (
          <div key={i} style={{ marginBottom: 4 }}>
            {m}
          </div>
        ))}
      </div>
      <input
        placeholder="Type a message…"
        value={inputMessage}
        onChange={e => setInputMessage(e.target.value)}
        style={{ padding: 8, width: '60%' }}
      />
      <button
        onClick={handleSend}
        disabled={!key}
        style={{ marginLeft: 8, padding: '8px 16px' }}
      >
        Send
      </button>
    </div>
  );
}
