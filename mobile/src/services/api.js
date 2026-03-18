import axios from 'axios';

// Replace with your local IP or backend URL
const API_URL = 'http://YOUR_LOCAL_IP:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

export const getInventory = () => api.get('/inventory');
export const getProductionBoard = (token) => api.get('/production/board', {
  headers: { Authorization: `Bearer ${token}` }
});
export const getInvoices = () => api.get('/finance/invoices');

export default api;
