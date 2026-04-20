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

  /**
   * Get advanced BI reporting overview
   */
  async getBIOverview() {
    const response = await api.get('/reporting/overview');
    return response.data;
  }

  /**
   * Get performance metrics by branch
   */
  async getBranchComparison() {
    const response = await api.get('/reporting/branches');
    return response.data;
  }
}

export default new DashboardService();
