import { useNavigate } from 'react-router-dom';
import '../styles.css';

export default function Ask() {
  const userId = localStorage.getItem('userId');
  const navigate = useNavigate();

  return (
    <div className="container">
      <h2>Hello, {userId}!</h2>
      <p>Do you want to join an existing room?</p>
      <button onClick={() => navigate('/join/someRoom')}>Yes</button>
      <button onClick={() => navigate('/lobby')}>No, show me rooms</button>
    </div>
  );
}
