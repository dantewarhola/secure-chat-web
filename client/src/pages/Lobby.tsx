import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles.css';

const SERVER = 'https://secure-chat-web.onrender.com';

interface RoomInfo {
  roomId: string;
  count: number;
  capacity: number;
}

export default function Lobby() {
  const [rooms, setRooms] = useState<RoomInfo[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get<{ rooms: RoomInfo[] }>(`${SERVER}/rooms`)
      .then((res) => setRooms(res.data.rooms))
      .catch((err) => console.error('Could not fetch rooms', err));
  }, []);

  const handleJoinRoom = (roomId: string) => {
    sessionStorage.setItem('selectedRoomId', roomId); 
    navigate('/join');                               
  };

  return (
    <div className="container">
      <h2>Available Rooms</h2>
      {rooms.length === 0 && <p>No rooms yet. Create one!</p>}
      {rooms.map((r) => (
        <div key={r.roomId} className="room-box">
          <strong>{r.roomId}</strong><br />
          {r.count}/{r.capacity} users<br />
          <button onClick={() => handleJoinRoom(r.roomId)}>Join Room</button>
        </div>
      ))}
      <button onClick={() => navigate('/create')}>Create New Room</button>
    </div>
  );
}
