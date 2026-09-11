import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { FaPrint, FaWhatsapp, FaUserCircle, FaSearch, FaPhoneAlt, FaMapMarkerAlt } from 'react-icons/fa';
import { BUSINESS, WHATSAPP_LINK } from '../constants/business';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import './Navbar.css';

const Navbar = () => {
  const navLinkClass = ({ isActive }) => `navbar-link${isActive ? ' navbar-link-active' : ''}`;
  const { isAuthenticated, customer } = useCustomerAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    navigate(`/catalogue${search.trim() ? `?search=${encodeURIComponent(search.trim())}` : ''}`);
  };

  return (
    <header className="navbar">
      <div className="navbar-topbar">
        <div className="navbar-topbar-inner">
          <span className="navbar-topbar-item">
            <FaMapMarkerAlt /> {BUSINESS.address}
          </span>
          <a href={`tel:${BUSINESS.phone}`} className="navbar-topbar-item navbar-topbar-link">
            <FaPhoneAlt /> {BUSINESS.phone}
          </a>
        </div>
      </div>

      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <FaPrint className="navbar-brand-icon" />
          <span>
            {BUSINESS.name}
            <small className="navbar-brand-sub">{BUSINESS.location}</small>
          </span>
        </Link>

        <nav className="navbar-links">
          <NavLink to="/" end className={navLinkClass}>Home</NavLink>
          <NavLink to="/catalogue" className={navLinkClass}>Designs</NavLink>
          <NavLink to="/catalogue" className={navLinkClass}>Categories</NavLink>
          <NavLink to="/contact" className={navLinkClass}>Contact</NavLink>
        </nav>

        <form className="navbar-search" onSubmit={handleSearchSubmit}>
          <FaSearch className="navbar-search-icon" />
          <input
            type="text"
            placeholder="Search flex, vinyl, boards..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>

        <div className="navbar-actions">
          <NavLink to={isAuthenticated ? '/account' : '/login'} className="navbar-account-link">
            <FaUserCircle />
            {isAuthenticated ? customer?.name?.split(' ')[0] || 'My Account' : 'My Orders'}
          </NavLink>
          <a href={`tel:${BUSINESS.phone}`} className="btn btn-outline navbar-call-btn">
            {BUSINESS.phone}
          </a>
          <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="navbar-whatsapp">
            <FaWhatsapp />
            <span>WhatsApp</span>
          </a>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
