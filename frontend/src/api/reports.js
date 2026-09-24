import api from './axios';

export const getReportTransactions = (params) => api.get('/api/reports/transactions', { params });
export const getReportSummary = (params) => api.get('/api/reports/summary', { params });
export const exportCsv = (params) =>
  api.get('/api/reports/export', {
    params,
    responseType: 'blob',
  });
