import React from 'react';
import { motion } from 'framer-motion';
import { Lock, ArrowLeft, Sun, Moon } from 'lucide-react';
import { Link } from 'react-router-dom';
import useUIStore from '../store/uiStore';
import logoDark from '../assets/images/logo_darkmode.png';
import logoLight from '../assets/images/logo_lightmode.png';

const PrivacyPolicy = () => {
    const { theme, toggleTheme } = useUIStore();
    const logo = theme === 'dark' ? logoDark : logoLight;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0F172A] text-slate-900 dark:text-slate-50 font-sans selection:bg-emerald-500/30 transition-colors duration-300">

            {/* Header */}
            <header className="fixed w-full top-0 z-50 bg-white/80 dark:bg-[#0F172A]/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 group">
                        <img src={logo} alt="Cryndol Logo" className="h-10 w-auto" />
                    </Link>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                        >
                            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                        <Link
                            to="/"
                            className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-white transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Home
                        </Link>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="flex-grow pt-32 pb-16 px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="max-w-3xl mx-auto bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 sm:p-12 shadow-xl"
                >
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                            <Lock className="w-6 h-6" />
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Privacy Policy</h1>
                    </div>

                    <div className="prose prose-slate dark:prose-invert prose-emerald max-w-none space-y-6">
                        <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-300">
                            At Cryndol, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclosure, and safeguard your information when you visit our website or use our mobile application.
                        </p>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">1. Information We Collect</h2>
                            <p className="text-slate-600 dark:text-slate-400">
                                We may collect information about you in a variety of ways. The information we may collect includes:
                            </p>
                            <ul className="list-disc pl-5 space-y-2 mt-2 text-slate-600 dark:text-slate-400">
                                <li>
                                    <strong className="text-slate-900 dark:text-white">Personal Data:</strong> Personally identifiable information, such as your name, shipping address, email address, and telephone number, that you voluntarily give to us when you register.
                                </li>
                                <li>
                                    <strong className="text-slate-900 dark:text-white">Financial Data:</strong> Financial information, such as data related to your payment method (e.g., valid credit card number, card brand, expiration date) that we may collect when you purchase, order, return, exchange, or request information about our services.
                                </li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">2. Use of Your Information</h2>
                            <p className="text-slate-600 dark:text-slate-400">
                                Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you to:
                            </p>
                            <ul className="list-disc pl-5 space-y-2 mt-2 text-slate-600 dark:text-slate-400">
                                <li>Create and manage your account.</li>
                                <li>Process transactions and send related information.</li>
                                <li>Email you regarding your account or order.</li>
                                <li>Prevent fraudulent transactions, monitor against theft, and protect against criminal activity.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">3. Account Deletion</h2>
                            <p className="text-slate-600 dark:text-slate-400">
                                You have the right to request the deletion of your account and personal data. We provide a dedicated page for you to securely request account deletion. Upon verification, your account and associated data will be permanently removed from our systems, except where retention is required by law.
                            </p>
                            <div className="mt-4">
                                <Link to="/delete-account" className="inline-flex items-center gap-2 text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 font-medium transition-colors">
                                    Go to Account Deletion Request &rarr;
                                </Link>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">4. Contact Us</h2>
                            <p className="text-slate-600 dark:text-slate-400">
                                If you have questions or comments about this Privacy Policy, please contact us at: <a href="mailto:support@cryndol.com" className="text-emerald-600 dark:text-emerald-400 hover:underline">support@cryndol.com</a>.
                            </p>
                        </section>

                        <p className="text-sm text-slate-500 pt-8 border-t border-slate-200 dark:border-slate-800">
                            Last updated: {new Date().toLocaleDateString()}
                        </p>
                    </div>
                </motion.div>
            </main>

            {/* Footer */}
            <footer className="bg-white dark:bg-[#0F172A] border-t border-slate-200 dark:border-slate-800 py-8">
                <div className="max-w-7xl mx-auto px-6 text-center text-slate-500 text-sm">
                    &copy; {new Date().getFullYear()} Cryndol. All rights reserved.
                </div>
            </footer>
        </div>
    );
};

export default PrivacyPolicy;
