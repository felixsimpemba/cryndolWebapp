import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, DollarSign, Percent, AlertCircle, Info,
  ShieldCheck, BookOpen, Zap, TrendingDown
} from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { handleApiError } from '../../utils/errorHandler';
import loanTemplateService from '../../services/loanTemplate.service';
import toast from 'react-hot-toast';

// ─── Default form states ──────────────────────────────────────────────────────

const flatRateDefaults = (t) => ({
  rate_per_day:          t?.rate_per_day    ?? '',
  rate_per_week:         t?.rate_per_week   ?? '',
  rate_per_2weeks:       t?.rate_per_2weeks ?? '',
  rate_per_3weeks:       t?.rate_per_3weeks ?? '',
  rate_per_month:        t?.rate_per_month  ?? '',
  min_amount:            t?.min_amount      ?? '',
  max_amount:            t?.max_amount      ?? '',
  description:           t?.description     ?? '',
  processing_fee_type:   t?.processing_fee_type   ?? 'fixed',
  processing_fee_value:  t?.processing_fee_value  ?? '0',
  late_penalty_type:     t?.late_penalty_type     ?? 'fixed',
  late_penalty_value:    t?.late_penalty_value    ?? '0',
  late_penalty_frequency:t?.late_penalty_frequency ?? 'once',
  is_active:             t?.is_active !== undefined ? !!t.is_active : true,
});

