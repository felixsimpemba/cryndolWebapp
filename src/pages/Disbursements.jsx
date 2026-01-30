import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, XCircle, DollarSign } from 'lucide-react';
import Header from '../components/layout/Header';
import Card from '../components/ui/Card';
import api from '../services/api';
import { formatCurrency, formatDate } from '../utils/formatters';
import toast from 'react-hot-toast';
import { useConfirmation } from '../context/ConfirmationContext';

const Disbursements = () => {
  const [disbursements, setDisbursements] = useState([]);
  const [loading, setLoading] = useState(true);
  const { confirm } = useConfirmation();

  useEffect(() => {
    fetchDisbursements();
  }, []);

  const fetchDisbursements = async () => {
    try {
      setLoading(true);
      const response = await api.get('/disbursements');
      setDisbursements(response.data.data.data || []); // Paginated response structure
    } catch (error) {
      console.error('Failed to fetch disbursements:', error);
      toast.error('Failed to load disbursements');
    } finally {
      setLoading(false);
    }
  };

  const handleProcess = async (id) => {
    const isConfirmed = await confirm({
      title: 'Process Disbursement',
      message: 'Process this disbursement manually?',
      confirmText: 'Process',
      type: 'info'
    });

    if (!isConfirmed) return;
    try {
      await api.post(`/disbursements/${id}/process`);
      toast.success('Disbursement processed');
      fetchDisbursements();
    } catch (error) {
      toast.error('Processing failed');
    }
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
    <div className="flex-1 overflow-y-auto custom-scrollbar">
      <Header title="Disbursements" />

      <div className="p-6">
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
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-white/10">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600 dark:text-gray-300">Reference</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600 dark:text-gray-300">Borrower</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600 dark:text-gray-300">Amount</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600 dark:text-gray-300">Method</th>
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
                          <td className="py-3 px-4 text-sm text-slate-500 font-mono">
                            {item.reference || '-'}
                          </td>
                          <td className="py-3 px-4 text-sm font-medium text-slate-900 dark:text-gray-200">
                            {item.loan?.borrower?.fullName || 'Unknown'}
                          </td>
                          <td className="py-3 px-4 text-sm font-semibold text-slate-900 dark:text-gray-100">
                            {formatCurrency(item.amount)}
                          </td>
                          <td className="py-3 px-4 text-sm text-slate-500 dark:text-gray-400">
                            {item.method}
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
                            {item.status === 'pending' && (
                              <button className="text-xs bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded hover:bg-emerald-500/20 transition-colors"
                                onClick={() => handleProcess(item.id)}
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
            )}
          </Card.Content>
        </Card>
      </div>
    </div>
  );
};

export default Disbursements;
