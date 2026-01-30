import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, DollarSign, Calendar, Clock, AlertTriangle, FileText, ChevronRight, Plus, Download, Mail } from 'lucide-react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { formatCurrency, formatDate, getLoanStatusColor } from '../../utils/formatters';
import { generateRepaymentSchedule } from '../../utils/calculations';
import loanService from '../../services/loan.service';
import documentService from '../../services/document.service';
import toast from 'react-hot-toast';
import { useConfirmation } from '../../context/ConfirmationContext';

const LoanDetailsModal = ({ isOpen, onClose, loanId, onUpdate }) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [loan, setLoan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [aggregates, setAggregates] = useState({});
    const [showPaymentForm, setShowPaymentForm] = useState(false);
    const [paymentData, setPaymentData] = useState({
        amountPaid: '',
        paidDate: new Date().toISOString().split('T')[0],
        payment_method: 'cash',
        notes: ''
    });
    const { confirm } = useConfirmation();

    useEffect(() => {
        if (isOpen && loanId) {
            fetchLoanDetails();
        }
    }, [isOpen, loanId]);

    const fetchLoanDetails = async () => {
        try {
            setLoading(true);
            const response = await loanService.getLoan(loanId);
            setLoan(response.data.loan);
            setAggregates(response.data.aggregates);
        } catch (error) {
            toast.error('Failed to fetch loan details');
            onClose();
        } finally {
            setLoading(false);
        }
    };

    const handleStatusAction = async (action) => {
        const isConfirmed = await confirm({
            title: 'Confirm Action',
            message: `Are you sure you want to ${action} this loan?`,
            confirmText: 'Yes, Proceed',
            type: action === 'reject' ? 'danger' : 'warning'
        });

        if (!isConfirmed) return;

        let status = 'pending';
        if (action === 'approve') status = 'approved';
        if (action === 'reject') status = 'rejected';
        if (action === 'disburse') status = 'active';

        // Ask about sending email for approval
        let sendEmail = false;
        if (action === 'approve') {
            const emailConfirmed = await confirm({
                title: 'Send Approval Email',
                message: `Would you like to send an approval confirmation email to ${loan?.borrower?.fullName}?`,
                confirmText: 'Yes, Send Email',
                cancelText: 'No, Skip',
                type: 'info'
            });
            sendEmail = emailConfirmed;
        }

        try {
            await loanService.changeStatus(loanId, status, sendEmail);
            toast.success(`Loan ${status} successfully${sendEmail ? ' and email sent' : ''}`);
            fetchLoanDetails();
            if (onUpdate) onUpdate();
        } catch (error) {
            toast.error('Action failed');
        }
    };

    const calculateProgress = () => {
        if (!aggregates.totalDue) return 0;
        return Math.min(100, (aggregates.totalPaid / aggregates.totalDue) * 100);
    };

    const handlePaymentSubmit = async (e) => {
        e.preventDefault();

        // Ask about sending payment confirmation email
        const emailConfirmed = await confirm({
            title: 'Send Payment Confirmation',
            message: `Would you like to send a payment confirmation email to ${loan?.borrower?.fullName}?`,
            confirmText: 'Yes, Send Email',
            cancelText: 'No, Skip',
            type: 'info'
        });

        try {
            const dataWithEmail = { ...paymentData, sendEmail: emailConfirmed };
            await loanService.addPayment(loanId, dataWithEmail);
            toast.success(`Payment recorded successfully${emailConfirmed ? ' and email sent' : ''}`);
            setShowPaymentForm(false);
            setPaymentData({ amountPaid: '', paidDate: new Date().toISOString().split('T')[0], payment_method: 'cash', notes: '' });
            fetchLoanDetails();
            if (onUpdate) onUpdate();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to record payment');
        }
    };

    const handleSendReminder = async () => {
        try {
            await loanService.sendReminderEmail(loanId);
            toast.success('Payment reminder sent successfully!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send reminder');
        }
    };

    const handleGenerateAgreement = async () => {
        try {
            await documentService.generateLoanAgreement(loanId);
            toast.success('Loan agreement generated successfully!');
        } catch (error) {
            console.error('PDF generation error:', error);
            toast.error('Failed to generate loan agreement');
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-xl flex flex-col overflow-hidden"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 z-10">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                {loading ? 'Loading...' : `Loan #${loan?.id} - ${loan?.borrower?.fullName}`}
                                {!loading && (
                                    <span className={`text-xs px-2 py-1 rounded-full border ${getLoanStatusColor(loan?.status)}`}>
                                        {loan?.status}
                                    </span>
                                )}
                            </h2>
                            <p className="text-sm text-slate-500 dark:text-gray-400">
                                {loading ? '...' : `${loan?.loan_product?.name || 'Personal Loan'} • Created ${formatDate(loan?.created_at)}`}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-gray-200 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {loading ? (
                        <div className="flex-1 flex items-center justify-center p-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
                        </div>
                    ) : (
                        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col md:flex-row">

                            {/* Sidebar / Tabs (Desktop) */}
                            <div className="w-full md:w-64 border-r border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900/50 p-4 space-y-2">
                                <button
                                    onClick={() => setActiveTab('overview')}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'overview'
                                        ? 'bg-emerald-500 text-white'
                                        : 'text-slate-600 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-white/5'
                                        }`}
                                >
                                    <FileText size={18} /> Overview
                                </button>
                                <button
                                    onClick={() => setActiveTab('schedule')}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'schedule'
                                        ? 'bg-emerald-500 text-white'
                                        : 'text-slate-600 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-white/5'
                                        }`}
                                >
                                    <Calendar size={18} /> Repayment Schedule
                                </button>
                                <button
                                    onClick={() => setActiveTab('transactions')}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'transactions'
                                        ? 'bg-emerald-500 text-white'
                                        : 'text-slate-600 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-white/5'
                                        }`}
                                >
                                    <DollarSign size={18} /> Payments
                                </button>
                            </div>

                            {/* Content Area */}
                            <div className="flex-1 p-6">

                                {/* OVERVIEW TAB */}
                                {activeTab === 'overview' && (
                                    <div className="space-y-6">
                                        {/* Summary Cards */}
                                        {/* Summary Cards */}
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <Card>
                                                <div className="p-4">
                                                    <p className="text-sm text-slate-500">Principal</p>
                                                    <p className="text-xl font-bold text-slate-900 dark:text-white">{formatCurrency(loan.principal)}</p>
                                                </div>
                                            </Card>
                                            <Card>
                                                <div className="p-4">
                                                    <p className="text-sm text-slate-500">Term</p>
                                                    <p className="text-xl font-bold text-slate-900 dark:text-white">
                                                        {loan.termMonths} <span className="capitalize text-sm">{loan.term_unit || 'months'}</span>
                                                    </p>
                                                </div>
                                            </Card>
                                            <Card>
                                                <div className="p-4">
                                                    <p className="text-sm text-slate-500">Due Date</p>
                                                    <p className="text-lg font-bold text-slate-900 dark:text-white">{formatDate(loan.dueDate)}</p>
                                                </div>
                                            </Card>
                                            <Card>
                                                <div className="p-4">
                                                    <p className="text-sm text-slate-500">est. Profit</p>
                                                    <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                                                        {formatCurrency(aggregates.totalDue - loan.principal)}
                                                    </p>
                                                </div>
                                            </Card>
                                        </div>

                                        {/* Repayment Progress */}
                                        <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-white/10">
                                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Repayment Progress</h3>
                                            <div className="flex items-end justify-between mb-2">
                                                <div>
                                                    <p className="text-3xl font-bold text-emerald-500">{formatCurrency(aggregates.totalPaid)}</p>
                                                    <p className="text-sm text-slate-500">Paid so far</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-lg font-medium text-slate-700 dark:text-gray-300">of {formatCurrency(aggregates.totalDue)}</p>
                                                    <p className="text-sm text-slate-400">Total Expected</p>
                                                </div>
                                            </div>
                                            <div className="w-full bg-slate-200 dark:bg-slate-700 h-3 rounded-full overflow-hidden">
                                                <div
                                                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                                                    style={{ width: `${calculateProgress()}%` }}
                                                ></div>
                                            </div>
                                            <div className="flex justify-between mt-2">
                                                <p className="text-sm text-slate-500">Outstanding Balance:</p>
                                                <p className="text-sm font-bold text-red-500">{formatCurrency(aggregates.balance)}</p>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex flex-wrap gap-3">
                                            {loan.status === 'pending' || loan.status === 'submitted' ? (
                                                <>
                                                    <Button onClick={() => handleStatusAction('approve')} variant="primary" leftIcon={<Check size={18} />}>Approve Loan</Button>
                                                    <Button onClick={() => handleStatusAction('reject')} variant="danger" leftIcon={<X size={18} />}>Reject Loan</Button>
                                                </>
                                            ) : null}

                                            {loan.status === 'approved' && (
                                                <Button onClick={() => handleStatusAction('disburse')} variant="primary" leftIcon={<DollarSign size={18} />}>Disburse Funds</Button>
                                            )}

                                            {loan.status === 'active' && (
                                                <>
                                                    <Button onClick={() => setActiveTab('transactions')} variant="outline" leftIcon={<Plus size={18} />}>Record Payment</Button>
                                                    <Button onClick={handleSendReminder} variant="outline" leftIcon={<Mail size={18} />}>Send Reminder</Button>
                                                </>
                                            )}

                                            {/* Generate Agreement PDF Button */}
                                            <Button onClick={handleGenerateAgreement} variant="outline" leftIcon={<Download size={18} />}>Generate Agreement PDF</Button>
                                        </div>
                                    </div>
                                )}

                                {/* SCHEDULE TAB */}
                                {activeTab === 'schedule' && (
                                    <div>
                                        <h3 className="text-lg font-bold mb-4 text-slate-900 dark:text-white">Repayment Schedule</h3>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm text-left text-slate-500 dark:text-gray-400">
                                                <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-800 dark:text-gray-300">
                                                    <tr>
                                                        <th className="px-4 py-3">Due Date</th>
                                                        <th className="px-4 py-3">Expected Amount</th>
                                                        <th className="px-4 py-3">Paid Amount</th>
                                                        <th className="px-4 py-3">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {loan.payments && loan.payments.length > 0 ? (
                                                        loan.payments.sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate)).map((payment) => (
                                                            <tr key={payment.id} className="bg-white border-b dark:bg-slate-900 dark:border-slate-800">
                                                                <td className="px-4 py-3">{formatDate(payment.scheduledDate)}</td>
                                                                <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{formatCurrency(payment.amountScheduled)}</td>
                                                                <td className="px-4 py-3 text-emerald-600">{formatCurrency(payment.amountPaid)}</td>
                                                                <td className="px-4 py-3">
                                                                    <span className={`px-2 py-1 rounded-full text-xs border ${payment.status === 'paid' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                                                                        payment.status === 'overdue' ? 'bg-red-100 text-red-800 border-red-200' :
                                                                            'bg-slate-100 text-slate-800 border-slate-200'
                                                                        }`}>
                                                                        {payment.status}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan="4" className="px-4 py-8 text-center">No schedule items found.</td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {/* TRANSACTIONS TAB */}
                                {activeTab === 'transactions' && (
                                    <div>
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Payment History</h3>
                                            {loan.status === 'active' && (
                                                <Button size="sm" variant="primary" leftIcon={<Plus size={16} />} onClick={() => setShowPaymentForm(!showPaymentForm)}>
                                                    {showPaymentForm ? 'Cancel' : 'Add Payment'}
                                                </Button>
                                            )}
                                        </div>

                                        {/* Payment Form */}
                                        {showPaymentForm && (
                                            <form onSubmit={handlePaymentSubmit} className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-white/10 mb-4">
                                                <h4 className="font-semibold text-slate-900 dark:text-white mb-3">Record New Payment</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <Input
                                                        label="Amount Paid"
                                                        type="number"
                                                        step="0.01"
                                                        required
                                                        value={paymentData.amountPaid}
                                                        onChange={(e) => setPaymentData({ ...paymentData, amountPaid: e.target.value })}
                                                        placeholder="Enter amount"
                                                        leftIcon={<span className="font-bold text-slate-500 dark:text-gray-400">K</span>}
                                                    />
                                                    <Input
                                                        label="Payment Date"
                                                        type="date"
                                                        required
                                                        value={paymentData.paidDate}
                                                        onChange={(e) => setPaymentData({ ...paymentData, paidDate: e.target.value })}
                                                    />
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Payment Method</label>
                                                        <select
                                                            value={paymentData.payment_method}
                                                            onChange={(e) => setPaymentData({ ...paymentData, payment_method: e.target.value })}
                                                            className="block w-full px-4 py-2.5 bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all"
                                                        >
                                                            <option value="cash">Cash</option>
                                                            <option value="bank_transfer">Bank Transfer</option>
                                                            <option value="mobile_money">Mobile Money</option>
                                                            <option value="cheque">Cheque</option>
                                                        </select>
                                                    </div>
                                                    <Input
                                                        label="Notes (Optional)"
                                                        value={paymentData.notes}
                                                        onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
                                                        placeholder="Add notes"
                                                    />
                                                </div>
                                                <div className="flex gap-3 mt-4">
                                                    <Button type="submit" variant="primary" size="sm">Record Payment</Button>
                                                    <Button type="button" variant="outline" size="sm" onClick={() => setShowPaymentForm(false)}>Cancel</Button>
                                                </div>
                                            </form>
                                        )}

                                        {/* Payment History List */}
                                        <div className="space-y-3">
                                            {loan.payments && loan.payments.filter(p => p.amountPaid > 0).length > 0 ? (
                                                loan.payments.filter(p => p.amountPaid > 0).sort((a, b) => new Date(b.paidDate) - new Date(a.paidDate)).map((payment) => (
                                                    <div key={payment.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-white/5">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                                                <Check size={20} />
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold text-slate-900 dark:text-white">Payment Received</p>
                                                                <p className="text-xs text-slate-500">{formatDate(payment.paidDate)}</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-bold text-slate-900 dark:text-white">{formatCurrency(payment.amountPaid)}</p>
                                                            <p className="text-xs text-slate-500">via {payment.payment_method || 'Cash'}</p>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-center py-8 text-slate-500">No payments recorded yet.</p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default LoanDetailsModal;
