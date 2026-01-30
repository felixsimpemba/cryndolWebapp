import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Calendar, CheckCircle, Clock } from 'lucide-react';
import Header from '../components/layout/Header';
import Card from '../components/ui/Card';
import loanService from '../services/loan.service';
import { formatCurrency, formatDate } from '../utils/formatters';
import toast from 'react-hot-toast';

const Collections = () => {
    const [loans, setLoans] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCollections();
    }, []);

    const fetchCollections = async () => {
        try {
            setLoading(true);
            // In a real app, this would filter by 'active' or 'overdue' statuses specifically
            const response = await loanService.getLoans({ status: 'active' });
            setLoans(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch collections:', error);
            toast.error('Failed to load collections');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 overflow-y-auto custom-scrollbar">
            <Header title="Collections" />

            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <Card className="bg-red-500/10 border-red-500/20">
                        <Card.Content>
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-red-500/20 rounded-full">
                                    <AlertCircle className="text-red-500" size={24} />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500 dark:text-gray-400">Overdue Amount</p>
                                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(0)}</h3>
                                </div>
                            </div>
                        </Card.Content>
                    </Card>
                    <Card className="bg-amber-500/10 border-amber-500/20">
                        <Card.Content>
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-amber-500/20 rounded-full">
                                    <Clock className="text-amber-500" size={24} />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500 dark:text-gray-400">Due This Week</p>
                                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(0)}</h3>
                                </div>
                            </div>
                        </Card.Content>
                    </Card>
                    <Card className="bg-emerald-500/10 border-emerald-500/20">
                        <Card.Content>
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-emerald-500/20 rounded-full">
                                    <CheckCircle className="text-emerald-500" size={24} />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500 dark:text-gray-400">Collected Today</p>
                                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(0)}</h3>
                                </div>
                            </div>
                        </Card.Content>
                    </Card>
                </div>

                <Card>
                    <Card.Header>
                        <Card.Title>Active Loans</Card.Title>
                        <Card.Description>Loans currently requiring repayment tracking</Card.Description>
                    </Card.Header>
                    <Card.Content>
                        {loading ? (
                            <div className="py-12 text-center">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                                <p className="mt-4 text-slate-600 dark:text-gray-400">Loading collections data...</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-slate-200 dark:border-white/10">
                                            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600 dark:text-gray-300">Borrower</th>
                                            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600 dark:text-gray-300">Total Due</th>
                                            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600 dark:text-gray-300">Paid</th>
                                            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600 dark:text-gray-300">Outstanding</th>
                                            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600 dark:text-gray-300">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loans.length > 0 ? (
                                            loans.map((loan, index) => {
                                                const totalDue = parseFloat(loan.principal) + (parseFloat(loan.principal) * parseFloat(loan.interestRate) / 100);
                                                const paid = parseFloat(loan.totalPaid || 0);
                                                const outstanding = totalDue - paid;

                                                return (
                                                    <motion.tr
                                                        key={loan.id}
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: index * 0.05 }}
                                                        className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                                                    >
                                                        <td className="py-3 px-4 text-sm font-medium text-slate-900 dark:text-gray-200">
                                                            {loan.borrower?.fullName || 'N/A'}
                                                        </td>
                                                        <td className="py-3 px-4 text-sm text-slate-600 dark:text-gray-300">
                                                            {formatCurrency(totalDue)}
                                                        </td>
                                                        <td className="py-3 px-4 text-sm text-emerald-600 dark:text-emerald-400">
                                                            {formatCurrency(paid)}
                                                        </td>
                                                        <td className="py-3 px-4 text-sm font-bold text-slate-900 dark:text-white">
                                                            {formatCurrency(outstanding)}
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <span className="bg-secondary-500/10 text-secondary-600 px-2 py-1 rounded text-xs uppercase font-bold">
                                                                {loan.status}
                                                            </span>
                                                        </td>
                                                    </motion.tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan="5" className="py-8 text-center text-slate-500">No active loans found.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </Card.Content>
                </Card>
            </div>
        </div>
    );
};

export default Collections;
