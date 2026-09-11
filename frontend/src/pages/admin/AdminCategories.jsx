import { useEffect, useState } from 'react';
import { FaPlus, FaTrash } from 'react-icons/fa';
import { api } from '../../api/client';
import Loader from '../../components/Loader';
import './AdminTable.css';
import './AdminCategories.css';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', slug: '', description: '' });
  const [error, setError] = useState('');

  const loadCategories = () => {
    setLoading(true);
    api.get('/admin/categories').then((res) => setCategories(res.data)).finally(() => setLoading(false));
  };

  useEffect(loadCategories, []);

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/admin/categories', form);
      setForm({ name: '', slug: '', description: '' });
      loadCategories();
    } catch (err) {
      setError(err.message || 'Failed to create category');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    await api.del(`/admin/categories/${id}`);
    loadCategories();
  };

  return (
    <div>
      <h1 className="section-title">Categories</h1>

      <form className="card category-form" onSubmit={handleSubmit}>
        {error && <p className="order-form-error">{error}</p>}
        <div className="category-form-row">
          <input className="form-input" name="name" placeholder="Category name" value={form.name} onChange={handleChange} required />
          <input className="form-input" name="slug" placeholder="slug-name" value={form.slug} onChange={handleChange} required />
          <input className="form-input" name="description" placeholder="Description" value={form.description} onChange={handleChange} />
          <button type="submit" className="btn btn-primary"><FaPlus /> Add</button>
        </div>
      </form>

      {loading ? (
        <Loader />
      ) : (
        <div className="admin-table-wrapper card">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Slug</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat._id}>
                  <td>{cat.name}</td>
                  <td>{cat.slug}</td>
                  <td>{cat.description}</td>
                  <td className="admin-table-actions">
                    <button onClick={() => handleDelete(cat._id)}><FaTrash /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {categories.length === 0 && <div className="empty-state">No categories yet.</div>}
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
