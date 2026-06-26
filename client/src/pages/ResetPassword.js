import { useState } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';

function ResetPassword() {
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:3001/api/reset-password', { token, password });
      setMessage({ text: res.data.message, type: 'success' });
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setMessage({ text: err.response?.data?.error || 'Something went wrong.', type: 'error' });
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <h1>Reset Password</h1>
        <p className="auth-subtitle">Choose a new password for your account.</p>
        {message.text && <div className={`form-message ${message.type}`}>{message.text}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label className="form-label">New Password</label>
            <input className="form-input" type="password" placeholder="At least 6 characters" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;