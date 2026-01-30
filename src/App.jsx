import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

// Layout
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';
import ThemeInitializer from './components/ThemeInitializer';
import BackButtonHandler from './components/BackButtonHandler';
import { ConfirmationProvider } from './context/ConfirmationContext';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import PrivacyPolicy from './pages/PrivacyPolicy';
import DeleteAccount from './pages/DeleteAccount';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Loans from './pages/Loans';
import Disbursements from './pages/Disbursements';
import Collections from './pages/Collections';
import LoanProducts from './pages/LoanProducts';
import Business from './pages/Business';
import Settings from './pages/Settings';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeInitializer />
      <ConfirmationProvider>
        <Router>
          <BackButtonHandler />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            {/* <Route path="/" element={<Login />} /> */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/delete-account" element={<DeleteAccount />} />

            {/* Protected Routes */}
            <Route
              path="/app"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/app/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="customers" element={<Customers />} />
              <Route path="loans" element={<Loans />} />
              <Route path="disbursements" element={<Disbursements />} />
              <Route path="collections" element={<Collections />} />
              <Route path="products" element={<LoanProducts />} />
              <Route path="business" element={<Business />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </ConfirmationProvider>

      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1e293b',
            color: '#f1f5f9',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            padding: '16px',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </QueryClientProvider>
  );
}

export default App;

