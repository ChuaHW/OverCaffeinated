import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

const ArrowIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12 5 19 12 12 19"/>
  </svg>
);

const CupIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8h1a4 4 0 0 1 0 8h-1"/>
    <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
    <line x1="6" y1="1" x2="6" y2="4"/>
    <line x1="10" y1="1" x2="10" y2="4"/>
    <line x1="14" y1="1" x2="14" y2="4"/>
  </svg>
);

function CafeList() {
  const navigate = useNavigate();
  const [cafes, setCafes] = useState([]);
  const [shelfStatus, setShelfStatus] = useState({});
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [selectedTag, setSelectedTag] = useState('');
  const [shareOpenId, setShareOpenId] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    axios.get('/api/cafes')
      .then(res => setCafes(res.data))
      .catch(err => console.error(err));

    if (token) {
      axios.get('/api/shelf/mine', {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => {
        const map = {};
        res.data.forEach(item => { map[item.cafe_id] = item.status; });
        setShelfStatus(map);
      }).catch(err => console.error(err));
    }
  }, [token]);

  useEffect(() => {
    if (shareOpenId === null) return;
    const handleClick = (e) => {
      if (!e.target.closest('.share-wrap')) setShareOpenId(null);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [shareOpenId]);

  const handleShelf = async (e, cafeId, status) => {
    e.stopPropagation();
    try {
      await axios.post('/api/shelf',
        { cafe_id: cafeId, status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShelfStatus(prev => ({ ...prev, [cafeId]: status }));
    } catch (err) { console.error(err); }
  };

  const handleRemoveShelf = async (e, cafeId) => {
    e.stopPropagation();
    try {
      await axios.delete(`/api/shelf/${cafeId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShelfStatus(prev => {
        const next = { ...prev };
        delete next[cafeId];
        return next;
      });
    } catch (err) { console.error(err); }
  };

  const renderStars = (rating) => '★'.repeat(rating) + '☆'.repeat(5 - rating);

  const buildShareUrl = (cafe) => `${window.location.origin}/cafes/${cafe.id}`;

  const buildShareText = (cafe) => {
    const ratingLine = cafe.avg_rating
      ? `${cafe.avg_rating}★ from ${cafe.review_count} review${cafe.review_count === 1 ? '' : 's'}`
      : 'No ratings yet';
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
      if (sortBy === 'highest') return (parseFloat(b.avg_rating) || 0) - (parseFloat(a.avg_rating) || 0);
      if (sortBy === 'most_reviewed') return (b.review_count || 0) - (a.review_count || 0);
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
            className="cafe-card cafe-card-link"
            onClick={() => navigate(`/cafes/${cafe.id}`)}
          >
            <div className="cafe-card-image">
              {cafe.image_url ? <img src={cafe.image_url} alt={cafe.name} /> : <CupIcon />}
            </div>
            <div className="cafe-card-body">
            <div className="cafe-card-header">
              <div>
                <h2 className="cafe-name">{cafe.name}</h2>
                <div className="cafe-address">
                  <PinIcon /> {cafe.address}
                </div>
              </div>
              <div className="cafe-header-actions">
                {cafe.avg_rating
                  ? <div className="cafe-rating"><StarIcon /> {cafe.avg_rating}</div>
                  : <div className="cafe-no-rating">No ratings yet</div>
                }
                <div className="share-wrap">
                  <button
                    className="share-btn"
                    onClick={(e) => { e.stopPropagation(); setShareOpenId(shareOpenId === cafe.id ? null : cafe.id); }}
                    aria-label="Share this cafe"
                  >
                    <ShareIcon />
                  </button>
                  {shareOpenId === cafe.id && (
                    <div className="share-menu" onClick={(e) => e.stopPropagation()}>
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

            {cafe.specialty && <div className="cafe-specialty">{cafe.specialty}</div>}
            {cafe.description && <p className="cafe-description">{cafe.description}</p>}

            {parseTags(cafe.tags).length > 0 && (
              <div className="cafe-tags">
                {parseTags(cafe.tags).map(tag => (
                  <span key={tag} className="cafe-tag">{tag}</span>
                ))}
              </div>
            )}

            {token && (
              <div className="shelf-bar" onClick={(e) => e.stopPropagation()}>
                <span className="shelf-label-text">My Shelf</span>
                {Object.entries(SHELF_LABELS).map(([s, label]) => (
                  <button
                    key={s}
                    onClick={(e) => handleShelf(e, cafe.id, s)}
                    className={`shelf-btn${shelfStatus[cafe.id] === s ? ' active' : ''}`}
                  >
                    {label}
                  </button>
                ))}
                {shelfStatus[cafe.id] && (
                  <button onClick={(e) => handleRemoveShelf(e, cafe.id)} className="shelf-remove">
                    ✕ Remove
                  </button>
                )}
              </div>
            )}

            <div className="cafe-card-footer">
              <span className="cafe-card-cta">
                {cafe.review_count > 0
                  ? `${renderStars(Math.round(cafe.avg_rating))} · ${cafe.review_count} review${cafe.review_count === 1 ? '' : 's'}`
                  : 'No reviews yet'}
              </span>
              <span className="cafe-card-cta-link">View details <ArrowIcon /></span>
            </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CafeList;
