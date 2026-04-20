import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Mail, Phone, MapPin, Upload, ArrowRight, CheckCircle2 } from 'lucide-react';
import useAuthStore from '../store/authStore';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import authService from '../services/auth.service';

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
  });

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
      // Use FormData to handle file upload
      const data = new FormData();
      data.append('businessName', formData.businessName);
      data.append('contact_email', formData.contact_email);
      data.append('contact_phone', formData.contact_phone);
      data.append('address', formData.address);
      if (logoFile) {
        data.append('logo', logoFile);
      }

      await authService.updateBusinessProfile(data);
      
      // Update local storage/state
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
    <div className="min-h-screen bg-slate-50 dark:bg-dark-950 flex flex-col items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary-500/10 via-transparent to-transparent">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-600 text-white mb-6 shadow-lg shadow-primary-500/20">
            <Building2 size={32} />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">
            Set up your Business
          </h1>
          <p className="text-slate-500 dark:text-gray-400 max-w-md mx-auto">
            Welcome to Cryndol! Please provide your business details to customize your experience and documents.
          </p>
        </div>

        <Card className="border-none shadow-2xl shadow-slate-200/50 dark:shadow-none dark:bg-dark-900/50 backdrop-blur-xl border border-white/10">
          <Card.Content className="pt-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Logo Upload Section */}
              <div className="flex flex-col items-center">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-3xl bg-slate-100 dark:bg-dark-800 border-2 border-dashed border-slate-300 dark:border-white/10 flex items-center justify-center overflow-hidden transition-all group-hover:border-primary-500">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo preview" className="w-full h-full object-contain p-2" />
                    ) : (
                      <div className="text-center p-4">
                        <Upload size={24} className="mx-auto text-slate-400 mb-2" />
                        <span className="text-xs text-slate-400 font-medium tracking-tight">upload logo</span>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  {logoPreview && (
                    <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1.5 rounded-full shadow-lg">
                      <CheckCircle2 size={16} />
                    </div>
                  )}
                </div>
                <p className="mt-4 text-xs text-slate-500 dark:text-gray-400">
                   Square PNG or JPG recommended (max 2MB)
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Business Name"
                  name="businessName"
                  placeholder="e.g. Felix Finance Ltd"
                  value={formData.businessName}
                  onChange={handleChange}
                  leftIcon={<Building2 size={18} />}
                  required
                />
                <Input
                  label="Contact Email"
                  name="contact_email"
                  type="email"
                  placeholder="business@example.com"
                  value={formData.contact_email}
                  onChange={handleChange}
                  leftIcon={<Mail size={18} />}
                />
                <Input
                  label="Contact Phone"
                  name="contact_phone"
                  placeholder="+260..."
                  value={formData.contact_phone}
                  onChange={handleChange}
                  leftIcon={<Phone size={18} />}
                />
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2 pl-1">
                    Physical Address
                  </label>
                  <div className="relative">
                    <div className="absolute top-3 left-3 text-slate-400 pointer-events-none">
                      <MapPin size={18} />
                    </div>
                    <textarea
                      name="address"
                      rows="3"
                      className="block w-full rounded-xl border-slate-200 dark:border-white/10 dark:bg-dark-800/50 bg-white pl-10 pr-4 py-2.5 text-slate-900 dark:text-white focus:border-primary-500 focus:ring-primary-500 transition-all text-sm"
                      placeholder="Street name, City, Country"
                      value={formData.address}
                      onChange={handleChange}
                    ></textarea>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full py-6 text-lg rounded-2xl shadow-xl shadow-primary-500/20"
                  isLoading={isLoading}
                  rightIcon={<ArrowRight size={20} />}
                >
                  Complete Setup
                </Button>
                <div className="text-center mt-6 text-xs text-slate-500 dark:text-gray-500 flex items-center justify-center gap-1.5">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                   Setup only takes a minute
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
