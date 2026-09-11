import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft, FaCopy, FaPhoneAlt, FaCheckCircle, FaWhatsapp } from 'react-icons/fa';
import { api } from '../../api/client';
import { BUSINESS, WHATSAPP_LINK, whatsappLinkWithMessage, PRINT_SPECIFICATIONS, ORDER_ASSURANCES } from '../../constants/business';
import Loader from '../../components/Loader';
import './DesignDetails.css';

const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace('/api', '');
const resolveImage = (src) => (src?.startsWith('http') ? src : `${API_ORIGIN}${src || ''}`);

const DesignDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [design, setDesign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/designs/${id}`)
      .then((res) => setDesign(res.data))
      .catch(() => setError('Design not found'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loader label="Loading design..." />;
  if (error || !design) {
    return (
      <div className="page-container empty-state">
        {error || 'Design not found'}. <Link to="/catalogue">Back to catalogue</Link>
      </div>
    );
  }

  const shortId = design._id.slice(-6).toUpperCase();

  const handleCopyId = () => {
    navigator.clipboard?.writeText(shortId);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="page-container design-details-page">
      <div className="design-details-topbar">
        <nav className="design-details-breadcrumb">
          <Link to="/">Home</Link> <span>/</span> <Link to="/catalogue">Designs</Link>{' '}
          {design.category?.name && (
            <>
              <span>/</span> <span>{design.category.name}</span>
            </>
          )}
          <span>/</span> <span>{shortId} ({design.title})</span>
        </nav>
        <Link to="/catalogue" className="design-details-back">
          <FaArrowLeft /> Back to Design Catalog
        </Link>
      </div>

      <div className="design-details">
        <div className="design-details-gallery">
          <div className="design-details-image">
            <span className="design-details-id-badge">ID: {shortId}</span>
            <span className="design-details-hd-badge">HD 1440 DPI Ready</span>
            <img src={resolveImage(design.fullImage)} alt={design.title} loading="lazy" />
          </div>

          {design.tags?.length > 0 && (
            <div className="design-details-block">
              <h4>Style Tags</h4>
              <div className="design-details-tags">
                {design.tags.map((tag) => (
                  <span key={tag} className="tag">{tag}</span>
                ))}
              </div>
            </div>
          )}

          <div className="design-details-specs card">
            <h4>Print Specifications</h4>
            <div className="design-details-specs-grid">
              {PRINT_SPECIFICATIONS.map((spec) => (
                <div key={spec.label}>
                  <span className="design-details-specs-label">{spec.label}</span>
                  <span className="design-details-specs-value">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="design-details-assurances">
            {ORDER_ASSURANCES.map((item) => (
              <span key={item} className="design-details-assurance">
                <FaCheckCircle /> {item}
              </span>
            ))}
          </div>
        </div>

        <div className="design-details-info">
          <p className="design-details-eyebrow">
            {design.category?.name || 'Design'} Collection &middot; {BUSINESS.location} Studio
          </p>
          <h1 className="section-title design-details-title">
            {design.title} <span className="design-details-title-id">({shortId})</span>
          </h1>
          {design.description && <p className="design-details-description">{design.description}</p>}

          <button type="button" className="design-details-copy-btn" onClick={handleCopyId}>
            <FaCopy /> {copied ? 'Copied!' : `Copy ID: ${shortId}`}
          </button>

          {design.sizeOptions?.length > 0 && (
            <div className="design-details-block">
              <h4>Available Sizes</h4>
              <div className="design-details-tags">
                {design.sizeOptions.map((size) => (
                  <span key={size} className="tag">{size}</span>
                ))}
              </div>
            </div>
          )}

          {design.price > 0 && (
            <p className="design-details-price">
              Starting at &#8377;{design.price}
              {typeof design.orderCount === 'number' && design.orderCount > 0 && (
                <span className="design-details-order-count"> &middot; {design.orderCount} orders placed</span>
              )}
            </p>
          )}

          <p className="design-details-dispatch">
            <FaCheckCircle /> Printed &amp; dispatched from {BUSINESS.address}
          </p>

          <div className="design-details-actions">
            <button className="btn btn-primary design-details-order-btn" onClick={() => navigate(`/order/${design._id}`)}>
              Select &amp; Order This Design
            </button>
            <a href={`tel:${BUSINESS.phone}`} className="btn btn-outline">
              <FaPhoneAlt /> Call Designer
            </a>
            <a
              href={whatsappLinkWithMessage(`Hi, I'd like to ask about design ${shortId} (${design.title}).`)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-gold"
            >
              <FaWhatsapp /> WhatsApp Query
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesignDetails;
