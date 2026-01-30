/**
 * Extract field-specific validation errors from Laravel error response
 * @param {Object} error - Axios error object
 * @returns {Object} Field errors in format { fieldName: 'error message' }
 */
export const extractValidationErrors = (error) => {
  if (!error.response?.data?.errors) {
    return {};
  }

  const backendErrors = error.response.data.errors;
  const formattedErrors = {};

  // Laravel returns errors as { fieldName: ['error message'] }
  // We need to convert to { fieldName: 'error message' }
  Object.keys(backendErrors).forEach((field) => {
    const errorMessages = backendErrors[field];
    // Take the first error message if multiple exist
    formattedErrors[field] = Array.isArray(errorMessages) 
      ? errorMessages[0] 
      : errorMessages;
  });

  return formattedErrors;
};

/**
 * Get general error message from Laravel error response
 * @param {Object} error - Axios error object
 * @param {string} defaultMessage - Default message if none found
 * @returns {string} Error message
 */
export const getErrorMessage = (error, defaultMessage = 'An error occurred') => {
  return error.response?.data?.message || error.message || defaultMessage;
};

/**
 * Check if error is a validation error (422)
 * @param {Object} error - Axios error object
 * @returns {boolean}
 */
export const isValidationError = (error) => {
  return error.response?.status === 422;
};

/**
 * Handle API error and return formatted error data
 * @param {Object} error - Axios error object
 * @returns {Object} { message: string, fieldErrors: object, isValidation: boolean }
 */
export const handleApiError = (error) => {
  const isValidation = isValidationError(error);
  
  return {
    message: getErrorMessage(error),
    fieldErrors: isValidation ? extractValidationErrors(error) : {},
    isValidation,
    status: error.response?.status,
  };
};
