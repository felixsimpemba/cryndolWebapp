import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, Calendar, DollarSign, 
  FileText, User, Shield, 
  Clock, CheckCircle, AlertCircle,
  Download, Plus, TrendingUp,
  CreditCard, PieChart, Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

import Header from '../components/layout/Header';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import loanService from '../services/loan.service';
import { formatCurrency, formatDate, getLoanStatusColor } from '../utils/formatters';
import { calculateLoanTotalInterest, calculateLoanTotalRepayment } from '../utils/calculations';
import RecordPaymentModal from '../components/modals/RecordPaymentModal';
import { usePermissions, PERMISSIONS } from '../utils/permissions';

const LoanDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loan, setLoan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('payments');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const { can } = usePermissions();

  useEffect(() => {
    fetchLoanDetails();
  }, [id]);

  const fetchLoanDetails = async () => {
    try {
      setLoading(true);
      const response = await loanService.getLoan(id);
      setLoan(response.data);
    } catch (error) {
      console.error('Failed to fetch loan details:', error);
      toast.error('Failed to load loan details');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveLoan = async () => {
    try {
      setLoading(true);
      await loanService.changeStatus(id, 'APPROVED');
      toast.success('Loan approved successfully');
      await fetchLoanDetails();
    } catch (error) {
      console.error('Failed to approve loan:', error);
      toast.error('Failed to approve loan');
      setLoading(false);
    }
  };

  const handleDownloadStatement = async () => {
    const toastId = toast.loading('Generating document...');
    try {
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
      const cleanBaseUrl = baseUrl.endsWith('/api') ? baseUrl.slice(0, -4) : baseUrl;
      
      const response = await fetch(`${cleanBaseUrl}/api/documents/pdf/loan-agreement/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Download failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Loan_Agreement_${loan?.loan_number || id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Downloaded successfully', { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error('Failed to download document', { id: toastId });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!loan) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Loan not found</h2>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/app/loans')}>
          Back to Loans
        </Button>
      </div>
    );
  }

  const interest = calculateLoanTotalInterest(loan);
  const totalRepayable = calculateLoanTotalRepayment(loan);
  
  const totalPaid = Number(loan.total_paid || 0);
  const principal = Number(loan.principal_amount);
  const remainingBalance = totalRepayable - totalPaid;
  const repaymentPercentage = totalRepayable > 0 ? (totalPaid / totalRepayable) * 100 : 0;

  const tabs = [
    { id: 'payments', label: 'Payments', icon: <CreditCard size={18} /> },
    { id: 'schedules', label: 'Schedule', icon: <Calendar size={18} /> },
    { id: 'collaterals', label: 'Collateral', icon: <Shield size={18} /> },
    { id: 'documents', label: 'Documents', icon: <FileText size={18} /> },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      {/* Page Header & Top Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/app/loans')}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all group border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
          >
            <ArrowLeft size={20} className="text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight truncate">
                {loan.loan_number || `LN-${loan.id.substring(0, 8).toUpperCase()}`}
              </h1>
              <Badge variant={getLoanStatusColor(loan.status)} className="px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-bold">
                {loan.status}
              </Badge>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-slate-400 text-xs font-medium uppercase tracking-widest">Issued To:</span>
              <Link 
                to={`/app/customers/${loan.customer_id}`}
                className="text-emerald-600 hover:text-emerald-700 text-sm font-bold flex items-center gap-1 group/link"
              >
                <User size={14} className="opacity-70 group-hover/link:opacity-100" />
                <span className="truncate border-b border-transparent group-hover/link:border-emerald-600 transition-all">{loan.customer?.first_name} {loan.customer?.last_name}</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {can(PERMISSIONS.LOANS.APPROVE) && ['PENDING', 'pending', 'submitted', 'SUBMITTED'].includes(loan.status) && (
            <Button 
                variant="primary" 
                leftIcon={<CheckCircle size={18} />} 
                className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 border-none"
                onClick={handleApproveLoan}
            >
                Approve
            </Button>
          )}

          {can(PERMISSIONS.DISBURSEMENTS.PROCESS) && (loan.status === 'APPROVED' || loan.status === 'approved') && (
            <Button 
                variant="primary" 
                leftIcon={<DollarSign size={18} />} 
                className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 border-none"
                onClick={() => navigate('/app/disbursements')}
            >
                Disburse
            </Button>
          )}

          <Button 
            variant="outline" 
            leftIcon={<Download size={18} />} 
            className="flex-1 md:flex-none border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
            onClick={handleDownloadStatement}
          >
            Statement
          </Button>

          {can(PERMISSIONS.LOANS.EDIT) && (loan.status === 'ACTIVE' || loan.status === 'active') && (
            <Button 
              variant="primary" 
              leftIcon={<Plus size={18} />} 
              className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 border-none"
              onClick={() => setIsPaymentModalOpen(true)}
            >
              Payment
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column - Key Metrics & Progress */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-none shadow-xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 overflow-hidden">
            <Card.Header className="pb-2 border-b border-slate-50 dark:border-slate-800/50">
              <Card.Title className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Repayment Progress</Card.Title>
            </Card.Header>
            <Card.Content className="pt-6 pb-8 space-y-8">
              <div className="flex flex-col items-center justify-center relative py-4">
                <svg className="w-40 h-40 transform -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="currentColor"
                    strokeWidth="10"
                    fill="transparent"
                    className="text-slate-100 dark:text-slate-800"
                  />
                  <motion.circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="currentColor"
                    strokeWidth="10"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 70}
                    initial={{ strokeDashoffset: 2 * Math.PI * 70 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 70 * (1 - repaymentPercentage / 100) }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="text-emerald-500"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-3xl font-black text-slate-900 dark:text-white leading-none">
                    {repaymentPercentage.toFixed(0)}%
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Repaid</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-500/10">
                  <p className="text-[10px] font-bold text-emerald-600/70 uppercase tracking-widest mb-1">Total Paid</p>
                  <p className="text-lg font-black text-emerald-600 leading-tight">{formatCurrency(totalPaid)}</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Remaining</p>
                  <p className="text-lg font-black text-slate-900 dark:text-white leading-tight">{formatCurrency(Math.max(0, remainingBalance))}</p>
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <div className="flex justify-between items-center group">
                  <span className="text-sm font-medium text-slate-500 group-hover:text-slate-700 transition-colors">Principal Amount</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{formatCurrency(principal)}</span>
                </div>
                <div className="flex justify-between items-center group">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium text-slate-500 group-hover:text-slate-700 transition-colors">Total Interest</span>
                    <Badge variant="secondary" className="text-[8px] px-1 py-0">{loan.interest_rate}%</Badge>
                  </div>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{formatCurrency(interest)}</span>
                </div>
                <div className="h-px bg-slate-100 dark:bg-slate-800 my-2" />
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">Total Repayable</span>
                  <span className="text-xl font-black text-emerald-600">{formatCurrency(totalRepayable)}</span>
                </div>
              </div>
            </Card.Content>
          </Card>

          <Card className="border-none shadow-xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900">
            <Card.Header className="pb-2 border-b border-slate-50 dark:border-slate-800/50">
              <Card.Title className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Loan Structure</Card.Title>
            </Card.Header>
            <Card.Content className="pt-6 space-y-6 pb-6">
              <div className="flex items-center gap-4 group">
                <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                  <Clock size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Loan Duration</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                    {loan.loan_term_months} {loan.loan_template?.term_unit || 'Months'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 group">
                <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
                  <Activity size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Repayment Frequency</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 capitalize">
                    {(() => {
                      if (loan.repayment_strategy === 'BULLET') return 'End of Term';
                      if (loan.repayment_frequency) return loan.repayment_frequency;
                      return 'Monthly';
                    })()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 group">
                <div className="w-11 h-11 rounded-2xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
                  <Calendar size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Start / Disbursement</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                    {formatDate(loan.start_date)}
                  </p>
                </div>
              </div>
            </Card.Content>
          </Card>
        </div>

        {/* Right Column - Tabbed Lists */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="border-none shadow-xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 overflow-hidden">
            <div className="flex items-center px-6 pt-2 overflow-x-auto no-scrollbar border-b border-slate-100 dark:border-slate-800">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-5 text-sm font-bold transition-all relative whitespace-nowrap ${
                    activeTab === tab.id 
                      ? 'text-emerald-600' 
                      : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                  }`}
                >
                  <span className={`${activeTab === tab.id ? 'opacity-100' : 'opacity-60'}`}>
                    {React.cloneElement(tab.icon, { size: 16 })}
                  </span>
                  {tab.label}
                  {activeTab === tab.id && (
                    <motion.div 
                      layoutId="activeTabLoan"
                      className="absolute bottom-0 left-6 right-6 h-1 bg-emerald-600 rounded-t-full"
                    />
                  )}
                </button>
              ))}
            </div>

            <Card.Content className="p-8">
              <AnimatePresence mode="wait">
                {activeTab === 'payments' && (
                  <motion.div
                    key="payments"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="space-y-4"
                  >
                    {loan.payments?.length > 0 ? (
                      <div className="overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-800">
                        <div className="hidden md:block">
                          <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50 dark:bg-slate-800/50">
                              <tr>
                                <th className="py-4 px-6 text-[10px] uppercase tracking-widest font-bold text-slate-400">Payment Date</th>
                                <th className="py-4 px-4 text-[10px] uppercase tracking-widest font-bold text-slate-400">Reference</th>
                                <th className="py-4 px-4 text-[10px] uppercase tracking-widest font-bold text-slate-400">Method</th>
                                <th className="py-4 px-6 text-[10px] uppercase tracking-widest font-bold text-slate-400 text-right">Amount</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                              {loan.payments.map((payment) => (
                                <tr key={payment.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                  <td className="py-4 px-6 text-sm font-medium text-slate-700 dark:text-slate-200">
                                    {formatDate(payment.payment_date || payment.created_at)}
                                  </td>
                                  <td className="py-4 px-4">
                                    <span className="text-xs font-mono font-bold text-slate-900 dark:text-white px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded uppercase">
                                      {payment.reference_number || 'N/A'}
                                    </span>
                                  </td>
                                  <td className="py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-tighter">
                                    {payment.payment_method?.replace(/_/g, ' ') || 'CASH'}
                                  </td>
                                  <td className="py-4 px-6 text-sm font-black text-emerald-600 text-right">
                                    {formatCurrency(payment.amount_paid)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Mobile Optimized Cards */}
                        <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
                          {loan.payments.map((payment) => (
                            <div key={payment.id} className="p-5 flex justify-between items-center">
                              <div>
                                <p className="text-sm font-bold text-slate-900 dark:text-white">{payment.reference_number || 'Ref N/A'}</p>
                                <p className="text-[10px] text-slate-500 mt-1 uppercase font-bold">{formatDate(payment.payment_date || payment.created_at)}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-black text-emerald-600">{formatCurrency(payment.amount_paid)}</p>
                                <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold">{payment.payment_method?.replace(/_/g, ' ')}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-300 mb-4">
                          <CreditCard size={32} />
                        </div>
                        <h3 className="text-slate-900 dark:text-white font-bold">No payments yet</h3>
                        <p className="text-slate-500 text-sm max-w-[240px] mt-2">When this customer makes a payment, it will appear here.</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === 'schedules' && (
                  <motion.div
                    key="schedules"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="space-y-4"
                  >
                    {loan.schedules?.length > 0 ? (
                      <div className="overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-800">
                        <div className="hidden md:block">
                          <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50 dark:bg-slate-800/50">
                              <tr>
                                <th className="py-4 px-6 text-[10px] uppercase tracking-widest font-bold text-slate-400">#</th>
                                <th className="py-4 px-4 text-[10px] uppercase tracking-widest font-bold text-slate-400">Due Date</th>
                                <th className="py-4 px-4 text-[10px] uppercase tracking-widest font-bold text-slate-400">Installment</th>
                                <th className="py-4 px-4 text-[10px] uppercase tracking-widest font-bold text-slate-400">Paid</th>
                                <th className="py-4 px-6 text-[10px] uppercase tracking-widest font-bold text-slate-400 text-right">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                              {loan.schedules.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                  <td className="py-4 px-6 text-xs font-black text-slate-400">{item.installment_number}</td>
                                  <td className="py-4 px-4 text-sm font-bold text-slate-700 dark:text-slate-200">
                                    {formatDate(item.due_date)}
                                  </td>
                                  <td className="py-4 px-4 text-sm font-black text-slate-900 dark:text-white">
                                    {formatCurrency(Number(item.principal_amount) + Number(item.interest_amount) + Number(item.fee_amount))}
                                  </td>
                                  <td className="py-4 px-4 text-sm font-bold text-emerald-600">
                                    {formatCurrency(Number(item.principal_paid) + Number(item.interest_paid) + Number(item.fee_paid))}
                                  </td>
                                  <td className="py-4 px-6 text-right">
                                    <Badge variant={item.status === 'paid' ? 'success' : item.status === 'overdue' ? 'danger' : 'secondary'} className="px-2 py-0.5 rounded uppercase text-[9px] tracking-tighter">
                                      {item.status}
                                    </Badge>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Mobile Optimized Schedules */}
                        <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
                          {loan.schedules.map((item) => (
                            <div key={item.id} className="p-5">
                              <div className="flex justify-between items-center mb-3">
                                <div className="flex items-center gap-2">
                                  <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-500">{item.installment_number}</span>
                                  <span className="text-sm font-bold text-slate-900 dark:text-white">{formatDate(item.due_date)}</span>
                                </div>
                                <Badge variant={item.status === 'paid' ? 'success' : item.status === 'overdue' ? 'danger' : 'secondary'} className="text-[9px]">
                                  {item.status}
                                </Badge>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Amount Due</p>
                                  <p className="text-sm font-black text-slate-900 dark:text-white">{formatCurrency(Number(item.principal_amount) + Number(item.interest_amount) + Number(item.fee_amount))}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-[9px] font-bold text-emerald-600/70 uppercase tracking-widest">Paid</p>
                                  <p className="text-sm font-black text-emerald-600">{formatCurrency(Number(item.principal_paid) + Number(item.interest_paid) + Number(item.fee_paid))}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-300 mb-4">
                          <Calendar size={32} />
                        </div>
                        <h3 className="text-slate-900 dark:text-white font-bold">No schedule generated</h3>
                        <p className="text-slate-500 text-sm max-w-[240px] mt-2">The repayment schedule will be available once the loan is finalized.</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === 'collaterals' && (
                  <motion.div
                    key="collaterals"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    {loan.collaterals?.length > 0 ? (
                      loan.collaterals.map((item) => (
                        <div key={item.id} className="p-6 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-none transition-all group bg-white dark:bg-slate-900">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-emerald-600 transition-colors">{item.name}</h4>
                            <Badge variant="secondary" className="text-[9px] px-2 py-0.5 uppercase tracking-widest">{item.pivot?.collateral_status || 'Linked'}</Badge>
                          </div>
                          <p className="text-xs text-slate-500 leading-relaxed mb-6">{item.description}</p>
                          <div className="flex justify-between items-center pt-4 border-t border-slate-50 dark:border-slate-800">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Market Valuation</span>
                            <span className="text-base font-black text-emerald-600">
                              {formatCurrency(item.pivot?.appraised_value || item.estimated_value)}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-2 flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-300 mb-4">
                          <Shield size={32} />
                        </div>
                        <h3 className="text-slate-900 dark:text-white font-bold">No collateral</h3>
                        <p className="text-slate-500 text-sm max-w-[240px] mt-2">This loan is unsecured or no assets have been linked yet.</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === 'documents' && (
                  <motion.div
                    key="documents"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    {loan.documents?.length > 0 ? (
                      loan.documents.map((doc) => (
                        <div key={doc.id} className="p-5 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between group hover:border-emerald-500/50 hover:bg-emerald-50/5 dark:hover:bg-emerald-500/5 transition-all cursor-pointer">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                              <FileText size={24} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[180px]">
                                {doc.file_name}
                              </p>
                              <p className="text-[10px] text-slate-500 flex items-center gap-2 mt-1 font-bold uppercase tracking-widest">
                                <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded uppercase">{doc.document_type?.replace(/_/g, ' ')}</span>
                                <span>{doc.file_size ? `${(doc.file_size / 1024).toFixed(1)} KB` : ''}</span>
                              </p>
                            </div>
                          </div>
                          <a 
                            href={`${import.meta.env.VITE_API_BASE_URL}/../storage/${doc.file_url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all opacity-0 group-hover:opacity-100"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Download size={20} />
                          </a>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-2 flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-300 mb-4">
                          <FileText size={32} />
                        </div>
                        <h3 className="text-slate-900 dark:text-white font-bold">No documents</h3>
                        <p className="text-slate-500 text-sm max-w-[240px] mt-2">No legal agreements or supporting documents found for this loan.</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </Card.Content>
          </Card>
        </div>
      </div>

      <RecordPaymentModal 
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        loanId={id}
        remainingBalance={remainingBalance}
        onSuccess={fetchLoanDetails}
      />
    </div>
  );
};

export default LoanDetails;
