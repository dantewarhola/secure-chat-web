// client/src/pages/Login.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles.css';

export default function Login() {
  const [inputUserId, setInputUserId] = useState('');
  const navigate = useNavigate();

  const handleLogin = () => {
    if (!inputUserId) return;
    localStorage.setItem('userId', inputUserId);
    navigate('/ask');
  };

  return (
    <div className="container">
      <h2>Enter your name</h2>
      <input
        placeholder="Name"
        value={inputUserId}
        onChange={(e) => setInputUserId(e.target.value)}
      />
      <button onClick={handleLogin}>Next</button>
    </div>
  );
}