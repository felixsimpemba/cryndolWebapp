import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import authService from '../services/auth.service';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      // Set user and token
      setAuth: (user, token) => {
        set({ user, token, isAuthenticated: true });
      },

      // Clear auth data
      clearAuth: () => {
        set({ user: null, token: null, isAuthenticated: false });
      },

      // Login
      login: async (email, password) => {
        const { user, token, greeting } = await authService.login(email, password);
        set({ user, token, isAuthenticated: true });
        return { user, token, greeting };
      },

      // Register
      register: async (userData) => {
        const result = await authService.register(userData);

        if (result.verificationRequired) {
          return { verificationRequired: true, email: result.email };
        }

        const { user, token } = result;
        set({ user, token, isAuthenticated: true });
        return { user, token };
      },

      // Verify OTP
      verifyOtp: async (email, code) => {
        const { user, tokens, greeting } = await authService.verifyOtp(email, code);
        set({ user, token: tokens, isAuthenticated: true });
        return { user, token: tokens, greeting };
      },

      // Resend OTP
      resendOtp: async (email) => {
        await authService.resendOtp(email);
      },

      // Create Business Profile
      createBusinessProfile: async (data) => {
        const response = await authService.createBusinessProfile(data);
        // Update user state to indicate business profile exists
        set((state) => ({
          user: { ...state.user, hasBusinessProfile: true }
        }));
        return response;
      },

      // Logout
      logout: async () => {
        await authService.logout();
        set({ user: null, token: null, isAuthenticated: false });
      },

      // Update user profile
      updateUser: (userData) => {
        set({ user: { ...get().user, ...userData } });
      },

      // Initialize from localStorage
      initialize: () => {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');

        if (token && userStr) {
          const user = JSON.parse(userStr);
          set({ user, token, isAuthenticated: true });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
