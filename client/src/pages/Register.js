import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3001/api/auth/register', { email, password, username });
      setMessage({ text: 'Account created! Redirecting to login…', type: 'success' });
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setMessage({ text: err.response?.data?.error || 'Something went wrong.', type: 'error' });
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <h1>Join the community</h1>
        <p className="auth-subtitle">Create your free OverCaffeinated account</p>
        {message.text && <div className={`form-message ${message.type}`}>{message.text}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label className="form-label">Username</label>
            <input className="form-input" placeholder="Choose a username" value={username} onChange={e => setUsername(e.target.value)} required />
          </div>
          <div className="form-field">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="form-field">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" placeholder="At least 6 characters" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
            Create Account
          </button>
        </form>
        <div className="auth-footer">
          Already have an account? <Link to="/login">Log in</Link>
        </div>
      </div>
    </div>
  );
}

export default Register;