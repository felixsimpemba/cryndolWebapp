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
  
  // Format integer part with commas
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
  if (typeof value === 'number') return value;
  const rawValue = value.toString().replace(/[^0-9.]/g, '');
  return parseFloat(rawValue) || 0;
};

/**
 * Format number with commas
 */
export const formatNumber = (value) => {
  if (!value && value !== 0) return '';
  return new Intl.NumberFormat('en-US').format(value);
};

/**
 * Class name merger utility (simple version)
 */
export const cn = (...classes) => {
  return classes.filter(Boolean).join(' ');
};
