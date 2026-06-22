import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, DollarSign, CreditCard, FileText, CheckCircle } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ProcessDisbursementModal = ({ isOpen, onClose, disbursement, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    method: 'CASH',
    reference: ''
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.method) {
      setErrors({ method: 'Please select a payment method' });
      return;
    }

    setIsLoading(true);
    try {
      await api.post(`/disbursements/${disbursement.id}/process`, formData);
      toast.success('Disbursement processed successfully');
      onSuccess?.();
      onClose();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to process disbursement';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!disbursement) return null;

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[100]"
          />

          <div className="fixed inset-0 flex items-center justify-center z-[101] p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-slate-900 rounded-[2rem] w-full max-w-md border border-slate-100 dark:border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.2)] overflow-hidden pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 sm:p-8 border-b border-slate-50 dark:border-white/5">
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
                    Process Payout
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">Finalize loan fund disbursement</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2.5 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-all text-slate-400 hover:text-slate-600 dark:hover:text-gray-200"
                >
                  <X size={22} />
                </button>
              </div>

              <div className="p-6 sm:p-8 space-y-6">
                <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20">
                   <div className="flex justify-between items-center mb-1">
                      <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">Disbursement Amount</p>
                      <DollarSign size={16} className="text-blue-400" />
                   </div>
                   <p className="text-2xl font-black text-blue-700 dark:text-blue-300">
                      ${parseFloat(disbursement.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                   </p>
                   <p className="text-xs text-blue-500 mt-2 font-medium">
                      Borrower: {disbursement.loan?.customer ? `${disbursement.loan.customer.first_name} ${disbursement.loan.customer.last_name}` : disbursement.loan?.borrower_name || 'N/A'}
                   </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-gray-300">
                      Payment Method
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {['CASH', 'BANK_TRANSFER', 'MOBILE_MONEY', 'CHEQUE'].map((meth) => (
                        <button
                          key={meth}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, method: meth }))}
                          className={`flex items-center gap-2 p-3 rounded-xl border transition-all text-sm font-medium ${
                            formData.method === meth
                              ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                              : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-white/5 text-slate-600 dark:text-gray-400 hover:border-emerald-500/50'
                          }`}
                        >
                          <CreditCard size={16} />
                          {meth.replace('_', ' ')}
                        </button>
                      ))}
                    </div>
                    {errors.method && <p className="text-xs text-red-500 mt-1">{errors.method}</p>}
                  </div>

                  <Input
                    label="Transaction Reference (Optional)"
                    name="reference"
                    value={formData.reference}
                    onChange={handleChange}
                    placeholder="Ref # / Receipt #"
                    leftIcon={<FileText size={18} />}
                  />

                  <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-500 dark:text-gray-400 border border-slate-100 dark:border-white/5">
                    <CheckCircle size={16} className="text-emerald-500 shrink-0" />
                    <p>Processing this disbursement will mark the loan as <strong>ACTIVE</strong> and create accounting entries.</p>
                  </div>
                </form>
              </div>

              <div className="p-6 sm:p-8 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-white/5 flex items-center justify-between gap-4">
                <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading} className="flex-1">
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  variant="primary" 
                  isLoading={isLoading} 
                  onClick={handleSubmit}
                  className="flex-[2] bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/20"
                >
                  Confirm & Process
                </Button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ProcessDisbursementModal;
