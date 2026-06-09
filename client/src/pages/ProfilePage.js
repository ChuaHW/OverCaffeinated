import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }

    axios.get('/api/users/profile', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setProfile(res.data))
      .catch(() => setError('Failed to load profile.'));
  }, [navigate]);

  if (error) return <p>{error}</p>;
  if (!profile) return <p>Loading...</p>;

  return (
    <div style={{ maxWidth: 500, margin: '2rem auto', padding: '0 1rem' }}>
      <h2>{profile.display_name || 'No name set'}</h2>
      <p style={{ color: '#555' }}>{profile.email}</p>
      <button onClick={() => navigate('/profile/edit')}>Edit Profile</button>

      <hr />

      <h3>Bio</h3>
      <p>{profile.bio || 'No bio yet.'}</p>

      <h3>Preferred Drink</h3>
      <p>{profile.preferred_drink || 'Not set.'}</p>
    </div>
  );
}