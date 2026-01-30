import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import api from '../services/api';
import useUIStore from '../store/uiStore';
import { handleApiError } from '../utils/errorHandler';
import logoDark from '../assets/images/logo_darkmode.png';
import logoLight from '../assets/images/logo_lightmode.png';

const ResetPassword = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { theme } = useUIStore();
    const logo = theme === 'dark' ? logoDark : logoLight;
    const [isLoading, setIsLoading] = useState(false);
    
    // Get email from previous page if available
    const [formData, setFormData] = useState({
        email: location.state?.email || '',
        code: '',
        password: '',
        password_confirmation: '',
    });
    
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
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
        
        if (!formData.code) {
           newErrors.code = 'Verification code is required';
        } else if (formData.code.length !== 6) {
           newErrors.code = 'Code must be 6 digits';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        }

        if (formData.password !== formData.password_confirmation) {
            newErrors.password_confirmation = 'Passwords do not match';
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
        setErrors({});

        try {
            await api.post('/auth/reset-password', formData);
            toast.success('Password reset successfully! Please login with your new password.');
            navigate('/login');
        } catch (error) {
            const { message, fieldErrors } = handleApiError(error);
            if (fieldErrors) {
                setErrors(fieldErrors);
                toast.error('Please fix the errors below.');
            } else {
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
                <div className="absolute top-0 -left-4 w-72 h-72 bg-primary-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"></div>
                <div className="absolute top-0 -right-4 w-72 h-72 bg-secondary-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float delay-100"></div>
                <div className="absolute -bottom-8 left-20 w-72 h-72 bg-accent-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float delay-200"></div>
            </div>

            {/* Card */}
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
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-gray-100 mb-2">Reset Password</h1>
                        <p className="text-slate-500 dark:text-gray-400">Enter the code sent to your email and your new password.</p>
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
                            required
                        />

                        <Input
                            label="Verification Code"
                            type="text"
                            name="code"
                            placeholder="Enter 6-digit code"
                            value={formData.code}
                            onChange={handleChange}
                            error={errors.code}
                            maxLength={6}
                            required
                        />

                        <Input
                            label="New Password"
                            type="password"
                            name="password"
                            placeholder="Enter new password"
                            value={formData.password}
                            onChange={handleChange}
                            error={errors.password}
                            leftIcon={<Lock size={18} />}
                            required
                        />

                        <Input
                            label="Confirm Password"
                            type="password"
                            name="password_confirmation"
                            placeholder="Confirm new password"
                            value={formData.password_confirmation}
                            onChange={handleChange}
                            error={errors.password_confirmation}
                            leftIcon={<Lock size={18} />}
                            required
                        />

                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            className="w-full"
                            isLoading={isLoading}
                            leftIcon={<CheckCircle size={20} />}
                        >
                            Reset Password
                        </Button>
                    </form>

                     {/* Footer */}
                     <div className="mt-6 text-center">
                        <Link
                            to="/login"
                            className="text-sm text-slate-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                        >
                            Back to Login
                        </Link>
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

export default ResetPassword;
