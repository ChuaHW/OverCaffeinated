import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../api';

const SHELF_LABELS = {
  want_to_visit: 'Want to Visit',
  currently_exploring: 'Currently Exploring',
  all_time_favourites: 'All-Time Favourites',
};

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

const ShareIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3"/>
    <circle cx="6" cy="12" r="3"/>
    <circle cx="18" cy="19" r="3"/>
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
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
  const [shelfStatus, setShelfStatus] = useState(null);
  const [shareOpen, setShareOpen] = useState(false);

  const token = localStorage.getItem('token');
  const currentUsername = localStorage.getItem('username');

  useEffect(() => {
    axios.get(`/api/cafes/${id}`)
      .then(res => { setCafe(res.data); setLoading(false); })
      .catch(() => { setLoading(false); });

    axios.get(`/api/reviews/${id}`)
      .then(res => setReviews(res.data))
      .catch(err => console.error(err));

    if (token) {
      axios.get('/api/shelf/mine', {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => {
        const entry = res.data.find(item => String(item.cafe_id) === String(id));
        setShelfStatus(entry ? entry.status : null);
      }).catch(err => console.error(err));
    }
  }, [id, token]);

  useEffect(() => {
    if (!shareOpen) return;
    const handleClick = (e) => {
      if (!e.target.closest('.share-wrap')) setShareOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [shareOpen]);

  const parseTags = (tags) => tags ? tags.split(',').map(t => t.trim()) : [];
  const renderStars = (rating) => '★'.repeat(rating) + '☆'.repeat(5 - rating);
  const formatTime = (t) => {
    if (!t) return null;
    const [h, m] = t.split(':');
    const hour = parseInt(h, 10);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    return `${displayHour}:${m} ${period}`;
  };
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
      await axios.post('/api/reviews',
        { cafe_id: id, rating: formState.rating, review_text: formState.review_text },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage({ text: 'Review submitted!', type: 'success' });
      setFormState({ rating: '', review_text: '' });
      const res = await axios.get(`/api/reviews/${id}`);
      setReviews(res.data);
    } catch (err) {
      setMessage({ text: err.response?.data?.error || 'Failed to submit.', type: 'error' });
    }
  };

  const handleShelf = async (status) => {
    try {
      await axios.post('/api/shelf',
        { cafe_id: id, status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShelfStatus(status);
    } catch (err) { console.error(err); }
  };

  const handleRemoveShelf = async () => {
    try {
      await axios.delete(`/api/shelf/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShelfStatus(null);
    } catch (err) { console.error(err); }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Delete this review? This cannot be undone.')) return;
    try {
      await axios.delete(`/api/reviews/${reviewId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReviews(prev => prev.filter(r => r.id !== reviewId));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="loading-screen">Loading…</div>;
  if (!cafe) return <div className="loading-screen">Cafe not found.</div>;

  const tags = parseTags(cafe.tags);
  const avg = averageRating();
  const alreadyReviewed = reviews.some(r => r.username === currentUsername);

  const shareUrl = `${window.location.origin}/cafes/${cafe.id}`;
  const shareText = `${cafe.name} — ${avg ? `${avg}★ from ${reviews.length} review${reviews.length === 1 ? '' : 's'}` : 'No ratings yet'}\n${cafe.address}`;
  const whatsAppLink = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n\nCheck it out on OverCaffeinated: ${shareUrl}`)}`;
  const telegramLink = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;

  return (
    <div className="cd-wrap">
      <div className="cd-header">
        <div className="cd-header-inner">
          <button className="cd-back" onClick={() => navigate('/cafes')}>← Back</button>
          <div className="cd-header-row">
            <div className="cd-header-content">
              <h1 className="cd-name">{cafe.name}</h1>
              <div className="cd-header-meta">
                {avg
                  ? <span className="cd-avg-rating"><StarIcon /> {avg} <span className="cd-review-count">({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span></span>
                  : <span className="cd-no-rating">No ratings yet</span>
                }
              </div>
            </div>
            <div className="share-wrap">
              <button
                className="share-btn"
                onClick={() => setShareOpen(o => !o)}
                aria-label="Share this cafe"
              >
                <ShareIcon />
              </button>
              {shareOpen && (
                <div className="share-menu">
                  <a className="share-menu-item" href={whatsAppLink} target="_blank" rel="noopener noreferrer" onClick={() => setShareOpen(false)}>WhatsApp</a>
                  <a className="share-menu-item" href={telegramLink} target="_blank" rel="noopener noreferrer" onClick={() => setShareOpen(false)}>Telegram</a>
                </div>
              )}
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

          {token && (
            <section className="cd-section">
              <div className="shelf-bar">
                <span className="shelf-label-text">My Shelf</span>
                {Object.entries(SHELF_LABELS).map(([s, label]) => (
                  <button
                    key={s}
                    onClick={() => handleShelf(s)}
                    className={`shelf-btn${shelfStatus === s ? ' active' : ''}`}
                  >
                    {label}
                  </button>
                ))}
                {shelfStatus && (
                  <button onClick={handleRemoveShelf} className="shelf-remove">✕ Remove</button>
                )}
              </div>
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
                  <span className="review-avatar">
                    {r.avatar_url
                      ? <img src={r.avatar_url} alt="" />
                      : (r.display_name || r.username || '?').charAt(0).toUpperCase()
                    }
                  </span>
                  <span className="review-author">{r.display_name || r.username}</span>
                  <span className="review-stars">{renderStars(r.rating)}</span>
                  {r.username === currentUsername && (
                    <button
                      className="review-delete"
                      onClick={() => handleDeleteReview(r.id)}
                      aria-label="Delete review"
                    >
                      ✕
                    </button>
                  )}
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
            {cafe.specialty && (
              <div className="cd-info-row">
                <div>
                  <span className="cd-info-label">Specialty</span>
                  <span className="cd-info-text">{cafe.specialty}</span>
                </div>
              </div>
            )}
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
                {cafe.opening_time && cafe.closing_time ? (
                  <span className="cd-info-text">{formatTime(cafe.opening_time)} – {formatTime(cafe.closing_time)}</span>
                ) : (
                  <span className="cd-info-text cd-info-muted">Not listed</span>
                )}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
