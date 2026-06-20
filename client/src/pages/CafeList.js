import { useEffect, useState } from 'react';
import axios from 'axios';

function CafeList() {
  const [cafes, setCafes] = useState([]);
  const [reviews, setReviews] = useState({});
  const [formState, setFormState] = useState({});
  const [message, setMessage] = useState({});
  const token = localStorage.getItem('token');

  useEffect(() => {
    axios.get('http://localhost:3001/api/cafes')
      .then(res => {
        setCafes(res.data);
        res.data.forEach(cafe => fetchReviews(cafe.id));
      })
      .catch(err => console.error(err));
  }, []);

  const fetchReviews = (cafeId) => {
    axios.get(`http://localhost:3001/api/reviews/${cafeId}`)
      .then(res => setReviews(prev => ({ ...prev, [cafeId]: res.data })));
  };

  const handleFormChange = (cafeId, field, value) => {
    setFormState(prev => ({
      ...prev,
      [cafeId]: { ...prev[cafeId], [field]: value }
    }));
  };

  const handleSubmit = async (cafeId) => {
    const { rating, review_text } = formState[cafeId] || {};
    if (!rating) { setMessage(prev => ({ ...prev, [cafeId]: 'Please select a rating.' })); return; }
    try {
      await axios.post('http://localhost:3001/api/reviews',
        { cafe_id: cafeId, rating, review_text },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(prev => ({ ...prev, [cafeId]: 'Review submitted!' }));
      setFormState(prev => ({ ...prev, [cafeId]: { rating: '', review_text: '' } }));
      fetchReviews(cafeId);
    } catch (err) {
      setMessage(prev => ({ ...prev, [cafeId]: err.response?.data?.error || 'Failed to submit.' }));
    }
  };

  const averageRating = (cafeId) => {
    const r = reviews[cafeId];
    if (!r || r.length === 0) return null;
    const avg = r.reduce((sum, rv) => sum + rv.rating, 0) / r.length;
    return avg.toFixed(1);
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h1>Discover Cafes</h1>
      {cafes.map(cafe => (
        <div key={cafe.id} style={{ border: '2px solid #6F4E37', margin: '0.5rem 0', padding: '1rem', borderRadius: '8px' }}>
          <h2>{cafe.name}</h2>
          <p>{cafe.address}</p>
          <p>{cafe.description}</p>
          <p><strong>Rating: </strong>{averageRating(cafe.id) ? `${averageRating(cafe.id)} / 5` : 'No reviews yet'}</p>

          <hr />
          <h3>Reviews</h3>
          {reviews[cafe.id]?.length === 0 && <p>No reviews yet. Be the first!</p>}
          {reviews[cafe.id]?.map(rv => (
            <div key={rv.id} style={{ background: '#f9f3ee', padding: '0.5rem', marginBottom: '0.5rem', borderRadius: '4px' }}>
              <strong>{rv.display_name || rv.username}</strong> — {'⭐'.repeat(rv.rating)}
              <p style={{ margin: '0.25rem 0 0' }}>{rv.review_text}</p>
            </div>
          ))}

          {token && (
            <div style={{ marginTop: '1rem' }}>
              <h4>Leave a Review</h4>
              <select
                value={formState[cafe.id]?.rating || ''}
                onChange={e => handleFormChange(cafe.id, 'rating', parseInt(e.target.value))}
              >
                <option value=''>Select rating</option>
                {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} star{n > 1 ? 's' : ''}</option>)}
              </select>
              <br /><br />
              <textarea
                placeholder='Write your review...'
                value={formState[cafe.id]?.review_text || ''}
                onChange={e => handleFormChange(cafe.id, 'review_text', e.target.value)}
                rows={3}
                style={{ width: '100%' }}
              />
              <br />
              <button onClick={() => handleSubmit(cafe.id)}>Submit Review</button>
              {message[cafe.id] && <p style={{ color: message[cafe.id] === 'Review submitted!' ? 'green' : 'red' }}>{message[cafe.id]}</p>}
            </div>
          )}

          {!token && <p style={{ color: '#888', marginTop: '1rem' }}>Log in to leave a review.</p>}
        </div>
      ))}
    </div>
  );
}

export default CafeList;