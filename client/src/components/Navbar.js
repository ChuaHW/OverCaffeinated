import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username');
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/login');
  };

  return (
    <nav style={{ padding: '1rem', borderBottom: '2px solid #6F4E37', display: 'flex', gap: '1rem' }}>
      {token ? (
        <>
          <span>Hi, {username}</span>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </>
      )}
    </nav>
  );
}

export default Navbar;