import { FaMapMarkerAlt, FaPhoneAlt, FaWhatsapp } from 'react-icons/fa';
import { BUSINESS, WHATSAPP_LINK } from '../../constants/business';
import './Contact.css';

const Contact = () => {
  return (
    <div className="page-container contact-page">
      <h1 className="section-title">Contact Us</h1>
      <p className="section-subtitle">We would love to help with your next printing project.</p>

      <div className="card contact-card">
        <p className="contact-item"><FaMapMarkerAlt /> {BUSINESS.address}</p>
        <p className="contact-item"><FaPhoneAlt /> {BUSINESS.phone}</p>
        <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
          <FaWhatsapp /> Chat on WhatsApp
        </a>
      </div>
    </div>
  );
};

export default Contact;
