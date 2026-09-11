import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import './CustomerAuth.css';

const CustomerLogin = () => {
  const { login } = useCustomerAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ phone: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/customers/login', form);
      login(res.token, res.customer);
      navigate('/account');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container customer-auth-page">
      <form className="card customer-auth-card" onSubmit={handleSubmit}>
        <h1 className="section-title">Login</h1>
        <p className="section-subtitle">Track your orders and manage your profile.</p>

        {error && <p className="order-form-error">{error}</p>}

        <div className="form-group">
          <label className="form-label">Phone Number</label>
          <input
            className="form-input"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Password</label>
          <input
            className="form-input"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary customer-auth-btn" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>

        <p className="customer-auth-switch">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </form>
    </div>
  );
};

export default CustomerLogin;
