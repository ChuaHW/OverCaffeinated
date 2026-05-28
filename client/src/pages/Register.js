import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3001/api/auth/register', { email, password, username });
      setMessage('Account created! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setMessage(err.response?.data?.error || 'Something went wrong');
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h1>Join the community</h1>
      {message && <p>{message}</p>}
      <form onSubmit={handleSubmit}>
        <div><input placeholder="choose a username" value={username} onChange={e => setUsername(e.target.value)} /></div>
        <div><input placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} /></div>
        <div><input placeholder="at least 6 characters" type="password" value={password} onChange={e => setPassword(e.target.value)} /></div>
        <button type="submit">Create Account</button>
      </form>
      <p>Already have an account? <Link to="/login">Log in</Link></p>
    </div>
  );
}

export default Register;