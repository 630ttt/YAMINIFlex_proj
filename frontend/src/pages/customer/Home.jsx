import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaArrowRight,
  FaWhatsapp,
  FaSearch,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaBirthdayCake,
  FaRing,
  FaStore,
  FaPray,
  FaCalendarAlt,
  FaBaby,
  FaBullhorn,
  FaFilm,
  FaBriefcase,
  FaFlag,
  FaChalkboardTeacher,
  FaClock,
} from 'react-icons/fa';
import { GiCandleFlame } from 'react-icons/gi';
import { api } from '../../api/client';
import {
  BUSINESS,
  WHATSAPP_LINK,
  whatsappLinkWithMessage,
  HERO_STATS,
  HERO_HIGHLIGHTS,
  SERVICE_DETAILS,
  UNIT_LABELS,
  RATE_CARD_MATERIALS,
  TRENDING_SEARCHES,
  CATEGORY_ICON_KEYS,
  HOW_IT_WORKS,
  WHY_CHOOSE_US,
} from '../../constants/business';
import Loader from '../../components/Loader';
import './Home.css';

const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace('/api', '');
const resolveImage = (src) => (src?.startsWith('http') ? src : `${API_ORIGIN}${src || ''}`);

const CATEGORY_ICONS = {
  birthday: FaBirthdayCake,
  marriage: FaRing,
  shop: FaStore,
  religious: FaPray,
  memorial: GiCandleFlame,
  functions: FaCalendarAlt,
  baby: FaBaby,
  political: FaBullhorn,
  cinema: FaFilm,
  business: FaBriefcase,
  banner: FaFlag,
  board: FaChalkboardTeacher,
};

const DesignPreviewCard = ({ design, badge }) => (
  <div className="preview-card card">
    {badge && <span className={`preview-card-badge preview-card-badge-${badge.toLowerCase().replace(/\s+/g, '-')}`}>{badge}</span>}
    <div className="preview-card-image-wrapper">
      <img src={resolveImage(design.thumbnail)} alt={design.title} loading="lazy" />
    </div>
    <div className="preview-card-body">
      {design.category?.name && <span className="preview-card-category">{design.category.name}</span>}
      <h3 className="preview-card-title">{design.title}</h3>
      {design.description && <p className="preview-card-description">{design.description}</p>}
      <div className="preview-card-footer">
        <span className="tag">HD Print Ready</span>
        <Link to={`/design/${design._id}`} className="btn btn-primary preview-card-btn">
          View Design
        </Link>
      </div>
    </div>
  </div>
);

