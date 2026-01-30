import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, DollarSign, User, FileText, Download } from 'lucide-react';
import Header from '../components/layout/Header';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import loanService from '../services/loan.service';
import documentService from '../services/document.service';
import { formatCurrency, formatDate, getLoanStatusColor } from '../utils/formatters';
import { calculatePeriodicPayment, calculateRemainingBalance } from '../utils/calculations';
import toast from 'react-hot-toast';
import { useConfirmation } from '../context/ConfirmationContext';

import CreateLoanModal from '../components/modals/CreateLoanModal';
import LoanDetailsModal from '../components/modals/LoanDetailsModal';

const Loans = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedLoanId, setSelectedLoanId] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const { confirm } = useConfirmation();

  useEffect(() => {
    fetchLoans();
  }, [statusFilter]);

  const fetchLoans = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      const response = await loanService.getLoans(params);
      setLoans(response.data?.data || []);
    } catch (error) {
      console.error('Failed to fetch loans:', error);
      toast.error('Failed to load loans');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    const isConfirmed = await confirm({
      title: 'Change Loan Status',
      message: `Are you sure you want to change status to ${newStatus}?`,
      confirmText: 'Yes, Change',
      type: 'warning'
    });

    if (!isConfirmed) return;

    // Ask about sending email for approval or closure
    let sendEmail = false;
    if (newStatus === 'approved' || newStatus === 'closed') {
      const emailConfirmed = await confirm({
        title: 'Send Email Notification',
        message: `Would you like to send a confirmation email to the customer?`,
        confirmText: 'Yes, Send Email',
        cancelText: 'No, Skip',
        type: 'info'
      });
      sendEmail = emailConfirmed;
    }

    try {
      await loanService.changeStatus(id, newStatus, sendEmail);
      toast.success(`Loan ${newStatus} successfully${sendEmail ? ' and email sent' : ''}`);
      fetchLoans();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleExportLoans = async () => {
    try {
      const filters = {};
      if (statusFilter !== 'all') {
        filters.status = statusFilter;
      }
      await documentService.exportLoans(filters);
      toast.success('Loans exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export loans');
    }
  };

  const filteredLoans = loans.filter((loan) => {
    if (!searchTerm) return true;
    const borrowerName = loan.borrower?.fullName || '';
    return borrowerName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'active', label: 'Active' },
    { value: 'closed', label: 'Closed' },
    { value: 'defaulted', label: 'Defaulted' },
  ];

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar">
      <Header title="Loans" />

      <div className="p-6">
        <Card>
          <Card.Header>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <Card.Title>All Loans</Card.Title>
                <Card.Description>Manage and track all loan applications</Card.Description>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" leftIcon={<Download size={18} />} onClick={handleExportLoans}>
                  Export to Excel
                </Button>
                <Button variant="primary" leftIcon={<Plus size={18} />} onClick={() => setIsCreateModalOpen(true)}>
                  New Loan
                </Button>
              </div>
            </div>

            {/* Search & Filter */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="Search by borrower name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<Search size={18} />}
              />

              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="block w-full px-4 py-2.5 pl-10 bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Filter size={18} className="text-gray-400" />
                </div>
              </div>
            </div>
          </Card.Header>

          <Card.Content>
            {loading ? (
              <div className="py-12 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                <p className="mt-4 text-slate-600 dark:text-gray-400">Loading loans...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-white/10">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600 dark:text-gray-300">Borrower</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600 dark:text-gray-300">Principal</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600 dark:text-gray-300">Remaining</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600 dark:text-gray-300">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600 dark:text-gray-300">Term</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600 dark:text-gray-300">Start Date</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600 dark:text-gray-300">Due Date</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-slate-600 dark:text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLoans.length > 0 ? (
                      filteredLoans.map((loan, index) => {
                        const remaining = calculateRemainingBalance(
                          loan.principal,
                          loan.interestRate,
                          loan.termMonths,
                          loan.totalPaid || 0
                        );

                        return (
                          <motion.tr
                            key={loan.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer"
                            onClick={() => {
                              setSelectedLoanId(loan.id);
                              setIsDetailsModalOpen(true);
                            }}
                          >
                            <td className="py-3 px-4">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                                  <User size={16} className="text-white" />
                                </div>
                                <span className="text-sm text-slate-900 dark:text-gray-200 font-medium">
                                  {loan.borrower?.fullName || 'N/A'}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-sm font-semibold text-slate-900 dark:text-gray-100">
                              {formatCurrency(loan.principal)}
                            </td>
                            <td className="py-3 px-4 text-sm text-slate-600 dark:text-gray-300">
                              {formatCurrency(remaining)}
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getLoanStatusColor(
                                  loan.status?.toLowerCase() || 'pending'
                                )}`}
                              >
                                {loan.status || 'pending'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-sm text-slate-600 dark:text-gray-300">
                              {loan.termMonths} <span className="capitalize">{loan.term_unit || 'months'}</span>
                            </td>
                            <td className="py-3 px-4 text-sm text-slate-500 dark:text-gray-400">
                              {formatDate(loan.startDate)}
                            </td>
                            <td className="py-3 px-4 text-sm text-slate-500 dark:text-gray-400">
                              {formatDate(loan.dueDate)}
                            </td>
                            <td className="py-3 px-4 text-sm">
                              <div className="flex gap-2 justify-end">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedLoanId(loan.id);
                                    setIsDetailsModalOpen(true);
                                  }}
                                  className="text-primary-500 hover:bg-primary-500/10 p-1.5 rounded transition-colors"
                                  title="View Details"
                                >
                                  <FileText size={16} />
                                </button>
                                {(loan.status === 'submitted' || loan.status === 'pending') && (
                                  <>
                                    <button
                                      onClick={(e) => { e.stopPropagation(); handleStatusChange(loan.id, 'approved'); }}
                                      className="text-emerald-500 hover:bg-emerald-500/10 p-1.5 rounded transition-colors"
                                      title="Approve Loan"
                                    >
                                      Approve
                                    </button>
                                    <button
                                      onClick={(e) => { e.stopPropagation(); handleStatusChange(loan.id, 'rejected'); }}
                                      className="text-red-500 hover:bg-red-500/10 p-1.5 rounded transition-colors"
                                      title="Reject Loan"
                                    >
                                      Reject
                                    </button>
                                  </>
                                )}
                                {loan.status === 'approved' && (
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleStatusChange(loan.id, 'active'); }}
                                    className="text-secondary-600 hover:bg-secondary-500/10 p-1.5 rounded transition-colors"
                                    title="Disburse Funds"
                                  >
                                    Disburse
                                  </button>
                                )}
                              </div>
                            </td>
                          </motion.tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="6" className="py-12 text-center">
                          <div className="text-slate-400 dark:text-gray-400">
                            <DollarSign size={48} className="mx-auto mb-4 opacity-30" />
                            <p className="text-lg mb-2">No loans found</p>
                            <p className="text-sm">Try adjusting your filters or create a new loan</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </Card.Content>

          {filteredLoans.length > 0 && (
            <Card.Footer>
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500 dark:text-gray-400">
                  Showing {filteredLoans.length} loans
                </p>
              </div>
            </Card.Footer>
          )}
        </Card>
      </div>

      <CreateLoanModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          fetchLoans();
        }}
      />

      <LoanDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        loanId={selectedLoanId}
        onUpdate={fetchLoans}
      />
    </div>
  );
};

export default Loans;
