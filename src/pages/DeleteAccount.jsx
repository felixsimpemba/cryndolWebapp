import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ArrowLeft, Mail, Key } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import useUIStore from '../store/uiStore';
import logoDark from '../assets/images/logo_darkmode.png';
import logoLight from '../assets/images/logo_lightmode.png';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const DeleteAccount = () => {
    const navigate = useNavigate();
    const { theme } = useUIStore();
    const logo = theme === 'dark' ? logoDark : logoLight;

    const [step, setStep] = useState('email'); // 'email' | 'otp'
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRequestOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post(`${API_URL}/auth/request-deletion-otp`, { email });
            toast.success('Verification code sent to your email');
            setStep('otp');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send verification code');
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmDeletion = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post(`${API_URL}/auth/confirm-deletion`, { email, code: otp });
            toast.success('Account deleted successfully');

            localStorage.removeItem('token');
            localStorage.removeItem('user');

            setTimeout(() => navigate('/'), 2000);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete account');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0F172A] text-slate-900 dark:text-slate-50 font-sans selection:bg-red-500/30 transition-colors duration-300">

            {/* Header */}
            <header className="fixed w-full top-0 z-50 bg-white/80 dark:bg-[#0F172A]/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 group">
                        <img src={logo} alt="Cryndol Logo" className="h-10 w-auto" />
                    </Link>
                    <Link
                        to="/"
                        className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Home
                    </Link>
                </div>
            </header>

            {/* Content */}
            <main className="flex-grow flex items-center justify-center px-4 sm:px-6 pt-20">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-2xl"
                >
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-500/10 mb-4">
                            <AlertTriangle className="w-8 h-8 text-red-500" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Delete Account</h1>
                        <p className="text-slate-500 dark:text-slate-400">
                            Permanently remove your account and all data.
                        </p>
                    </div>

                    <AnimatePresence mode="wait">
                        {step === 'email' ? (
                            <motion.form
                                key="email-form"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                onSubmit={handleRequestOtp}
                                className="space-y-6"
                            >
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
                                        <input
                                            id="email"
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all shadow-sm"
                                            placeholder="Enter your email"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg shadow-red-500/20"
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        'Request Verification Code'
                                    )}
                                </button>
                            </motion.form>
                        ) : (
                            <motion.form
                                key="otp-form"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                onSubmit={handleConfirmDeletion}
                                className="space-y-6"
                            >
                                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700 mb-6">
                                    <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
                                        We sent a verification code to <span className="text-slate-900 dark:text-white font-medium">{email}</span>
                                    </p>
                                </div>

                                <div>
                                    <label htmlFor="otp" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Verification Code
                                    </label>
                                    <div className="relative">
                                        <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
                                        <input
                                            id="otp"
                                            type="text"
                                            required
                                            maxLength={6}
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all tracking-widest shadow-sm"
                                            placeholder="000000"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg shadow-red-500/20"
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        'Permanently Delete Account'
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setStep('email')}
                                    className="w-full text-sm text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
                                >
                                    Cancel and go back
                                </button>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </motion.div>
            </main>
        </div>
    );
};

export default DeleteAccount;
