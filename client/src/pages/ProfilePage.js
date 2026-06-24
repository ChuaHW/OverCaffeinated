import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const SHELF_LABELS = {
  want_to_visit: 'Want to Visit',
  currently_exploring: 'Currently Exploring',
  all_time_favourites: 'All-Time Favourites',
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

  const handleRemoveFromShelf = async (cafeId) => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`/api/shelf/${cafeId}`, { headers: { Authorization: `Bearer ${token}` } });
      setShelf(prev => prev.filter(item => item.cafe_id !== cafeId));
    } catch (err) { console.error(err); }
  };

  const renderStars = (rating) => '★'.repeat(rating) + '☆'.repeat(5 - rating);

  if (error) return <div className="loading-screen">{error}</div>;
  if (!profile) return <div className="loading-screen">Loading…</div>;

  const groupedShelf = shelf.reduce((acc, item) => {
    acc[item.status] = acc[item.status] || [];
    acc[item.status].push(item);
    return acc;
  }, {});

  const initials = (profile.display_name || profile.username || '?').charAt(0).toUpperCase();

  return (
    <div className="page" style={{ maxWidth: 760 }}>
      <div className="profile-header">
        <div className="profile-header-left">
          <div className="profile-avatar">{initials}</div>
          <div>
            <h2 className="profile-name">{profile.display_name || 'No name set'}</h2>
            <p className="profile-email">{profile.email}</p>
          </div>
        </div>
        <button className="btn btn-outline" onClick={() => navigate('/profile/edit')}>Edit Profile</button>
      </div>

      <div className="section-card">
        <h3>About</h3>
        <div style={{ display: 'grid', gap: '1rem' }}>
          <div>
            <p className="form-label">Bio</p>
            <p className={`section-text${!profile.bio ? ' italic' : ''}`}>{profile.bio || 'No bio yet.'}</p>
          </div>
          <div>
            <p className="form-label">Preferred Drink</p>
            <p className={`section-text${!profile.preferred_drink ? ' italic' : ''}`}>{profile.preferred_drink || 'Not set.'}</p>
          </div>
        </div>
      </div>

      <div className="section-card">
        <h3>Coffee Shelf</h3>
        {shelf.length === 0 ? (
          <p className="section-text italic">No cafes on your shelf yet.</p>
        ) : (
          Object.keys(SHELF_LABELS).map(status =>
            groupedShelf[status] ? (
              <div key={status}>
                <p className="shelf-group-title">{SHELF_LABELS[status]}</p>
                {groupedShelf[status].map(item => (
                  <div key={item.id} className="shelf-item">
                    <div>
                      <div className="shelf-item-name">{item.cafe_name}</div>
                      {item.address && <div className="shelf-item-address">{item.address}</div>}
                    </div>
                    <button className="shelf-remove" onClick={() => handleRemoveFromShelf(item.cafe_id)}>✕</button>
                  </div>
                ))}
              </div>
            ) : null
          )
        )}
      </div>

      <div className="section-card">
        <h3>My Reviews</h3>
        {reviews.length === 0 ? (
          <p className="section-text italic">You haven't reviewed any cafes yet.</p>
        ) : (
          reviews.map(r => (
            <div key={r.id} className="review-profile-card">
              <div className="review-header">
                <span className="review-profile-name">{r.cafe_name}</span>
                <span className="review-stars">{renderStars(r.rating)}</span>
              </div>
              {r.review_text && <p className="review-text">{r.review_text}</p>}
            </div>
          ))
        )}
      </div>
    </div>
  );
}