import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p>&copy; {new Date().getFullYear()} Online Event Ticketing System</p>
        <div className="footer-links">
          <a href="mailto:support@example.com">Contact Us</a>
          <a href="/about">About</a>
          <a href="/privacy">Privacy Policy</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
