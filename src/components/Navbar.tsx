import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './Navbar.css';

function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to={user?.role === 'admin' ? '/admin' : '/dashboard'}>
          Time Tracker
        </Link>
      </div>
      <div className="navbar-links">
        {user?.role === 'admin' && <Link to="/admin">Admin</Link>}
        {user?.role === 'employee' && <Link to="/dashboard">Dashboard</Link>}
        {user && (
          <>
            <span className="navbar-user">{user.name}</span>
            <button className="navbar-logout" onClick={logout}>
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
