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
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    address: '',
    nrc_number: '',
    tpin_number: '',
    date_of_birth: '',
    gender: '',
    marital_status: '',
    employment_status: '',
    monthly_income: '',
  });
  const [documents, setDocuments] = useState([]);
  const [errors, setErrors] = useState({});
  const { confirm } = useConfirmation();

  useEffect(() => {
    if (customer) {
      setFormData({
        fullName: customer.fullName || '',
        email: customer.email || '',
        phoneNumber: customer.phoneNumber || '',
        address: customer.address || '',
        nrc_number: customer.nrc_number || '',
        tpin_number: customer.tpin_number || '',
        date_of_birth: customer.date_of_birth || '',
        gender: customer.gender || '',
        marital_status: customer.marital_status || '',
        employment_status: customer.employment_status || '',
        monthly_income: customer.monthly_income || '',
      });
      fetchDocuments(customer.id);
    } else {
      resetForm();
    }
  }, [customer, isOpen]);

  const resetForm = () => {
    setFormData({
      fullName: '',
      email: '',
      phoneNumber: '',
      address: '',
      nrc_number: '',
      tpin_number: '',
      date_of_birth: '',
      gender: '',
      marital_status: '',
      employment_status: '',
      monthly_income: '',
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
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

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
    data.append('document_type', 'other'); // You could add a selector for this

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
              className="glass rounded-2xl w-full max-w-2xl border border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <h2 className="text-2xl font-bold text-gray-100">{customer ? 'Edit Customer' : 'Add Customer'}</h2>
                <button onClick={handleClose} className="p-2 hover:bg-white/10 rounded-lg text-gray-400">
                  <X size={20} />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-white/10 px-6">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => !tab.disabled && setActiveTab(tab.id)}
                    disabled={tab.disabled}
                    className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id
                      ? 'border-emerald-500 text-emerald-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
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
                      <h3 className="text-lg font-medium text-slate-200">Customer Documents</h3>
                      <div className="relative">
                        <input
                          type="file"
                          id="doc-upload"
                          className="hidden"
                          onChange={handleFileUpload}
                        />
                        <label
                          htmlFor="doc-upload"
                          className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-400 rounded-lg hover:bg-emerald-500/20 cursor-pointer transition-colors"
                        >
                          <Upload size={18} />
                          Upload
                        </label>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {documents.length > 0 ? (
                        documents.map(doc => (
                          <div key={doc.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                            <div className="flex items-center gap-3">
                              <FileText className="text-slate-400" size={20} />
                              <div>
                                <p className="text-sm font-medium text-slate-200">{doc.original_name}</p>
                                <p className="text-xs text-slate-500 uppercase">{doc.document_type}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleDeleteDocument(doc.id)}
                              className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg"
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
                        <Input label="Full Name" name="fullName" value={formData.fullName} onChange={handleChange} error={errors.fullName} required />
                        <Input label="Email" name="email" type="email" value={formData.email} onChange={handleChange} error={errors.email} required />
                        <Input label="Phone" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} error={errors.phoneNumber} required />
                        <Input label="Address" name="address" value={formData.address} onChange={handleChange} error={errors.address} />
                      </div>
                    )}

                    {activeTab === 'kyc' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label="NRC Number" name="nrc_number" value={formData.nrc_number} onChange={handleChange} error={errors.nrc_number} />
                        <Input label="TPIN" name="tpin_number" value={formData.tpin_number} onChange={handleChange} error={errors.tpin_number} />
                        <Input label="Date of Birth" name="date_of_birth" type="date" value={formData.date_of_birth} onChange={handleChange} error={errors.date_of_birth} />
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-1">Gender</label>
                          <select name="gender" value={formData.gender} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-primary-500 outline-none">
                            <option value="">Select Gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-1">Employment</label>
                          <select name="employment_status" value={formData.employment_status} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-primary-500 outline-none">
                            <option value="">Select Status</option>
                            <option value="employed">Employed</option>
                            <option value="self_employed">Self Employed</option>
                            <option value="unemployed">Unemployed</option>
                          </select>
                        </div>
                        <Input label="Monthly Income" name="monthly_income" type="number" value={formData.monthly_income} onChange={handleChange} error={errors.monthly_income} />
                      </div>
                    )}

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
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
