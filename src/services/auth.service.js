import api from './api';

class AuthService {
  /**
   * Login user
   */
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    // Laravel returns: { success, message, greeting, data: { user, tokens } }
    const { user, tokens } = response.data.data;
    const greeting = response.data.greeting;

    // Store tokens
    localStorage.setItem('token', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
    localStorage.setItem('user', JSON.stringify(user));

    return { user, tokens, greeting };
  }

  /**
   * Register new user
   */
  async register(userData) {
    const response = await api.post('/auth/register/personal', userData);
    const data = response.data.data;

    // Check if verification is required (no tokens returned)
    if (data.verification_required) {
      return { verificationRequired: true, email: data.email };
    }

    // If tokens are returned, registration is complete (legacy behavior or optional OTP)
    const { user, tokens } = data;

    // Store tokens
    localStorage.setItem('token', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
    localStorage.setItem('user', JSON.stringify(user));

    return { user, tokens, verificationRequired: false };
  }

  /**
   * Verify OTP
   */
  async verifyOtp(email, code) {
    const response = await api.post('/auth/verify-otp', { email, code });
    const { user, tokens } = response.data.data;
    const greeting = response.data.greeting;

    // Store tokens
    localStorage.setItem('token', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
    localStorage.setItem('user', JSON.stringify(user));

    return { user, tokens, greeting };
  }

  /**
   * Resend OTP
   */
  async resendOtp(email) {
    return await api.post('/auth/resend-otp', { email });
  }

  /**
   * Create business profile
   */
  async createBusinessProfile(data) {
    const response = await api.post('/auth/business-profile', data);
    return response.data;
  }

  /**
   * Logout user
   */
  async logout() {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }

  /**
   * Get current user profile
   */
  async getProfile() {
    const response = await api.get('/auth/profile');
    return response.data;
  }

  /**
   * Refresh authentication token
   */
  async refreshToken() {
    const refreshToken = localStorage.getItem('refreshToken');
    const response = await api.post('/auth/refresh', { refresh_token: refreshToken });
    const { token } = response.data;

    localStorage.setItem('token', token);
    return token;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!localStorage.getItem('token');
  }

  /**
   * Get current user from local storage
   */
  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
}

export default new AuthService();
