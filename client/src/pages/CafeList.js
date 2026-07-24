import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';

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
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

function CafeList() {
  const [cafes, setCafes] = useState([]);
  const [reviews, setReviews] = useState({});
  const [formState, setFormState] = useState({});
  const [message, setMessage] = useState({});
  const [shelfStatus, setShelfStatus] = useState({});
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [selectedTag, setSelectedTag] = useState('');
  const [searchParams] = useSearchParams();
  const [highlightedCafe, setHighlightedCafe] = useState(null);
  const [shareOpenId, setShareOpenId] = useState(null);
  const token = localStorage.getItem('token');
  const currentUsername = localStorage.getItem('username');

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

  useEffect(() => {
    const cafeId = searchParams.get('cafe');
    if (!cafeId || cafes.length === 0) return;
    const el = document.getElementById(`cafe-${cafeId}`);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setHighlightedCafe(Number(cafeId));
    const timeout = setTimeout(() => setHighlightedCafe(null), 2500);
    return () => clearTimeout(timeout);
  }, [cafes, searchParams]);

  useEffect(() => {
    if (shareOpenId === null) return;
    const handleClick = (e) => {
      if (!e.target.closest('.share-wrap')) setShareOpenId(null);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [shareOpenId]);

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

  const buildShareUrl = (cafe) => `${window.location.origin}/cafes?cafe=${cafe.id}`;

  const buildShareText = (cafe) => {
    const avg = averageRating(cafe.id);
    const count = reviews[cafe.id]?.length || 0;
    const ratingLine = avg ? `${avg}★ from ${count} review${count === 1 ? '' : 's'}` : 'No ratings yet';
    return `${cafe.name} — ${ratingLine}\n${cafe.address}`;
  };

  const buildWhatsAppLink = (cafe) =>
    `https://wa.me/?text=${encodeURIComponent(`${buildShareText(cafe)}\n\nCheck it out on OverCaffeinated: ${buildShareUrl(cafe)}`)}`;

  const buildTelegramLink = (cafe) =>
    `https://t.me/share/url?url=${encodeURIComponent(buildShareUrl(cafe))}&text=${encodeURIComponent(buildShareText(cafe))}`;

  const parseTags = (tags) => tags ? tags.split(',').map(t => t.trim()) : [];

  const allTags = [...new Set(cafes.flatMap(c => parseTags(c.tags)))].sort();

  const visibleCafes = cafes
    .filter(cafe => {
      const q = search.toLowerCase();
      const matchesSearch = cafe.name.toLowerCase().includes(q) || (cafe.address || '').toLowerCase().includes(q);
      const matchesTag = !selectedTag || parseTags(cafe.tags).includes(selectedTag);
      return matchesSearch && matchesTag;
    })
    .sort((a, b) => {
      if (sortBy === 'highest') return (parseFloat(averageRating(b.id)) || 0) - (parseFloat(averageRating(a.id)) || 0);
      if (sortBy === 'most_reviewed') return (reviews[b.id]?.length || 0) - (reviews[a.id]?.length || 0);
      return 0;
    });

  return (
    <div className="page">
      <div className="page-header">
        <h1>Discover Cafes</h1>
        <p>Find your next favourite spot in Singapore</p>
      </div>

      <div className="search-bar">
        <input
          className="form-input search-input"
          placeholder="Search by name or location…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className="form-select search-sort"
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
        >
          <option value="default">Sort: Default</option>
          <option value="highest">Highest Rated</option>
          <option value="most_reviewed">Most Reviewed</option>
        </select>
      </div>

      {allTags.length > 0 && (
        <div className="tag-filter-bar">
          <button
            className={`tag-chip${selectedTag === '' ? ' active' : ''}`}
            onClick={() => setSelectedTag('')}
          >
            All
          </button>
          {allTags.map(tag => (
            <button
              key={tag}
              className={`tag-chip${selectedTag === tag ? ' active' : ''}`}
              onClick={() => setSelectedTag(selectedTag === tag ? '' : tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {visibleCafes.length === 0 && (
        <p className="search-empty">No cafes match your search.</p>
      )}

      <div className="cafe-grid">
        {visibleCafes.map(cafe => (
          <div
            key={cafe.id}
            id={`cafe-${cafe.id}`}
            className={`cafe-card${highlightedCafe === cafe.id ? ' cafe-card-highlight' : ''}`}
          >
            <div className="cafe-card-header">
              <div>
                <h2 className="cafe-name">{cafe.name}</h2>
                <div className="cafe-address">
                  <PinIcon /> {cafe.address}
                </div>
              </div>
              <div className="cafe-header-actions">
                {averageRating(cafe.id)
                  ? <div className="cafe-rating"><StarIcon /> {averageRating(cafe.id)}</div>
                  : <div className="cafe-no-rating">No ratings yet</div>
                }
                <div className="share-wrap">
                  <button
                    className="share-btn"
                    onClick={() => setShareOpenId(shareOpenId === cafe.id ? null : cafe.id)}
                    aria-label="Share this cafe"
                  >
                    <ShareIcon />
                  </button>
                  {shareOpenId === cafe.id && (
                    <div className="share-menu">
                      <a
                        className="share-menu-item"
                        href={buildWhatsAppLink(cafe)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setShareOpenId(null)}
                      >
                        WhatsApp
                      </a>
                      <a
                        className="share-menu-item"
                        href={buildTelegramLink(cafe)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setShareOpenId(null)}
                      >
                        Telegram
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {cafe.description && <p className="cafe-description">{cafe.description}</p>}
            {parseTags(cafe.tags).length > 0 && (
              <div className="cafe-tags">
                {parseTags(cafe.tags).map(tag => (
                  <span key={tag} className="cafe-tag">{tag}</span>
                ))}
              </div>
            )}
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
                reviews[cafe.id]?.some(r => r.username === currentUsername) ? (
                  <p className="login-nudge">You have already reviewed this cafe.</p>
                ) : (
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
                )
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