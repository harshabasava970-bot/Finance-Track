import api from './axios';

export const getTransactions = (params) => api.get('/api/transactions', { params });
export const getTransactionById = (id) => api.get(`/api/transactions/${id}`);
export const createTransaction = (data) => api.post('/api/transactions', data);
export const updateTransaction = (id, data) => api.put(`/api/transactions/${id}`, data);
export const deleteTransaction = (id) => api.delete(`/api/transactions/${id}`);
