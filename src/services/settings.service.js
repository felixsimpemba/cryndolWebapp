import api from './api';

class SettingsService {
  /**
   * Get user settings
   */
  async getSettings() {
    const response = await api.get('/settings');
    return response.data;
  }

  /**
   * Update user profile
   */
  async updateProfile(data) {
    const response = await api.put('/settings/profile', data);
    return response.data;
  }

  /**
   * Update user password
   */
  async updatePassword(data) {
    const response = await api.put('/settings/password', data);
    return response.data;
  }

  /**
   * Update notification preferences
   */
  async updateNotifications(data) {
    const response = await api.put('/settings/notifications', data);
    return response.data;
  }
}

export default new SettingsService();
