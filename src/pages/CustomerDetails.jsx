import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  User, Mail, Phone, MapPin, 
  FileText, History, DollarSign, 
  ShieldCheck, ArrowLeft, Download,
  ExternalLink, Calendar, CreditCard,
  Briefcase, Plus, Activity, TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

import Header from '../components/layout/Header';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import customerService from '../services/customer.service';
import { formatDate, formatCurrency, getLoanStatusColor } from '../utils/formatters';

const CustomerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('loans');

  useEffect(() => {
    fetchCustomerDetails();
  }, [id]);

  const fetchCustomerDetails = async () => {
    try {
      setLoading(true);
      const response = await customerService.getCustomer(id);
      setCustomer(response.data);
    } catch (error) {
      console.error('Failed to fetch customer details:', error);
      toast.error('Failed to load customer details');
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

  if (!customer) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Customer not found</h2>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/app/customers')}>
          Back to Customers
        </Button>
      </div>
    );
  }

  const CreditScoreGauge = ({ score }) => {
    // Assuming score is 0-100, if it's 300-850 we scale it
    const percentage = score > 100 ? ((score - 300) / (850 - 300)) * 100 : score;
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * (circumference / 2); // Half circle

    // Color based on percentage
    const getColor = (p) => {
      if (p >= 80) return '#10b981'; // Success/Green
      if (p >= 60) return '#f59e0b'; // Warning/Amber
      return '#ef4444'; // Error/Red
    };

    return (
      <div className="relative flex flex-col items-center">
        <svg className="w-32 h-20" viewBox="0 0 100 60">
          <path
            d="M 10 50 A 40 40 0 0 1 90 50"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="8"
            strokeLinecap="round"
            className="dark:stroke-slate-700"
          />
          <path
            d="M 10 50 A 40 40 0 0 1 90 50"
            fill="none"
            stroke={getColor(percentage)}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference / 2}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute top-8 text-center w-full">
          <span className="text-2xl font-bold text-slate-900 dark:text-white">{score}</span>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Credit Score</p>
        </div>
      </div>
    );
  };

  const tabs = [
    { id: 'loans', label: 'Loans', icon: <DollarSign size={18} /> },
    { id: 'documents', label: 'Documents', icon: <FileText size={18} /> },
    { id: 'history', label: 'Activity History', icon: <History size={18} /> },
    { id: 'details', label: 'KYC Details', icon: <ShieldCheck size={18} /> },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      {/* Page Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/app/customers')}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all group border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
          >
            <ArrowLeft size={20} className="text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                {customer.first_name} {customer.last_name}
              </h1>
              <Badge variant={customer.status === 'active' ? 'success' : 'secondary'} className="px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-bold">
                {customer.status || 'Active'}
              </Badge>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-0.5">
              Customer ID: <span className="font-mono text-xs">{customer.id.substring(0, 8).toUpperCase()}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            leftIcon={<Download size={18} />} 
            className="flex-1 md:flex-none border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Export
          </Button>
          <Button 
            variant="primary" 
            leftIcon={<Plus size={18} />} 
            className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 border-none"
            onClick={() => navigate('/app/loans/new', { state: { customerId: customer.id } })}
          >
            New Loan
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sidebar - Profile & Info */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="overflow-hidden border-none shadow-xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900">
            <div className="h-24 bg-gradient-to-r from-emerald-500 to-teal-600 relative">
              <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
                <div className="w-24 h-24 rounded-2xl bg-white dark:bg-slate-900 p-1 shadow-xl">
                  <div className="w-full h-full rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center text-emerald-600 text-3xl font-bold border border-emerald-100 dark:border-emerald-500/20">
                    {customer.first_name[0]}{customer.last_name ? customer.last_name[0] : ''}
                  </div>
                </div>
              </div>
            </div>
            
            <Card.Content className="pt-16 pb-8 text-center px-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {customer.first_name} {customer.last_name}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1">
                {customer.email}
              </p>

              <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800">
                <CreditScoreGauge score={customer.credit_score || 0} />
              </div>

              <div className="mt-8 space-y-5 text-left">
                <div className="flex items-center gap-4 group">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-emerald-500 transition-colors">
                    <Phone size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Phone Number</p>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{customer.phone || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 group">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-emerald-500 transition-colors">
                    <MapPin size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Resident Address</p>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">{customer.address || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 group">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-emerald-500 transition-colors">
                    <Briefcase size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Current Occupation</p>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{customer.occupation || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </Card.Content>
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-6">
          {/* Stats Overview Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-3 text-emerald-500/10 group-hover:scale-110 transition-transform">
                <DollarSign size={48} strokeWidth={1.5} />
              </div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest relative z-10">Total Borrowed</p>
              <div className="mt-2 flex items-baseline gap-1 relative z-10">
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {formatCurrency(customer.loans?.reduce((sum, l) => sum + Number(l.principal_amount), 0) || 0)}
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-3 text-blue-500/10 group-hover:scale-110 transition-transform">
                <Activity size={48} strokeWidth={1.5} />
              </div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest relative z-10">Active Loans</p>
              <div className="mt-2 flex items-baseline gap-1 relative z-10">
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {customer.loans?.filter(l => l.status === 'active' || l.status === 'ACTIVE').length || 0}
                </p>
                <span className="text-xs font-medium text-slate-500">units</span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-3 text-amber-500/10 group-hover:scale-110 transition-transform">
                <TrendingUp size={48} strokeWidth={1.5} />
              </div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest relative z-10">Total Repaid</p>
              <div className="mt-2 flex items-baseline gap-1 relative z-10">
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {formatCurrency(customer.loans?.reduce((sum, l) => sum + (Number(l.total_paid) || 0), 0) || 0)}
                </p>
              </div>
            </div>
          </div>

          {/* Detailed Content Card */}
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
                      layoutId="activeTabDetails"
                      className="absolute bottom-0 left-6 right-6 h-1 bg-emerald-600 rounded-t-full"
                    />
                  )}
                </button>
              ))}
            </div>

            <Card.Content className="p-8">
              <AnimatePresence mode="wait">
                {activeTab === 'loans' && (
                  <motion.div
                    key="loans"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="space-y-4"
                  >
                    {customer.loans?.length > 0 ? (
                      <div className="space-y-4">
                        <div className="hidden md:block overflow-hidden rounded-xl border border-slate-100 dark:border-slate-800">
                          <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50 dark:bg-slate-800/50">
                              <tr>
                                <th className="py-4 px-6 text-[10px] uppercase tracking-widest font-bold text-slate-400">Loan Reference</th>
                                <th className="py-4 px-4 text-[10px] uppercase tracking-widest font-bold text-slate-400">Principal</th>
                                <th className="py-4 px-4 text-[10px] uppercase tracking-widest font-bold text-slate-400">Balance</th>
                                <th className="py-4 px-4 text-[10px] uppercase tracking-widest font-bold text-slate-400">Status</th>
                                <th className="py-4 px-6 text-[10px] uppercase tracking-widest font-bold text-slate-400 text-right">Action</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                              {customer.loans.map((loan) => (
                                <tr key={loan.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                                  <td className="py-4 px-6">
                                    <div className="flex flex-col">
                                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                                        {loan.loan_number || `LN-${loan.id.substring(0, 8).toUpperCase()}`}
                                      </span>
                                      <span className="text-[10px] text-slate-500 font-medium">Applied {formatDate(loan.created_at)}</span>
                                    </div>
                                  </td>
                                  <td className="py-4 px-4 text-sm font-semibold text-slate-700 dark:text-slate-200">
                                    {formatCurrency(loan.principal_amount)}
                                  </td>
                                  <td className="py-4 px-4 text-sm font-bold text-emerald-600">
                                    {formatCurrency(Number(loan.principal_amount) - (Number(loan.total_paid) || 0))}
                                  </td>
                                  <td className="py-4 px-4">
                                    <Badge variant={getLoanStatusColor(loan.status)} className="rounded-md text-[9px] px-2 py-0.5 uppercase tracking-tighter">
                                      {loan.status}
                                    </Badge>
                                  </td>
                                  <td className="py-4 px-6 text-right">
                                    <Link 
                                      to={`/app/loans/${loan.id}`}
                                      className="p-2 inline-flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-all opacity-0 group-hover:opacity-100 shadow-sm"
                                    >
                                      <ExternalLink size={16} />
                                    </Link>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Mobile Optimized Cards */}
                        <div className="grid grid-cols-1 gap-4 md:hidden">
                          {customer.loans.map((loan) => (
                            <Link
                              to={`/app/loans/${loan.id}`}
                              key={loan.id}
                              className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 block shadow-sm"
                            >
                              <div className="flex justify-between items-start mb-4">
                                <div className="flex flex-col">
                                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                                    {loan.loan_number || `LN-${loan.id.substring(0, 8).toUpperCase()}`}
                                  </span>
                                  <span className="text-[10px] text-slate-500">{formatDate(loan.created_at)}</span>
                                </div>
                                <Badge variant={getLoanStatusColor(loan.status)} className="text-[10px]">
                                  {loan.status}
                                </Badge>
                              </div>
                              <div className="grid grid-cols-2 gap-4 text-xs">
                                <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                                  <p className="text-slate-500 mb-1">Principal</p>
                                  <p className="font-bold text-slate-900 dark:text-white">{formatCurrency(loan.principal_amount)}</p>
                                </div>
                                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl">
                                  <p className="text-emerald-600/70 mb-1">Balance</p>
                                  <p className="font-bold text-emerald-600">{formatCurrency(Number(loan.principal_amount) - (Number(loan.total_paid) || 0))}</p>
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-300 mb-4">
                          <DollarSign size={32} />
                        </div>
                        <h3 className="text-slate-900 dark:text-white font-bold">No loans found</h3>
                        <p className="text-slate-500 text-sm max-w-[200px] mt-1">This customer hasn't applied for any loans yet.</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === 'documents' && (
                  <motion.div
                    key="documents"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    {customer.documents?.length > 0 ? (
                      customer.documents.map((doc) => (
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
                                <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded uppercase">{doc.document_type?.replace('_', ' ')}</span>
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
                      <div className="col-span-2 flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-300 mb-4">
                          <FileText size={32} />
                        </div>
                        <h3 className="text-slate-900 dark:text-white font-bold">No documents</h3>
                        <p className="text-slate-500 text-sm max-w-[200px] mt-1">No identification or legal documents uploaded.</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === 'history' && (
                  <motion.div
                    key="history"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="space-y-6"
                  >
                    {customer.audit_logs?.length > 0 ? (
                      <div className="relative pl-8 space-y-8 before:content-[''] before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100 dark:before:bg-slate-800">
                        {customer.audit_logs.map((log) => (
                          <div key={log.id} className="relative">
                            <div className="absolute left-[-24px] top-1 w-4 h-4 rounded-full bg-white dark:bg-slate-900 border-[3px] border-emerald-500 z-10 shadow-sm shadow-emerald-500/20" />
                            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2">
                              <div>
                                <p className="text-sm font-bold text-slate-900 dark:text-white">
                                  {log.action?.replace(/_/g, ' ')}
                                </p>
                                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5 font-medium">
                                  <User size={12} className="text-slate-400" />
                                  Performed by <span className="text-slate-700 dark:text-slate-300">{log.user?.name || 'System'}</span>
                                </p>
                              </div>
                              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg w-fit">
                                <Calendar size={12} className="text-emerald-500" /> {formatDate(log.created_at)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-300 mb-4">
                          <History size={32} />
                        </div>
                        <h3 className="text-slate-900 dark:text-white font-bold">No activity</h3>
                        <p className="text-slate-500 text-sm max-w-[200px] mt-1">No recent system logs for this customer.</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === 'details' && (
                  <motion.div
                    key="details"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-8"
                  >
                    <div className="space-y-6">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-3">
                        <span className="w-8 h-[2px] bg-emerald-500 rounded-full" />
                        Personal Information
                      </h3>
                      <div className="space-y-1">
                        <DetailRow label="Full Name" value={`${customer.first_name} ${customer.last_name}`} />
                        <DetailRow label="National ID / NRC" value={customer.id_number} />
                        <DetailRow label="Gender" value={customer.gender} />
                        <DetailRow label="Date of Birth" value={formatDate(customer.date_of_birth)} />
                      </div>
                    </div>
                    <div className="space-y-6">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-3">
                        <span className="w-8 h-[2px] bg-blue-500 rounded-full" />
                        Tax & Compliance
                      </h3>
                      <div className="space-y-1">
                        <DetailRow label="Tax PIN (TPIN)" value={customer.tpin || 'Not Provided'} />
                        <DetailRow label="ID Type" value={customer.id_type} />
                        <DetailRow label="Customer Since" value={formatDate(customer.created_at)} />
                        <DetailRow label="Total Interactions" value={customer.audit_logs?.length || 0} />
                      </div>
                    </div>
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

const DetailRow = ({ label, value }) => (
  <div className="flex justify-between items-center py-4 border-b border-slate-50 dark:border-slate-800/50 last:border-0 group">
    <span className="text-sm font-medium text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">{label}</span>
    <span className="text-sm font-bold text-slate-900 dark:text-white">{value || '—'}</span>
  </div>
);

export default CustomerDetails;
