import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  User, Mail, Phone, MapPin, 
  FileText, History, DollarSign, 
  ShieldCheck, ArrowLeft, Download,
  ExternalLink, Calendar, CreditCard,
  Briefcase
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <button 
            onClick={() => navigate('/app/customers')}
            className="p-1.5 sm:p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors group"
          >
            <ArrowLeft size={20} className="text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-tight">
              {customer.first_name} {customer.last_name}
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <Badge variant={customer.status === 'active' ? 'success' : 'secondary'} className="text-[10px] sm:text-xs">
                {customer.status || 'Active'}
              </Badge>
              <span className="hidden sm:inline text-slate-300 dark:text-white/10">•</span>
              <span className="text-slate-500 dark:text-slate-400 text-[10px] sm:text-xs">ID: {customer.id.substring(0, 8)}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" leftIcon={<Download size={16} />} className="flex-1 sm:flex-none text-xs sm:text-sm py-2 sm:py-2.5">Export</Button>
          <Button variant="primary" leftIcon={<CreditCard size={16} />} className="flex-1 sm:flex-none text-xs sm:text-sm py-2 sm:py-2.5">Issue Loan</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-1">
          <Card.Content className="pt-6">
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white text-3xl font-bold mb-4 shadow-lg shadow-emerald-500/20">
                {customer.first_name[0]}{customer.last_name ? customer.last_name[0] : ''}
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {customer.first_name} {customer.last_name}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">{customer.email}</p>
              
              <CreditScoreGauge score={customer.credit_score || 0} />
            </div>

            <div className="mt-8 space-y-4 border-t border-slate-100 dark:border-white/5 pt-6">
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                  <Phone size={16} />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">Phone</p>
                  <p className="text-sm">{customer.phone || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                  <MapPin size={16} />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">Address</p>
                  <p className="text-sm">{customer.address || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                  <Briefcase size={16} />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">Occupation</p>
                  <p className="text-sm">{customer.occupation || 'N/A'}</p>
                </div>
              </div>
            </div>
          </Card.Content>
        </Card>

        {/* Dynamic Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-emerald-500/5 border-emerald-500/20">
              <Card.Content className="p-4">
                <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Total Borrowed</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                  {formatCurrency(customer.loans?.reduce((sum, l) => sum + Number(l.principal_amount), 0) || 0)}
                </p>
              </Card.Content>
            </Card>
            <Card className="bg-blue-500/5 border-blue-500/20">
              <Card.Content className="p-4">
                <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Active Loans</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                  {customer.loans?.filter(l => l.status === 'active').length || 0}
                </p>
              </Card.Content>
            </Card>
            <Card className="bg-amber-500/5 border-amber-500/20">
              <Card.Content className="p-4">
                <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Payments Made</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                  {formatCurrency(customer.loans?.reduce((sum, l) => sum + (Number(l.total_paid) || 0), 0) || 0)}
                </p>
              </Card.Content>
            </Card>
          </div>

          {/* Tabs Container */}
          <Card>
            <div className="border-b border-slate-100 dark:border-white/5 flex overflow-x-auto no-scrollbar">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all relative whitespace-nowrap ${
                    activeTab === tab.id 
                      ? 'text-emerald-500' 
                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                  {activeTab === tab.id && (
                    <motion.div 
                      layoutId="activeTabDetails"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500"
                    />
                  )}
                </button>
              ))}
            </div>

            <Card.Content className="p-6">
              <AnimatePresence mode="wait">
                {activeTab === 'loans' && (
                  <motion.div
                    key="loans"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    {customer.loans?.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="text-left text-xs uppercase tracking-wider text-slate-400 font-bold border-b border-slate-100 dark:border-white/5">
                              <th className="pb-3 px-2">Loan ID</th>
                              <th className="pb-3">Amout</th>
                              <th className="pb-3">Balance</th>
                              <th className="pb-3">Status</th>
                              <th className="pb-3 text-right">View</th>
                            </tr>
                          </thead>
                          <tbody>
                            {customer.loans.map((loan) => (
                              <tr key={loan.id} className="border-b border-slate-50 dark:border-white/5 hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors group">
                                <td className="py-4 px-2 text-sm font-medium text-slate-900 dark:text-white">
                                  {loan.loan_number || `LN-${loan.id.substring(0, 8)}`}
                                </td>
                                <td className="py-4 text-sm text-slate-600 dark:text-slate-300">
                                  {formatCurrency(loan.principal_amount)}
                                </td>
                                <td className="py-4 text-sm text-slate-600 dark:text-slate-300">
                                  {formatCurrency(Number(loan.principal_amount) - (Number(loan.total_paid) || 0))}
                                </td>
                                <td className="py-4">
                                  <Badge variant={getLoanStatusColor(loan.status)}>
                                    {loan.status}
                                  </Badge>
                                </td>
                                <td className="py-4 text-right px-2">
                                  <Link 
                                    to={`/app/loans/${loan.id}`}
                                    className="p-2 inline-flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-emerald-500 transition-all opacity-0 group-hover:opacity-100"
                                  >
                                    <ExternalLink size={16} />
                                  </Link>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-slate-500">
                        <p>No loans found for this customer.</p>
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
                    {customer.documents?.length > 0 ? (
                      customer.documents.map((doc) => (
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
                      <div className="col-span-2 text-center py-8 text-slate-500">
                        <p>No documents found.</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === 'history' && (
                  <motion.div
                    key="history"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    {customer.audit_logs?.length > 0 ? (
                      <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-px before:bg-slate-100 dark:before:bg-white/5">
                        {customer.audit_logs.map((log) => (
                          <div key={log.id} className="relative">
                            <div className="absolute left-[-21px] top-1.5 w-3 h-3 rounded-full bg-white dark:bg-slate-900 border-2 border-emerald-500 z-10" />
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                  {log.action}: Customer detail recorded
                                </p>
                                <p className="text-xs text-slate-500 mt-1">
                                  By {log.user?.name || 'System'}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-slate-400 flex items-center gap-1">
                                  <Calendar size={12} /> {formatDate(log.created_at)}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-slate-500">
                        <p>No activity history available.</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === 'details' && (
                  <motion.div
                    key="details"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                  >
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                        <User size={16} className="text-emerald-500" />
                        Personal Information
                      </h3>
                      <div className="space-y-3 bg-slate-50 dark:bg-slate-800/30 p-4 rounded-xl">
                        <DetailRow label="Full Name" value={`${customer.first_name} ${customer.last_name}`} />
                        <DetailRow label="NRC/ID" value={customer.id_number} />
                        <DetailRow label="Gender" value={customer.gender} />
                        <DetailRow label="Date of Birth" value={formatDate(customer.date_of_birth)} />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                        <ShieldCheck size={16} className="text-emerald-500" />
                        Tax & Compliance
                      </h3>
                      <div className="space-y-3 bg-slate-50 dark:bg-slate-800/30 p-4 rounded-xl">
                        <DetailRow label="TPIN" value={customer.tpin || 'Not Registered'} />
                        <DetailRow label="ID Type" value={customer.id_type} />
                        <DetailRow label="Joined" value={formatDate(customer.created_at)} />
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
  <div className="flex justify-between items-center text-sm border-b border-slate-200/50 dark:border-white/5 pb-2 last:border-0 last:pb-0">
    <span className="text-slate-500">{label}</span>
    <span className="font-medium text-slate-900 dark:text-white">{value || 'N/A'}</span>
  </div>
);

export default CustomerDetails;
