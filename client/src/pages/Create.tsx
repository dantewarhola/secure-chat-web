// client/src/pages/Create.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { socket } from '../socket';
import '../styles.css';

export default function Create() {
  const [roomId, setRoomId] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleCreate = () => {
    const userId = localStorage.getItem('userId');
    sessionStorage.setItem('roomId', roomId);
    sessionStorage.setItem('roomPassword', password);

    socket.connect();
    socket.emit('join', { roomId, password });

    socket.on('join_success', () => {
      navigate('/chat');
    });
    socket.on('join_error', ({ message }) => {
      alert(`Could not create: ${message}`);
      socket.disconnect();
    });
  };

  return (
    <div className="container">
      <h2>Create Room</h2>
      <input
        placeholder="Room ID"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleCreate} disabled={!roomId || !password}>
        Create & Join
      </button>
    </div>
  );
}
