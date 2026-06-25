import axios from 'axios';

// Update this to point to the correct backend URL once deployed.
const API_URL = 'http://localhost:8000/api'; 
// Actually, since index.php routes using index.php?action=...
// Let's configure it like this:
const api = axios.create({
  baseURL: '/api/index.php',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add JWT token if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = (data) => api.post('?action=login', data);
export const getHalls = () => api.get('?action=halls');
export const getCategories = () => api.get('?action=categories');
export const getStalls = (hall_id) => api.get(`?action=stalls&hall_id=${hall_id}`);
export const getAllStalls = () => api.get('?action=all_stalls');
export const createBooking = (formData) => api.post('?action=book', formData, {
    headers: {
        'Content-Type': 'multipart/form-data'
    }
});
export const getBookings = () => api.get('?action=bookings');
export const approveBooking = (id) => api.post('?action=approve', { id });
export const rejectBooking = (id) => api.post('?action=reject', { id });
export const getDashboardStats = () => api.get('?action=stats');

// Admin Master Management
export const adminGetHalls = () => api.get('?action=admin_halls');
export const adminAddHall = (data) => api.post('?action=admin_halls&subaction=add', data);
export const adminUpdateHall = (data) => api.post('?action=admin_halls&subaction=edit', data);
export const adminDeleteHall = (id) => api.post('?action=admin_halls&subaction=delete', { id });

export const adminGetCategories = () => api.get('?action=admin_categories');
export const adminAddCategory = (data) => api.post('?action=admin_categories&subaction=add', data);
export const adminUpdateCategory = (data) => api.post('?action=admin_categories&subaction=edit', data);
export const adminDeleteCategory = (id) => api.post('?action=admin_categories&subaction=delete', { id });

export const adminGetStalls = () => api.get('?action=admin_stalls');
export const adminAddStall = (data) => api.post('?action=admin_stalls&subaction=add', data);
export const adminUpdateStall = (data) => api.post('?action=admin_stalls&subaction=edit', data);
export const adminDeleteStall = (id) => api.post('?action=admin_stalls&subaction=delete', { id });
export const adminBulkImportStalls = (stalls) => api.post('?action=admin_stalls&subaction=bulk', { stalls });

// Payments
export const getPayments = (booking_id) => api.get(`?action=payments&booking_id=${booking_id}`);
export const addPayment = (data) => api.post('?action=add_payment', data);

// Visitors
export const registerVisitor = (data) => api.post('?action=visitor_register', data);
export const getVisitorStats = () => api.get('?action=visitor_stats');
export const searchVisitors = (query) => api.get(`?action=visitor_search&query=${encodeURIComponent(query)}`);
export const getAllVisitors = () => api.get('?action=visitor_all');
export const checkInVisitor = (data) => api.post('?action=visitor_checkin', data);

export default api;
