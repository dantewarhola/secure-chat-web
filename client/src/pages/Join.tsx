import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { socket } from '../socket';
import '../styles.css';

export default function Join() {
  const [roomId, setRoomId] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleJoin = () => {
    const userId = localStorage.getItem('userId');
    if (!roomId || !password || !userId) return;

    sessionStorage.setItem('roomId', roomId);
    sessionStorage.setItem('roomPassword', password);

    socket.connect();
    socket.emit('join', { roomId, password });

    socket.on('join_success', () => {
      navigate('/chat');
    });

    socket.on('join_error', ({ message }) => {
      alert(`Could not join: ${message}`);
      socket.disconnect();
    });
  };

  return (
    <div className="container">
      <h2>Join a Room</h2>
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
      <button onClick={handleJoin} disabled={!roomId || !password}>
        Join
      </button>
    </div>
  );
}
