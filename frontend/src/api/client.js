const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://yamini-flex-proj-lu87.vercel.app/';

const buildQuery = (params = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, value);
    }
  });
  const qs = query.toString();
  return qs ? `?${qs}` : '';
};

const request = async (path, options = {}) => {
  const tokenKey = path.startsWith('/admin') ? 'admin_token' : 'customer_token';
  const token = localStorage.getItem(tokenKey);
  const headers = { ...(options.headers || {}) };
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }
  return data;
};

export const api = {
  get: (path, params) => request(`${path}${buildQuery(params)}`),
  post: (path, body) =>
    request(path, { method: 'POST', body: body instanceof FormData ? body : JSON.stringify(body) }),
  put: (path, body) =>
    request(path, { method: 'PUT', body: body instanceof FormData ? body : JSON.stringify(body) }),
  del: (path) => request(path, { method: 'DELETE' }),
};

export default API_BASE_URL;
