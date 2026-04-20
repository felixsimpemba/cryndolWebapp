import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, DollarSign, Calendar, Percent, AlertCircle, Info, Settings, ShieldCheck, Clock } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { handleApiError } from '../../utils/errorHandler';
import loanTemplateService from '../../services/loanTemplate.service';
import toast from 'react-hot-toast';

const LoanTemplateModal = ({ isOpen, onClose, template, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    interest_type: 'flat',
    interest_rate: '',
    min_amount: '',
    max_amount: '',
    term_unit: 'months',
    default_term: '',
    allow_custom_term: false,
    processing_fee_type: 'fixed',
    processing_fee_value: '0',
    late_penalty_type: 'fixed',
    late_penalty_value: '0',
    late_penalty_frequency: 'once',
    is_active: true
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name,
        description: template.description || '',
        interest_type: template.interest_type.toLowerCase() === 'flat' ? 'flat' : 'reducing_balance',
        interest_rate: template.interest_rate,
        min_amount: template.min_amount,
        max_amount: template.max_amount,
        term_unit: template.term_unit || 'months',
        default_term: template.default_term || '',
        allow_custom_term: !!template.allow_custom_term,
        processing_fee_type: template.processing_fee_type || 'fixed',
        processing_fee_value: template.processing_fee_value || '0',
        late_penalty_type: template.late_penalty_type || 'fixed',
        late_penalty_value: template.late_penalty_value || '0',
        late_penalty_frequency: template.late_penalty_frequency || 'once',
        is_active: !!template.is_active
      });
    } else {
      setFormData({
        name: '',
        description: '',
        interest_type: 'flat',
        interest_rate: '',
        min_amount: '',
        max_amount: '',
        term_unit: 'months',
        default_term: '',
        allow_custom_term: false,
        processing_fee_type: 'fixed',
        processing_fee_value: '0',
        late_penalty_type: 'fixed',
        late_penalty_value: '0',
        late_penalty_frequency: 'once',
        is_active: true
      });
    }
    setErrors({});
  }, [template, isOpen]);

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
      if (template) {
        await loanTemplateService.updateTemplate(template.id, formData);
        toast.success('Template updated successfully');
      } else {
        await loanTemplateService.createTemplate(formData);
        toast.success('Template created successfully');
      }

      onSuccess?.();
    } catch (error) {
      const { message, fieldErrors, isValidation } = handleApiError(error);
      if (isValidation) {
        setErrors(fieldErrors);
        toast.error('Please check the form for errors');
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
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 transition-opacity"
          />

          <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white dark:bg-slate-950 rounded-3xl w-full max-w-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-h-[90vh] flex flex-col pointer-events-auto overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800/60">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-xl">
                    <BookOpen size={24} className="text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                      {template ? 'Edit Loan Template' : 'Create Loan Template'}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Standardize your lending products and terms
                    </p>
                  </div>
                </div>
                <button 
                  onClick={onClose} 
                  className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-all text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Body */}
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-10">
                {/* Basic Section */}
                <div className="space-y-6">
                  <div className="flex items-center space-x-2 pb-2 border-b border-slate-100 dark:border-slate-800/40">
                    <Info size={16} className="text-emerald-500" />
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-tight">Basic Information</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-6">
                    <Input
                      label="Template Name"
                      name="name"
                      placeholder="e.g., Short Term Business Loan"
                      value={formData.name}
                      onChange={handleChange}
                      error={errors.name}
                      required
                    />
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Description</label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Briefly describe the purpose of this template..."
                        className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-slate-900 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                        rows="3"
                      />
                    </div>
                  </div>
                </div>

                {/* Terms Section */}
                <div className="space-y-6">
                  <div className="flex items-center space-x-2 pb-2 border-b border-slate-100 dark:border-slate-800/40">
                    <Clock size={16} className="text-emerald-500" />
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-tight">Financial Terms</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Interest Calculation</label>
                      <select
                        name="interest_type"
                        value={formData.interest_type}
                        onChange={handleChange}
                        className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 text-slate-900 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                      >
                        <option value="flat">Flat Interest Rate</option>
                        <option value="reducing_balance">Reducing Balance</option>
                      </select>
                    </div>
                    <Input
                      label="Interest Rate (%)"
                      name="interest_rate"
                      type="number"
                      step="0.01"
                      placeholder="5.00"
                      value={formData.interest_rate}
                      onChange={handleChange}
                      error={errors.interest_rate}
                      leftIcon={<Percent size={18} />}
                      required
                    />
                    <Input
                      label="Minimum Amount"
                      name="min_amount"
                      type="number"
                      placeholder="1,000"
                      value={formData.min_amount}
                      onChange={handleChange}
                      error={errors.min_amount}
                      leftIcon={<DollarSign size={18} />}
                      required
                    />
                    <Input
                      label="Maximum Amount"
                      name="max_amount"
                      type="number"
                      placeholder="50,000"
                      value={formData.max_amount}
                      onChange={handleChange}
                      error={errors.max_amount}
                      leftIcon={<DollarSign size={18} />}
                      required
                    />
                    <div className="space-y-1">
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Duration Unit</label>
                      <select
                        name="term_unit"
                        value={formData.term_unit}
                        onChange={handleChange}
                        className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 text-slate-900 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                      >
                        <option value="days">Days</option>
                        <option value="weeks">Weeks</option>
                        <option value="months">Months</option>
                        <option value="years">Years</option>
                      </select>
                    </div>
                    <Input
                      label="Default Duration"
                      name="default_term"
                      type="number"
                      placeholder="12"
                      value={formData.default_term}
                      onChange={handleChange}
                      error={errors.default_term}
                      required
                    />
                    <div className="md:col-span-2 bg-slate-50 dark:bg-slate-900/30 p-4 rounded-2xl flex items-center justify-between border border-dashed border-slate-200 dark:border-slate-800">
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">Customizable Terms</p>
                        <p className="text-xs text-slate-500">Allow loan officers to modify terms during loan creation</p>
                      </div>
                      <div className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ring-offset-2 focus:ring-2 focus:ring-emerald-500 bg-slate-200 dark:bg-slate-800">
                        <input
                          type="checkbox"
                          name="allow_custom_term"
                          checked={formData.allow_custom_term}
                          onChange={handleChange}
                          className="absolute h-full w-full opacity-0 cursor-pointer z-10"
                        />
                        <span 
                          className={`${formData.allow_custom_term ? 'translate-x-6 bg-emerald-500' : 'translate-x-1 bg-white dark:bg-slate-400'} inline-block h-4 w-4 transform rounded-full transition-transform duration-200 ease-in-out`} 
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Fees Section */}
                <div className="space-y-6">
                  <div className="flex items-center space-x-2 pb-2 border-b border-slate-100 dark:border-slate-800/40">
                    <ShieldCheck size={16} className="text-emerald-500" />
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-tight">Fees & Penalties</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Processing Fee Type</label>
                      <select
                        name="processing_fee_type"
                        value={formData.processing_fee_type}
                        onChange={handleChange}
                        className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 text-slate-900 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
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
                    <div className="space-y-1">
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Late Penalty Type</label>
                      <select
                        name="late_penalty_type"
                        value={formData.late_penalty_type}
                        onChange={handleChange}
                        className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 text-slate-900 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
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
                    <div className="space-y-1 md:col-span-2">
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Penalty Frequency</label>
                      <select
                        name="late_penalty_frequency"
                        value={formData.late_penalty_frequency}
                        onChange={handleChange}
                        className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 text-slate-900 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                      >
                        <option value="once">One-time charge</option>
                        <option value="daily">Daily accrual</option>
                        <option value="weekly">Weekly accrual</option>
                        <option value="monthly">Monthly accrual</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Status Toggle */}
                <div className="bg-emerald-500/5 dark:bg-emerald-500/10 p-5 rounded-2xl border border-emerald-500/20 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${formData.is_active ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'}`}>
                      <ShieldCheck size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">Active Status</p>
                      <p className="text-xs text-slate-500">Newly created loans will only be able to use active templates</p>
                    </div>
                  </div>
                  <div 
                    onClick={() => handleChange({ target: { name: 'is_active', type: 'checkbox', checked: !formData.is_active } })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full cursor-pointer transition-colors focus:outline-none ${formData.is_active ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800'}`}
                  >
                    <span 
                      className={`${formData.is_active ? 'translate-x-6 bg-white' : 'translate-x-1 bg-white dark:bg-slate-400'} inline-block h-4 w-4 transform rounded-full transition-transform duration-200 ease-in-out`} 
                    />
                  </div>
                </div>
              </form>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/30">
                <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
                  Discard
                </Button>
                <Button 
                  type="submit" 
                  variant="primary" 
                  isLoading={isLoading} 
                  onClick={handleSubmit}
                  className="px-8"
                >
                  {template ? 'Save Changes' : 'Create Template'}
                </Button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

// Internal BookOpen component for the icon if needed, or import from lucide-react
import { BookOpen } from 'lucide-react';

export default LoanTemplateModal;
