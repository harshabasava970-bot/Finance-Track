import api from './axios';

export const getAdminUsers = () => api.get('/api/admin/users');
export const getAdminUserById = (id) => api.get(`/api/admin/users/${id}`);
export const toggleUserActive = (id) => api.patch(`/api/admin/users/${id}/toggle-active`);
export const getAdminStats = () => api.get('/api/admin/stats');
export const getAdminCategories = () => api.get('/api/admin/categories');
export const createAdminCategory = (data) => api.post('/api/admin/categories', data);
export const updateAdminCategory = (id, data) => api.put(`/api/admin/categories/${id}`, data);
export const deleteAdminCategory = (id) => api.delete(`/api/admin/categories/${id}`);
