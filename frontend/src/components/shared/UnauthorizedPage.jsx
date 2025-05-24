import { Link } from 'react-router-dom';
import './UnauthorizedPage.css';

const UnauthorizedPage = () => {
  return (
    <div className="unauthorized-container">
      <h1>Access Denied</h1>
      <div className="unauthorized-icon">🔒</div>
      <p>You don't have permission to access this page.</p>
      <p>Please contact the administrator if you believe this is an error.</p>
      <Link to="/" className="home-button">Go to Home Page</Link>
    </div>
  );
};

export default UnauthorizedPage;
