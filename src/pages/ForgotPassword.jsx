import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import api from '../services/api';
import useUIStore from '../store/uiStore';
import { handleApiError } from '../utils/errorHandler';
import logoDark from '../assets/images/logo_darkmode.png';
import logoLight from '../assets/images/logo_lightmode.png';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const { theme } = useUIStore();
    const logo = theme === 'dark' ? logoDark : logoLight;
    const [isLoading, setIsLoading] = useState(false);

    const [email, setEmail] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email) {
            setError('Email is required');
            return;
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            setError('Email is invalid');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            await api.post('/auth/forgot-password', { email });
            toast.success('Password reset code sent to your email.');
            // Navigate to reset password page, passing email in state
            navigate('/reset-password', { state: { email } });
        } catch (err) {
            const { message } = handleApiError(err);
            setError(message);
            toast.error(message);
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
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-gray-100 mb-2">Forgot Password?</h1>
                        <p className="text-slate-500 dark:text-gray-400">Enter your email to receive a reset code</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Input
                            label="Email Address"
                            type="email"
                            name="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            error={error}
                            leftIcon={<Mail size={18} />}
                            required
                        />

                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            className="w-full"
                            isLoading={isLoading}
                            rightIcon={<ArrowRight size={20} />}
                        >
                            Send Reset Code
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

export default ForgotPassword;
