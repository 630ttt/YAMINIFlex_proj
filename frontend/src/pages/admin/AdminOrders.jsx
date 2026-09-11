import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../api/client';
import Pagination from '../../components/Pagination';
import Loader from '../../components/Loader';
import './AdminTable.css';
import './AdminOrders.css';

const STATUS_OPTIONS = ['pending', 'confirmed', 'in-progress', 'awaiting-approval', 'approved', 'ready', 'delivered', 'cancelled'];
const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace('/api', '');

const AdminOrders = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploadingId, setUploadingId] = useState(null);
  const page = parseInt(searchParams.get('page'), 10) || 1;
  const status = searchParams.get('status') || '';

  const loadOrders = () => {
    setLoading(true);
    api
      .get('/admin/orders', { page, limit: 20, status })
      .then((res) => {
        setOrders(res.data);
        setPagination(res.pagination);
      })
      .finally(() => setLoading(false));
  };

  useEffect(loadOrders, [page, status]);

  const handleStatusChange = async (orderId, newStatus) => {
    setError('');
    try {
      await api.put(`/admin/orders/${orderId}`, { status: newStatus });
      loadOrders();
    } catch (err) {
      setError(err.message || 'Failed to update order status');
    }
  };

  const handleFileUpload = async (orderId, file) => {
    setError('');
    setUploadingId(orderId);
    try {
      const formData = new FormData();
      formData.append('finalDesignFile', file);
      await api.put(`/admin/orders/${orderId}`, formData);
      loadOrders();
    } catch (err) {
      setError(err.message || 'Failed to upload final design file');
    } finally {
      setUploadingId(null);
    }
  };

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="section-title">Orders</h1>
        <select
          className="form-select admin-orders-filter"
          value={status}
          onChange={(e) => setSearchParams({ status: e.target.value, page: 1 })}
        >
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {error && <p className="order-form-error">{error}</p>}

      {loading ? (
        <Loader />
      ) : (
        <>
          <div className="admin-table-wrapper card">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Design</th>
                  <th>Customer</th>
                  <th>Qty</th>
                  <th>Reference Images</th>
                  <th>Status</th>
                  <th>Customer Approval</th>
                  <th>Final Design</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td>{order.design?.title || '-'}</td>
                    <td>{order.customer?.name} ({order.customer?.phone})</td>
                    <td>{order.quantity}</td>
                    <td>
                      {order.customerFileUploads?.length > 0 ? (
                        <div className="admin-orders-ref-images">
                          {order.customerFileUploads.map((src, index) => (
                            <a key={src} href={`${API_ORIGIN}${src}`} target="_blank" rel="noopener noreferrer">
                              Image {index + 1}
                            </a>
                          ))}
                        </div>
                      ) : (
                        <span className="admin-orders-approval-none">None</span>
                      )}
                    </td>
                    <td>
                      <select
                        className="form-select"
                        value={order.status}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      {!order.finalDesignFile ? (
                        <span className="admin-orders-approval-none">Not uploaded</span>
                      ) : order.finalDesignApproved ? (
                        <span className="badge badge-approved">Approved</span>
                      ) : order.status === 'awaiting-approval' ? (
                        <span className="badge badge-awaiting-approval">Awaiting customer</span>
                      ) : (
                        <span className="admin-orders-approval-none">Not approved</span>
                      )}
                      {order.customerFeedback && (
                        <p className="admin-orders-feedback">"{order.customerFeedback}"</p>
                      )}
                    </td>
                    <td>
                      {order.finalDesignFile && (
                        <a href={`${API_ORIGIN}${order.finalDesignFile}`} target="_blank" rel="noopener noreferrer" className="admin-orders-final-link">
                          View uploaded
                        </a>
                      )}
                      <input
                        type="file"
                        disabled={uploadingId === order._id}
                        onChange={(e) => e.target.files[0] && handleFileUpload(order._id, e.target.files[0])}
                      />
                      {uploadingId === order._id && <span className="admin-orders-uploading">Uploading...</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {orders.length === 0 && <div className="empty-state">No orders found.</div>}
          </div>
          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={(newPage) => setSearchParams({ status, page: newPage })}
          />
        </>
      )}
    </div>
  );
};

export default AdminOrders;
