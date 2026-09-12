import React from "react";
import { Link } from "react-router-dom";

import {
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaArrowRight,
} from "react-icons/fa";

import {
  BUSINESS,
  SERVICES,
} from "../constants/business";

import yaminiLogo from "../assets/yamini-flex-logo.webp";

import "./Footer.css";

const QUICK_LINKS = [
  { label: "Home", to: "/" },
  { label: "Designs", to: "/catalogue" },
  
  { label: "How It Works", to: "/#how-it-works" },
  { label: "Contact", to: "/contact" },
  { label: "Track Order", to: "/account" },
];

const LEGAL_LINKS = [
  { label: "Privacy Policy", to: "/privacy-policy" },
  { label: "Terms & Conditions", to: "/terms-and-conditions" },
  { label: "Refund Policy", to: "/refund-policy" },
];

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">

        {/* ================= BRAND ================= */}
        <div className="footer-brand">

          <Link to="/" className="footer-logo">

            <div className="footer-logo-image">
              <img
                src={yaminiLogo}
                alt="Yamini Flex Printing"
              />
            </div>

          </Link>

          <p className="footer-text">
            Premium flex printing, signage and large-format print
            solutions crafted for businesses, events, celebrations
            and promotional campaigns across {BUSINESS.location}.
          </p>

        </div>


        {/* ================= SERVICES ================= */}
        <div className="footer-col">

          <h4 className="footer-subtitle">
            Our Services
          </h4>

          <ul className="footer-services">

            {SERVICES.map((service) => (
              <li key={service}>

                <span className="footer-list-arrow">
                  <FaArrowRight />
                </span>

                <span>
                  {service}
                </span>

              </li>
            ))}

          </ul>

        </div>


        {/* ================= QUICK LINKS ================= */}
        <div className="footer-col">

          <h4 className="footer-subtitle">
            Quick Links
          </h4>

          <ul className="footer-links">

            {QUICK_LINKS.map((link) => (
              <li key={link.label}>

                <Link to={link.to}>

                  <span className="footer-link-arrow">
                    <FaArrowRight />
                  </span>

                  {link.label}

                </Link>

              </li>
            ))}

          </ul>

        </div>


        {/* ================= CONTACT ================= */}
        <div className="footer-col">

          <h4 className="footer-subtitle">
            Contact Us
          </h4>

          <div className="footer-contact">

            {/* Address */}
            <div className="footer-contact-item">

              <span className="footer-contact-icon">
                <FaMapMarkerAlt />
              </span>

              <span>
                {BUSINESS.fullAddress || BUSINESS.location}
              </span>

            </div>


            {/* Phone */}
            {BUSINESS.phone && (
              <div className="footer-contact-item">

                <span className="footer-contact-icon">
                  <FaPhoneAlt />
                </span>

                <a href={`tel:${BUSINESS.phone}`}>
                  {BUSINESS.phone}
                </a>

              </div>
            )}

          </div>


          {/* Policies */}
          <div className="footer-legal">

            <span className="footer-legal-title">
              Policies
            </span>

            {LEGAL_LINKS.map((link) => (
              <Link
                key={link.label}
                to={link.to}
              >
                {link.label}
              </Link>
            ))}

          </div>

        </div>

      </div>


      {/* ================= BOTTOM ================= */}
      <div className="footer-bottom">

        <div className="footer-bottom-inner">

          <p>
            &copy; {year}{" "}
            <strong>
              HRA GROUPS PRIVATE LIMITED
            </strong>
            . All rights reserved.
          </p>

          <p className="footer-bottom-location">

            Premium Flex Printing &amp; Signage

            <span>•</span>

            {BUSINESS.location}

          </p>

        </div>

      </div>

    </footer>
  );
};

export default Footer;

