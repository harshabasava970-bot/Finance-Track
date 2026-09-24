import api from './axios';

export const getBudgets = () => api.get('/api/budgets');
export const getBudgetById = (id) => api.get(`/api/budgets/${id}`);
export const createBudget = (data) => api.post('/api/budgets', data);
export const updateBudget = (id, data) => api.put(`/api/budgets/${id}`, data);
export const deleteBudget = (id) => api.delete(`/api/budgets/${id}`);
