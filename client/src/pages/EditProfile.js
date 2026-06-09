import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function EditProfile() {
  const [form, setForm] = useState({ display_name: '', bio: '', preferred_drink: '' });
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }

    axios.get('/api/users/profile', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      const p = res.data;
      setEmail(p.email);
      setForm({
        display_name: p.display_name || '',
        bio: p.bio || '',
        preferred_drink: p.preferred_drink || ''
      });
    });
  }, [navigate]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      await axios.put('/api/users/profile', form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate('/profile');
    } catch {
      setMessage('Failed to save changes.');
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: '2rem auto', padding: '0 1rem' }}>
      <h2>Edit Profile</h2>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label>Display Name<br />
            <input name="display_name" value={form.display_name} onChange={handleChange} />
          </label>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label>Email<br />
            <input value={email} disabled />
          </label>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label>Bio<br />
            <textarea name="bio" value={form.bio} onChange={handleChange} rows={4} />
          </label>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label>Preferred Drink<br />
            <input name="preferred_drink" value={form.preferred_drink} onChange={handleChange} />
          </label>
        </div>

        {message && <p style={{ color: 'red' }}>{message}</p>}

        <button type="submit">Save</button>
        <button type="button" onClick={() => navigate('/profile')} style={{ marginLeft: '0.5rem' }}>
          Cancel
        </button>
      </form>
    </div>
  );
}