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

  const handleJoinRoom = (room: RoomInfo) => {
    if (room.count >= room.capacity) {
      alert('⚠️ This room is full. Please choose another room.');
      return; // ❌ Do NOT navigate if room is full
    }

    sessionStorage.setItem('selectedRoomId', room.roomId);
    navigate('/join');
  };

  return (
    <div className="container">
      <h2>Available Rooms</h2>
      {rooms.length === 0 && <p>No rooms yet. Create one!</p>}
      {rooms.map((room) => (
        <div key={room.roomId} className="room-box">
          <strong>{room.roomId}</strong><br />
          {room.count}/{room.capacity} users<br />
          <button onClick={() => handleJoinRoom(room)}>Join Room</button>
        </div>
      ))}
      <button onClick={() => navigate('/create')}>Create New Room</button>
    </div>
  );
}
