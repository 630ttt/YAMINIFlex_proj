import { Link } from 'react-router-dom';
import { FaWhatsapp } from 'react-icons/fa';
import { BUSINESS, SERVICES, WHATSAPP_LINK } from '../constants/business';
import './Footer.css';

const QUICK_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Designs', to: '/catalogue' },
  { label: 'Categories', to: '/catalogue' },
  { label: 'How It Works', to: '/#how-it-works' },
  { label: 'Contact', to: '/contact' },
  { label: 'Track Order', to: '/account' },
];

const LEGAL_LINKS = [
  { label: 'Privacy Policy', to: '/privacy-policy' },
  { label: 'Terms & Conditions', to: '/terms-and-conditions' },
  { label: 'Refund Policy', to: '/refund-policy' },
];

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-col">
          <h3 className="footer-title">{BUSINESS.name}</h3>
          <p className="footer-text">
            Premium digital flex printing, signage and commercial fabrication catering to high-volume trade and
            specialty orders across {BUSINESS.location}.
          </p>
          <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="footer-whatsapp">
            <FaWhatsapp /> Chat on WhatsApp
          </a>
        </div>

        <div className="footer-col">
          <h4 className="footer-subtitle">Services</h4>
          <ul className="footer-services">
            {SERVICES.map((service) => (
              <li key={service}>{service}</li>
            ))}
          </ul>
        </div>

        <div className="footer-col">
          <h4 className="footer-subtitle">Quick Links</h4>
          <ul className="footer-links">
            {QUICK_LINKS.map((link) => (
              <li key={link.label}>
                <Link to={link.to}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer-col">
          <h4 className="footer-subtitle">Legal &amp; Policies</h4>
          <ul className="footer-links">
            {LEGAL_LINKS.map((link) => (
              <li key={link.label}>
                <Link to={link.to}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        &copy; {year} {BUSINESS.name}, {BUSINESS.location}. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
