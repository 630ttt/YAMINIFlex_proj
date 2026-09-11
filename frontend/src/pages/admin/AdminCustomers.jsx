import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';
import { api } from '../../api/client';
import Pagination from '../../components/Pagination';
import Loader from '../../components/Loader';
import './AdminTable.css';

const AdminCustomers = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [customers, setCustomers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const page = parseInt(searchParams.get('page'), 10) || 1;
  const search = searchParams.get('search') || '';

  useEffect(() => {
    setLoading(true);
    api
      .get('/admin/customers', { page, limit: 20, search })
      .then((res) => {
        setCustomers(res.data);
        setPagination(res.pagination);
      })
      .finally(() => setLoading(false));
  }, [page, search]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchParams({ search: searchInput, page: 1 });
  };

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="section-title">Customers</h1>
        <form onSubmit={handleSearchSubmit} className="catalogue-search" style={{ maxWidth: 320 }}>
          <input
            className="form-input"
            placeholder="Search by name/phone"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <button type="submit" className="btn btn-primary"><FaSearch /></button>
        </form>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <>
          <div className="admin-table-wrapper card">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Address</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer._id}>
                    <td>{customer.name}</td>
                    <td>{customer.phone}</td>
                    <td>{customer.email || '-'}</td>
                    <td>{customer.address || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {customers.length === 0 && <div className="empty-state">No customers found.</div>}
          </div>
          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={(newPage) => setSearchParams({ search, page: newPage })}
          />
        </>
      )}
    </div>
  );
};

export default AdminCustomers;
