import { useNavigate, Link } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username');

  return (
    <div className="landing">
      <video
        className="landing-bg-video"
        src="/videos/hero.mp4"
        autoPlay
        muted
        loop
        playsInline
      />
      <div className="landing-overlay" />

      <header className="landing-header">
        <div className="navbar-inner">
          <span className="navbar-brand" style={{ cursor: 'default', color: '#ffffff' }}>
            OverCaffeinated
          </span>
          <div className="landing-header-links">
            <Link to="/cafes" className="nav-link" style={{ color: 'rgba(255,255,255,0.75)' }}>Cafes</Link>
            {token ? (
              <>
                <span className="nav-greeting" style={{ color: 'rgba(255,255,255,0.6)' }}>Hi, {username}</span>
                <button className="landing-cta" onClick={() => navigate('/cafes')}>Explore</button>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link" style={{ color: 'rgba(255,255,255,0.75)' }}>Sign In</Link>
                <Link to="/register" className="nav-link" style={{ color: 'rgba(255,255,255,0.75)' }}>Sign Up</Link>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="landing-hero">
        <p className="landing-eyebrow">Singapore Specialty Coffee Directory</p>
        <h1 className="landing-headline">
          Find your next favourite cafe in Singapore
        </h1>
        <p className="landing-sub">
          Discover, review, and save specialty cafes with fellow coffee lovers.
        </p>
        <button className="landing-cta" onClick={() => navigate('/cafes')}>
          Explore Cafes
        </button>
      </div>

    </div>
  );
}
