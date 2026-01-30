import api from './api';

const getCustomerDocuments = (customerId) => api.get(`/customers/${customerId}/documents`);

const uploadDocument = (customerId, formData) => {
  return api.post(`/customers/${customerId}/documents`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

const deleteDocument = (documentId) => api.delete(`/documents/${documentId}`);

/**
 * Helper method to download files from blob responses
 */
const downloadFile = async (url, filename) => {
  try {
    const response = await api.get(url, {
      responseType: 'blob', // Important for file downloads
    });

    // Create a blob URL and trigger download
    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);

    return { success: true };
  } catch (error) {
    console.error('Download error:', error);
    throw error;
  }
};

/**
 * Export loans to Excel
 */
const exportLoans = (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const url = `/documents/export/loans${params ? '?' + params : ''}`;
  return downloadFile(url, `loans_export_${new Date().toISOString().split('T')[0]}.xlsx`);
};

/**
 * Export borrowers to Excel
 */
const exportBorrowers = () => {
  const url = '/documents/export/borrowers';
  return downloadFile(url, `borrowers_export_${new Date().toISOString().split('T')[0]}.xlsx`);
};

/**
 * Export transactions to Excel
 */
const exportTransactions = (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const url = `/documents/export/transactions${params ? '?' + params : ''}`;
  return downloadFile(url, `transactions_export_${new Date().toISOString().split('T')[0]}.xlsx`);
};

/**
 * Export loan payments to Excel
 */
const exportPayments = (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const url = `/documents/export/payments${params ? '?' + params : ''}`;
  return downloadFile(url, `payments_export_${new Date().toISOString().split('T')[0]}.xlsx`);
};

/**
 * Generate loan agreement PDF
 */
const generateLoanAgreement = (loanId) => {
  const url = `/documents/pdf/loan-agreement/${loanId}`;
  return downloadFile(url, `loan_agreement_${loanId}.pdf`);
};

const documentService = {
  getCustomerDocuments,
  uploadDocument,
  deleteDocument,
  exportLoans,
  exportBorrowers,
  exportTransactions,
  exportPayments,
  generateLoanAgreement,
};

export default documentService;
