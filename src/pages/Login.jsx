import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import useAuthStore from '../store/authStore';
import useUIStore from '../store/uiStore';
import { handleApiError } from '../utils/errorHandler';
import logoDark from '../assets/images/logo_darkmode.png';
import logoLight from '../assets/images/logo_lightmode.png';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const { theme } = useUIStore();
  const logo = theme === 'dark' ? logoDark : logoLight;

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false,
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      const { user, greeting } = await login(formData.email, formData.password);
      // Show personalized greeting with time-based message
      toast.success(greeting || 'Login successful! Welcome back.');

      if (user.hasBusinessProfile) {
        navigate('/app/dashboard');
      } else {
        navigate('/app/business');
      }
    } catch (error) {
      const { message, fieldErrors, isValidation } = handleApiError(error);

      if (isValidation) {
        // Set field-specific errors from backend
        setErrors(fieldErrors);
        toast.error(message); // Still show the general message
      } else {
        // For non-validation errors, show a toast
        toast.error(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-emerald-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float delay-100"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-violet-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float delay-200"></div>
      </div>

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="glass rounded-2xl p-8 shadow-2xl border border-white/10">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="flex items-center justify-center mx-auto mb-4"
            >
              <img src={logo} alt="Cryndol Logo" className="h-16 w-auto object-contain" />
            </motion.div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-gray-100 mb-2">Welcome Back</h1>
            <p className="text-slate-500 dark:text-gray-400">Sign in to manage your loan business</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Email Address"
              type="email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              leftIcon={<Mail size={18} />}
              required
            />

            <Input
              label="Password"
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              leftIcon={<Lock size={18} />}
              required
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="remember"
                  checked={formData.remember}
                  onChange={handleChange}
                  className="w-4 h-4 bg-white dark:bg-dark-900 border-slate-300 dark:border-dark-700 rounded text-emerald-500 focus:ring-emerald-500 focus:ring-offset-white dark:focus:ring-offset-dark-950"
                />
                <span className="text-sm text-slate-500 dark:text-gray-400">Remember me</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={isLoading}
              leftIcon={<LogIn size={20} />}
            >
              Sign In
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-slate-500 dark:text-gray-400">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300 font-medium transition-colors"
              >
                Create one now
              </Link>
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <p className="text-center text-slate-400 dark:text-gray-500 text-sm mt-6">
          © 2026 Cryndol. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
