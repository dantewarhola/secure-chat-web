// client/src/pages/Chat.tsx
import { useEffect, useState } from 'react';
import { socket } from '../socket';
import { decryptMessage, encryptMessage, deriveKeyFromPassword } from '../crypto';
import '../styles.css';

export default function Chat() {
  const roomId = sessionStorage.getItem('roomId') || 'unknown';
  const password = sessionStorage.getItem('roomPassword') || '';

  const [userId, setUserId] = useState('anonymous');
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<string[]>([]);
  const [key, setKey] = useState<Uint8Array | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('userId');
    if (stored) setUserId(stored);
  }, []);

  useEffect(() => {
    (async () => {
      const derivedKey = await deriveKeyFromPassword(password);
      setKey(derivedKey);
    })();

    socket.on('encrypted_message', ({ sender, nonce, cipher }) => {
      if (!key) return;
      const text = decryptMessage(cipher, nonce, key);
      setMessages(prev => [...prev, `${sender}: ${text}`]);
    });

    return () => {
      socket.off('encrypted_message');
    };
  }, [key, password]);

  const handleSend = () => {
    if (!key) return;
    const { nonce, cipher } = encryptMessage(inputMessage, key);
    socket.emit('encrypted_message', {
      roomId,
      nonce,
      cipher,
      sender: userId,
    });
    setMessages(prev => [...prev, `${userId}: ${inputMessage}`]);
    setInputMessage('');
  };

  return (
    <div className="container">
      <h2>
        Room: <em>{roomId}</em> (You: <em>{userId}</em>)
      </h2>
      <div style={{ border: '1px solid #555', padding: 12, height: 300, overflowY: 'auto', marginBottom: 12 }}>
        {messages.map((m, i) => (
          <div key={i}>{m}</div>
        ))}
      </div>
      <input
        placeholder="Type a message…"
        value={inputMessage}
        onChange={(e) => setInputMessage(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        }}
      />
      <button onClick={handleSend} disabled={!key}>Send</button>
    </div>
  );
}
