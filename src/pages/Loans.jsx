import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, DollarSign, User, FileText, Download } from 'lucide-react';
import Header from '../components/layout/Header';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import loanService from '../services/loan.service';
import documentService from '../services/document.service';
import { formatCurrency, formatDate, getLoanStatusColor } from '../utils/formatters';
import { calculateLoanTotalRepayment } from '../utils/calculations';
import toast from 'react-hot-toast';
import { useConfirmation } from '../context/ConfirmationContext';
import { usePermissions, PERMISSIONS } from '../utils/permissions';

import CreateLoanModal from '../components/modals/CreateLoanModal';

const Loans = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { confirm } = useConfirmation();
  const navigate = useNavigate();
  const { can } = usePermissions();

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
    const borrowerName = `${loan.customer?.first_name || ''} ${loan.customer?.last_name || ''}`;
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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Header title="Loans" />

      <div>
        <Card>
          <Card.Header>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <Card.Title className="text-xl sm:text-2xl">All Loans</Card.Title>
                <Card.Description>Manage and track all loan applications</Card.Description>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  leftIcon={<Download size={18} />}
                  onClick={handleExportLoans}
                  className="flex-1 sm:flex-none text-xs sm:text-sm"
                >
                  Export
                </Button>
                {can(PERMISSIONS.LOANS.CREATE) && (
                  <Button
                    variant="primary"
                    leftIcon={<Plus size={18} />}
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex-1 sm:flex-none text-xs sm:text-sm"
                  >
                    New Loan
                  </Button>
                )}
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
              <div className="space-y-4">
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
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
                          const totalRepayable = calculateLoanTotalRepayment(loan);
                          const remaining = Math.max(0, totalRepayable - (parseFloat(loan.totalPaid) || 0));

                          return (
                            <motion.tr
                              key={loan.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer"
                              onClick={() => navigate(`/app/loans/${loan.id}`)}
                            >
                              <td className="py-3 px-4">
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                                    <User size={16} className="text-white" />
                                  </div>
                                  <span className="text-sm text-slate-900 dark:text-gray-200 font-medium">
                                    {loan.customer ? `${loan.customer.first_name} ${loan.customer.last_name}` : 'N/A'}
                                  </span>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-sm font-semibold text-slate-900 dark:text-gray-100">
                                {formatCurrency(loan.principal_amount)}
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
                                {loan.loan_term_months} <span className="capitalize">{loan.term_unit || 'months'}</span>
                              </td>
                              <td className="py-3 px-4 text-sm text-slate-500 dark:text-gray-400">
                                {formatDate(loan.start_date)}
                              </td>
                              <td className="py-3 px-4 text-sm text-slate-500 dark:text-gray-400">
                                {formatDate(loan.maturity_date)}
                              </td>
                              <td className="py-3 px-4 text-sm">
                                <div className="flex gap-2 justify-end">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigate(`/app/loans/${loan.id}`);
                                    }}
                                    className="text-primary-500 hover:bg-primary-500/10 p-1.5 rounded transition-colors"
                                    title="View Details"
                                  >
                                    <FileText size={16} />
                                  </button>
                                  {can(PERMISSIONS.LOANS.APPROVE) && ['submitted', 'pending'].includes(loan.status?.toLowerCase()) && (
                                    <>
                                      <button
                                        onClick={(e) => { e.stopPropagation(); handleStatusChange(loan.id, 'APPROVED'); }}
                                        className="text-emerald-500 hover:bg-emerald-500/10 p-1.5 rounded transition-colors"
                                        title="Approve Loan"
                                      >
                                        Approve
                                      </button>
                                      <button
                                        onClick={(e) => { e.stopPropagation(); handleStatusChange(loan.id, 'REJECTED'); }}
                                        className="text-red-500 hover:bg-red-500/10 p-1.5 rounded transition-colors"
                                        title="Reject Loan"
                                      >
                                        Reject
                                      </button>
                                    </>
                                  )}
                                  {loan.status?.toLowerCase() === 'approved' && (
                                    <button
                                      onClick={(e) => { 
                                        e.stopPropagation(); 
                                        navigate('/app/disbursements');
                                      }}
                                      className="text-blue-500 hover:bg-blue-500/10 p-1.5 rounded transition-colors"
                                      title="Go to Disbursement"
                                    >
                                      Disburse
                                    </button>
                                  )}
                                  {can(PERMISSIONS.LOANS.EDIT) && loan.status?.toLowerCase() === 'active' && (
                                    <button
                                      onClick={(e) => { 
                                        e.stopPropagation(); 
                                        navigate(`/app/loans/${loan.id}`);
                                      }}
                                      className="text-emerald-600 hover:bg-emerald-500/10 p-1.5 rounded transition-colors"
                                      title="Record Payment"
                                    >
                                      Pay
                                    </button>
                                  )}
                                </div>
                              </td>
                            </motion.tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan="8" className="py-12 text-center">
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

                {/* Mobile Cards */}
                <div className="grid grid-cols-1 gap-4 md:hidden">
                  {filteredLoans.length > 0 ? (
                    filteredLoans.map((loan, index) => {
                      const totalRepayable = calculateLoanTotalRepayment(loan);
                      const remaining = Math.max(0, totalRepayable - (parseFloat(loan.totalPaid) || 0));

                      return (
                        <motion.div
                          key={loan.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-white/5 space-y-3 cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => navigate(`/app/loans/${loan.id}`)}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                                <User size={16} className="text-white" />
                              </div>
                              <span className="text-sm text-slate-900 dark:text-gray-200 font-medium">
                                {loan.customer ? `${loan.customer.first_name} ${loan.customer.last_name}` : 'N/A'}
                              </span>
                            </div>
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-medium border ${getLoanStatusColor(
                                loan.status?.toLowerCase() || 'pending'
                              )}`}
                            >
                              {loan.status || 'pending'}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-y-2 text-sm">
                            <div className="text-slate-500 dark:text-gray-400">Principal</div>
                            <div className="text-right text-slate-900 dark:text-gray-100 font-semibold">{formatCurrency(loan.principal_amount)}</div>

                            <div className="text-slate-500 dark:text-gray-400">Remaining</div>
                            <div className="text-right text-slate-900 dark:text-gray-300">{formatCurrency(remaining)}</div>

                            <div className="text-slate-500 dark:text-gray-400">Term</div>
                            <div className="text-right text-slate-900 dark:text-gray-300">{loan.loan_term_months} <span className="capitalize">{loan.term_unit || 'months'}</span></div>
                          </div>

                          <div className="flex justify-between pt-3 border-t border-slate-50 dark:border-white/5">
                            <div className="text-xs">
                              <p className="text-slate-500 dark:text-gray-400">Due Date</p>
                              <p className="font-medium text-slate-900 dark:text-white">{formatDate(loan.maturity_date)}</p>
                            </div>
                            <div className="flex gap-2">
                              {can(PERMISSIONS.LOANS.APPROVE) && ['submitted', 'pending'].includes(loan.status?.toLowerCase()) && (
                                <>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleStatusChange(loan.id, 'APPROVED'); }}
                                    className="px-2 py-1 bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 rounded text-xs font-medium"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleStatusChange(loan.id, 'REJECTED'); }}
                                    className="px-2 py-1 bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 rounded text-xs font-medium"
                                  >
                                    Reject
                                  </button>
                                </>
                              )}
                              {loan.status?.toLowerCase() === 'approved' && (
                                <button
                                  onClick={(e) => { 
                                    e.stopPropagation(); 
                                    navigate('/app/disbursements');
                                  }}
                                  className="px-2 py-1 bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 rounded text-xs font-medium"
                                >
                                  Disburse
                                </button>
                              )}
                              {can(PERMISSIONS.LOANS.EDIT) && loan.status?.toLowerCase() === 'active' && (
                                <button
                                  onClick={(e) => { 
                                    e.stopPropagation(); 
                                    navigate(`/app/loans/${loan.id}`);
                                  }}
                                  className="px-2 py-1 bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 rounded text-xs font-medium"
                                >
                                  Pay
                                </button>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                  ) : (
                    <div className="py-12 text-center border border-slate-100 dark:border-white/5 rounded-xl">
                      <div className="text-slate-400 dark:text-gray-400">
                        <DollarSign size={48} className="mx-auto mb-4 opacity-30" />
                        <p className="text-lg mb-2">No loans found</p>
                        <p className="text-sm">Try adjusting your filters or create a new loan</p>
                      </div>
                    </div>
                  )}
                </div>
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
    </div>
  );
};

export default Loans;
