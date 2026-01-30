import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building2, Edit, Trash2, Plus } from 'lucide-react';
import Header from '../components/layout/Header';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';
import authService from '../services/auth.service';

import { useNavigate } from 'react-router-dom';
import dashboardService from '../services/dashboard.service';
import { formatCurrency } from '../utils/formatters';

const Business = () => {
  const navigate = useNavigate();
  const { user, createBusinessProfile } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  
  // Creation Form State
  const [formData, setFormData] = useState({
    businessName: '',
  });

  const [isEditingCapital, setIsEditingCapital] = useState(false);
  const [workingCapital, setWorkingCapital] = useState(0);
  const [newCapital, setNewCapital] = useState('');

  const fetchProfileData = async () => {
    try {
        const data = await authService.getProfile();
        if (data.data.businessProfile) {
            setProfile(data.data.businessProfile);
        }
        if (data.data.user) {
            setWorkingCapital(data.data.user.working_capital || 0);
        }
    } catch(error) {
        console.error('Failed to fetch profile', error);
    }
  }

  useEffect(() => {
    if (user?.hasBusinessProfile) {
      fetchProfileData();
    }
  }, [user]);

  // Removed old fetchBusinessProfile to use fetchProfileData instead which gets both
  const handleUpdateCapital = async () => {
      const amount = parseFloat(newCapital);
      if (isNaN(amount) || amount < 0) {
          toast.error("Please enter a valid amount");
          return;
      }
      
      try {
          await dashboardService.updateCapital(amount);
          setWorkingCapital(amount);
          setIsEditingCapital(false);
          toast.success("Working Capital updated!");
      } catch (error) {
          toast.error("Failed to update capital");
      }
  };


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.businessName.trim()) {
       toast.error('Business Name is required');
       return;
    }

    setIsLoading(true);
    try {
      await createBusinessProfile(formData);
      toast.success('Business Profile created!');
      // Refresh user profile in store to ensure all data is synced if needed
      // But creating profile updated the flag locally already.
      // We can redirect immediately.
      navigate('/app/dashboard');
    } catch (error) {
      toast.error('Failed to create business profile.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user?.hasBusinessProfile) {
    // CREATE BUSINESS FORM
    return (
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
        <Header title="Create Business Profile" />
        <div className="max-w-xl mx-auto mt-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <Card.Header>
                <Card.Title>Welcome to Cryndol!</Card.Title>
                <Card.Description>
                  Before you continue, please set up your business profile. This name will be displayed on your loan documents.
                </Card.Description>
              </Card.Header>
              <Card.Content>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <Input
                    label="Business Name"
                    name="businessName"
                    placeholder="e.g. Felix Finance Ltd."
                    value={formData.businessName}
                    onChange={handleChange}
                    leftIcon={<Building2 size={18} />}
                    required
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full"
                    isLoading={isLoading}
                    leftIcon={<Plus size={20} />}
                  >
                    Create Business Profile
                  </Button>
                </form>
              </Card.Content>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  // DISPLAY BUSINESS PROFILE
  if (!profile) {
     return <div className="p-6">Loading profile...</div>;
  }

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar">
      <Header title="Business Profile" />
      
      <div className="p-6 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <Card.Header>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center">
                    <Building2 size={32} className="text-white" />
                  </div>
                  <div>
                    <Card.Title>{profile.businessName}</Card.Title>
                    <Card.Description>Created on {new Date(profile.createdAt).toLocaleDateString()}</Card.Description>
                  </div>
                </div>
                {/* Edit functionality to be implemented */}
                <Button variant="outline" size="sm" leftIcon={<Edit size={16} />}>
                  Edit
                </Button>
              </div>
            </Card.Header>

            <Card.Content>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* For now, just showing available data. Add more fields to backend if needed */}
                  <div>
                    <label className="block text-sm font-medium text-slate-500 dark:text-gray-400 mb-2">
                       Business Name
                    </label>
                    <p className="text-slate-900 dark:text-gray-100 text-lg">{profile.businessName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-500 dark:text-gray-400 mb-2">
                      Owner Email
                    </label>
                    <p className="text-slate-900 dark:text-gray-100">{user.email}</p>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 dark:border-white/5">
                    <div className="flex items-center justify-between mb-2">
                        <label className="block text-lg font-medium text-slate-900 dark:text-white">
                            Working Capital
                        </label>
                        {!isEditingCapital ? (
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => {
                                    setNewCapital(workingCapital.toString());
                                    setIsEditingCapital(true);
                                }}
                                leftIcon={<Edit size={16} />}
                            >
                                Edit
                            </Button>
                        ) : (
                            <div className="flex gap-2">
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => setIsEditingCapital(false)}
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    variant="primary" 
                                    size="sm" 
                                    onClick={handleUpdateCapital}
                                >
                                    Save
                                </Button>
                            </div>
                        )}
                    </div>
                    
                    {!isEditingCapital ? (
                        <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(workingCapital)}
                        </p>
                    ) : (
                        <Input
                            type="number"
                            value={newCapital}
                            onChange={(e) => setNewCapital(e.target.value)}
                            placeholder="Enter new total capital"
                            autoFocus
                        />
                    )}
                    <p className="text-sm text-slate-500 mt-1">
                        Editing this value will automatically create a transaction for the difference.
                    </p>
                </div>
              </div>
            </Card.Content>

            <Card.Footer>
               {/* Delete functionality to be implemented connected to backend */}
              <Button variant="danger" leftIcon={<Trash2 size={18} />}>
                Delete Business Profile
              </Button>
            </Card.Footer>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Business;
