import { useEffect, useRef } from 'react';
import useAuthStore from '../store/authStore';

const IDLE_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds
const ACTIVITY_EVENTS = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];

const useIdleTimeout = () => {
  const { isAuthenticated, logout, recordActivity, lastActivity } = useAuthStore();
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    const handleActivity = () => {
      recordActivity();
      resetTimeout();
    };

    const resetTimeout = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        logout();
      }, IDLE_TIMEOUT);
    };

    // Set initial timeout
    resetTimeout();

    // Add activity listeners
    ACTIVITY_EVENTS.forEach((event) => {
      window.addEventListener(event, handleActivity);
    });

    // Integrity check: if lastActivity was too long ago even if timers were paused/throttled
    const integrityInterval = setInterval(() => {
      if (Date.now() - useAuthStore.getState().lastActivity > IDLE_TIMEOUT) {
        logout();
      }
    }, 60000); // Check every minute

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      clearInterval(integrityInterval);
      ACTIVITY_EVENTS.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [isAuthenticated, logout, recordActivity]);

  return null;
};

export default useIdleTimeout;
