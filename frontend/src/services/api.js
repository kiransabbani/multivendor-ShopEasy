import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
};

export const productsAPI = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  getFeatured: () => api.get('/products/featured'),
  getTrending: () => api.get('/products/trending'),
  getBestSellers: () => api.get('/products/best-sellers'),
  getRecommendations: (id) => api.get(id ? `/products/${id}/recommendations` : '/products/featured'),
  getVendorProducts: (params) => api.get('/products/vendor/my-products', { params }),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
};

export const categoriesAPI = { getAll: () => api.get('/categories') };

export const cartAPI = {
  get: () => api.get('/cart'),
  addItem: (data) => api.post('/cart/add', data),
  updateItem: (data) => api.put('/cart/update', data),
  removeItem: (productId) => api.delete(`/cart/remove/${productId}`),
  clear: () => api.delete('/cart/clear'),
};

export const wishlistAPI = {
  get: () => api.get('/wishlist'),
  addItem: (data) => api.post('/wishlist/add', data),
  removeItem: (productId) => api.delete(`/wishlist/remove/${productId}`),
};

export const ordersAPI = {
  place: (data) => api.post('/orders', data),
  getMyOrders: () => api.get('/orders/my-orders'),
  getById: (id) => api.get(`/orders/${id}`),
  cancel: (id) => api.put(`/orders/${id}/cancel`),
  return: (id) => api.put(`/orders/${id}/return`),
  getVendorOrders: () => api.get('/orders/vendor/orders'),
  updateStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
};

export const vendorAPI = {
  getDashboard: () => api.get('/vendors/dashboard/stats'),
  getProfile: () => api.get('/vendors/profile'),
  updateProfile: (data) => api.put('/vendors/profile', data),
  getPerformance: () => api.get('/vendors/performance'),
  getAll: () => api.get('/vendors'),
  getById: (id) => api.get(`/vendors/${id}`),
  getProducts: (params) => api.get('/products/vendor/my-products', { params }),
  createProduct: (data) => api.post('/products', data),
  updateProduct: (id, data) => api.put(`/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/products/${id}`),
};

export const analyticsAPI = {
  getVendorAnalytics: (params) => api.get('/analytics/vendor', { params }),
  getAdminAnalytics: (params) => api.get('/analytics/admin', { params }),
};

export const forecastingAPI = {
  runForecast: (productId, horizonDays = 30) => api.post(`/forecasting/run/${productId}`, { horizonDays }),
  getForecast: (productId) => api.get(`/forecasting/${productId}`),
  getAllForecasts: () => api.get('/forecasting/vendor/all'),
};

export const inventoryAPI = {
  getVendorInventory: () => api.get('/inventory/vendor'),
  updateStock: (productId, data) => api.put(`/inventory/${productId}/update-stock`, data),
};

export const productionAPI = {
  getVendorProduction: () => api.get('/production/vendor'),
  updateAction: (id, action) => api.put(`/production/${id}/action`, { action }),
};

export const reorderAPI = {
  getVendorReorder: () => api.get('/reorder/vendor'),
  updateAction: (id, action, modifiedQuantity) => api.put(`/reorder/${id}/action`, { action, modifiedQuantity }),
};

export const adminAPI = {
  getDashboard: () => api.get('/analytics/admin'),
  getAnalytics: (params) => api.get('/analytics/admin', { params }),
  getUsers: () => api.get('/admin/users'),
  toggleUserStatus: (id) => api.put(`/admin/users/${id}/toggle-status`),
  getVendors: () => api.get('/admin/vendors'),
  approveVendor: (id) => api.put(`/admin/vendors/${id}/approve`),
  rejectVendor: (id) => api.put(`/admin/vendors/${id}/reject`),
  suspendVendor: (id) => api.put(`/admin/vendors/${id}/suspend`),
  activateVendor: (id) => api.put(`/admin/vendors/${id}/activate`),
  getProducts: () => api.get('/admin/products'),
  deleteProduct: (id) => api.delete(`/admin/products/${id}`),
  getOrders: () => api.get('/admin/orders'),
  getCommissions: () => api.get('/admin/commissions'),
};

export const invoiceAPI = {
  getById: (id) => api.get(`/invoices/${id}`),
  getMyInvoices: () => api.get('/invoices/my-invoices'),
};

export const notificationsAPI = {
  getAll: () => api.get('/notifications'),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
};

export const reviewsAPI = {
  addReview: (productId, data) => api.post('/reviews', { ...data, product: productId }),
  getProductReviews: (productId) => api.get(`/reviews/${productId}`),
};

export const usersAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  addAddress: (data) => api.post('/users/address', data),
  updateAddress: (id, data) => api.put(`/users/address/${id}`, data),
  deleteAddress: (id) => api.delete(`/users/address/${id}`),
};

export default api;
