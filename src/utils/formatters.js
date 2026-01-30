import { format, formatDistance, formatDistanceToNow } from 'date-fns';

/**
 * Format currency value
 */
export const formatCurrency = (value, currency = 'ZMW') => {
  // Force "K" symbol for ZMW currency
  const formatted = new Intl.NumberFormat('en-ZM', {
    style: 'currency',
    currency: currency,
  }).format(value);

  return formatted.replace('ZMW', 'K');
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
