import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../api/client';
import Pagination from '../../components/Pagination';
import Loader from '../../components/Loader';
import './AdminTable.css';
import './AdminOrders.css';

const STATUS_OPTIONS = [
  'pending',
  'confirmed',
  'in-progress',
  'awaiting-approval',
  'approved',
  'ready',
  'delivered',
  'cancelled',
];

const API_ORIGIN = (
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'
).replace('/api', '');

const AdminOrders = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploadingId, setUploadingId] = useState(null);

  const page = parseInt(searchParams.get('page'), 10) || 1;
  const status = searchParams.get('status') || '';

  const loadOrders = () => {
    setLoading(true);
    setError('');

    api
      .get('/admin/orders', {
        page,
        limit: 20,
        status,
      })
      .then((res) => {
        setOrders(res.data || []);
        setPagination(
          res.pagination || {
            page: 1,
            totalPages: 1,
          }
        );
      })
      .catch((err) => {
        setError(err.message || 'Failed to load orders');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadOrders();
  }, [page, status]);

  const handleStatusChange = async (orderId, newStatus) => {
    setError('');

    try {
      await api.put(`/admin/orders/${orderId}`, {
        status: newStatus,
      });

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

  const getDeliveryAddress = (order) => {
    return (
      order.deliveryAddress ||
      order.address ||
      order.functionHallAddress ||
      ''
    );
  };

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="section-title">Orders</h1>

        <select
          className="form-select admin-orders-filter"
          value={status}
          onChange={(e) =>
            setSearchParams({
              status: e.target.value,
              page: 1,
            })
          }
        >
          <option value="">All Statuses</option>

          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
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
                  <th>Delivery Address</th>
                  <th>Qty</th>
                  <th>Reference Images</th>
                  <th>Status</th>
                  <th>Customer Approval</th>
                  <th>Final Design</th>
                </tr>
              </thead>

              <tbody>
                {orders.map((order) => {
                  const deliveryAddress = getDeliveryAddress(order);

                  return (
                    <tr key={order._id}>
                      {/* Design */}
                      <td>
                        {order.design?.title || '-'}
                      </td>

                      {/* Customer */}
                      <td>
                        <div>
                          <strong>
                            {order.customer?.name ||
                              order.name ||
                              '-'}
                          </strong>

                          <div>
                            {order.customer?.phone ||
                              order.phone ||
                              '-'}
                          </div>

                          {(order.customer?.email ||
                            order.email) && (
                            <div>
                              {order.customer?.email ||
                                order.email}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Delivery Address */}
                      <td>
                        {order.deliveryMode === 'home-dispatch' ? (
                          <div className="admin-orders-address">
                            <strong>Home Delivery</strong>

                            {deliveryAddress ? (
                              <p>
                                {deliveryAddress}
                              </p>
                            ) : (
                              <span className="admin-orders-approval-none">
                                Address not provided
                              </span>
                            )}
                          </div>
                        ) : order.deliveryMode === 'studio-pickup' ? (
                          <div className="admin-orders-address">
                            <strong>Studio Pickup</strong>
                          </div>
                        ) : deliveryAddress ? (
                          <div className="admin-orders-address">
                            <p>{deliveryAddress}</p>
                          </div>
                        ) : (
                          <span className="admin-orders-approval-none">
                            Address not provided
                          </span>
                        )}
                      </td>

                      {/* Quantity */}
                      <td>
                        {order.quantity || 1}
                      </td>

                      {/* Reference Images */}
                      <td>
                        {order.customerFileUploads?.length > 0 ? (
                          <div className="admin-orders-ref-images">
                            {order.customerFileUploads.map(
                              (src, index) => (
                                <a
                                  key={`${src}-${index}`}
                                  href={`${API_ORIGIN}${src}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  Image {index + 1}
                                </a>
                              )
                            )}
                          </div>
                        ) : (
                          <span className="admin-orders-approval-none">
                            None
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td>
                        <select
                          className="form-select"
                          value={order.status || 'pending'}
                          onChange={(e) =>
                            handleStatusChange(
                              order._id,
                              e.target.value
                            )
                          }
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Customer Approval */}
                      <td>
                        {!order.finalDesignFile ? (
                          <span className="admin-orders-approval-none">
                            Not uploaded
                          </span>
                        ) : order.finalDesignApproved ? (
                          <span className="badge badge-approved">
                            Approved
                          </span>
                        ) : order.status === 'awaiting-approval' ? (
                          <span className="badge badge-awaiting-approval">
                            Awaiting customer
                          </span>
                        ) : (
                          <span className="admin-orders-approval-none">
                            Not approved
                          </span>
                        )}

                        {order.customerFeedback && (
                          <p className="admin-orders-feedback">
                            "{order.customerFeedback}"
                          </p>
                        )}
                      </td>

                      {/* Final Design */}
                      <td>
                        {order.finalDesignFile && (
                          <a
                            href={`${API_ORIGIN}${order.finalDesignFile}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="admin-orders-final-link"
                          >
                            View uploaded
                          </a>
                        )}

                        <input
                          type="file"
                          accept=".pdf,image/*"
                          disabled={
                            uploadingId === order._id
                          }
                          onChange={(e) => {
                            const file = e.target.files?.[0];

                            if (file) {
                              handleFileUpload(
                                order._id,
                                file
                              );
                            }
                          }}
                        />

                        {uploadingId === order._id && (
                          <span className="admin-orders-uploading">
                            Uploading...
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {orders.length === 0 && (
              <div className="empty-state">
                No orders found.
              </div>
            )}
          </div>

          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={(newPage) =>
              setSearchParams({
                status,
                page: newPage,
              })
            }
          />
        </>
      )}
    </div>
  );
};

export default AdminOrders;