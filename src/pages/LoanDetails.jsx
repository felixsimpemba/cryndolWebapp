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

const LoanDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loan, setLoan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('payments');

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

  const totalPaid = Number(loan.total_paid || 0);
  const principal = Number(loan.principal_amount);
  const interest = Number(loan.interest_amount || (principal * (loan.interest_rate / 100)));
  const totalRepayable = principal + interest;
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
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <button 
            onClick={() => navigate('/app/loans')}
            className="p-1.5 sm:p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors group"
          >
            <ArrowLeft size={20} className="text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
          </button>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-tight truncate">
              {loan.loan_number || `LN-${loan.id.substring(0, 8)}`}
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <Badge variant={getLoanStatusColor(loan.status)} className="text-[10px] sm:text-xs">
                {loan.status}
              </Badge>
              <span className="hidden sm:inline text-slate-300 dark:text-white/10">|</span>
              <Link 
                to={`/app/customers/${loan.customer_id}`}
                className="text-emerald-500 hover:text-emerald-600 text-[11px] sm:text-sm font-medium flex items-center gap-1"
              >
                <User size={14} />
                <span className="truncate">{loan.customer?.first_name} {loan.customer?.last_name}</span>
              </Link>
            </div>
          </div>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" leftIcon={<Download size={16} />} className="flex-1 sm:flex-none text-xs sm:text-sm py-2 sm:py-2.5">Statement</Button>
          <Button variant="primary" leftIcon={<Plus size={16} />} className="flex-1 sm:flex-none text-xs sm:text-sm py-2 sm:py-2.5">Payment</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Financial Overview */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <Card.Header>
              <Card.Title className="text-sm font-bold uppercase tracking-wider text-slate-500">Repayment Progress</Card.Title>
            </Card.Header>
            <Card.Content className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Progress</span>
                  <span className="font-bold text-emerald-500">{repaymentPercentage.toFixed(1)}%</span>
                </div>
                <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${repaymentPercentage}%` }}
                    className="h-full bg-emerald-500"
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Paid</p>
                  <p className="text-lg font-bold text-emerald-500">{formatCurrency(totalPaid)}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Remaining</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">{formatCurrency(Math.max(0, remainingBalance))}</p>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-white/5">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Principal</span>
                  <span className="font-medium text-slate-900 dark:text-white">{formatCurrency(principal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Interest ({loan.interest_rate}%)</span>
                  <span className="font-medium text-slate-900 dark:text-white">{formatCurrency(interest)}</span>
                </div>
                <div className="flex justify-between text-base font-bold pt-2 border-t border-slate-100 dark:border-white/5">
                  <span className="text-slate-900 dark:text-white">Total Repayable</span>
                  <span className="text-emerald-500">{formatCurrency(totalRepayable)}</span>
                </div>
              </div>
            </Card.Content>
          </Card>

          <Card>
            <Card.Header>
              <Card.Title className="text-sm font-bold uppercase tracking-wider text-slate-500">Loan Info</Card.Title>
            </Card.Header>
            <Card.Content className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                  <Clock size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Term</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {loan.loan_term_months} {loan.loan_template?.term_unit || 'Months'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                  <Activity size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Frequency</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-white capitalize">
                    {loan.repayment_frequency || 'Monthly'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                  <Calendar size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Disbursement Date</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {formatDate(loan.start_date)}
                  </p>
                </div>
              </div>
            </Card.Content>
          </Card>
        </div>

        {/* Right Column - Tabs & Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="border-b border-slate-100 dark:border-white/5 flex">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all relative ${
                    activeTab === tab.id 
                      ? 'text-emerald-500' 
                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                  {activeTab === tab.id && (
                    <motion.div 
                      layoutId="activeTabLoan"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500"
                    />
                  )}
                </button>
              ))}
            </div>

            <Card.Content className="p-6">
              <AnimatePresence mode="wait">
                {activeTab === 'payments' && (
                  <motion.div
                    key="payments"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    {loan.payments?.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="text-left text-xs uppercase tracking-wider text-slate-400 font-bold border-b border-slate-100 dark:border-white/5">
                              <th className="pb-3 px-2">Date</th>
                              <th className="pb-3">Reference</th>
                              <th className="pb-3">Method</th>
                              <th className="pb-3 text-right">Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            {loan.payments.map((payment) => (
                              <tr key={payment.id} className="border-b border-slate-50 dark:border-white/5 hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                                <td className="py-4 px-2 text-sm text-slate-600 dark:text-slate-300">
                                  {formatDate(payment.payment_date || payment.created_at)}
                                </td>
                                <td className="py-4 text-sm font-medium text-slate-900 dark:text-white">
                                  {payment.reference_number || 'N/A'}
                                </td>
                                <td className="py-4 text-sm text-slate-500 capitalize">
                                  {payment.payment_method?.replace('_', ' ') || 'Cash'}
                                </td>
                                <td className="py-4 text-sm font-bold text-emerald-500 text-right px-2">
                                  {formatCurrency(payment.amount_paid)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-12 text-slate-500">
                        <p>No payments recorded yet.</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === 'schedules' && (
                  <motion.div
                    key="schedules"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    {loan.schedules?.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="text-left text-xs uppercase tracking-wider text-slate-400 font-bold border-b border-slate-100 dark:border-white/5">
                              <th className="pb-3 px-2">#</th>
                              <th className="pb-3">Due Date</th>
                              <th className="pb-3">Amount</th>
                              <th className="pb-3">Paid</th>
                              <th className="pb-3 text-right text-xs">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {loan.schedules.map((item, idx) => (
                              <tr key={item.id} className="border-b border-slate-50 dark:border-white/5 hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                                <td className="py-4 px-2 text-sm font-medium text-slate-400">{item.installment_number}</td>
                                <td className="py-4 text-sm text-slate-900 dark:text-white">
                                  {formatDate(item.due_date)}
                                </td>
                                <td className="py-4 text-sm font-bold text-slate-900 dark:text-white">
                                  {formatCurrency(Number(item.principal_amount) + Number(item.interest_amount) + Number(item.fee_amount))}
                                </td>
                                <td className="py-4 text-sm text-emerald-500 font-medium">
                                  {formatCurrency(Number(item.principal_paid) + Number(item.interest_paid) + Number(item.fee_paid))}
                                </td>
                                <td className="py-4 text-right px-2">
                                  <Badge variant={item.status === 'paid' ? 'success' : item.status === 'overdue' ? 'danger' : 'secondary'}>
                                    {item.status}
                                  </Badge>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-12 text-slate-500">
                        <p>Repayment schedule not generated yet.</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === 'collaterals' && (
                  <motion.div
                    key="collaterals"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    {loan.collaterals?.length > 0 ? (
                      loan.collaterals.map((item) => (
                        <div key={item.id} className="p-4 rounded-xl border border-slate-100 dark:border-white/5 hover:border-emerald-500/50 transition-all">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">{item.name}</h4>
                            <Badge variant="secondary">{item.pivot?.collateral_status || 'Linked'}</Badge>
                          </div>
                          <p className="text-xs text-slate-500 mb-3">{item.description}</p>
                          <div className="flex justify-between items-center text-sm pt-3 border-t border-slate-50 dark:border-white/5">
                            <span className="text-slate-400">Valuation</span>
                            <span className="font-bold text-emerald-500">
                              {formatCurrency(item.pivot?.appraised_value || item.estimated_value)}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-2 text-center py-12 text-slate-500">
                        <p>No collateral attached to this loan.</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === 'documents' && (
                  <motion.div
                    key="documents"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    {loan.documents?.length > 0 ? (
                      loan.documents.map((doc) => (
                        <div key={doc.id} className="p-4 rounded-xl border border-slate-100 dark:border-white/5 flex items-center justify-between group hover:border-emerald-500/50 transition-all">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                              <FileText size={20} />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-900 dark:text-white truncate max-w-[150px]">
                                {doc.file_name}
                              </p>
                              <p className="text-[10px] text-slate-400 flex items-center gap-1 uppercase font-bold tracking-wider">
                                {doc.document_type?.replace('_', ' ')} • {doc.file_size ? `${(doc.file_size / 1024).toFixed(1)} KB` : 'N/A'}
                              </p>
                            </div>
                          </div>
                          <a 
                            href={`${import.meta.env.VITE_API_BASE_URL}/../storage/${doc.file_url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-slate-400 hover:text-emerald-500 transition-colors opacity-0 group-hover:opacity-100"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Download size={18} />
                          </a>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-2 text-center py-12 text-slate-500">
                        <p>No documents found for this loan.</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </Card.Content>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LoanDetails;
