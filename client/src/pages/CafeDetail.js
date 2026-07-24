import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const StarIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
);

const PinIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);

export default function CafeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cafe, setCafe] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [formState, setFormState] = useState({ rating: '', review_text: '' });
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');
  const currentUsername = localStorage.getItem('username');

  useEffect(() => {
    axios.get(`http://localhost:3001/api/cafes/${id}`)
      .then(res => { setCafe(res.data); setLoading(false); })
      .catch(() => { setLoading(false); });

    axios.get(`http://localhost:3001/api/reviews/${id}`)
      .then(res => setReviews(res.data))
      .catch(err => console.error(err));
  }, [id]);

  const parseTags = (tags) => tags ? tags.split(',').map(t => t.trim()) : [];
  const renderStars = (rating) => '★'.repeat(rating) + '☆'.repeat(5 - rating);
  const averageRating = () => {
    if (!reviews.length) return null;
    return (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1);
  };

  const handleSubmit = async () => {
    if (!formState.rating) {
      setMessage({ text: 'Please select a rating.', type: 'error' });
      return;
    }
    try {
      await axios.post('http://localhost:3001/api/reviews',
        { cafe_id: id, rating: formState.rating, review_text: formState.review_text },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage({ text: 'Review submitted!', type: 'success' });
      setFormState({ rating: '', review_text: '' });
      const res = await axios.get(`http://localhost:3001/api/reviews/${id}`);
      setReviews(res.data);
    } catch (err) {
      setMessage({ text: err.response?.data?.error || 'Failed to submit.', type: 'error' });
    }
  };

  if (loading) return <div className="loading-screen">Loading…</div>;
  if (!cafe) return <div className="loading-screen">Cafe not found.</div>;

  const tags = parseTags(cafe.tags);
  const avg = averageRating();
  const alreadyReviewed = reviews.some(r => r.username === currentUsername);

  return (
    <div className="cd-wrap">
      <div className="cd-header">
        <div className="cd-header-inner">
          <button className="cd-back" onClick={() => navigate('/cafes')}>← Back</button>
          <div className="cd-header-content">
            <h1 className="cd-name">{cafe.name}</h1>
            <div className="cd-header-meta">
              {avg
                ? <span className="cd-avg-rating"><StarIcon /> {avg} <span className="cd-review-count">({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span></span>
                : <span className="cd-no-rating">No ratings yet</span>
              }
              {tags.map(tag => <span key={tag} className="cd-tag">{tag}</span>)}
            </div>
          </div>
        </div>
      </div>

      <div className="cd-body">
        <div className="cd-main">
          {cafe.description && (
            <section className="cd-section">
              <h2 className="cd-section-title">Description</h2>
              <p className="cd-description">{cafe.description}</p>
            </section>
          )}

          <section className="cd-section">
            <h2 className="cd-section-title">Reviews</h2>

            {reviews.length === 0 && (
              <p className="no-reviews">No reviews yet — be the first!</p>
            )}

            {reviews.map(r => (
              <div key={r.id} className="review-card">
                <div className="review-header">
                  <span className="review-author">{r.display_name || r.username}</span>
                  <span className="review-stars">{renderStars(r.rating)}</span>
                </div>
                {r.review_text && <p className="review-text">{r.review_text}</p>}
              </div>
            ))}

            {token ? (
              alreadyReviewed ? (
                <p className="login-nudge">You have already reviewed this cafe.</p>
              ) : (
                <div className="review-form">
                  <h4>Leave a Review</h4>
                  <div className="form-field">
                    <label className="form-label">Rating</label>
                    <select
                      className="form-select"
                      value={formState.rating}
                      onChange={e => setFormState(p => ({ ...p, rating: parseInt(e.target.value) }))}
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
                      value={formState.review_text}
                      onChange={e => setFormState(p => ({ ...p, review_text: e.target.value }))}
                      rows={3}
                    />
                  </div>
                  <button className="btn btn-primary btn-sm" onClick={handleSubmit}>Submit Review</button>
                  {message.text && (
                    <div className={`form-message ${message.type}`}>{message.text}</div>
                  )}
                </div>
              )
            ) : (
              <p className="login-nudge"><a href="/login">Log in</a> to leave a review.</p>
            )}
          </section>
        </div>

        <aside className="cd-sidebar">
          <div className="cd-info-card">
            <h3 className="cd-info-title">Store Info</h3>
            <div className="cd-info-row">
              <span className="cd-info-icon"><PinIcon /></span>
              <span className="cd-info-text">{cafe.address || 'Not listed'}</span>
            </div>
            {tags.length > 0 && (
              <div className="cd-info-row">
                <div>
                  <span className="cd-info-label">Brew Method</span>
                  <div className="cd-info-tags">
                    {tags.map(tag => <span key={tag} className="cafe-tag">{tag}</span>)}
                  </div>
                </div>
              </div>
            )}
            <div className="cd-info-row">
              <div>
                <span className="cd-info-label">Opening Hours</span>
                <span className="cd-info-text cd-info-muted">Not listed</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
