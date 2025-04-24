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
const USER_ID = 'demoUser';

export default function App() {
  console.log('🛠️ App render start');

  const [sharedKey, setSharedKey] = useState<Uint8Array | null>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    console.log('🛠️ useEffect fired');
    (async () => {
      console.log('1️⃣ Checking localStorage for keypair');
      let kp: KeyPair;
      const stored = localStorage.getItem('chat_keys');
      console.log('   localStorage →', stored);

      if (stored) {
        kp = JSON.parse(stored) as KeyPair;
        console.log('   ✅ Loaded existing keypair');
      } else {
        console.log('   🔑 No keypair—generating & signing up');
        kp = generateKeyPair();
        localStorage.setItem('chat_keys', JSON.stringify(kp));
        console.log('   Sending POST /signup with', kp.publicKey);
        await axios.post(`${SERVER}/signup`, {
          userId: USER_ID,
          publicKey: kp.publicKey,
        });
        console.log('   ✅ Signup complete');
      }

      console.log('2️⃣ Fetching peer publicKey');
      try {
        const { data } = await axios.get<{ publicKey: string }>(
          `${SERVER}/publicKey/${USER_ID}`
        );
        console.log('   Received peer publicKey:', data.publicKey);

        console.log('3️⃣ Deriving shared secret via X25519');
        const key = deriveSharedKey(data.publicKey, kp.privateKey);
        console.log('   Shared key:', key);
        setSharedKey(key);

        console.log('4️⃣ Connecting socket');
        socket.connect();
        socket.on('encrypted_message', ({ nonce, cipher }) => {
          console.log('   🔄 Received encrypted_message:', { nonce, cipher });
          const text = decryptMessage(cipher, nonce, key);
          setMessages((prev) => [...prev, `Server: ${text}`]);
        });
      } catch (err) {
        console.error('❌ Error fetching publicKey or deriving key:', err);
      }
    })();

    return () => {
      socket.off('encrypted_message');
      socket.disconnect();
    };
  }, []);

  const send = () => {
    if (!sharedKey) return;
    const { cipher, nonce } = encryptMessage(input || 'ping', sharedKey);
    console.log('✉️ Sending encrypted_message:', { nonce, cipher });
    socket.emit('encrypted_message', { nonce, cipher });
    setMessages((prev) => [...prev, `You: ${input || 'ping'}`]);
    setInput('');
  };

  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <h1>Secure Chat Demo</h1>
      <div style={{ marginBottom: 16 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message…"
          style={{ padding: 8, width: '60%' }}
        />
        <button onClick={send} disabled={!sharedKey} style={{ marginLeft: 8, padding: '8px 16px' }}>
          Send Encrypted
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
