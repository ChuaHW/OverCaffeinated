import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const SHELF_LABELS = {
  want_to_visit: 'Want to Visit',
  currently_exploring: 'Currently Exploring',
  all_time_favourites: 'All-Time Favourites'
};

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [shelf, setShelf] = useState([]);
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

    axios.get('/api/shelf/mine', { headers })
      .then(res => setShelf(res.data))
      .catch(err => console.error(err));
  }, [navigate]);

  if (error) return <p>{error}</p>;
  if (!profile) return <p>Loading...</p>;

  const groupedShelf = shelf.reduce((acc, item) => {
    acc[item.status] = acc[item.status] || [];
    acc[item.status].push(item);
    return acc;
  }, {});

  const handleRemoveFromShelf = async (cafeId) => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`/api/shelf/${cafeId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShelf(prev => prev.filter(item => item.cafe_id !== cafeId));
    } catch (err) {
      console.error(err);
    }
  };

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

      <h3>Coffee Shelf</h3>
      {shelf.length === 0 && <p>No cafes on your shelf yet.</p>}
      {Object.keys(SHELF_LABELS).map(status => (
        groupedShelf[status] && (
          <div key={status} style={{ marginBottom: '1rem' }}>
            <h4 style={{ color: '#6F4E37' }}>{SHELF_LABELS[status]}</h4>
            {groupedShelf[status].map(item => (
              <div key={item.id} style={{ background: '#f9f3ee', padding: '0.5rem', marginBottom: '0.5rem', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>{item.cafe_name}</strong>
                  <p style={{ margin: '0.25rem 0 0', color: '#666' }}>{item.address}</p>
                </div>
                <button
                  onClick={() => handleRemoveFromShelf(item.cafe_id)}
                  style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer', fontSize: '1rem' }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )
      ))}

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