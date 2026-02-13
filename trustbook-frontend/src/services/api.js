import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

// Auto-attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('tb_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-handle 401 — force logout
API.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('tb_token');
      if (!window.location.pathname.includes('login')) {
        window.location.reload();
      }
    }
    return Promise.reject(error);
  }
);

// ─── Auth ────────────────────────────────────
export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);
export const fetchProfile = (token) =>
  API.get('/auth/profile', { headers: { Authorization: `Bearer ${token}` } });
export const updateProfile = (data) => API.put('/auth/profile', data);
export const changePassword = (data) => API.put('/auth/password', data);

// ─── Accounts ────────────────────────────────
export const createAccount = (data) => API.post('/accounts', data);
export const fetchMyAccounts = () => API.get('/accounts/my');
export const fetchSharedAccounts = () => API.get('/accounts/shared');
export const fetchAccountDetail = (id) => API.get(`/accounts/${id}`);
export const updateAccount = (id, data) => API.put(`/accounts/${id}`, data);
export const deleteAccount = (id) => API.delete(`/accounts/${id}`);
export const searchAccounts = (q) => API.get(`/accounts/search?q=${encodeURIComponent(q)}`);
export const fetchAccountTransactions = (id, page = 1) => API.get(`/accounts/${id}/transactions?page=${page}`);
export const fetchAccountStatement = (id, year, month) => API.get(`/accounts/${id}/statement/${year}/${month}`);
export const fetchMonthlyStatement = (year, month) => API.get(`/accounts/statement/${year}/${month}`);

// ─── Transactions ────────────────────────────
export const fetchDashboardStats = () => API.get('/transactions/dashboard');

export const fetchAllTransactions = (page = 1, limit = 50) =>
  API.get(`/transactions/all?page=${page}&limit=${limit}`);

export const addTransaction = (data) => API.post('/transactions/add', data);

export const deleteTransaction = (id) => API.delete(`/transactions/${id}`);

export const searchTransactions = (query) =>
  API.get(`/transactions/search?q=${encodeURIComponent(query)}`);

// ─── Export ──────────────────────────────────
export const getExportPDFUrl = (accountId, year, month) =>
  `/api/export/pdf/${accountId}/${year}/${month}`;
export const getExportExcelUrl = (accountId, year, month) =>
  `/api/export/excel/${accountId}/${year}/${month}`;

export default API;
