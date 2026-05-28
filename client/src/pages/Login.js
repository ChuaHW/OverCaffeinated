import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:3001/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('username', res.data.username);
      navigate('/');
    } catch (err) {
      setError('Invalid email or password');
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h1>Welcome back, coffee enthusiast</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div><input placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} /></div>
        <div><input placeholder="enter your password" type="password" value={password} onChange={e => setPassword(e.target.value)} /></div>
        <button type="submit">Login</button>
      </form>
      <p>New here? <Link to="/register">Create an account</Link></p>
    </div>
  );
}

export default Login;