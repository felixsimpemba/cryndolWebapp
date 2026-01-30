import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, DollarSign, Calendar, Percent, AlertCircle } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { handleApiError } from '../../utils/errorHandler';
import loanProductService from '../../services/loanProduct.service';
import toast from 'react-hot-toast';

const LoanProductModal = ({ isOpen, onClose, product, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    interest_type: 'flat',
    interest_rate: '',
    min_amount: '',
    max_amount: '',
    min_term: '',
    max_term: '',
    term_unit: 'months',
    repayment_frequency: 'monthly',
    grace_period: '0',
    processing_fee_type: 'fixed',
    processing_fee_value: '0',
    late_penalty_type: 'fixed',
    late_penalty_value: '0',
    is_active: true
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description || '',
        interest_type: product.interest_type,
        interest_rate: product.interest_rate,
        min_amount: product.min_amount,
        max_amount: product.max_amount,
        min_term: product.min_term,
        max_term: product.max_term,
        term_unit: product.term_unit,
        repayment_frequency: product.repayment_frequency,
        grace_period: product.grace_period,
        processing_fee_type: product.processing_fee_type,
        processing_fee_value: product.processing_fee_value,
        late_penalty_type: product.late_penalty_type,
        late_penalty_value: product.late_penalty_value,
        is_active: product.is_active
      });
    } else {
      // Reset defaults
      setFormData({
        name: '',
        description: '',
        interest_type: 'flat',
        interest_rate: '',
        min_amount: '',
        max_amount: '',
        min_term: '',
        max_term: '',
        term_unit: 'months',
        repayment_frequency: 'monthly',
        grace_period: '0',
        processing_fee_type: 'fixed',
        processing_fee_value: '0',
        late_penalty_type: 'fixed',
        late_penalty_value: '0',
        is_active: true
      });
    }
    setErrors({});
  }, [product, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (product) {
        await loanProductService.updateProduct(product.id, formData);
      } else {
        await loanProductService.createProduct(formData);
      }
      
      onSuccess?.();
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
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass rounded-2xl w-full max-w-2xl border border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-white/10 sticky top-0 bg-[#0f172a]/95 backdrop-blur z-10">
                <h2 className="text-2xl font-bold text-gray-100">
                  {product ? 'Edit Loan Product' : 'Create Loan Product'}
                </h2>
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-gray-200">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Basic Information</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <Input
                      label="Product Name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      error={errors.name}
                      required
                    />
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                        rows="2"
                      />
                    </div>
                  </div>
                </div>

                {/* Interest & Limits */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider border-t border-white/10 pt-4">Term & Interest</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Interest Type</label>
                      <select
                        name="interest_type"
                        value={formData.interest_type}
                        onChange={handleChange}
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-primary-500 outline-none"
                      >
                        <option value="flat">Flat Rate</option>
                        <option value="reducing_balance">Reducing Balance</option>
                        <option value="tiered">Tiered</option>
                      </select>
                    </div>
                    <Input
                      label="Interest Rate (%)"
                      name="interest_rate"
                      type="number"
                      step="0.01"
                      value={formData.interest_rate}
                      onChange={handleChange}
                      error={errors.interest_rate}
                      leftIcon={<Percent size={18} />}
                      required
                    />
                     <Input
                      label="Min Amount"
                      name="min_amount"
                      type="number"
                      value={formData.min_amount}
                      onChange={handleChange}
                      error={errors.min_amount}
                      required
                    />
                    <Input
                      label="Max Amount"
                      name="max_amount"
                      type="number"
                      value={formData.max_amount}
                      onChange={handleChange}
                      error={errors.max_amount}
                      required
                    />
                     <Input
                      label="Min Term"
                      name="min_term"
                      type="number"
                      value={formData.min_term}
                      onChange={handleChange}
                      error={errors.min_term}
                      required
                    />
                    <Input
                      label="Max Term"
                      name="max_term"
                      type="number"
                      value={formData.max_term}
                      onChange={handleChange}
                      error={errors.max_term}
                      required
                    />
                     <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Term Unit</label>
                      <select
                        name="term_unit"
                        value={formData.term_unit}
                        onChange={handleChange}
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-primary-500 outline-none"
                      >
                        <option value="days">Days</option>
                        <option value="weeks">Weeks</option>
                        <option value="months">Months</option>
                      </select>
                    </div>
                     <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Repayment Freq</label>
                      <select
                        name="repayment_frequency"
                        value={formData.repayment_frequency}
                        onChange={handleChange}
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-primary-500 outline-none"
                      >
                         <option value="weekly">Weekly</option>
                        <option value="bi_weekly">Bi-Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                  </div>
                </div>

                 {/* Fees */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider border-t border-white/10 pt-4">Fees & Penalties</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Process Fee Type</label>
                      <select
                        name="processing_fee_type"
                        value={formData.processing_fee_type}
                        onChange={handleChange}
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-primary-500 outline-none"
                      >
                        <option value="fixed">Fixed Amount</option>
                        <option value="percentage">Percentage</option>
                      </select>
                    </div>
                    <Input
                      label="Processing Fee Value"
                      name="processing_fee_value"
                      type="number"
                      step="0.01"
                      value={formData.processing_fee_value}
                      onChange={handleChange}
                      error={errors.processing_fee_value}
                    />
                     <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Penalty Type</label>
                      <select
                        name="late_penalty_type"
                        value={formData.late_penalty_type}
                        onChange={handleChange}
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-primary-500 outline-none"
                      >
                        <option value="fixed">Fixed Amount</option>
                        <option value="percentage">Percentage</option>
                      </select>
                    </div>
                    <Input
                      label="Late Penalty Value"
                      name="late_penalty_value"
                      type="number"
                      step="0.01"
                      value={formData.late_penalty_value}
                      onChange={handleChange}
                      error={errors.late_penalty_value}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-6 border-t border-white/10">
                  <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" isLoading={isLoading}>
                    {product ? 'Update Product' : 'Create Product'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default LoanProductModal;
