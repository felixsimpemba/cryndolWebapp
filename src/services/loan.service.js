import api from './api';

class LoanService {
  /**
   * Get all loans
   */
  async getLoans(params = {}) {
    const response = await api.get('/loans', { params });
    return response.data;
  }

  /**
   * Get single loan by ID
   */
  async getLoan(id) {
    const response = await api.get(`/loans/${id}`);
    return response.data;
  }

  /**
   * Create new loan
   */
  async createLoan(data) {
    const response = await api.post('/loans', data);
    return response.data;
  }

  /**
   * Update loan
   */
  async updateLoan(id, data) {
    const response = await api.put(`/loans/${id}`, data);
    return response.data;
  }

  /**
   * Delete loan
   */
  async deleteLoan(id) {
    const response = await api.delete(`/loans/${id}`);
    return response.data;
  }

  /**
   * Change loan status
   */
  async changeStatus(id, status, sendEmail = false, comments = null) {
    const response = await api.post(`/loans/${id}/status`, { status, sendEmail, comments });
    return response.data;
  }

  /**
   * Add payment to loan
   */
  async addPayment(id, paymentData) {
    const response = await api.post(`/loans/${id}/payments`, paymentData);
    return response.data;
  }

  /**
   * Send payment reminder email
   */
  async sendReminderEmail(id) {
    const response = await api.post(`/loans/${id}/send-reminder`);
    return response.data;
  }
}

export default new LoanService();
