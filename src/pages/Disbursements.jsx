import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, XCircle, DollarSign } from 'lucide-react';
import Header from '../components/layout/Header';
import Card from '../components/ui/Card';
import api from '../services/api';
import { formatCurrency, formatDate } from '../utils/formatters';
import toast from 'react-hot-toast';
import { useConfirmation } from '../context/ConfirmationContext';
import ProcessDisbursementModal from '../components/modals/ProcessDisbursementModal';
import { usePermissions, PERMISSIONS } from '../utils/permissions';
import { DATE_PRESETS, getDateRangeFromPreset } from '../utils/datePresets';

const Disbursements = () => {
  const [disbursements, setDisbursements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);
  const [selectedDisbursement, setSelectedDisbursement] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    start_date: '',
    end_date: ''
  });
  const [preset, setPreset] = useState(DATE_PRESETS.ALL);

  const { confirm } = useConfirmation();
  const { can } = usePermissions();

  useEffect(() => {
    fetchDisbursements();
  }, []);

  const fetchDisbursements = async (currentFilters = filters) => {
    try {
      setLoading(true);
      const response = await api.get('/disbursements', { params: currentFilters });
      setDisbursements(response.data.data.data || []); // Paginated response structure
    } catch (error) {
      console.error('Failed to fetch disbursements:', error);
      toast.error('Failed to load disbursements');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handlePresetChange = (e) => {
    const val = e.target.value;
    setPreset(val);
    if (val !== DATE_PRESETS.CUSTOM) {
      const range = getDateRangeFromPreset(val);
      const newFilters = { ...filters, ...range };
      setFilters(newFilters);
      fetchDisbursements(newFilters);
    }
  };

  const applyFilters = () => {
    fetchDisbursements(filters);
  };

  const clearFilters = () => {
    const resetFilters = {
      search: '',
      status: '',
      start_date: '',
      end_date: ''
    };
    setFilters(resetFilters);
    setPreset(DATE_PRESETS.ALL);
    fetchDisbursements(resetFilters);
  };

  const handleProcessClick = (disbursement) => {
    setSelectedDisbursement(disbursement);
    setIsProcessModalOpen(true);
  };

  const handleProcessSuccess = () => {
    fetchDisbursements();
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'processed': return <CheckCircle className="text-emerald-500" size={18} />;
      case 'pending': return <Clock className="text-amber-500" size={18} />;
      case 'failed': return <XCircle className="text-red-500" size={18} />;
      default: return <Clock className="text-slate-400" size={18} />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Header title="Disbursements" />

      <div>
        <Card className="mb-6">
          <Card.Content className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
              <div className="space-y-1.5">
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

              <div className="space-y-1.5">
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
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status</label>
                <select 
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 transition-all outline-none"
                >
                  <option value="">All Statuses</option>
                  <option value="PENDING">Pending</option>
                  <option value="PROCESSED">Processed</option>
                  <option value="FAILED">Failed</option>
                </select>
              </div>
              <div className="flex gap-2">
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
            <Card.Title>Disbursement Queue</Card.Title>
            <Card.Description>Track and process loan payouts</Card.Description>
          </Card.Header>

          <Card.Content>
            {loading ? (
              <div className="py-12 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                <p className="mt-4 text-slate-600 dark:text-gray-400">Loading disbursements...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-white/10">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600 dark:text-gray-300">Borrower</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600 dark:text-gray-300">Amount</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600 dark:text-gray-300">Status</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600 dark:text-gray-300">Date</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-slate-600 dark:text-gray-300">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {disbursements.length > 0 ? (
                        disbursements.map((item, index) => (
                          <motion.tr
                            key={item.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                          >
                            <td className="py-3 px-4 text-sm font-medium text-slate-900 dark:text-gray-200">
                              {item.loan?.customer ? `${item.loan.customer.first_name} ${item.loan.customer.last_name}` : item.loan?.borrower_name || 'Unknown'}
                            </td>
                            <td className="py-3 px-4 text-sm font-semibold text-slate-900 dark:text-gray-100">
                              {formatCurrency(item.amount)}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                {getStatusIcon(item.status)}
                                <span className="text-sm capitalize text-slate-600 dark:text-gray-300">{item.status}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-sm text-slate-500 dark:text-gray-400">
                              {formatDate(item.created_at)}
                            </td>
                            <td className="py-3 px-4 text-right">
                               {can(PERMISSIONS.DISBURSEMENTS.PROCESS) && (item.status?.toLowerCase() === 'pending') && (
                                 <button className="text-xs bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded hover:bg-emerald-500/20 transition-colors"
                                  onClick={() => handleProcessClick(item)}
                                >
                                  Process
                                </button>
                              )}
                            </td>
                          </motion.tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="7" className="py-12 text-center text-slate-500">
                            No disbursements found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="grid grid-cols-1 gap-4 md:hidden">
                  {disbursements.length > 0 ? (
                    disbursements.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-white/5 space-y-3 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start">
                          <div className="font-medium text-slate-900 dark:text-white text-lg">
                            {item.loan?.customer ? `${item.loan.customer.first_name} ${item.loan.customer.last_name}` : item.loan?.borrower_name || 'Unknown'}
                          </div>
                          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700">
                            {getStatusIcon(item.status)}
                            <span className="text-xs capitalize text-slate-600 dark:text-gray-300 font-medium">{item.status}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-y-2 text-sm pt-2">
                          <div className="text-slate-500 dark:text-gray-400">Amount</div>
                          <div className="text-right text-slate-900 dark:text-gray-100 font-bold">{formatCurrency(item.amount)}</div>
                          
                          <div className="text-slate-500 dark:text-gray-400">Date</div>
                          <div className="text-right text-slate-700 dark:text-gray-300">{formatDate(item.created_at)}</div>
                        </div>

                        {can(PERMISSIONS.DISBURSEMENTS.PROCESS) && item.status?.toLowerCase() === 'pending' && (
                          <div className="pt-3 border-t border-slate-50 dark:border-white/5 flex justify-end">
                            <button className="text-sm font-medium bg-emerald-500/10 text-emerald-600 px-4 py-2 rounded-lg hover:bg-emerald-500/20 transition-colors w-full sm:w-auto"
                              onClick={() => handleProcessClick(item)}
                            >
                              Process Disbursement
                            </button>
                          </div>
                        )}
                      </motion.div>
                    ))
                  ) : (
                    <div className="py-12 text-center text-slate-500 border border-slate-100 dark:border-white/5 rounded-xl">
                      No disbursements found.
                    </div>
                  )}
                </div>
              </div>
            )}
          </Card.Content>
        </Card>
      </div>

      <ProcessDisbursementModal 
        isOpen={isProcessModalOpen}
        onClose={() => setIsProcessModalOpen(false)}
        disbursement={selectedDisbursement}
        onSuccess={handleProcessSuccess}
      />
    </div>
  );
};

export default Disbursements;
