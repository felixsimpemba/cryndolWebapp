import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { PageLoader } from './ui/Loader';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    // Check authentication status
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      // In a real app we might validate token validity here
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If user is authenticated but has no business profile, restrict them to the business page
  // We use window.location.pathname because useLocation might not be available if not wrapped
  // But since we are inside Router in App.jsx, let's assume useLocation is better if we imported it.
  // For safety without changing imports extensively, we can check path.
  
  const currentPath = window.location.pathname;
  if (!user?.hasBusinessProfile && !currentPath.includes('/app/business')) {
     return <Navigate to="/app/business" replace />; 
  }

  return children;
};

export default ProtectedRoute;
