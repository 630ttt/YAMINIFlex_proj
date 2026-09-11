import { Link } from 'react-router-dom';
import './DesignCard.css';

const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace('/api', '');

const resolveImage = (src) => {
  if (!src) return '';
  return src.startsWith('http') ? src : `${API_ORIGIN}${src}`;
};

const DesignCard = ({ design }) => {
  return (
    <Link to={`/design/${design._id}`} className="design-card card">
      <div className="design-card-image-wrapper">
        <img src={resolveImage(design.thumbnail)} alt={design.title} loading="lazy" />
      </div>
      <div className="design-card-body">
        <h3 className="design-card-title">{design.title}</h3>
        {design.category?.name && <span className="design-card-category">{design.category.name}</span>}
      </div>
    </Link>
  );
};

export default DesignCard;
