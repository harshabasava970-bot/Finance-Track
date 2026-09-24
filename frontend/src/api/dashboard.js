import api from './axios';

export const getDashboardSummary = (params) => api.get('/api/dashboard/summary', { params });
export const getMonthlyData = (params) => api.get('/api/dashboard/monthly', { params });
export const getCategorySpending = (params) => api.get('/api/dashboard/categories', { params });
export const getBudgetAnalysis = (params) => api.get('/api/dashboard/budget-analysis', { params });
