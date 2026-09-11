import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { api } from '../../api/client';
import Pagination from '../../components/Pagination';
import Loader from '../../components/Loader';
import './AdminTable.css';

const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace('/api', '');
const resolveImage = (src) => (src?.startsWith('http') ? src : `${API_ORIGIN}${src || ''}`);

const AdminDesigns = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [designs, setDesigns] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const page = parseInt(searchParams.get('page'), 10) || 1;

  const loadDesigns = () => {
    setLoading(true);
    api
      .get('/admin/designs', { page, limit: 20 })
      .then((res) => {
        setDesigns(res.data);
        setPagination(res.pagination);
      })
      .finally(() => setLoading(false));
  };

  useEffect(loadDesigns, [page]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this design?')) return;
    await api.del(`/admin/designs/${id}`);
    loadDesigns();
  };

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="section-title">Designs</h1>
        <Link to="/admin/designs/add" className="btn btn-primary"><FaPlus /> Add Design</Link>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <>
          <div className="admin-table-wrapper card">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Thumbnail</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {designs.map((design) => (
                  <tr key={design._id}>
                    <td><img src={resolveImage(design.thumbnail)} alt={design.title} className="admin-table-thumb" /></td>
                    <td>{design.title}</td>
                    <td>{design.category?.name || '-'}</td>
                    <td>&#8377;{design.price || 0}</td>
                    <td className="admin-table-actions">
                      <Link to={`/admin/designs/edit/${design._id}`}><FaEdit /></Link>
                      <button onClick={() => handleDelete(design._id)}><FaTrash /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {designs.length === 0 && <div className="empty-state">No designs yet.</div>}
          </div>
          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={(newPage) => setSearchParams({ page: newPage })}
          />
        </>
      )}
    </div>
  );
};

export default AdminDesigns;
