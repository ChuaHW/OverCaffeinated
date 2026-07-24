import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username');
  const role = localStorage.getItem('role');
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">OverCaffeinated</Link>
        <div className="navbar-links">
          <Link to="/cafes" className="nav-link">Cafes</Link>
          {token ? (
            <>
              <span className="nav-greeting">Hi, {username}</span>
              {role === 'owner' && <Link to="/owner/dashboard" className="nav-link">Owner Dashboard</Link>}
              <Link to="/profile" className="nav-link">Profile</Link>
              <button onClick={logout} className="btn btn-outline btn-sm" style={{ marginLeft: '0.25rem' }}>
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Log in</Link>
              <Link to="/register" className="btn btn-primary btn-sm" style={{ marginLeft: '0.25rem' }}>
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;