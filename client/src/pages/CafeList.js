import { useEffect, useState } from 'react';
import axios from 'axios';

const SHELF_LABELS = {
  want_to_visit: 'Want to Visit',
  currently_exploring: 'Currently Exploring',
  all_time_favorites: 'All-Time Favourite',
};

const StarIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
);

const PinIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);

function CafeList() {
  const [cafes, setCafes] = useState([]);
  const [reviews, setReviews] = useState({});
  const [formState, setFormState] = useState({});
  const [message, setMessage] = useState({});
  const [shelfStatus, setShelfStatus] = useState({});
  const token = localStorage.getItem('token');

  useEffect(() => {
    axios.get('http://localhost:3001/api/cafes')
      .then(res => {
        setCafes(res.data);
        res.data.forEach(cafe => fetchReviews(cafe.id));
      })
      .catch(err => console.error(err));

    if (token) {
      axios.get('http://localhost:3001/api/shelf/mine', {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => {
        const map = {};
        res.data.forEach(item => { map[item.cafe_id] = item.status; });
        setShelfStatus(map);
      }).catch(err => console.error(err));
    }
  }, []);

  const fetchReviews = (cafeId) => {
    axios.get(`http://localhost:3001/api/reviews/${cafeId}`)
      .then(res => setReviews(prev => ({ ...prev, [cafeId]: res.data })));
  };

  const handleFormChange = (cafeId, field, value) => {
    setFormState(prev => ({ ...prev, [cafeId]: { ...prev[cafeId], [field]: value } }));
  };

  const handleShelf = async (cafeId, status) => {
    try {
      await axios.post('http://localhost:3001/api/shelf',
        { cafe_id: cafeId, status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShelfStatus(prev => ({ ...prev, [cafeId]: status }));
    } catch (err) { console.error(err); }
  };

  const handleRemoveShelf = async (cafeId) => {
    try {
      await axios.delete(`http://localhost:3001/api/shelf/${cafeId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShelfStatus(prev => {
        const next = { ...prev };
        delete next[cafeId];
        return next;
      });
    } catch (err) { console.error(err); }
  };

  const handleSubmit = async (cafeId) => {
    const { rating, review_text } = formState[cafeId] || {};
    if (!rating) {
      setMessage(prev => ({ ...prev, [cafeId]: { text: 'Please select a rating.', type: 'error' } }));
      return;
    }
    try {
      await axios.post('http://localhost:3001/api/reviews',
        { cafe_id: cafeId, rating, review_text },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(prev => ({ ...prev, [cafeId]: { text: 'Review submitted!', type: 'success' } }));
      setFormState(prev => ({ ...prev, [cafeId]: { rating: '', review_text: '' } }));
      fetchReviews(cafeId);
    } catch (err) {
      setMessage(prev => ({ ...prev, [cafeId]: { text: err.response?.data?.error || 'Failed to submit.', type: 'error' } }));
    }
  };

  const averageRating = (cafeId) => {
    const r = reviews[cafeId];
    if (!r || r.length === 0) return null;
    return (r.reduce((sum, x) => sum + x.rating, 0) / r.length).toFixed(1);
  };

  const renderStars = (rating) => '★'.repeat(rating) + '☆'.repeat(5 - rating);

  return (
    <div className="page">
      <div className="page-header">
        <h1>Discover Cafes</h1>
        <p>Find your next favourite spot in Singapore</p>
      </div>
      <div className="cafe-grid">
        {cafes.map(cafe => (
          <div key={cafe.id} className="cafe-card">
            <div className="cafe-card-header">
              <div>
                <h2 className="cafe-name">{cafe.name}</h2>
                <div className="cafe-address">
                  <PinIcon /> {cafe.address}
                </div>
              </div>
              {averageRating(cafe.id)
                ? <div className="cafe-rating"><StarIcon /> {averageRating(cafe.id)}</div>
                : <div className="cafe-no-rating">No ratings yet</div>
              }
            </div>
            {cafe.description && <p className="cafe-description">{cafe.description}</p>}
            {token && (
              <div className="shelf-bar">
                <span className="shelf-label-text">My Shelf</span>
                {Object.entries(SHELF_LABELS).map(([s, label]) => (
                  <button
                    key={s}
                    onClick={() => handleShelf(cafe.id, s)}
                    className={`shelf-btn${shelfStatus[cafe.id] === s ? ' active' : ''}`}
                  >
                    {label}
                  </button>
                ))}
                {shelfStatus[cafe.id] && (
                  <button onClick={() => handleRemoveShelf(cafe.id)} className="shelf-remove">
                    ✕ Remove
                  </button>
                )}
              </div>
            )}
            <div className="reviews-section">
              <h3>Reviews</h3>
              {(!reviews[cafe.id] || reviews[cafe.id].length === 0) && (
                <p className="no-reviews">No reviews yet — be the first!</p>
              )}
              {reviews[cafe.id]?.map(r => (
                <div key={r.id} className="review-card">
                  <div className="review-header">
                    <span className="review-author">{r.display_name || r.username}</span>
                    <span className="review-stars">{renderStars(r.rating)}</span>
                  </div>
                  {r.review_text && <p className="review-text">{r.review_text}</p>}
                </div>
              ))}
              {token ? (
                <div className="review-form">
                  <h4>Leave a Review</h4>
                  <div className="form-field">
                    <label className="form-label">Rating</label>
                    <select
                      className="form-select"
                      value={formState[cafe.id]?.rating || ''}
                      onChange={e => handleFormChange(cafe.id, 'rating', parseInt(e.target.value))}
                    >
                      <option value="">Select a rating</option>
                      {[1,2,3,4,5].map(n => (
                        <option key={n} value={n}>{n} star{n > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-field">
                    <label className="form-label">Your thoughts</label>
                    <textarea
                      className="form-textarea"
                      placeholder="What did you think of this cafe?"
                      value={formState[cafe.id]?.review_text || ''}
                      onChange={e => handleFormChange(cafe.id, 'review_text', e.target.value)}
                      rows={3}
                    />
                  </div>
                  <button className="btn btn-primary btn-sm" onClick={() => handleSubmit(cafe.id)}>
                    Submit Review
                  </button>
                  {message[cafe.id] && (
                    <div className={`form-message ${message[cafe.id].type}`}>
                      {message[cafe.id].text}
                    </div>
                  )}
                </div>
              ) : (
                <p className="login-nudge">
                  <a href="/login">Log in</a> to leave a review.
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CafeList;