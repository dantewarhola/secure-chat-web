import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { socket } from '../socket';
import '../styles.css';

export default function Join() {
  const { roomId: routeRoomId } = useParams<{ roomId: string }>(); // roomId from URL if it exists
  const [inputRoomId, setInputRoomId] = useState(routeRoomId || '');
  const [inputPassword, setInputPassword] = useState('');
  const navigate = useNavigate();

  const handleJoin = () => {
    const userId = localStorage.getItem('userId');
    sessionStorage.setItem('roomId', inputRoomId);
    sessionStorage.setItem('roomPassword', inputPassword);

    socket.connect();
    socket.emit('join', { roomId: inputRoomId, password: inputPassword });

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
        value={inputRoomId}
        onChange={(e) => setInputRoomId(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={inputPassword}
        onChange={(e) => setInputPassword(e.target.value)}
      />
      <button onClick={handleJoin} disabled={!inputRoomId || !inputPassword}>
        Join
      </button>
    </div>
  );
}
