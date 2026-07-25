import { useState } from 'react';
import axios from '../api';
import { Link } from 'react-router-dom';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/forgot-password', { email });
      setMessage({ text: res.data.message, type: 'success' });
    } catch (err) {
      setMessage({ text: err.response?.data?.error || 'Something went wrong.', type: 'error' });
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <h1>Forgot Password</h1>
        <p className="auth-subtitle">Enter your email and we'll send you a reset link.</p>
        {message.text && <div className={`form-message ${message.type}`}>{message.text}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
            Send Reset Link
          </button>
        </form>
        <div className="auth-footer">
          Remember your password? <Link to="/login">Log in</Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;