import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function EditProfile() {
  const [form, setForm] = useState({ display_name: '', bio: '', preferred_drink: '' });
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }
    axios.get('/api/users/profile', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        const p = res.data;
        setEmail(p.email);
        setForm({ display_name: p.display_name || '', bio: p.bio || '', preferred_drink: p.preferred_drink || '' });
        setAvatarPreview(p.avatar_url || null);
      });
  }, [navigate]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleAvatarChange = e => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => data.append(key, value));
    if (avatarFile) data.append('avatar', avatarFile);
    try {
      await axios.put('/api/users/profile', data, { headers: { Authorization: `Bearer ${token}` } });
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
            <label className="form-label">Profile Picture</label>
            {avatarPreview && (
              <img src={avatarPreview} alt="Avatar preview" className="avatar-preview" />
            )}
            <input className="form-input" type="file" accept="image/*" onChange={handleAvatarChange} />
          </div>
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