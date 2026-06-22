import { format, formatDistance, formatDistanceToNow } from 'date-fns';

/**
 * Format currency value for display (e.g. K 1,000.00)
 */
export const formatCurrency = (value, currency = 'ZMW') => {
  if (value === null || value === undefined || value === '') return 'K 0.00';
  const num = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.]/g, '')) : value;
  if (isNaN(num)) return 'K 0.00';
  
  const formatted = new Intl.NumberFormat('en-ZM', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);

  return formatted.replace('ZMW', 'K');
};

/**
 * Format input value with commas as user types
 */
export const formatCurrencyInput = (value) => {
  if (value === null || value === undefined || value === '') return '';
  
  // Remove everything except numbers and decimal point
  let rawValue = value.toString().replace(/[^0-9.]/g, '');
  
  // Handle multiple decimal points
  const parts = rawValue.split('.');
  if (parts.length > 2) {
    rawValue = parts[0] + '.' + parts.slice(1).join('');
  }

  const [integer, fraction] = rawValue.split('.');
  
  // Use en-US for commas logic as it's consistent with ZM
  const formattedInteger = integer ? new Intl.NumberFormat('en-US').format(integer) : '';
  
  if (rawValue.endsWith('.') || rawValue.includes('.')) {
    return `${formattedInteger}.${fraction !== undefined ? fraction.slice(0, 2) : ''}`;
  }
  
  return formattedInteger;
};

/**
 * Parse a formatted currency string back to a raw number
 */
export const parseCurrency = (value) => {
  if (!value) return 0;
  const rawValue = value.toString().replace(/[^0-9.]/g, '');
  return parseFloat(rawValue) || 0;
};

/**
 * Format number with commas
 */
export const formatNumber = (value) => {
  return new Intl.NumberFormat('en-US').format(value);
};

/**
 * Format date
 */
export const formatDate = (date, formatStr = 'MMM dd, yyyy') => {
  if (!date) return '';
  return format(new Date(date), formatStr);
};

/**
 * Format date to relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (date) => {
  if (!date) return '';
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

/**
 * Format percentage
 */
export const formatPercentage = (value, decimals = 2) => {
  if (!value && value !== 0) return '0%';
  return `${value.toFixed(decimals)}%`;
};

/**
 * Get loan status color
 */
export const getLoanStatusColor = (status) => {
  const statusColors = {
    pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    active: 'bg-green-500/10 text-green-500 border-green-500/20',
    closed: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    defaulted: 'bg-red-500/10 text-red-500 border-red-500/20',
  };
  return statusColors[status?.toLowerCase()] || 'bg-gray-500/10 text-gray-500 border-gray-500/20';
};

/**
 * Get customer status color
 */
export const getCustomerStatusColor = (status) => {
  const statusColors = {
    active: 'bg-green-500/10 text-green-500 border-green-500/20',
    inactive: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
    blacklisted: 'bg-red-500/10 text-red-500 border-red-500/20',
  };
  return statusColors[status?.toLowerCase()] || 'bg-gray-500/10 text-gray-500 border-gray-500/20';
};

/**
 * Truncate text
 */
export const truncate = (text, length = 50) => {
  if (!text) return '';
  if (text.length <= length) return text;
  return `${text.substring(0, length)}...`;
};
