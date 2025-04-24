// client/src/App.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { socket } from './socket';
import {
  generateKeyPair,
  deriveSharedKey,
  encryptMessage,
  decryptMessage,
} from './crypto';

interface KeyPair {
  publicKey: string;
  privateKey: string;
}

const SERVER = 'http://localhost:4000';

export default function App() {
  // ❶ Form inputs
  const [inputUserId, setInputUserId] = useState(
    localStorage.getItem('userId') || ''
  );
  const [inputPeerId, setInputPeerId] = useState(
    localStorage.getItem('peerId') || ''
  );

  // ❷ Committed IDs & login flag
  const [userId, setUserId] = useState<string | null>(null);
  const [peerId, setPeerId] = useState<string | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);

  // ❸ Chat state
  const [sharedKey, setSharedKey] = useState<Uint8Array | null>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState('');

  // ❹ Only run this effect once we've clicked “Start Chat”
  useEffect(() => {
    if (!loggedIn || !userId || !peerId) return;
    console.log('🛠️ useEffect fired for', userId, '→', peerId);

    (async () => {
      console.log('1️⃣ Checking keypair for', userId);
      let kp: KeyPair;
      const stored = localStorage.getItem(`keys_${userId}`);
      if (stored) {
        kp = JSON.parse(stored);
        console.log('   ✅ Loaded existing keypair');
      } else {
        kp = generateKeyPair();
        localStorage.setItem(`keys_${userId}`, JSON.stringify(kp));
        console.log('   🔑 Signing up', userId);
        await axios.post(`${SERVER}/signup`, { userId, publicKey: kp.publicKey });
        console.log('   ✅ Signup complete for', userId);
      }

      console.log('2️⃣ Fetching publicKey for peer', peerId);
      const { data } = await axios.get<{ publicKey: string }>(
        `${SERVER}/publicKey/${peerId}`
      );
      console.log('   👀 Received peer publicKey:', data.publicKey);

      console.log('3️⃣ Deriving shared secret');
      const key = deriveSharedKey(data.publicKey, kp.privateKey);
      console.log('   🔑 Shared key:', key);
      setSharedKey(key);

      // join the same sorted room in both tabs
      const chatId = [userId, peerId].sort().join(':');
      console.log('4️⃣ Joining room', chatId);
      socket.connect();
      socket.emit('join', { chatId });

      socket.on('encrypted_message', ({ nonce, cipher }) => {
        console.log('   🔄 Received encrypted_message:', { nonce, cipher });
        const text = decryptMessage(cipher, nonce, key);
        setMessages((prev) => [...prev, `${peerId}: ${text}`]);
      });
    })();

    return () => {
      socket.off('encrypted_message');
      socket.disconnect();
    };
  }, [loggedIn, userId, peerId]);

  // ❺ Handle clicking “Start Chat”
  const handleLogin = () => {
    localStorage.setItem('userId', inputUserId);
    localStorage.setItem('peerId', inputPeerId);
    setUserId(inputUserId);
    setPeerId(inputPeerId);
    setLoggedIn(true);
    console.log('🛠️ Logged in as', inputUserId, '→', inputPeerId);
  };

  // ❻ Send a message
  const send = () => {
    if (!sharedKey || !userId || !peerId) return;
    const { cipher, nonce } = encryptMessage(input || '…', sharedKey);
    const chatId = [userId, peerId].sort().join(':');
    console.log('✉️ Sending to room', chatId, { cipher, nonce });
    socket.emit('encrypted_message', { chatId, nonce, cipher });
    setMessages((prev) => [...prev, `${userId}: ${input || '…'}`]);
    setInput('');
  };

  // ❼ Render
  if (!loggedIn) {
    return (
      <div style={{ padding: 24 }}>
        <h2>Login / Setup</h2>
        <input
          placeholder="Your userId"
          value={inputUserId}
          onChange={(e) => setInputUserId(e.target.value)}
          style={{ marginRight: 8 }}
        />
        <input
          placeholder="Peer userId"
          value={inputPeerId}
          onChange={(e) => setInputPeerId(e.target.value)}
          style={{ marginRight: 8 }}
        />
        <button
          onClick={handleLogin}
          disabled={!inputUserId || !inputPeerId}
        >
          Start Chat
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <h1>
        Chatting as <em>{userId}</em> → <em>{peerId}</em>
      </h1>
      <div style={{ marginBottom: 16 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message…"
          style={{ padding: 8, width: '60%' }}
        />
        <button
          onClick={send}
          disabled={!sharedKey}
          style={{ marginLeft: 8, padding: '8px 16px' }}
        >
          Send
        </button>
      </div>
      <div>
        {messages.map((m, i) => (
          <div key={i} style={{ marginBottom: 4 }}>
            {m}
          </div>
        ))}
      </div>
    </div>
  );
}
