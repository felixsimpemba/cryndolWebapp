import api from './api';

class CollectionService {
  /**
   * Get all collection payments
   */
  async getCollections(params = {}) {
    const response = await api.get('/collections', { params });
    return response.data;
  }

  /**
   * Get collection statistics
   */
  async getStats() {
    const response = await api.get('/collections/stats');
    return response.data;
  }
}

export default new CollectionService();
