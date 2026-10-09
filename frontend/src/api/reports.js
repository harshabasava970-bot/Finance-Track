import api from './axios';

// Use 120s timeout on report endpoints — they hit the DB heavily
// and Render free-tier cold starts can take 60+ seconds
const REPORT_TIMEOUT = 120000;

export const getReportTransactions = (params) =>
  api.get('/api/reports/transactions', { params, timeout: REPORT_TIMEOUT });

export const getReportSummary = (params) =>
  api.get('/api/reports/summary', { params, timeout: REPORT_TIMEOUT });

export const exportCsv = (params) =>
  api.get('/api/reports/export', {
    params,
    responseType: 'blob',
    timeout: REPORT_TIMEOUT,
  });
