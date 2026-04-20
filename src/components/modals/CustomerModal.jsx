import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, Phone, MapPin, FileText, Upload, Trash2, Calendar, Briefcase } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { handleApiError } from '../../utils/errorHandler';
import customerService from '../../services/customer.service';
import documentService from '../../services/document.service';
import toast from 'react-hot-toast';
import { useConfirmation } from '../../context/ConfirmationContext';

const CustomerModal = ({ isOpen, onClose, onSuccess, customer }) => {
  const [activeTab, setActiveTab] = useState('basic');
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [lastVerifiedNRC, setLastVerifiedNRC] = useState('');
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    id_number: '',
    id_type: 'NATIONAL_ID',
    tpin: '',
    date_of_birth: '',
    occupation: '',
    annual_income: '',
  });
  const [documents, setDocuments] = useState([]);
  const [errors, setErrors] = useState({});
  const { confirm } = useConfirmation();

  useEffect(() => {
    if (customer) {
      setFormData({
        first_name: customer.first_name || '',
        last_name: customer.last_name || '',
        email: customer.email || '',
        phone: customer.phone || '',
        address: customer.address || '',
        id_number: customer.id_number || '',
        id_type: customer.id_type || 'NATIONAL_ID',
        tpin: customer.tpin || '',
        date_of_birth: customer.date_of_birth || '',
        occupation: customer.occupation || '',
        annual_income: customer.annual_income || '',
      });
      fetchDocuments(customer.id);
    } else {
      resetForm();
    }
  }, [customer, isOpen]);

  const resetForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      address: '',
      id_number: '',
      id_type: 'NATIONAL_ID',
      tpin: '',
      date_of_birth: '',
      occupation: '',
      annual_income: '',
    });
    setDocuments([]);
    setActiveTab('basic');
  };

  const fetchDocuments = async (id) => {
    try {
      const response = await documentService.getCustomerDocuments(id);
      setDocuments(response.data.data);
    } catch (error) {
      console.error("Failed to fetch documents", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Auto-format NRC (XXXXXX/XX/X)
    if (name === 'id_number' && formData.id_type === 'NATIONAL_ID') {
      const digits = value.replace(/\D/g, '').slice(0, 9);
      let res = '';
      if (digits.length > 0) res += digits.slice(0, 6);
      if (digits.length > 6) res += '/' + digits.slice(6, 8);
      if (digits.length > 8) res += '/' + digits.slice(8, 9);

      setFormData((prev) => ({ ...prev, [name]: res }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const performNRCVerification = async (nrc) => {
    const nrcToVerify = nrc || formData.id_number;
    if (!nrcToVerify || isVerifying || lastVerifiedNRC === nrcToVerify) return;

    setIsVerifying(true);
    setLastVerifiedNRC(nrcToVerify);
    try {
      const response = await customerService.verifyNrc(nrcToVerify);
      if (response.success && response.verified) {
        toast.success('NRC verified automatically');
        const fullName = response.name;
        const nameParts = fullName.split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ');

        setFormData(prev => ({
          ...prev,
          first_name: firstName,
          last_name: lastName,
          tpin: response.tpin || prev.tpin
        }));
      } else {
        console.log('NRC not found on ZRA', response.message);
      }
    } catch (error) {
      console.error('NRC verification failed', error);
    } finally {
      setIsVerifying(false);
    }
  };

  useEffect(() => {
    if (formData.id_type !== 'NATIONAL_ID' || !formData.id_number || customer) return;

    const nrcPattern1 = /^\d{6}\/\d{2}\/\d{1}$/; // XXXXXX/XX/X
    const nrcPattern2 = /^\d{9}$/;               // XXXXXXXXX

    if (nrcPattern1.test(formData.id_number) || nrcPattern2.test(formData.id_number)) {
      performNRCVerification(formData.id_number);
    }
  }, [formData.id_number, formData.id_type]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (customer) {
        await customerService.updateCustomer(customer.id, formData);
        toast.success('Customer updated successfully');
      } else {
        await customerService.createCustomer(formData);
        toast.success('Customer created successfully');
      }
      onSuccess?.();
      handleClose();
    } catch (error) {
      const { message, fieldErrors, isValidation } = handleApiError(error);
      if (isValidation) setErrors(fieldErrors);
      else toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !customer) return;

    const data = new FormData();
    data.append('file', file);
    data.append('document_type', 'other');

    try {
      await documentService.uploadDocument(customer.id, data);
      toast.success('Document uploaded');
      fetchDocuments(customer.id);
    } catch (error) {
      toast.error('Upload failed');
    }
  };

  const handleDeleteDocument = async (id) => {
    const isConfirmed = await confirm({
      title: 'Delete Document',
      message: 'Are you sure you want to delete this document?',
      confirmText: 'Delete',
      type: 'danger'
    });

    if (!isConfirmed) return;
    try {
      await documentService.deleteDocument(id);
      toast.success('Document deleted');
      fetchDocuments(customer.id);
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const tabs = [
    { id: 'basic', label: 'Basic Info' },
    { id: 'kyc', label: 'KYC Details' },
    { id: 'documents', label: 'Documents', disabled: !customer },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass rounded-2xl w-full max-w-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur sticky top-0 z-10">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-gray-100">{customer ? 'Edit Customer' : 'Add Customer'}</h2>
                <button onClick={handleClose} className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-200 transition-colors">
                  <X size={20} />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 bg-white/30 dark:bg-slate-900/30 backdrop-blur sticky top-[81px] z-10">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => !tab.disabled && setActiveTab(tab.id)}
                    disabled={tab.disabled}
                    className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id
                      ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                      : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                      } ${tab.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {activeTab === 'documents' ? (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-slate-900 dark:text-slate-200">Customer Documents</h3>
                      <div className="relative">
                        <input
                          type="file"
                          id="doc-upload"
                          className="hidden"
                          onChange={handleFileUpload}
                        />
                        <label
                          htmlFor="doc-upload"
                          className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg hover:bg-emerald-500/20 cursor-pointer transition-colors"
                        >
                          <Upload size={18} />
                          Upload
                        </label>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {documents.length > 0 ? (
                        documents.map(doc => (
                          <div key={doc.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                            <div className="flex items-center gap-3">
                              <FileText className="text-slate-400" size={20} />
                              <div>
                                <p className="text-sm font-medium text-slate-900 dark:text-slate-200">{doc.file_name}</p>
                                <p className="text-xs text-slate-500 uppercase">{doc.document_type}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleDeleteDocument(doc.id)}
                              className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))
                      ) : (
                        <p className="text-center text-slate-500 py-4">No documents uploaded yet.</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {activeTab === 'basic' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 bg-emerald-500/5 p-4 rounded-xl border border-emerald-500/10 mb-2">
                          <Input
                            label="NRC Number"
                            name="id_number"
                            value={formData.id_number}
                            onChange={handleChange}
                            onBlur={() => performNRCVerification()}
                            error={errors.id_number}
                            placeholder="e.g. 123456/12/1"
                            isLoading={isVerifying}
                            required
                          />
                          <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">ID Type</label>
                            <select name="id_type" value={formData.id_type} onChange={handleChange} className="w-full bg-white dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 rounded-lg p-3 text-slate-900 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all">
                              <option value="NATIONAL_ID">National ID (NRC)</option>
                              <option value="PASSPORT">Passport</option>
                              <option value="DRIVER_LICENSE">Driver License</option>
                            </select>
                          </div>
                          {isVerifying && (
                            <div className="md:col-span-2 flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-sm font-medium animate-pulse">
                              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Verifying NRC with ...
                            </div>
                          )}
                          {formData.tpin && !isVerifying && (
                            <div className="md:col-span-2">
                              <Input label="TPIN (Retrieved)" name="tpin" value={formData.tpin} onChange={handleChange} />
                            </div>
                          )}
                        </div>

                        <Input label="First Name" name="first_name" value={formData.first_name} onChange={handleChange} error={errors.first_name} required />
                        <Input label="Last Name" name="last_name" value={formData.last_name} onChange={handleChange} error={errors.last_name} required />
                        <Input label="Email" name="email" type="email" value={formData.email} onChange={handleChange} error={errors.email} required />
                        <Input label="Phone" name="phone" value={formData.phone} onChange={handleChange} error={errors.phone} required />
                        <div className="md:col-span-2">
                          <Input label="Address" name="address" value={formData.address} onChange={handleChange} error={errors.address} />
                        </div>
                      </div>
                    )}

                    {activeTab === 'kyc' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label="Date of Birth" name="date_of_birth" type="date" value={formData.date_of_birth} onChange={handleChange} error={errors.date_of_birth} />
                        <Input label="Occupation" name="occupation" value={formData.occupation} onChange={handleChange} error={errors.occupation} />
                        <div className="md:col-span-2">
                          <Input label="Annual Income" name="annual_income" type="number" value={formData.annual_income} onChange={handleChange} error={errors.annual_income} />
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-white/10">
                      <Button type="button" variant="ghost" onClick={handleClose} disabled={isLoading}>Cancel</Button>
                      <Button type="submit" variant="primary" isLoading={isLoading}>{customer ? 'Update' : 'Create'}</Button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CustomerModal;
