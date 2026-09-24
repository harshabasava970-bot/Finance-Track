// Format currency in Indian Rupees
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '₹0.00';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount);
};

// Format date
export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric', month: 'short', day: '2-digit'
  }).format(date);
};

// Get month name
export const getMonthName = (month) => {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return months[month - 1] || '';
};

// Get date range for filter
export const getDateRange = (filter) => {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  
  switch (filter) {
    case 'this_month': {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      return { startDate: start.toISOString().split('T')[0], endDate: today };
    }
    case 'last_month': {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0);
      return { startDate: start.toISOString().split('T')[0], endDate: end.toISOString().split('T')[0] };
    }
    case 'last_3_months': {
      const start = new Date(now.getFullYear(), now.getMonth() - 2, 1);
      return { startDate: start.toISOString().split('T')[0], endDate: today };
    }
    case 'last_6_months': {
      const start = new Date(now.getFullYear(), now.getMonth() - 5, 1);
      return { startDate: start.toISOString().split('T')[0], endDate: today };
    }
    case 'this_year': {
      const start = new Date(now.getFullYear(), 0, 1);
      return { startDate: start.toISOString().split('T')[0], endDate: today };
    }
    default:
      return { startDate: null, endDate: null };
  }
};

// Extract error message from Axios error
export const getErrorMessage = (error) => {
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.response?.data?.data) {
    const errs = Object.values(error.response.data.data);
    if (errs.length) return errs[0];
  }
  if (error?.message) return error.message;
  return 'An unexpected error occurred';
};

// Get budget status color
export const getBudgetStatus = (pct) => {
  if (pct >= 100) return 'danger';
  if (pct >= 80) return 'warning';
  return 'good';
};
