import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }

    const headers = { Authorization: `Bearer ${token}` };

    axios.get('/api/users/profile', { headers })
      .then(res => setProfile(res.data))
      .catch(() => setError('Failed to load profile.'));

    axios.get('/api/reviews/user/mine', { headers })
      .then(res => setReviews(res.data))
      .catch(err => console.error(err));
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

      <hr />

      <h3>My Reviews</h3>
      {reviews.length === 0 && <p>You haven't reviewed any cafes yet.</p>}
      {reviews.map(r => (
        <div key={r.id} style={{ background: '#f9f3ee', padding: '0.5rem', marginBottom: '0.5rem', borderRadius: '4px' }}>
          <strong>{r.cafe_name}</strong> — {'⭐'.repeat(r.rating)}
          <p style={{ margin: '0.25rem 0 0' }}>{r.review_text}</p>
        </div>
      ))}
    </div>
  );
}