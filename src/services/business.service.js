import api from './api';
import { handleApiError } from '../utils/errorHandler';

class BusinessService {
  /**
   * Create business profile
   */
  async createBusinessProfile(data) {
    try {
      const response = await api.post('/auth/business-profile', data);
      return response.data;
    } catch (error) {
      // Re-throw with enhanced error info
      throw error;
    }
  }

  /**
   * Update business profile
   */
  async updateBusinessProfile(data) {
    try {
      const response = await api.put('/auth/business-profile', data);
      return response.data;
    } catch (error) {
      // Re-throw with enhanced error info
      throw error;
    }
  }

  /**
   * Delete business profile
   */
  async deleteBusinessProfile() {
    try {
      const response = await api.delete('/auth/business-profile');
      return response.data;
    } catch (error) {
      // Re-throw with enhanced error info
      throw error;
    }
  }
}

export default new BusinessService();
