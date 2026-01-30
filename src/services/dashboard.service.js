import api from './api';

class DashboardService {
  /**
   * Get dashboard summary statistics
   */
  async getSummary(businessId) {
    const response = await api.get(`/dashboard/summary/${businessId}`);
    return response.data;
  }

  async addCapital(amount) {
    const response = await api.post('/capital/add', { amount });
    return response.data;
  }

  async updateCapital(amount) {
    const response = await api.put('/capital/update', { amount });
    return response.data;
  }
}

export default new DashboardService();
