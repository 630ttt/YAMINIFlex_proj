import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  FaTachometerAlt,
  FaImages,
  FaThLarge,
  FaClipboardList,
  FaUsers,
  FaSignOutAlt,
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import './AdminLayout.css';

const AdminLayout = () => {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const linkClass = ({ isActive }) => `admin-nav-link${isActive ? ' admin-nav-link-active' : ''}`;

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-title">YAMINI ADMIN</div>
        <nav className="admin-nav">
          <NavLink to="/admin/dashboard" className={linkClass}>
            <FaTachometerAlt /> Dashboard
          </NavLink>
          <NavLink to="/admin/designs" className={linkClass}>
            <FaImages /> Designs
          </NavLink>
          <NavLink to="/admin/categories" className={linkClass}>
            <FaThLarge /> Categories
          </NavLink>
          <NavLink to="/admin/orders" className={linkClass}>
            <FaClipboardList /> Orders
          </NavLink>
          <NavLink to="/admin/customers" className={linkClass}>
            <FaUsers /> Customers
          </NavLink>
        </nav>
        <button className="admin-logout-btn" onClick={handleLogout}>
          <FaSignOutAlt /> Logout
        </button>
      </aside>
      <div className="admin-content">
        <header className="admin-topbar">
          <span>Welcome, {admin?.name || 'Admin'}</span>
        </header>
        <main className="admin-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
