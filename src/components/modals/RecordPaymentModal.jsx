import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, DollarSign, Calendar, FileText, CreditCard } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import toast from 'react-hot-toast';
import { handleApiError } from '../../utils/errorHandler';
import loanService from '../../services/loan.service';

const RecordPaymentModal = ({ isOpen, onClose, loanId, remainingBalance, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount_paid: '',
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: 'CASH',
    reference_number: '',
    notes: ''
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount_paid || isNaN(formData.amount_paid) || Number(formData.amount_paid) <= 0) {
      setErrors({ amount_paid: 'Please enter a valid positive amount' });
      return;
    }
    
    if (Number(formData.amount_paid) > remainingBalance) {
      setErrors({ amount_paid: `Amount cannot exceed remaining balance of $${remainingBalance.toFixed(2)}` });
      return;
    }

    setIsLoading(true);
    try {
      await loanService.addPayment(loanId, formData);
      toast.success('Payment recorded successfully');
      setFormData({
        amount_paid: '',
        payment_date: new Date().toISOString().split('T')[0],
        payment_method: 'CASH',
        reference_number: '',
        notes: ''
      });
      onSuccess?.();
      onClose();
    } catch (error) {
      const { message, fieldErrors, isValidation } = handleApiError(error);
      if (isValidation) {
        setErrors(fieldErrors);
      } else {
        toast.error(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

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
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white dark:bg-slate-900 rounded-[2rem] w-full max-w-md border border-slate-100 dark:border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.2)] overflow-hidden pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 sm:p-8 border-b border-slate-50 dark:border-white/5">
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
                    Record Payment
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">Manual payment entry</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2.5 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-all text-slate-400 hover:text-slate-600 dark:hover:text-gray-200"
                >
                  <X size={22} />
                </button>
              </div>

              <div className="p-6 sm:p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <form onSubmit={handleSubmit} className="space-y-6">
                  
                  <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 text-center">
                    <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1">Remaining Balance</p>
                    <p className="text-2xl font-black text-emerald-700 dark:text-emerald-300">
                      ${Math.max(0, remainingBalance).toFixed(2)}
                    </p>
                  </div>

                  <Input
                    label="Amount Paid"
                    name="amount_paid"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.amount_paid}
                    onChange={handleChange}
                    error={errors.amount_paid}
                    leftIcon={<DollarSign size={18} />}
                    placeholder="0.00"
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700 dark:text-gray-300">Method</label>
                        <div className="relative">
                            <select
                                name="payment_method"
                                value={formData.payment_method}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white"
                            >
                                <option value="CASH">Cash</option>
                                <option value="BANK_TRANSFER">Bank Transfer</option>
                                <option value="MOBILE_MONEY">Mobile Money</option>
                                <option value="CHEQUE">Cheque</option>
                            </select>
                            <CreditCard size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        </div>
                    </div>
                    <Input
                      label="Payment Date"
                      name="payment_date"
                      type="date"
                      required
                      value={formData.payment_date}
                      onChange={handleChange}
                      error={errors.payment_date}
                    />
                  </div>

                  <Input
                    label="Reference Number (Optional)"
                    name="reference_number"
                    value={formData.reference_number}
                    onChange={handleChange}
                    error={errors.reference_number}
                    placeholder="Transaction ID / Receipt #"
                    leftIcon={<FileText size={18} />}
                  />

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-gray-300">Notes (Optional)</label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white resize-none"
                    />
                  </div>

                </form>
              </div>

              <div className="p-6 sm:p-8 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  variant="primary" 
                  isLoading={isLoading} 
                  onClick={handleSubmit}
                  className="bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 px-8"
                >
                  Record Payment
                </Button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default RecordPaymentModal;
