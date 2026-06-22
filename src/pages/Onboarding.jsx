import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Mail, Phone, MapPin, Upload, ArrowRight, CheckCircle2, DollarSign, Wallet, ShieldCheck } from 'lucide-react';
import useAuthStore from '../store/authStore';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import authService from '../services/auth.service';
import { formatCurrencyInput, parseCurrency } from '../utils/utils';

const Onboarding = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoFile, setLogoFile] = useState(null);

  const [formData, setFormData] = useState({
    businessName: '',
    contact_email: user?.email || '',
    contact_phone: user?.phoneNumber || '',
    address: '',
    working_capital: '',
  });

  const [displayValue, setDisplayValue] = useState('');

  const handleCapitalChange = (e) => {
    const inputVal = e.target.value;
    const formatted = formatCurrencyInput(inputVal);
    const raw = parseCurrency(formatted);
    
    setFormData({ ...formData, working_capital: raw });
    setDisplayValue(formatted);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Logo must be less than 2MB');
        return;
      }
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.businessName.trim()) {
      toast.error('Business Name is required');
      return;
    }

    setIsLoading(true);
    try {
      const data = new FormData();
      data.append('businessName', formData.businessName);
      data.append('contact_email', formData.contact_email);
      data.append('contact_phone', formData.contact_phone);
      data.append('address', formData.address);
      data.append('working_capital', formData.working_capital || 0);
      if (logoFile) {
        data.append('logo', logoFile);
      }

      await authService.updateBusinessProfile(data);
      
      updateUser({ hasBusinessProfile: true });
      
      toast.success('Welcome aboard! Your business profile is ready.');
      navigate('/app/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save business profile');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-primary-600/5 -skew-x-12 transform origin-top-right"></div>
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl relative z-10"
      >
        <div className="text-center mb-10">
          <motion.div 
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-primary-600 text-white mb-6 shadow-2xl shadow-primary-500/20"
          >
            <Building2 size={40} />
          </motion.div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-3">
            Business Identity
          </h1>
          <p className="text-slate-500 dark:text-gray-400 text-lg">
            Let's customize your workspace and documents.
          </p>
        </div>

        <Card className="border-none shadow-2xl dark:bg-dark-900/40 backdrop-blur-2xl border border-white/5 overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-primary-500 via-primary-600 to-emerald-500"></div>
          <Card.Content className="p-8 lg:p-12">
            <form onSubmit={handleSubmit} className="space-y-10">
              {/* Logo Upload */}
              <div className="flex flex-col items-center">
                <div className="relative group">
                  <div className="w-36 h-36 rounded-[2.5rem] bg-slate-100 dark:bg-dark-800 border-2 border-dashed border-slate-200 dark:border-white/5 flex items-center justify-center overflow-hidden transition-all group-hover:border-primary-500 group-hover:bg-primary-500/5">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo" className="w-full h-full object-contain p-4" />
                    ) : (
                      <div className="text-center">
                        <Upload size={32} className="mx-auto text-slate-300 mb-2 group-hover:text-primary-500 transition-colors" />
                        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 group-hover:text-primary-500">Upload Logo</span>
                      </div>
                    )}
                  </div>
                  <input type="file" accept="image/*" onChange={handleLogoChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                  {logoPreview && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-2 rounded-2xl shadow-xl border-4 border-white dark:border-dark-900">
                      <CheckCircle2 size={18} />
                    </motion.div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <Input
                  label="Business Name"
                  name="businessName"
                  placeholder="e.g. BlueSky Credits"
                  value={formData.businessName}
                  onChange={handleChange}
                  leftIcon={<Building2 size={18} />}
                  required
                />
                
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2.5 ml-1">
                    Initial Working Capital
                  </label>
                  <div className="relative group">
                    <div className="absolute top-1/2 -translate-y-1/2 left-4 text-slate-400 group-focus-within:text-primary-500 transition-colors">
                      <Wallet size={18} />
                    </div>
                    <input
                      type="text"
                      placeholder="0.00"
                      value={displayValue}
                      onChange={handleCapitalChange}
                      className="block w-full rounded-2xl border-slate-200 dark:border-white/5 dark:bg-dark-800/50 bg-white pl-12 pr-16 py-3 text-slate-900 dark:text-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all text-sm font-semibold"
                    />
                    <div className="absolute top-1/2 -translate-y-1/2 right-4 text-xs font-bold text-slate-400 group-focus-within:text-primary-500">
                      ZMW
                    </div>
                  </div>
                </div>

                <Input
                  label="Business Email"
                  name="contact_email"
                  type="email"
                  placeholder="contact@business.com"
                  value={formData.contact_email}
                  onChange={handleChange}
                  leftIcon={<Mail size={18} />}
                />
                <Input
                  label="Business Phone"
                  name="contact_phone"
                  placeholder="+260..."
                  value={formData.contact_phone}
                  onChange={handleChange}
                  leftIcon={<Phone size={18} />}
                />
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2.5 ml-1">
                    Headquarters Address
                  </label>
                  <div className="relative group">
                    <div className="absolute top-3.5 left-4 text-slate-400 group-focus-within:text-primary-500 transition-colors">
                      <MapPin size={20} />
                    </div>
                    <textarea
                      name="address"
                      rows="3"
                      className="block w-full rounded-2xl border-slate-200 dark:border-white/5 dark:bg-dark-800/50 bg-white pl-12 pr-4 py-3 text-slate-900 dark:text-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all text-sm resize-none"
                      placeholder="Enter street, city, and country..."
                      value={formData.address}
                      onChange={handleChange}
                    ></textarea>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full py-7 text-lg font-bold rounded-[2rem] shadow-2xl shadow-primary-500/30"
                  isLoading={isLoading}
                  rightIcon={<ArrowRight size={22} />}
                >
                  Launch Workspace
                </Button>
                <div className="flex items-center justify-center gap-2 mt-8 text-slate-400 text-sm font-medium">
                  <ShieldCheck size={16} className="text-emerald-500" />
                  All data is encrypted and secure
                </div>
              </div>
            </form>
          </Card.Content>
        </Card>
      </motion.div>
    </div>
  );
};

export default Onboarding;
