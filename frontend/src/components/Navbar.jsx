
import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

import {
  FaPrint,
  FaUserCircle,
  FaSearch,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaBars,
  FaTimes,
} from "react-icons/fa";

import { BUSINESS } from "../constants/business";
import { useCustomerAuth } from "../context/CustomerAuthContext";

import yaminiLogo from "../assets/yamini-flex-logo.webp";

import "./Navbar.css";

const Navbar = () => {
  const { isAuthenticated, customer } = useCustomerAuth();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinkClass = ({ isActive }) =>
    `navbar-link${isActive ? " navbar-link-active" : ""}`;

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();

    const value = search.trim();

    navigate(
      `/catalogue${
        value ? `?search=${encodeURIComponent(value)}` : ""
      }`
    );

    closeMenu();
  };

  return (
    <header className="navbar">

      {/* ================= TOP BAR ================= */}
      <div className="navbar-topbar">
        <div className="navbar-topbar-inner">

          <div className="navbar-topbar-left">
            <span>
              <FaMapMarkerAlt />
              {BUSINESS.address}
            </span>

            <span className="navbar-topbar-divider">|</span>

            <span>
              Premium Flex Printing & Signage
            </span>
          </div>

          <div className="navbar-topbar-right">
            <a href={`tel:${BUSINESS.phone}`}>
              <FaPhoneAlt />
              {BUSINESS.phone}
            </a>
          </div>

        </div>
      </div>

      {/* ================= MAIN NAVBAR ================= */}
      <div className="navbar-main">
        <div className="navbar-main-inner">

          {/* LOGO */}
          <Link
            to="/"
            className="navbar-brand"
            onClick={closeMenu}
          >
            <div className="navbar-brand-logo">
              <img
                src={yaminiLogo}
                alt="Yamini Flex Printing"
              />
            </div>
          </Link>

          {/* DESKTOP NAVIGATION */}
          <nav className="navbar-navigation">

            <NavLink
              to="/"
              end
              className={navLinkClass}
            >
              Home
            </NavLink>

            <NavLink
              to="/catalogue"
              className={navLinkClass}
            >
              Designs
            </NavLink>

            <NavLink
              to="/how-it-works"
              className={navLinkClass}
            >
              How It Works
            </NavLink>

            <NavLink
              to="/contact"
              className={navLinkClass}
            >
              Contact
            </NavLink>

          </nav>

          {/* MAIN ACTIONS */}
          <div className="navbar-main-actions">

            <NavLink
              to={isAuthenticated ? "/account" : "/login"}
              className="navbar-account"
            >
              <FaUserCircle />

              <span>
                {isAuthenticated
                  ? customer?.name?.split(" ")[0] || "Account"
                  : "My Orders"}
              </span>
            </NavLink>

          </div>

          {/* MOBILE MENU BUTTON */}
          <button
            type="button"
            className="navbar-menu-button"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label={
              menuOpen
                ? "Close menu"
                : "Open menu"
            }
            aria-expanded={menuOpen}
          >
            {menuOpen ? <FaTimes /> : <FaBars />}
          </button>

        </div>
      </div>

      {/* ================= SEARCH SECTION ================= */}
      <div className="navbar-search-section">

        <div className="navbar-search-inner">

          <div className="navbar-search-label">
          

            <span>
              What are you looking to print?
            </span>
          </div>

          <form
            className="navbar-search"
            onSubmit={handleSearchSubmit}
          >
            <FaSearch className="navbar-search-icon" />

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search flex, vinyl, boards, banners..."
              aria-label="Search printing services"
            />

            <button type="submit">
              Search
            </button>
          </form>

        </div>

      </div>

      {/* ================= MOBILE MENU ================= */}
      <div
        className={`navbar-mobile ${
          menuOpen
            ? "navbar-mobile-open"
            : ""
        }`}
      >

        <nav className="navbar-mobile-navigation">

          <NavLink
            to="/"
            end
            className={navLinkClass}
            onClick={closeMenu}
          >
            Home
          </NavLink>

          <NavLink
            to="/catalogue"
            className={navLinkClass}
            onClick={closeMenu}
          >
            Designs
          </NavLink>

          <NavLink
            to="/how-it-works"
            className={navLinkClass}
            onClick={closeMenu}
          >
            How It Works
          </NavLink>

          <NavLink
            to="/contact"
            className={navLinkClass}
            onClick={closeMenu}
          >
            Contact
          </NavLink>

        </nav>

        <div className="navbar-mobile-divider" />

        {/* MOBILE ACCOUNT */}
        <NavLink
          to={
            isAuthenticated
              ? "/account"
              : "/login"
          }
          className="navbar-mobile-account"
          onClick={closeMenu}
        >
          <FaUserCircle />

          <span>
            {isAuthenticated
              ? customer?.name?.split(" ")[0] ||
                "My Account"
              : "My Orders"}
          </span>
        </NavLink>

        {/* MOBILE CALL */}
        <a
          href={`tel:${BUSINESS.phone}`}
          className="navbar-mobile-call"
        >
          <FaPhoneAlt />
          Call Us
        </a>

      </div>

    </header>
  );
};

export default Navbar;

