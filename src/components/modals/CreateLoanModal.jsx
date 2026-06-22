import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, DollarSign, Calendar, Percent, User, Package, PlusCircle, 
  Camera, Trash2, ChevronRight, Check, Shield, 
  Info, Wallet, Clock
} from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import SearchableSelect from '../ui/SearchableSelect';
import { handleApiError } from '../../utils/errorHandler';
import loanService from '../../services/loan.service';
import customerService from '../../services/customer.service';
import loanTemplateService from '../../services/loanTemplate.service';
import CustomerModal from './CustomerModal';
import toast from 'react-hot-toast';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { cn } from '../../utils/cn';
import { 
  calculateFlatTotalInterest,
  calculateFlatTotalRepayment,
  calculateFlatInstallment,
  generateFlatSchedule,
  calculateSmartLoanPMT,
  calculateSmartLoanTotalInterest,
  calculateSmartLoanTotalRepayment,
  generateSmartLoanSchedule,
  PERIOD_LABELS,
  VARIABLE_TERM_PERIODS
} from '../../utils/calculations';

const CreateLoanModal = ({ isOpen, onClose, onSuccess }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [loanTemplates, setLoanTemplates] = useState([]);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    customer_id: '',
    loan_template_id: '',
    principal_amount: '',
    interest_rate: '',
    interest_type: 'FLAT',
    repayment_strategy: 'INSTALLMENTS',
    rate_period: 'month', // Default for flat_rate
    loan_term_months: '',
    term_unit: 'months',
    start_date: new Date().toISOString().split('T')[0],
    status: 'pending',
    collateral_name: '',
    collateral_description: '',
    collateral_photos: []
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      fetchCustomers();
      fetchLoanTemplates();
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setCurrentStep(1);
    setFormData({
      customer_id: '',
      loan_template_id: '',
      principal_amount: '',
      interest_rate: '',
      interest_type: 'FLAT',
      repayment_strategy: 'INSTALLMENTS',
      loan_term_months: '',
      term_unit: 'months',
      start_date: new Date().toISOString().split('T')[0],
      status: 'pending',
      collateral_name: '',
      collateral_description: '',
      collateral_photos: []
    });
    setErrors({});
  };

  const fetchCustomers = async () => {
    try {
      const response = await customerService.getCustomers({ per_page: 100 });
      if (response?.data?.data && Array.isArray(response.data.data)) {
        setCustomers(response.data.data);
      } else if (Array.isArray(response?.data)) {
        setCustomers(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch customers:', error);
    }
  };

  const fetchLoanTemplates = async () => {
    try {
      const response = await loanTemplateService.getTemplates();
      if (response.data && Array.isArray(response.data.data)) {
        setLoanTemplates(response.data.data);
      } else if (Array.isArray(response.data)) {
        setLoanTemplates(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch loan templates:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    updateFormData(name, value);
  };

  const updateFormData = (name, value) => {
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };

      if (name === 'loan_template_id') {
        const template = loanTemplates.find(p => String(p.id) === String(value));
        if (template) {
          if (template.template_type === 'flat_rate') {
            newData.interest_type = 'FLAT';
            newData.rate_period = 'month';
            newData.interest_rate = template.rate_per_month || '';
            newData.loan_term_months = '1';
            newData.term_unit = 'month';
          } else if (template.template_type === 'smart_loan') {
            newData.interest_type = 'REDUCING';
            newData.interest_rate = template.interest_rate || '';
            newData.loan_term_months = '12';
            newData.term_unit = 'months';
          }
          newData.repayment_strategy = 'INSTALLMENTS';
        }
      }

      // If rate_period changes on a flat rate loan, update the rate and term rules
      if (name === 'rate_period' && prev.interest_type === 'FLAT') {
        const template = loanTemplates.find(p => String(p.id) === String(prev.loan_template_id));
        if (template) {
          const rateKey = {
            'day': 'rate_per_day',
            'week': 'rate_per_week',
            'biweekly': 'rate_per_2weeks',
            'triweekly': 'rate_per_3weeks',
            'month': 'rate_per_month'
          }[value];
          newData.interest_rate = template[rateKey] || '';
          
          if (!VARIABLE_TERM_PERIODS.includes(value)) {
            newData.loan_term_months = '1';
            newData.term_unit = value;
          } else {
            newData.term_unit = value === 'day' ? 'day' : 'month';
          }
        }
      }

      return newData;
    });

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => setCurrentStep(prev => prev - 1);

  const validateStep = (step) => {
    const newErrors = {};
    if (step === 1 && !formData.customer_id) newErrors.customer_id = 'Please select a borrower';
    
    if (step === 2) {
      if (!formData.principal_amount) newErrors.principal_amount = 'Required';
      if (!formData.interest_rate) newErrors.interest_rate = 'Required';
      if (!formData.loan_term_months) newErrors.loan_term_months = 'Required';
      if (!formData.start_date) newErrors.start_date = 'Required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(currentStep)) return;
    
    setIsLoading(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'collateral_photos') {
          formData.collateral_photos.forEach(file => {
            data.append('collateral_photos[]', file);
          });
        } else if (key === 'status') {
          data.append('status', formData.status.toUpperCase());
        } else {
          data.append(key, formData[key]);
        }
      });

      // Add maturity_date from projections
      if (loanProjections.maturityDate) {
        data.append('maturity_date', loanProjections.maturityDate.toISOString().split('T')[0]);
      }

      // Add derived fields for backend
      if (formData.interest_type === 'FLAT') {
        const freqMap = { 'day': 'DAILY', 'week': 'WEEKLY', 'biweekly': 'BIWEEKLY', 'triweekly': 'TRIWEEKLY', 'month': 'MONTHLY' };
        data.append('repayment_frequency', freqMap[formData.rate_period] || 'MONTHLY');
      } else {
        data.append('repayment_frequency', 'MONTHLY');
        data.append('repayment_strategy', 'INSTALLMENTS');
      }

      await loanService.createLoan(data);
      toast.success('Loan created successfully');
      onSuccess?.();
      onClose();
    } catch (error) {
      const { message, fieldErrors, isValidation } = handleApiError(error);
      if (isValidation) {
        setErrors(fieldErrors);
        toast.error('Please check for errors in the form');
      } else {
        toast.error(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loanProjections = useMemo(() => {
    const principal = parseFloat(formData.principal_amount) || 0;
    const rate      = parseFloat(formData.interest_rate) || 0;
    const term      = parseFloat(formData.loan_term_months) || 0;
    const { interest_type, rate_period, start_date } = formData;
    
    let totalInterest = 0;
    let totalRepayment = 0;
    let installment = 0;
    let schedule = [];

    if (interest_type === 'FLAT') {
      totalInterest  = calculateFlatTotalInterest(principal, rate, term);
      totalRepayment = calculateFlatTotalRepayment(principal, rate, term);
      installment    = calculateFlatInstallment(principal, rate, term);
      schedule       = generateFlatSchedule(principal, rate, term, rate_period, start_date);
    } else {
      // REDUCING / Smart Loan
      totalInterest  = calculateSmartLoanTotalInterest(principal, rate, term);
      totalRepayment = calculateSmartLoanTotalRepayment(principal, rate, term);
      installment    = calculateSmartLoanPMT(principal, rate, term);
      schedule       = generateSmartLoanSchedule(principal, rate, term, start_date);
    }

    return {
      totalInterest,
      totalRepayment,
      installment,
      schedule,
      maturityDate: schedule.length > 0 ? schedule[schedule.length - 1].scheduledDate : null
    };
  }, [formData.principal_amount, formData.interest_rate, formData.loan_term_months, formData.rate_period, formData.start_date, formData.interest_type]);

  const customerOptions = customers.map(c => ({
    value: c.id,
    label: `${c.first_name} ${c.last_name}`,
    subLabel: c.phone || c.email
  }));

  const templateOptions = loanTemplates.filter(t => t.is_active).map(t => ({
    value: t.id,
    label: t.name,
    subLabel: t.template_type === 'flat_rate' 
      ? `Flat Rate · Multiple Periods` 
      : `${t.interest_rate}% Annual · Smart Loan`
  }));

  const renderStepIndicator = () => (
    <div className="flex items-center justify-between mb-8 px-2">
      {[1, 2, 3, 4].map((step) => (
        <React.Fragment key={step}>
          <div className="flex flex-col items-center">
            <div 
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border-2",
                currentStep === step 
                  ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/30" 
                  : currentStep > step
                  ? "bg-emerald-500/10 border-emerald-500 text-emerald-500"
                  : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400"
              )}
            >
              {currentStep > step ? <Check size={18} strokeWidth={3} /> : step}
            </div>
            <span className={cn(
              "text-[10px] sm:text-xs mt-2 font-medium uppercase tracking-wider",
              currentStep === step ? "text-emerald-500" : "text-slate-400"
            )}>
              {step === 1 && "Borrower"}
              {step === 2 && "Terms"}
              {step === 3 && "Collateral"}
              {step === 4 && "Review"}
            </span>
          </div>
          {step < 4 && (
            <div className={cn(
              "flex-1 h-0.5 mx-2 rounded-full transition-all duration-500",
              currentStep > step ? "bg-emerald-500" : "bg-slate-100 dark:bg-slate-800"
            )} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

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
              className="bg-white dark:bg-slate-900 rounded-[2rem] w-full max-w-2xl border border-slate-100 dark:border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.2)] pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 sm:p-8 border-b border-slate-50 dark:border-white/5">
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
                    Create New Loan
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">
                    Step {currentStep} of 4: {currentStep === 1 ? "Select the borrower" : currentStep === 2 ? "Set loan terms" : currentStep === 3 ? "Collateral info" : "Final review"}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2.5 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-all text-slate-400 hover:text-slate-600 dark:hover:text-gray-200"
                >
                  <X size={22} />
                </button>
              </div>

              <div className="p-6 sm:p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                {renderStepIndicator()}

                <form className="space-y-6">
                  {currentStep === 1 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-6"
                    >
                      <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-500/10 flex items-start gap-4">
                        <div className="p-2 bg-emerald-500 rounded-lg text-white">
                          <User size={20} />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-400">Borrower Selection</h4>
                          <p className="text-xs text-emerald-700 dark:text-emerald-500/80 mt-0.5">Select an existing borrower or create a new one to start the application.</p>
                        </div>
                      </div>

                      <SearchableSelect
                        label="Borrower"
                        placeholder="Search for a borrower..."
                        options={customerOptions}
                        value={formData.customer_id}
                        onChange={(val) => updateFormData('customer_id', val)}
                        error={errors.customer_id}
                        required
                        leftIcon={<User size={18} />}
                      />

                      <div className="flex justify-center">
                        <button
                          type="button"
                          onClick={() => setIsCustomerModalOpen(true)}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
                        >
                          <PlusCircle size={16} className="text-emerald-500" />
                          Register New Borrower
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {currentStep === 2 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-6"
                    >
                      <SearchableSelect
                        label="Lending Product"
                        placeholder="Select a loan product..."
                        options={templateOptions}
                        value={formData.loan_template_id}
                        onChange={(val) => updateFormData('loan_template_id', val)}
                        leftIcon={<Package size={18} />}
                        required
                      />

                      {/* ── Period Picker (for Flat Rate) ── */}
                      {formData.interest_type === 'FLAT' && (
                        <div className="space-y-3">
                          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Interest Period</label>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(PERIOD_LABELS).map(([key, label]) => (
                              <button
                                key={key}
                                type="button"
                                onClick={() => updateFormData('rate_period', key)}
                                className={cn(
                                  "px-4 py-2 rounded-xl text-xs font-bold transition-all border-2",
                                  formData.rate_period === key
                                    ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                                    : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-800 text-slate-500 hover:border-emerald-500/30"
                                )}
                              >
                                {label}
                              </button>
                            ))}
                          </div>
                          <p className="text-[10px] text-slate-500 font-medium italic">
                            Rate: <span className="text-emerald-500 font-bold">{formData.interest_rate}%</span> applied once per {formData.rate_period}
                          </p>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <Input
                          label="Principal Amount"
                          name="principal_amount"
                          type="number"
                          step="0.01"
                          value={formData.principal_amount}
                          onChange={handleChange}
                          error={errors.principal_amount}
                          leftIcon={<DollarSign size={18} />}
                          required
                          placeholder="0.00"
                        />
                        
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                            {formData.interest_type === 'FLAT' 
                              ? `Term (${formData.rate_period}${VARIABLE_TERM_PERIODS.includes(formData.rate_period) ? 's' : ''})` 
                              : 'Term (Months)'
                            }
                          </label>
                          {formData.interest_type === 'FLAT' && !VARIABLE_TERM_PERIODS.includes(formData.rate_period) ? (
                            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-400 cursor-not-allowed">
                              Fixed at 1 {formData.rate_period}
                            </div>
                          ) : (
                            <Input
                              name="loan_term_months"
                              type="number"
                              value={formData.loan_term_months}
                              onChange={handleChange}
                              error={errors.loan_term_months}
                              required
                              placeholder="e.g. 3"
                              leftIcon={<Clock size={18} />}
                            />
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
                          placeholder="0.00"
                          helperText={formData.interest_type === 'FLAT' ? `Rate per ${formData.rate_period}` : 'Annual rate (APR)'}
                        />
                        <Input
                          label="Start Date"
                          name="start_date"
                          type="date"
                          value={formData.start_date}
                          onChange={handleChange}
                          error={errors.start_date}
                          leftIcon={<Calendar size={18} />}
                          required
                        />
                      </div>

                      {/* ── Smart Loan Amortization Preview ── */}
                      {formData.interest_type === 'REDUCING' && (
                        <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-500/10 space-y-2">
                          <div className="flex items-center gap-2">
                            <TrendingDown size={16} className="text-blue-500" />
                            <h4 className="text-xs font-bold text-blue-900 dark:text-blue-400 uppercase tracking-wider">Bank-Style Amortization</h4>
                          </div>
                          <p className="text-[11px] text-blue-700 dark:text-blue-400/80 leading-relaxed">
                            Interest is calculated on the reducing balance. Monthly payments are equal (PMT), and each payment covers interest first, then reduces the principal.
                          </p>
                        </div>
                      )}

                      {loanProjections.maturityDate && (
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-white/5 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Clock size={20} className="text-primary-500" />
                            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Maturity Date</span>
                          </div>
                          <span className="text-sm font-bold text-slate-900 dark:text-white">
                            {formatDate(loanProjections.maturityDate)}
                          </span>
                        </div>
                      )}

                      {loanProjections.totalRepayment > 0 && (
                        <div className="bg-emerald-50 dark:bg-emerald-500/10 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-500/20 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Wallet size={20} className="text-emerald-500" />
                            <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Total Payable</span>
                          </div>
                          <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(loanProjections.totalRepayment)}
                          </span>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {currentStep === 3 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-6"
                    >
                      <Input
                        label="Collateral Name"
                        name="collateral_name"
                        placeholder="e.g. Toyota Vitz, HP Laptop..."
                        value={formData.collateral_name}
                        onChange={handleChange}
                      />

                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">Detailed Description</label>
                        <textarea
                          name="collateral_description"
                          value={formData.collateral_description}
                          onChange={handleChange}
                          rows="3"
                          className="block w-full px-4 py-3 rounded-xl transition-all duration-200 bg-white dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 outline-none placeholder:text-slate-400"
                          placeholder="Detail condition, serial numbers, unique markings..."
                        />
                      </div>

                      <div className="space-y-3">
                        <label className="block text-sm font-medium text-slate-700 dark:text-gray-300">Collateral Photos</label>
                        <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                          {formData.collateral_photos?.map((file, index) => (
                            <div key={index} className="relative aspect-square group">
                              <img
                                src={URL.createObjectURL(file)}
                                alt={`Preview ${index}`}
                                className="w-full h-full object-cover rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm"
                              />
                              <button
                                type="button"
                                onClick={() => setFormData(p => ({ ...p, collateral_photos: p.collateral_photos.filter((_, i) => i !== index) }))}
                                className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full transition-all shadow-lg hover:scale-110"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          ))}

                          <label className="aspect-square flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 cursor-pointer transition-all text-slate-400 hover:text-emerald-500 bg-slate-50 dark:bg-slate-800/30 group">
                            <Camera size={26} className="group-hover:scale-110 transition-transform" />
                            <span className="text-[10px] mt-2 font-bold uppercase tracking-tight">Add Photo</span>
                            <input
                              type="file"
                              multiple
                              accept="image/*"
                              onChange={(e) => setFormData(p => ({ ...p, collateral_photos: [...p.collateral_photos, ...Array.from(e.target.files)] }))}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {currentStep === 4 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-6"
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-white/5">
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Borrower</p>
                          <p className="font-bold text-slate-900 dark:text-white truncate">
                            {customers.find(c => String(c.id) === String(formData.customer_id))?.first_name} {customers.find(c => String(c.id) === String(formData.customer_id))?.last_name}
                          </p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-white/5">
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Repayment</p>
                          <p className="font-bold text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(loanProjections.totalRepayment)}
                          </p>
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-6 rounded-2xl text-white shadow-xl shadow-emerald-500/20 relative overflow-hidden">
                        <Wallet size={80} className="absolute -right-4 -bottom-4 text-white/10" strokeWidth={1} />
                        <div className="relative z-10">
                          <p className="text-sm font-medium text-emerald-100/80">Projected Installment</p>
                          <h3 className="text-3xl font-black mt-1">
                            {formatCurrency(loanProjections.installment)}
                            <span className="text-sm font-normal text-emerald-100/70 lowercase"> 
                              /{formData.interest_type === 'FLAT' ? PERIOD_LABELS[formData.rate_period] : 'month'}
                            </span>
                          </h3>
                          <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-[10px] font-bold text-emerald-100/60 uppercase">Interest</p>
                              <p className="text-sm font-bold">{formatCurrency(loanProjections.totalInterest)}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-emerald-100/60 uppercase">Term</p>
                              <p className="text-sm font-bold">
                                {formData.interest_type === 'FLAT' 
                                  ? (VARIABLE_TERM_PERIODS.includes(formData.rate_period)
                                      ? `${formData.loan_term_months} ${parseFloat(formData.loan_term_months) === 1 ? PERIOD_LABELS[formData.rate_period] : `${PERIOD_LABELS[formData.rate_period]}s`}`
                                      : PERIOD_LABELS[formData.rate_period]
                                    )
                                  : `${formData.loan_term_months} ${parseFloat(formData.loan_term_months) === 1 ? 'Month' : 'Months'}`
                                }
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Repayment Schedule Preview</h4>
                        <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                          {loanProjections.schedule.slice(0, 5).map((pay, i) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-sm">
                              <div className="flex items-center gap-3">
                                <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-500">
                                  {i + 1}
                                </span>
                                <span className="font-medium">{formatDate(pay.scheduledDate)}</span>
                              </div>
                              <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(pay.amountScheduled)}</span>
                            </div>
                          ))}
                          {loanProjections.schedule.length > 5 && (
                            <p className="text-center text-[10px] text-slate-400 font-medium italic">+{loanProjections.schedule.length - 5} more installments</p>
                          )}
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-500/5 border border-amber-100 dark:border-amber-500/10 flex items-start gap-4">
                        <Info size={18} className="text-amber-500 mt-0.5" />
                        <p className="text-xs text-amber-700 dark:text-amber-500/80 leading-relaxed">
                          Please verify all details before creating the loan. Once created, a loan agreement will be generated based on these terms.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </form>
              </div>

              <div className="p-6 sm:p-8 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={currentStep === 1 ? onClose : prevStep} 
                  disabled={isLoading}
                  className="px-6"
                >
                  {currentStep === 1 ? "Cancel" : "Back"}
                </Button>

                {currentStep < 4 ? (
                  <Button 
                    type="button" 
                    variant="primary" 
                    onClick={nextStep}
                    className="px-8 flex items-center gap-2 group shadow-lg shadow-emerald-500/20"
                  >
                    Continue
                    <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </Button>
                ) : (
                  <Button 
                    type="submit" 
                    variant="primary" 
                    isLoading={isLoading} 
                    onClick={handleSubmit}
                    className="px-8 bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/30"
                  >
                    Generate Loan
                  </Button>
                )}
              </div>
            </motion.div>
          </div>

          <CustomerModal
            isOpen={isCustomerModalOpen}
            onClose={() => setIsCustomerModalOpen(false)}
            onSuccess={fetchCustomers}
          />
        </>
      )}
    </AnimatePresence>
  );
};

export default CreateLoanModal;