const Home = () => {
  const navigate = useNavigate();
  const [finderSearch, setFinderSearch] = useState('');

  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const [latestDesigns, setLatestDesigns] = useState([]);
  const [popularDesigns, setPopularDesigns] = useState([]);
  const [designsLoading, setDesignsLoading] = useState(true);

  const [calc, setCalc] = useState({
    width: 10,
    height: 6,
    materialIndex: 1,
    name: '',
    phone: '',
  });

  useEffect(() => {
    api
      .get('/categories')
      .then((res) => setCategories(res.data))
      .catch(() => setCategories([]))
      .finally(() => setCategoriesLoading(false));
  }, []);

  useEffect(() => {
    setDesignsLoading(true);
    Promise.all([
      api.get('/designs', { page: 1, limit: 4 }),
      api.get('/designs', { page: 1, limit: 4, featured: 'true' }),
    ])
      .then(([latestRes, featuredRes]) => {
        setLatestDesigns(latestRes.data);
        let popular = featuredRes.data;
        if (popular.length < 4) {
          const usedIds = new Set([...latestRes.data.map((d) => d._id), ...popular.map((d) => d._id)]);
          const fallback = latestRes.data.filter((d) => !usedIds.has(d._id));
          popular = [...popular, ...fallback].slice(0, 4);
          if (popular.length === 0) popular = latestRes.data.slice(0, 4);
        }
        setPopularDesigns(popular);
      })
      .catch(() => {})
      .finally(() => setDesignsLoading(false));
  }, []);

  const material = RATE_CARD_MATERIALS[calc.materialIndex] || RATE_CARD_MATERIALS[0];
  const totalArea = useMemo(() => (Number(calc.width) || 0) * (Number(calc.height) || 0), [calc.width, calc.height]);
  const estimatedRate = useMemo(() => Math.round(totalArea * (material?.price || 0)), [totalArea, material]);

  const handleFinderSubmit = (e) => {
    e.preventDefault();
    navigate(`/catalogue${finderSearch.trim() ? `?search=${encodeURIComponent(finderSearch.trim())}` : ''}`);
  };

  const handleCalcChange = (e) => {
    const { name, value } = e.target;
    setCalc((prev) => ({ ...prev, [name]: name === 'materialIndex' ? Number(value) : value }));
  };

  const handleCalcWhatsApp = () => {
    const message = `Hi ${BUSINESS.name}, I'd like a quote:\nMaterial: ${material?.name}\nSize: ${calc.width}ft x ${calc.height}ft (${totalArea} sq.ft)\nEstimated: ~₹${estimatedRate}\nName: ${calc.name || '-'}\nMobile: ${calc.phone || '-'}`;
    window.open(whatsappLinkWithMessage(message), '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      {/* HERO */}
      <section className="hero">
        <div className="hero-container">
          <div className="hero-content">
            <span className="hero-badge">{BUSINESS.location}'s No.1 Digital Hub</span>
            <h1 className="hero-title">{BUSINESS.name}</h1>
            <p className="hero-tagline">Creative Designs • Quality Printing • Easy Ordering</p>
            <p className="hero-subtitle">
              Choose from thousands of designs, customize your requirements and place your order easily.
              High-speed wide-format flex, vinyl, glow signboards, and event hoardings crafted with industrial precision.
            </p>
            <div className="hero-actions">
              <Link to="/catalogue" className="btn btn-primary">
                Browse Designs <FaArrowRight />
              </Link>
              <Link to="/catalogue" className="btn btn-outline">
                <FaSearch /> Search Designs
              </Link>
              <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="btn btn-gold">
                <FaWhatsapp /> Quick WhatsApp Order
              </a>
            </div>
            <div className="hero-stats">
              {HERO_STATS.map((stat) => (
                <div key={stat.label} className="hero-stat">
                  <span className="hero-stat-label">{stat.label}</span>
                  <span className="hero-stat-sub">{stat.sub}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-visual-card">
              <span className="hero-visual-tag">Durst P5 350 • Live Operation</span>
              <div className="hero-visual-image" aria-hidden="true" />
              <div className="hero-visual-caption">
                <strong>Ultra High-Res 1440 DPI</strong>
                <span>Same-Day Dispatch</span>
              </div>
              <p className="hero-visual-text">
                Heavy front-lit, star flex &amp; backlit banners, ready for custom cut {BUSINESS.location} studios.
              </p>
              <div className="hero-visual-footer">
                {HERO_HIGHLIGHTS.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="page-container">
        <span className="eyebrow">Atelier Solutions</span>
        <div className="section-header-row">
          <div>
            <h2 className="section-title">Our Printing Services</h2>
            <p className="section-subtitle">
              State-of-the-art print solutions for businesses, events, and personal celebrations with precision color calibration.
            </p>
          </div>
        </div>
        <div className="services-grid">
          {SERVICE_DETAILS.map((service) => (
            <div key={service.name} className="service-card card">
              <h3 className="service-card-title">{service.name}</h3>
              <span className="service-card-tagline">{service.tagline}</span>
              <p className="service-card-description">{service.description}</p>
              <div className="service-card-footer">
                <span className="service-card-price">
                  From ₹{service.price} {UNIT_LABELS[service.unit]}
                </span>
               
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* INSTANT CATALOG FINDER */}
      <section className="finder-section">
        <div className="page-container finder-container">
          <span className="eyebrow">Instant Catalog Finder</span>
          <h2 className="section-title">Find Your Design Fast</h2>
          <p className="section-subtitle">
            Enter your required event, design code, or template style to preview and place an immediate print request.
          </p>
          <form className="finder-search" onSubmit={handleFinderSubmit}>
            <FaSearch className="finder-search-icon" />
            <input
              type="text"
              placeholder="Search by Design ID, Name or Category (e.g. BD1025, Birthday, Wedding)..."
              value={finderSearch}
              onChange={(e) => setFinderSearch(e.target.value)}
            />
            <button type="submit" className="btn btn-primary">
              Search <FaArrowRight />
            </button>
          </form>
          <div className="finder-trending">
            <span>Trending:</span>
            {TRENDING_SEARCHES.map((term) => (
              <button key={term} type="button" className="tag finder-trending-tag" onClick={() => navigate(`/catalogue?search=${encodeURIComponent(term)}`)}>
                {term}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="page-container">
        <span className="eyebrow">Organized Collections</span>
        <h2 className="section-title">Browse Design Categories</h2>
        <p className="section-subtitle">
          Curated collections with ready-made Telugu &amp; English typographic templates for fast turnarounds.
        </p>
        {categoriesLoading ? (
          <Loader label="Loading categories..." />
        ) : (
          <div className="category-grid">
            {categories.map((category) => {
              const Icon = CATEGORY_ICONS[CATEGORY_ICON_KEYS[category.slug]] || FaChalkboardTeacher;
              return (
                <Link key={category._id} to={`/catalogue?category=${category._id}`} className="category-card card">
                  <span className="category-card-icon">
                    <Icon />
                  </span>
                  <span className="category-card-name">{category.name}</span>
                  <span className="category-card-count">
                    {category.designCount > 0 ? `${category.designCount}+ Designs` : 'New'}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
        <div className="category-cta">
          <Link to="/catalogue" className="btn btn-primary">
            View All Designs
          </Link>
        </div>
      </section>

      {/* LATEST DESIGNS */}
      <section className="page-container">
        <div className="section-header-row">
          <div>
            <span className="eyebrow">Fresh Creations</span>
            <h2 className="section-title">Latest Designs</h2>
            <p className="section-subtitle">Recently created custom flex print templates crafted for local celebrations.</p>
          </div>
        </div>
        {designsLoading ? (
          <Loader label="Loading designs..." />
        ) : latestDesigns.length === 0 ? (
          <div className="empty-state">No designs added yet. Check back soon!</div>
        ) : (
          <div className="preview-grid">
            {latestDesigns.map((design) => (
              <DesignPreviewCard key={design._id} design={design} />
            ))}
          </div>
        )}
      </section>

      {/* POPULAR DESIGNS */}
      <section className="page-container">
        <span className="eyebrow">Trending Now</span>
        <h2 className="section-title">Popular Designs</h2>
        <p className="section-subtitle">Most ordered and trending flex print layouts with proven crowd impact.</p>
        {designsLoading ? (
          <Loader label="Loading designs..." />
        ) : popularDesigns.length === 0 ? (
          <div className="empty-state">No designs added yet. Check back soon!</div>
        ) : (
          <div className="preview-grid">
            {popularDesigns.map((design) => (
              <DesignPreviewCard key={design._id} design={design} badge={design.isFeatured ? 'Popular' : undefined} />
            ))}
          </div>
        )}
      </section>

      {/* HOW IT WORKS */}
      <section className="page-container">
        <span className="eyebrow">Seamless Ordering Workflow</span>
        <h2 className="section-title">How It Works</h2>
        <p className="section-subtitle">
          From digital selection to doorstep delivery in 6 simple steps with instant WhatsApp proof approvals.
        </p>
        <div className="steps-grid">
          {HOW_IT_WORKS.map((item) => (
            <div key={item.step} className="step-card card">
              <span className="step-card-number">{item.step}</span>
              <h3 className="step-card-title">{item.title}</h3>
              <p className="step-card-description">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="page-container">
        <span className="eyebrow">The Yamini Advantage</span>
        <h2 className="section-title">Why Choose {BUSINESS.name}?</h2>
        <p className="section-subtitle">
          Combining regional cultural understanding with high-speed industrial printing infrastructure in Guntur district.
        </p>
        <div className="why-grid">
          {WHY_CHOOSE_US.map((item) => (
            <div key={item.title} className="why-card card">
              <h3 className="why-card-title">{item.title}</h3>
              <p className="why-card-description">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CONTACT + RATE CALCULATOR */}
      <section className="page-container">
        <div className="contact-banner">
          <div className="contact-banner-info">
            <h2 className="section-title" style={{ color: '#fff' }}>
              Get In Touch &amp; Visit Our Studio
            </h2>
            <p className="contact-banner-text">
              Experience high-definition finishing close up, inspect substrate swatches, or pick up your finished
              hoardings right at our print facility.
            </p>
            <div className="contact-banner-details">
              <p className="contact-banner-item">
                <FaMapMarkerAlt /> {BUSINESS.name} — {BUSINESS.fullAddress}
              </p>
              <p className="contact-banner-item">
                <FaPhoneAlt /> Customer Hotline: {BUSINESS.phone}
              </p>
              <p className="contact-banner-item">
                <FaClock /> {BUSINESS.workingHours}
              </p>
            </div>
            <div className="contact-banner-actions">
              <a href={`tel:${BUSINESS.phone}`} className="btn btn-outline contact-banner-btn">
                <FaPhoneAlt /> Call Now
              </a>
              <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                <FaWhatsapp /> WhatsApp
              </a>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(BUSINESS.fullAddress)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-gold"
              >
                <FaMapMarkerAlt /> Get Directions
              </a>
            </div>
          </div>

          <div className="rate-calculator card">
            <div className="rate-calculator-header">
              <h3>Quick Rate Calculator</h3>
              <span className="tag">Instant Estimate</span>
            </div>
            <p className="rate-calculator-hint">
              Select your flex dimensions &amp; material substrate to calculate estimated square footage and price instantly.
            </p>

            <div className="order-form-row">
              <div className="form-group">
                <label className="form-label">Width (Feet)</label>
                <input className="form-input" type="number" min={1} name="width" value={calc.width} onChange={handleCalcChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Height (Feet)</label>
                <input className="form-input" type="number" min={1} name="height" value={calc.height} onChange={handleCalcChange} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Material Substrate</label>
              <select className="form-select" name="materialIndex" value={calc.materialIndex} onChange={handleCalcChange}>
                {RATE_CARD_MATERIALS.map((mat, index) => (
                  <option key={mat.name} value={index}>
                    {mat.name} (₹{mat.price} / sq.ft)
                  </option>
                ))}
              </select>
            </div>

            <div className="order-form-row">
              <div className="form-group">
                <label className="form-label">Your Name</label>
                <input className="form-input" name="name" placeholder="e.g. Ramesh" value={calc.name} onChange={handleCalcChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Mobile Number</label>
                <input className="form-input" name="phone" placeholder="9XXXXXXXXX" value={calc.phone} onChange={handleCalcChange} />
              </div>
            </div>

            <div className="rate-calculator-result">
              <div>
                <span className="rate-calculator-result-label">Total Area</span>
                <span className="rate-calculator-result-value">{totalArea} sq.ft</span>
              </div>
              <div>
                <span className="rate-calculator-result-label">Estimated Rate</span>
                <span className="rate-calculator-result-value">₹{estimatedRate} approx</span>
              </div>
            </div>

            <button type="button" className="btn btn-primary rate-calculator-btn" onClick={handleCalcWhatsApp}>
              <FaWhatsapp /> Confirm on WhatsApp
            </button>
            <p className="rate-calculator-note">Custom metal framing &amp; site installation available in {BUSINESS.location}.</p>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
