import { Link } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  // Placeholder: will show role-appropriate links after auth is implemented
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/dashboard">Time Tracker</Link>
      </div>
      <div className="navbar-links">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/admin">Admin</Link>
        <Link to="/login">Login</Link>
      </div>
    </nav>
  );
}

export default Navbar;
