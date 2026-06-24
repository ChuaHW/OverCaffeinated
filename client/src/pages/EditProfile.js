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
    axios.get('/api/users/profile', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        const p = res.data;
        setEmail(p.email);
        setForm({ display_name: p.display_name || '', bio: p.bio || '', preferred_drink: p.preferred_drink || '' });
      });
  }, [navigate]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      await axios.put('/api/users/profile', form, { headers: { Authorization: `Bearer ${token}` } });
      navigate('/profile');
    } catch {
      setMessage('Failed to save changes.');
    }
  };

  return (
    <div className="page" style={{ maxWidth: 560 }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.375rem' }}>Edit Profile</h1>
        <p style={{ color: 'var(--text-muted)' }}>Update your public profile information</p>
      </div>
      <div className="section-card">
        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label className="form-label">Display Name</label>
            <input className="form-input" name="display_name" placeholder="Your display name" value={form.display_name} onChange={handleChange} />
          </div>
          <div className="form-field">
            <label className="form-label">Email</label>
            <input className="form-input" value={email} disabled />
          </div>
          <div className="form-field">
            <label className="form-label">Bio</label>
            <textarea className="form-textarea" name="bio" placeholder="Tell the community about yourself…" value={form.bio} onChange={handleChange} rows={4} />
          </div>
          <div className="form-field">
            <label className="form-label">Preferred Drink</label>
            <input className="form-input" name="preferred_drink" placeholder="e.g. Flat White, Matcha Latte…" value={form.preferred_drink} onChange={handleChange} />
          </div>
          {message && <div className="form-message error">{message}</div>}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="submit" className="btn btn-primary">Save Changes</button>
            <button type="button" className="btn btn-outline" onClick={() => navigate('/profile')}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}