import { useEffect, useState } from 'react';
import { FaImages, FaClipboardList, FaUsers, FaThLarge } from 'react-icons/fa';
import { api } from '../../api/client';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ designs: 0, categories: 0, orders: 0, customers: 0 });

  useEffect(() => {
    Promise.all([
      api.get('/admin/designs', { limit: 1 }),
      api.get('/admin/categories'),
      api.get('/admin/orders', { limit: 1 }),
      api.get('/admin/customers', { limit: 1 }),
    ])
      .then(([designs, categories, orders, customers]) => {
        setStats({
          designs: designs.pagination?.total ?? 0,
          categories: categories.count ?? categories.data?.length ?? 0,
          orders: orders.pagination?.total ?? 0,
          customers: customers.pagination?.total ?? 0,
        });
      })
      .catch(() => {});
  }, []);

  const cards = [
    { label: 'Total Designs', value: stats.designs, icon: <FaImages /> },
    { label: 'Categories', value: stats.categories, icon: <FaThLarge /> },
    { label: 'Total Orders', value: stats.orders, icon: <FaClipboardList /> },
    { label: 'Customers', value: stats.customers, icon: <FaUsers /> },
  ];

  return (
    <div>
      <h1 className="section-title">Dashboard</h1>
      <p className="section-subtitle">Overview of your catalogue and orders.</p>

      <div className="dashboard-grid">
        {cards.map((card) => (
          <div key={card.label} className="card dashboard-card">
            <div className="dashboard-card-icon">{card.icon}</div>
            <div>
              <p className="dashboard-card-value">{card.value}</p>
              <p className="dashboard-card-label">{card.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
