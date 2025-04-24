// client/src/pages/Join.tsx
import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { socket } from '../socket';
import '../styles.css';

export default function Join() {
  const { roomId } = useParams<{ roomId: string }>();
  const [inputPassword, setInputPassword] = useState('');
  const navigate = useNavigate();

  const handleJoin = () => {
    const userId = localStorage.getItem('userId');
    sessionStorage.setItem('roomId', roomId || '');
    sessionStorage.setItem('roomPassword', inputPassword);

    socket.connect();
    socket.emit('join', { roomId, password: inputPassword });

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
      <h2>Join Room: {roomId}</h2>
      <input
        type="password"
        placeholder="Password"
        value={inputPassword}
        onChange={(e) => setInputPassword(e.target.value)}
      />
      <button onClick={handleJoin} disabled={!inputPassword}>Join</button>
    </div>
  );
}