const smartLoanDefaults = (t) => ({
  interest_rate:         t?.interest_rate   ?? '',
  min_amount:            t?.min_amount      ?? '',
  max_amount:            t?.max_amount      ?? '',
  description:           t?.description     ?? '',
  processing_fee_type:   t?.processing_fee_type   ?? 'fixed',
  processing_fee_value:  t?.processing_fee_value  ?? '0',
  late_penalty_type:     t?.late_penalty_type     ?? 'fixed',
  late_penalty_value:    t?.late_penalty_value    ?? '0',
  late_penalty_frequency:t?.late_penalty_frequency ?? 'once',
  is_active:             t?.is_active !== undefined ? !!t.is_active : true,
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SectionHeader = ({ icon: Icon, label }) => (
  <div className="flex items-center space-x-2 pb-2 border-b border-slate-100 dark:border-slate-800/40">
    <Icon size={16} className="text-emerald-500" />
    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-tight">{label}</h3>
  </div>
);

const Toggle = ({ checked, onChange, label, description }) => (
  <div 
    onClick={onChange}
    className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${checked ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-slate-50 dark:bg-slate-900/30 border-dashed border-slate-200 dark:border-slate-800'}`}
  >
    <div>
      <p className="text-sm font-bold text-slate-900 dark:text-white">{label}</p>
      {description && <p className="text-xs text-slate-500">{description}</p>}
    </div>
    <div
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`}
    >
      <span className={`${checked ? 'translate-x-6 bg-white' : 'translate-x-1 bg-white dark:bg-slate-400'} inline-block h-4 w-4 transform rounded-full transition-transform duration-200`} />
    </div>
  </div>
);

// ─── Component ────────────────────────────────────────────────────────────────

const LoanTemplateModal = ({ isOpen, onClose, template, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData]   = useState({});
  const [errors, setErrors]       = useState({});

  const isFlatRate  = template?.template_type === 'flat_rate';
  const isSmartLoan = template?.template_type === 'smart_loan';

  useEffect(() => {
    if (template) {
      setFormData(isFlatRate ? flatRateDefaults(template) : smartLoanDefaults(template));
    }
    setErrors({});
  }, [template, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const toggleActive = () => {
    setFormData(prev => ({ ...prev, is_active: !prev.is_active }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await loanTemplateService.configureTemplate(template.id, formData);
      toast.success('Template saved successfully');
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

  if (!template) return null;

  const selectClass = "w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 text-slate-900 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all";


  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50"
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
              {/* ── Header ── */}
              <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800/60">
                <div className="flex items-center space-x-3">
                  <div className={`p-2.5 rounded-xl ${isFlatRate ? 'bg-amber-500/10' : 'bg-blue-500/10'}`}>
                    {isFlatRate
                      ? <Zap size={24} className="text-amber-500" />
                      : <TrendingDown size={24} className="text-blue-500" />
                    }
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                      Configure {template.name}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {isFlatRate ? 'Set interest rates per period and limits' : 'Set annual interest rate and loan limits'}
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

              {/* ── Body ── */}
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-10">

                {/* ── Active Status ── */}
                <Toggle
                  checked={formData.is_active}
                  onChange={toggleActive}
                  label="Template Active"
                  description="Loan officers can only use active templates when creating loans"
                />

                {/* ── Description ── */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Description</label>
                  <textarea
                    name="description"
                    value={formData.description || ''}
                    onChange={handleChange}
                    rows={2}
                    className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-slate-900 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all placeholder:text-slate-400 text-sm"
                    placeholder="Brief description of this loan product..."
                  />
                </div>

                {/* ── Interest Rates ── */}
                <div className="space-y-6">
                  <SectionHeader icon={Percent} label={isFlatRate ? 'Interest Rates (% per period)' : 'Interest Rate'} />

                  {isFlatRate ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {[
                        { key: 'rate_per_day',    label: 'Rate per Day',      placeholder: '2.5' },
                        { key: 'rate_per_week',   label: 'Rate per Week',     placeholder: '5.0' },
                        { key: 'rate_per_2weeks', label: 'Rate per 2 Weeks',  placeholder: '8.0' },
                        { key: 'rate_per_3weeks', label: 'Rate per 3 Weeks',  placeholder: '10.0' },
                        { key: 'rate_per_month',  label: 'Rate per Month',    placeholder: '15.0' },
                      ].map(({ key, label, placeholder }) => (
                        <Input
                          key={key}
                          label={label}
                          name={key}
                          type="number"
                          step="0.0001"
                          placeholder={placeholder}
                          value={formData[key] ?? ''}
                          onChange={handleChange}
                          error={errors[key]}
                          leftIcon={<Percent size={18} />}
                        />
                      ))}

                      {/* Info note */}
                      <div className="sm:col-span-2 flex items-start gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-500/5 border border-amber-100 dark:border-amber-500/10">
                        <Info size={16} className="text-amber-500 mt-0.5 shrink-0" />
                        <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                          These are flat rates applied once per period. For example, 5% per week on ZMW 1,000 = ZMW 50 interest per week.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Input
                        label="Annual Interest Rate (%)"
                        name="interest_rate"
                        type="number"
                        step="0.01"
                        placeholder="24.00"
                        value={formData.interest_rate ?? ''}
                        onChange={handleChange}
                        error={errors.interest_rate}
                        leftIcon={<Percent size={18} />}
                      />
                      <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-500/10">
                        <Info size={16} className="text-blue-500 mt-0.5 shrink-0" />
                        <p className="text-xs text-blue-700 dark:text-blue-400 leading-relaxed">
                          This is the annual interest rate. Monthly rate = Annual ÷ 12. The system generates a full amortization schedule using the standard PMT formula — just like a bank.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* ── Loan Limits ── */}
                <div className="space-y-6">
                  <SectionHeader icon={DollarSign} label="Loan Limits" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <Input
                      label="Minimum Amount"
                      name="min_amount"
                      type="number"
                      placeholder="1,000"
                      value={formData.min_amount ?? ''}
                      onChange={handleChange}
                      error={errors.min_amount}
                      leftIcon={<DollarSign size={18} />}
                    />
                    <Input
                      label="Maximum Amount"
                      name="max_amount"
                      type="number"
                      placeholder="100,000"
                      value={formData.max_amount ?? ''}
                      onChange={handleChange}
                      error={errors.max_amount}
                      leftIcon={<DollarSign size={18} />}
                    />
                  </div>
                </div>

                {/* ── Fees & Penalties ── */}
                <div className="space-y-6">
                  <SectionHeader icon={ShieldCheck} label="Fees & Penalties" />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1">
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Processing Fee Type</label>
                      <select
                        name="processing_fee_type"
                        value={formData.processing_fee_type ?? 'fixed'}
                        onChange={handleChange}
                        className={selectClass}
                      >
                        <option value="fixed">Fixed Amount</option>
                        <option value="percentage">Percentage of Principal</option>
                      </select>
                    </div>
                    <Input
                      label={`Processing Fee ${formData.processing_fee_type === 'percentage' ? '(%)' : '(Amount)'}`}
                      name="processing_fee_value"
                      type="number"
                      step="0.01"
                      value={formData.processing_fee_value ?? '0'}
                      onChange={handleChange}
                      error={errors.processing_fee_value}
                      leftIcon={formData.processing_fee_type === 'percentage' ? <Percent size={18} /> : <DollarSign size={18} />}
                    />

                    <div className="space-y-1">
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Late Penalty Type</label>
                      <select
                        name="late_penalty_type"
                        value={formData.late_penalty_type ?? 'fixed'}
                        onChange={handleChange}
                        className={selectClass}
                      >
                        <option value="fixed">Fixed Amount</option>
                        <option value="percentage">Percentage of Balance</option>
                      </select>
                    </div>
                    <Input
                      label={`Late Penalty ${formData.late_penalty_type === 'percentage' ? '(%)' : '(Amount)'}`}
                      name="late_penalty_value"
                      type="number"
                      step="0.01"
                      value={formData.late_penalty_value ?? '0'}
                      onChange={handleChange}
                      error={errors.late_penalty_value}
                      leftIcon={formData.late_penalty_type === 'percentage' ? <Percent size={18} /> : <DollarSign size={18} />}
                    />

                    <div className="space-y-1 sm:col-span-2">
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Penalty Frequency</label>
                      <select
                        name="late_penalty_frequency"
                        value={formData.late_penalty_frequency ?? 'once'}
                        onChange={handleChange}
                        className={selectClass}
                      >
                        <option value="once">One-time charge</option>
                        <option value="daily">Daily accrual</option>
                        <option value="weekly">Weekly accrual</option>
                        <option value="monthly">Monthly accrual</option>
                      </select>
                    </div>
                  </div>
                </div>

              </form>

              {/* ── Footer ── */}
              <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/30">
                <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isLoading}
                  onClick={handleSubmit}
                  className="px-8"
                >
                  Save Configuration
                </Button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default LoanTemplateModal;
