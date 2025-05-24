import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isAuthenticated, hasRole } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">Event Ticketing System</Link>
      </div>
      
      <div className="navbar-menu">
        {/* Public Links */}
        <Link to="/" className="navbar-item">Events</Link>
        
        {/* Authenticated Links */}
        {isAuthenticated && (
          <>
            <Link to="/profile" className="navbar-item">Profile</Link>
            
            {/* User-specific Links */}
            {hasRole('user') && (
              <Link to="/bookings" className="navbar-item">My Bookings</Link>
            )}
            
            {/* Organizer-specific Links */}
            {hasRole('organizer') && (
              <>
                <Link to="/my-events" className="navbar-item">My Events</Link>
                <Link to="/my-events/analytics" className="navbar-item">Analytics</Link>
              </>
            )}
            
            {/* Admin-specific Links */}
            {hasRole('admin') && (
              <>
                <Link to="/admin/events" className="navbar-item">Manage Events</Link>
                <Link to="/admin/users" className="navbar-item">Manage Users</Link>
              </>
            )}
          </>
        )}
      </div>
      
      <div className="navbar-auth">
        {isAuthenticated ? (
          <>
            <span className="user-welcome">Welcome, {user.name}</span>
            <button onClick={handleLogout} className="logout-button">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="navbar-item">Login</Link>
            <Link to="/register" className="navbar-item">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
