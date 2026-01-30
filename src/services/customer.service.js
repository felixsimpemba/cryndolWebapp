import api from './api';

class CustomerService {
  /**
   * Get all customers
   */
  async getCustomers(params = {}) {
    try {
      const response = await api.get('/customers', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get single customer by ID
   */
  async getCustomer(id) {
    try {
      const response = await api.get(`/customers/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create new customer
   */
  async createCustomer(data) {
    try {
      const response = await api.post('/customers', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update customer
   */
  async updateCustomer(id, data) {
    try {
      const response = await api.put(`/customers/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete customer
   */
  async deleteCustomer(id) {
    try {
      const response = await api.delete(`/customers/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default new CustomerService();
