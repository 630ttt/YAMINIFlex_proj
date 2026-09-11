import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../api/client';
import './DesignForm.css';

const DesignForm = ({ mode }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = mode === 'edit';

  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    tags: '',
    sizeOptions: '',
    price: '',
    isFeatured: false,
  });
  const [thumbnail, setThumbnail] = useState(null);
  const [fullImage, setFullImage] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get('/admin/categories').then((res) => setCategories(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    api
      .get(`/admin/designs/${id}`)
      .then((res) => {
        const d = res.data;
        setForm({
          title: d.title || '',
          description: d.description || '',
          category: d.category?._id || d.category || '',
          tags: (d.tags || []).join(', '),
          sizeOptions: (d.sizeOptions || []).join(', '),
          price: d.price || '',
          isFeatured: d.isFeatured || false,
        });
      })
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => formData.append(key, value));
      if (thumbnail) formData.append('thumbnail', thumbnail);
      if (fullImage) formData.append('fullImage', fullImage);

      if (isEdit) {
        await api.put(`/admin/designs/${id}`, formData);
      } else {
        await api.post('/admin/designs', formData);
      }
      navigate('/admin/designs');
    } catch (err) {
      setError(err.message || 'Failed to save design');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1 className="section-title">{isEdit ? 'Edit Design' : 'Add Design'}</h1>

      <form className="card design-form" onSubmit={handleSubmit}>
        {error && <p className="order-form-error">{error}</p>}

        <div className="form-group">
          <label className="form-label">Title</label>
          <input className="form-input" name="title" value={form.title} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea className="form-textarea" name="description" value={form.description} onChange={handleChange} rows={3} />
        </div>

        <div className="form-group">
          <label className="form-label">Category</label>
          <select className="form-select" name="category" value={form.category} onChange={handleChange} required>
            <option value="">Select category</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div className="design-form-row">
          <div className="form-group">
            <label className="form-label">Tags (comma separated)</label>
            <input className="form-input" name="tags" value={form.tags} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Size Options (comma separated)</label>
            <input className="form-input" name="sizeOptions" value={form.sizeOptions} onChange={handleChange} />
          </div>
        </div>

        <div className="design-form-row">
          <div className="form-group">
            <label className="form-label">Price</label>
            <input className="form-input" type="number" name="price" value={form.price} onChange={handleChange} />
          </div>
          <div className="form-group design-form-checkbox">
            <label className="form-label">
              <input type="checkbox" name="isFeatured" checked={form.isFeatured} onChange={handleChange} /> Featured
            </label>
          </div>
        </div>

        <div className="design-form-row">
          <div className="form-group">
            <label className="form-label">Thumbnail Image {isEdit && '(leave empty to keep current)'}</label>
            <input type="file" onChange={(e) => setThumbnail(e.target.files[0])} required={!isEdit} />
          </div>
          <div className="form-group">
            <label className="form-label">Full Image {isEdit && '(leave empty to keep current)'}</label>
            <input type="file" onChange={(e) => setFullImage(e.target.files[0])} />
          </div>
        </div>

        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Saving...' : isEdit ? 'Update Design' : 'Create Design'}
        </button>
      </form>
    </div>
  );
};

export default DesignForm;
