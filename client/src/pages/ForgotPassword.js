import { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:3001/api/forgot-password', { email });
      setMessage(res.data.message);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
      setMessage('');
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h1>Forgot Password</h1>
      <p>Enter your email and we'll send you a reset link.</p>
      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div><input placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} /></div>
        <button type="submit">Send Reset Link</button>
      </form>
      <p>Remember your password? <Link to="/login">Log in</Link></p>
    </div>
  );
}

export default ForgotPassword;