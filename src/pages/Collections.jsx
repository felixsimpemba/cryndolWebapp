import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Receipt, Calendar, CreditCard, User, Hash, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import Header from '../components/layout/Header';
import Card from '../components/ui/Card';
import collectionService from '../services/collection.service';
import { formatCurrency, formatDate } from '../utils/formatters';
import toast from 'react-hot-toast';

const Collections = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [filters, setFilters] = useState({
        start_date: '',
        end_date: '',
        search: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async (currentFilters = filters) => {
        try {
            setLoading(true);
            const [statsRes, paymentsRes] = await Promise.all([
                collectionService.getStats(),
                collectionService.getCollections(currentFilters)
            ]);

            setStats(statsRes.data);
            setPayments(paymentsRes.data.data || []);
        } catch (error) {
            console.error('Failed to fetch collections data:', error);
            toast.error('Failed to load collections');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const applyFilters = () => {
        fetchData(filters);
    };

    const clearFilters = () => {
        const resetFilters = {
            start_date: '',
            end_date: '',
            search: '',
            payment_method: ''
        };
        setFilters(resetFilters);
        fetchData(resetFilters);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Header title="Collections" />

            <div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    {/* ... stats cards ... */}
                    <Card className="bg-emerald-500/10 border-emerald-500/20">
                        <Card.Content>
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-emerald-500/20 rounded-full">
                                    <CheckCircle className="text-emerald-500" size={24} />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500 dark:text-gray-400">Collected Today</p>
                                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                                        {formatCurrency(stats?.collected_today || 0)}
                                    </h3>
                                </div>
                            </div>
                        </Card.Content>
                    </Card>
                    <Card className="bg-blue-500/10 border-blue-500/20">
                        <Card.Content>
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-500/20 rounded-full">
                                    <Calendar className="text-blue-500" size={24} />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500 dark:text-gray-400">This Week</p>
                                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                                        {formatCurrency(stats?.collected_this_week || 0)}
                                    </h3>
                                </div>
                            </div>
                        </Card.Content>
                    </Card>
                    <Card className="bg-slate-500/10 border-slate-500/20">
                        <Card.Content>
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-slate-500/20 rounded-full">
                                    <Receipt className="text-slate-500" size={24} />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500 dark:text-gray-400">Total Collected</p>
                                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                                        {formatCurrency(stats?.total_collected || 0)}
                                    </h3>
                                </div>
                            </div>
                        </Card.Content>
                    </Card>
                </div>

                <Card className="mb-6">
                    <Card.Content className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
                            <div className="space-y-1.5 md:col-span-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Time Range</label>
                                <select 
                                    value={preset}
                                    onChange={handlePresetChange}
                                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 transition-all outline-none"
                                >
                                    <option value={DATE_PRESETS.ALL}>All Time</option>
                                    <option value={DATE_PRESETS.TODAY}>Today</option>
                                    <option value={DATE_PRESETS.YESTERDAY}>Yesterday</option>
                                    <option value={DATE_PRESETS.THIS_WEEK}>This Week</option>
                                    <option value={DATE_PRESETS.LAST_WEEK}>Last Week</option>
                                    <option value={DATE_PRESETS.THIS_MONTH}>This Month</option>
                                    <option value={DATE_PRESETS.LAST_MONTH}>Last Month</option>
                                    <option value={DATE_PRESETS.CUSTOM}>Custom Range</option>
                                </select>
                            </div>

                            {preset === DATE_PRESETS.CUSTOM && (
                                <>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">From Date</label>
                                        <input 
                                            type="date" 
                                            name="start_date"
                                            value={filters.start_date}
                                            onChange={handleFilterChange}
                                            className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 transition-all outline-none"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">To Date</label>
                                        <input 
                                            type="date" 
                                            name="end_date"
                                            value={filters.end_date}
                                            onChange={handleFilterChange}
                                            className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 transition-all outline-none"
                                        />
                                    </div>
                                </>
                            )}

                            <div className="space-y-1.5 md:col-span-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Search</label>
                                <input 
                                    type="text" 
                                    name="search"
                                    value={filters.search}
                                    onChange={handleFilterChange}
                                    placeholder="Loan # or Name..."
                                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 transition-all outline-none"
                                />
                            </div>
                            <div className="space-y-1.5 md:col-span-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Method</label>
                                <select 
                                    name="payment_method"
                                    value={filters.payment_method}
                                    onChange={handleFilterChange}
                                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 transition-all outline-none"
                                >
                                    <option value="">All Methods</option>
                                    <option value="CASH">Cash</option>
                                    <option value="BANK_TRANSFER">Bank Transfer</option>
                                    <option value="MOBILE_MONEY">Mobile Money</option>
                                    <option value="CHEQUE">Cheque</option>
                                </select>
                            </div>
                            <div className="flex gap-2 md:col-span-1">
                                <button 
                                    onClick={applyFilters}
                                    className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-xl text-sm transition-all shadow-lg shadow-primary-600/20"
                                >
                                    Filter
                                </button>
                                <button 
                                    onClick={clearFilters}
                                    className="bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400 font-bold py-2 px-4 rounded-xl text-sm transition-all"
                                >
                                    Clear
                                </button>
                            </div>
                        </div>
                    </Card.Content>
                </Card>

                <Card>
                    <Card.Header>
                        <div className="flex justify-between items-center">
                            <div>
                                <Card.Title>Payment History</Card.Title>
                                <Card.Description>Recent collections across all loans</Card.Description>
                            </div>
                        </div>
                    </Card.Header>
                    <Card.Content>
                        {loading ? (
                            <div className="py-12 text-center">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                                <p className="mt-4 text-slate-600 dark:text-gray-400">Loading payments...</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {/* Desktop Table */}
                                <div className="hidden md:block overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-slate-200 dark:border-white/10">
                                                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600 dark:text-gray-300">Date</th>
                                                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600 dark:text-gray-300">Borrower</th>
                                                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600 dark:text-gray-300">Loan #</th>
                                                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600 dark:text-gray-300">Amount</th>
                                                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600 dark:text-gray-300">Method</th>
                                                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600 dark:text-gray-300">Reference</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {payments.length > 0 ? (
                                                payments.map((payment, index) => (
                                                    <motion.tr
                                                        key={payment.id}
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: index * 0.05 }}
                                                        className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                                                    >
                                                        <td className="py-3 px-4 text-sm text-slate-600 dark:text-gray-300">
                                                            {formatDate(payment.payment_date)}
                                                        </td>
                                                        <td className="py-3 px-4 text-sm font-medium text-slate-900 dark:text-gray-200">
                                                            {payment.loan?.borrower_name || 'N/A'}
                                                        </td>
                                                        <td className="py-3 px-4 text-sm text-slate-500 dark:text-gray-400">
                                                            {payment.loan?.loan_number || 'N/A'}
                                                        </td>
                                                        <td className="py-3 px-4 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                                                            {formatCurrency(payment.amount_paid)}
                                                        </td>
                                                        <td className="py-3 px-4 text-sm text-slate-600 dark:text-gray-300">
                                                            <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-[10px] uppercase font-semibold">
                                                                {payment.payment_method?.replace('_', ' ')}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-4 text-sm text-slate-500 dark:text-gray-400">
                                                            {payment.reference_number || '---'}
                                                        </td>
                                                    </motion.tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="6" className="py-8 text-center text-slate-500">No payments found.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Mobile Cards */}
                                <div className="grid grid-cols-1 gap-4 md:hidden">
                                    {payments.length > 0 ? (
                                        payments.map((payment, index) => (
                                            <motion.div
                                                key={payment.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-white/5 space-y-3 shadow-sm"
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <div className="font-medium text-slate-900 dark:text-white">
                                                            {payment.loan?.borrower_name || 'N/A'}
                                                        </div>
                                                        <div className="text-xs text-slate-500">{payment.loan?.loan_number}</div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="font-bold text-emerald-600">{formatCurrency(payment.amount_paid)}</div>
                                                        <div className="text-[10px] text-slate-400">{formatDate(payment.payment_date)}</div>
                                                    </div>
                                                </div>
                                                <div className="flex justify-between items-center pt-2 border-t border-slate-50 dark:border-white/5 text-xs">
                                                    <span className="text-slate-500 uppercase">{payment.payment_method?.replace('_', ' ')}</span>
                                                    <span className="text-slate-400">{payment.reference_number}</span>
                                                </div>
                                            </motion.div>
                                        ))
                                    ) : (
                                        <div className="py-8 text-center text-slate-500 border border-slate-100 dark:border-white/5 rounded-xl">
                                            No payments found.
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </Card.Content>
                </Card>
            </div>
        </div>
    );
};

export default Collections;

