import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import authService from '../services/auth.service';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      remember: false,
      lastActivity: Date.now(),

      // Set user and token
      setAuth: (user, token) => {
        set({ user, token, isAuthenticated: true });
      },

      // Clear auth data
      clearAuth: () => {
        set({ user: null, token: null, isAuthenticated: false });
      },

      // Login
      login: async (email, password, remember = false) => {
        const { user, tokens, greeting } = await authService.login(email, password, remember);
        set({
          user,
          token: tokens.accessToken,
          isAuthenticated: true,
          remember,
          lastActivity: Date.now()
        });

        if (!remember) {
          sessionStorage.setItem('is_session_active', 'true');
        }

        return { user, tokens, greeting };
      },

      // Register
      register: async (userData) => {
        const result = await authService.register(userData);

        if (result.verificationRequired) {
          return { verificationRequired: true, email: result.email };
        }

        const { user, tokens } = result;
        set({ user, token: tokens.accessToken, isAuthenticated: true });
        return { user, tokens };
      },

      // Verify OTP
      verifyOtp: async (email, code) => {
        const { user, tokens, greeting } = await authService.verifyOtp(email, code);
        set({ user, token: tokens.accessToken, isAuthenticated: true });
        return { user, tokens, greeting };
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
        try {
          await authService.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          set({ user: null, token: null, isAuthenticated: false, remember: false });
          sessionStorage.removeItem('is_session_active');
          localStorage.removeItem('auth-storage'); // Force clear persisted state
        }
      },

      // Update activity timestamp
      recordActivity: () => {
        set({ lastActivity: Date.now() });
      },

      // Update user profile
      updateUser: (userData) => {
        set({ user: { ...get().user, ...userData } });
      },

      // Initialize and check for session validity
      initialize: () => {
        const state = get();
        if (state.isAuthenticated && !state.remember) {
          const isSessionActive = sessionStorage.getItem('is_session_active');
          if (!isSessionActive) {
            // Browser was closed, session-only login should be cleared
            state.logout();
            return;
          }
        }
        
        // Update last activity on init
        set({ lastActivity: Date.now() });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        remember: state.remember,
        lastActivity: state.lastActivity,
      }),
    }
  )
);

export default useAuthStore;
