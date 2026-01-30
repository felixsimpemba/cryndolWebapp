import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, DollarSign, Calendar, Percent, User, Package, PlusCircle } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { handleApiError } from '../../utils/errorHandler';
import loanService from '../../services/loan.service';
import customerService from '../../services/customer.service';
import loanProductService from '../../services/loanProduct.service';
import CustomerModal from './CustomerModal';
import toast from 'react-hot-toast';

const CreateLoanModal = ({ isOpen, onClose, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [loanProducts, setLoanProducts] = useState([]);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    borrower_id: '',
    loan_product_id: '',
    principal: '',
    interestRate: '',
    termMonths: '',
    term_unit: 'months',
    startDate: new Date().toISOString().split('T')[0],
    status: 'pending'
  });
  const [errors, setErrors] = useState({});
  const [estimatedDueDate, setEstimatedDueDate] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchCustomers();
      fetchLoanProducts();
      // Reset form on open
      setFormData({
        borrower_id: '',
        loan_product_id: '',
        principal: '',
        interestRate: '',
        termMonths: '',
        term_unit: 'months',
        startDate: new Date().toISOString().split('T')[0],
        status: 'pending'
      });
      setErrors({});
    }
  }, [isOpen]);

  // Calculate estimated due date whenever relevant fields change
  useEffect(() => {
    if (formData.startDate && formData.termMonths) {
      calculateDueDate();
    } else {
      setEstimatedDueDate('');
    }
  }, [formData.startDate, formData.termMonths, formData.term_unit]);

  const calculateDueDate = () => {
    const date = new Date(formData.startDate);
    const term = parseInt(formData.termMonths);

    if (isNaN(term)) return;

    if (formData.term_unit === 'days') date.setDate(date.getDate() + term);
    if (formData.term_unit === 'weeks') date.setDate(date.getDate() + (term * 7));
    if (formData.term_unit === 'months') date.setMonth(date.getMonth() + term);
    if (formData.term_unit === 'years') date.setFullYear(date.getFullYear() + term);

    setEstimatedDueDate(date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
  };

  const fetchCustomers = async () => {
    try {
      const response = await customerService.getCustomers({ limit: 100 });
      // Handle Laravel pagination response: { success: true, data: { data: [...] } }
      if (response?.data?.data && Array.isArray(response.data.data)) {
        setCustomers(response.data.data);
      } else if (Array.isArray(response?.data)) {
        setCustomers(response.data);
      } else {
        setCustomers([]);
      }
    } catch (error) {
      console.error('Failed to fetch customers:', error);
    }
  };

  const fetchLoanProducts = async () => {
    try {
      const response = await loanProductService.getProducts();
      // API returns { status: 'success', data: [...] }
      if (response.data && Array.isArray(response.data.data)) {
        setLoanProducts(response.data.data);
      } else {
        setLoanProducts([]);
      }
    } catch (error) {
      console.error('Failed to fetch loan products:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };

      // Auto-fill logic when product changes
      if (name === 'loan_product_id') {
        const product = loanProducts.find(p => p.id === parseInt(value));
        if (product) {
          newData.interestRate = product.interest_rate;
          newData.termMonths = product.min_term || product.max_term || ''; // Default to min term
          newData.term_unit = product.term_unit || 'months';
        } else {
          newData.term_unit = 'months'; // Default reset
        }
      }
      return newData;
    });

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await loanService.createLoan(formData);
      toast.success('Loan created successfully');
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

  const handleCustomerCreated = () => {
    fetchCustomers(); // Refresh list to include new customer
    // Optimization: Fetch specifically the new customer or pass it from onSuccess and auto-select
  };

  // Helper to format unit for display
  const getUnitLabel = (unit) => {
    if (!unit) return 'Months';
    return unit.charAt(0).toUpperCase() + unit.slice(1);
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
              className="glass rounded-2xl w-full max-w-lg border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto custom-scrollbar"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur sticky top-0 z-10">
                <h2 className="text-xl font-bold text-slate-900 dark:text-gray-100">
                  Create New Loan
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-200"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">

                {/* Loan Product Selection */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">Loan Product (Optional)</label>
                  <div className="relative">
                    <select
                      name="loan_product_id"
                      value={formData.loan_product_id}
                      onChange={handleChange}
                      className="block w-full px-4 py-2.5 pl-10 rounded-lg transition-all duration-200 bg-white dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none appearance-none hover:border-slate-400 dark:hover:border-slate-600"
                    >
                      <option value="">Select a product (or Custom)...</option>
                      {loanProducts.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name} ({product.interest_rate}% Interest)
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-gray-400">
                      <Package size={18} />
                    </div>
                  </div>
                </div>

                {/* Borrower Selection */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-gray-300">Borrower</label>
                    <button
                      type="button"
                      onClick={() => setIsCustomerModalOpen(true)}
                      className="text-xs flex items-center gap-1 text-emerald-500 hover:text-emerald-600 font-medium"
                    >
                      <PlusCircle size={14} /> New Borrower
                    </button>
                  </div>
                  <div className="relative">
                    <select
                      name="borrower_id"
                      value={formData.borrower_id}
                      onChange={handleChange}
                      className={`block w-full px-4 py-2.5 pl-10 rounded-lg transition-all duration-200 
                        bg-white dark:bg-slate-800/50 
                        border border-slate-300 dark:border-slate-700 
                        text-slate-900 dark:text-gray-100 
                        focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 
                        outline-none appearance-none
                        ${errors.borrower_id ? 'border-red-500' : 'hover:border-slate-400 dark:hover:border-slate-600'}`}
                    >
                      <option value="">Select a borrower...</option>
                      {customers.map((customer) => (
                        <option key={customer.id} value={customer.id}>
                          {customer.fullName} ({customer.phoneNumber})
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-gray-400">
                      <User size={18} />
                    </div>
                  </div>
                  {errors.borrower_id && <p className="mt-1 text-xs text-red-500">{errors.borrower_id}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Principal Amount"
                    name="principal"
                    type="number"
                    step="0.01"
                    value={formData.principal}
                    onChange={handleChange}
                    error={errors.principal}
                    leftIcon={<span className="font-bold text-slate-500 dark:text-gray-400">K</span>}
                    required
                  />
                  <Input
                    label="Interest Rate (%)"
                    name="interestRate"
                    type="number"
                    step="0.01"
                    value={formData.interestRate}
                    onChange={handleChange}
                    error={errors.interestRate}
                    leftIcon={<Percent size={18} />}
                    required
                    className={formData.loan_product_id ? 'bg-slate-100 dark:bg-slate-900/30' : ''}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label={`Term (${getUnitLabel(formData.term_unit)})`}
                    name="termMonths"
                    type="number"
                    value={formData.termMonths}
                    onChange={handleChange}
                    error={errors.termMonths}
                    required
                  />
                  <Input
                    label="Start Date"
                    name="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={handleChange}
                    error={errors.startDate}
                    leftIcon={<Calendar size={18} />}
                    required
                  />
                </div>

                {/* Estimated Due Date Display */}
                {estimatedDueDate && (
                  <div className="bg-emerald-50 dark:bg-emerald-500/10 p-3 rounded-lg flex items-center gap-3 border border-emerald-100 dark:border-emerald-500/20">
                    <Calendar size={18} className="text-emerald-500" />
                    <div>
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium uppercase">Estimated Due Date</p>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{estimatedDueDate}</p>
                    </div>
                  </div>
                )}

                <div className="border-t border-slate-200 dark:border-slate-800 pt-5 mt-2 flex justify-end gap-3">
                  <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" isLoading={isLoading}>
                    Create Loan
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>

          <CustomerModal
            isOpen={isCustomerModalOpen}
            onClose={() => setIsCustomerModalOpen(false)}
            onSuccess={handleCustomerCreated}
          />
        </>
      )}
    </AnimatePresence>
  );
};

export default CreateLoanModal;
