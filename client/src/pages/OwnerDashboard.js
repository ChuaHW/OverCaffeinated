import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CupIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8h1a4 4 0 0 1 0 8h-1"/>
    <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
    <line x1="6" y1="1" x2="6" y2="4"/>
    <line x1="10" y1="1" x2="10" y2="4"/>
    <line x1="14" y1="1" x2="14" y2="4"/>
  </svg>
);

const emptyForm = {
  name: '',
  address: '',
  description: '',
  specialty: '',
  opening_time: '',
  closing_time: '',
};

export default function OwnerDashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  const [cafes, setCafes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    if (role !== 'owner') { navigate('/cafes'); return; }
    fetchCafes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCafes = () => {
    setLoading(true);
    axios.get('http://localhost:3001/api/cafes/mine', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => { setCafes(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setPhotoFile(null);
    setPhotoPreview(null);
    setEditingId(null);
    setShowForm(false);
  };

  const startCreate = () => {
    resetForm();
    setShowForm(true);
  };

  const startEdit = (cafe) => {
    setForm({
      name: cafe.name || '',
      address: cafe.address || '',
      description: cafe.description || '',
      specialty: cafe.specialty || '',
      opening_time: cafe.opening_time ? cafe.opening_time.slice(0, 5) : '',
      closing_time: cafe.closing_time ? cafe.closing_time.slice(0, 5) : '',
    });
    setPhotoFile(null);
    setPhotoPreview(cafe.image_url || null);
    setEditingId(cafe.id);
    setShowForm(true);
    setMessage({ text: '', type: '' });
  };

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setMessage({ text: 'Cafe name is required.', type: 'error' });
      return;
    }
    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => data.append(key, value));
    if (photoFile) data.append('photo', photoFile);

    try {
      if (editingId) {
        await axios.put(`http://localhost:3001/api/cafes/${editingId}`, data, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessage({ text: 'Cafe listing updated!', type: 'success' });
      } else {
        await axios.post('http://localhost:3001/api/cafes', data, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessage({ text: 'Cafe listing created!', type: 'success' });
      }
      resetForm();
      fetchCafes();
    } catch (err) {
      setMessage({ text: err.response?.data?.error || 'Something went wrong.', type: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this cafe listing? This cannot be undone.')) return;
    try {
      await axios.delete(`http://localhost:3001/api/cafes/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCafes();
    } catch (err) {
      console.error(err);
    }
  };

  const formatTime = (t) => {
    if (!t) return null;
    const [h, m] = t.split(':');
    const hour = parseInt(h, 10);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    return `${displayHour}:${m} ${period}`;
  };

  if (!token || role !== 'owner') return null;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Owner Dashboard</h1>
        <p>Manage your cafe listings on OverCaffeinated</p>
      </div>

      {!showForm && (
        <button className="btn btn-primary" onClick={startCreate} style={{ marginBottom: '1.75rem' }}>
          + Add New Cafe
        </button>
      )}

      {showForm && (
        <div className="section-card" style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1.25rem' }}>{editingId ? 'Edit Cafe Listing' : 'New Cafe Listing'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-field">
              <label className="form-label">Cafe Name</label>
              <input className="form-input" name="name" value={form.name} onChange={handleChange} placeholder="e.g. Nylon Coffee Roasters" required />
            </div>
            <div className="form-field">
              <label className="form-label">Address</label>
              <input className="form-input" name="address" value={form.address} onChange={handleChange} placeholder="Street address" />
            </div>
            <div className="form-field">
              <label className="form-label">Short Description</label>
              <textarea className="form-textarea" name="description" value={form.description} onChange={handleChange} rows={3} placeholder="A short description of your cafe…" />
            </div>
            <div className="form-field">
              <label className="form-label">Specialty</label>
              <input className="form-input" name="specialty" value={form.specialty} onChange={handleChange} placeholder="e.g. Single-origin pour-over" />
            </div>
            <div className="form-row">
              <div className="form-field">
                <label className="form-label">Opening Time</label>
                <input className="form-input" type="time" name="opening_time" value={form.opening_time} onChange={handleChange} />
              </div>
              <div className="form-field">
                <label className="form-label">Closing Time</label>
                <input className="form-input" type="time" name="closing_time" value={form.closing_time} onChange={handleChange} />
              </div>
            </div>
            <div className="form-field">
              <label className="form-label">Display Photo</label>
              {photoPreview && (
                <img src={photoPreview} alt="Preview" className="photo-preview" />
              )}
              <input className="form-input" type="file" accept="image/*" onChange={handlePhotoChange} />
            </div>
            {message.text && <div className={`form-message ${message.type}`}>{message.text}</div>}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button type="submit" className="btn btn-primary">{editingId ? 'Save Changes' : 'Create Listing'}</button>
              <button type="button" className="btn btn-outline" onClick={resetForm}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="loading-screen">Loading…</div>
      ) : cafes.length === 0 ? (
        <p className="search-empty">You haven't listed any cafes yet.</p>
      ) : (
        <div className="cafe-grid">
          {cafes.map(cafe => (
            <div key={cafe.id} className="cafe-card owner-cafe-card">
              <div className="cafe-card-image">
                {cafe.image_url ? <img src={cafe.image_url} alt={cafe.name} /> : <CupIcon />}
              </div>
              <div className="cafe-card-body">
                <div className="cafe-card-header">
                  <div>
                    <h2 className="cafe-name">{cafe.name}</h2>
                    <div className="cafe-address">{cafe.address}</div>
                  </div>
                </div>
                {cafe.specialty && <div className="cafe-specialty">{cafe.specialty}</div>}
                {cafe.description && <p className="cafe-description">{cafe.description}</p>}
                {(cafe.opening_time || cafe.closing_time) && (
                  <p className="owner-cafe-hours">
                    {formatTime(cafe.opening_time)} – {formatTime(cafe.closing_time)}
                  </p>
                )}
                <div className="cafe-card-footer">
                  <span className="cafe-card-cta">
                    {cafe.review_count > 0 ? `${cafe.avg_rating}★ · ${cafe.review_count} reviews` : 'No reviews yet'}
                  </span>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-outline btn-sm" onClick={() => startEdit(cafe)}>Edit</button>
                    <button className="btn btn-outline btn-sm" onClick={() => handleDelete(cafe.id)}>Delete</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
