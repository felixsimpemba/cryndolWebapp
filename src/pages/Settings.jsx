import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, User, Shield, Bell, Briefcase, Sliders } from 'lucide-react';
import Header from '../components/layout/Header';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import api from '../services/api';
import toast from 'react-hot-toast';
import TeamSettings from './settings/TeamSettings';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState({});
  const [systemSettings, setSystemSettings] = useState({});
  const [passwordData, setPasswordData] = useState({ current_password: '', password: '', password_confirmation: '' });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/settings');
      setProfileData(response.data.data.profile || {});
      setSystemSettings(response.data.data.system || {});
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put('/settings/profile', profileData);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handleSystemUpdate = async (e) => {
    e.preventDefault();
    try {
        await api.put('/settings/system', { settings: systemSettings });
        toast.success('System settings saved');
    } catch (error) {
        toast.error('Failed to save settings');
    }
  };

  const handlePasswordUpdate = async (e) => {
      e.preventDefault();
      try {
          await api.put('/settings/password', passwordData);
          toast.success('Password changed successfully');
          setPasswordData({ current_password: '', password: '', password_confirmation: '' });
      } catch (error) {
          toast.error(error.response?.data?.message || 'Failed to update password');
      }
  };

  const tabs = [
    { id: 'profile', label: 'Business Profile', icon: <Briefcase size={18} /> },
    { id: 'system', label: 'System & Workflow', icon: <Sliders size={18} /> },
    // { id: 'team', label: 'Team Members', icon: <User size={18} /> },
    { id: 'security', label: 'Security', icon: <Shield size={18} /> },
  ];

  const renderProfileTab = () => (
    <form onSubmit={handleProfileUpdate} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input 
            label="Business Name" 
            value={profileData.businessName || ''} 
            onChange={(e) => setProfileData({...profileData, businessName: e.target.value})} 
        />
        <Input 
            label="Tagline" 
            value={profileData.tagline || ''} 
            onChange={(e) => setProfileData({...profileData, tagline: e.target.value})} 
        />
        <Input 
            label="Currency Code" 
            value={profileData.currency_code || 'ZMW'} 
            onChange={(e) => setProfileData({...profileData, currency_code: e.target.value})} 
        />
         <Input 
            label="Locale" 
            value={profileData.locale || 'en-ZM'} 
            onChange={(e) => setProfileData({...profileData, locale: e.target.value})} 
        />
        <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Primary Color</label>
            <div className="flex gap-2">
                <input 
                    type="color" 
                    value={profileData.primary_color || '#0F172A'}
                    onChange={(e) => setProfileData({...profileData, primary_color: e.target.value})}
                    className="h-10 w-20 rounded border border-gray-300"
                />
                <Input 
                    value={profileData.primary_color || ''}
                    onChange={(e) => setProfileData({...profileData, primary_color: e.target.value})}
                    containerClassName="flex-1"
                />
            </div>
        </div>
      </div>
      <div className="flex justify-end pt-4">
        <Button type="submit" variant="primary">Save Changes</Button>
      </div>
    </form>
  );

  const renderSystemTab = () => (
      <form onSubmit={handleSystemUpdate} className="space-y-6">
          <div className="space-y-4">
              <h3 className="text-lg font-medium text-slate-900 dark:text-white">Workflow Configuration</h3>
              <div className="grid grid-cols-1 gap-4">
                 {/* Example dynamic settings */}
                 <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/10">
                    <div>
                        <p className="font-medium text-slate-900 dark:text-white">Auto-approve Loans</p>
                        <p className="text-sm text-slate-500">Automatically approve loans under a certain threshold</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                            type="checkbox" 
                            className="sr-only peer"
                            checked={systemSettings['workflow.auto_approve'] === 'true'}
                            onChange={(e) => setSystemSettings({...systemSettings, 'workflow.auto_approve': e.target.checked ? 'true' : 'false'})}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                    </label>
                 </div>
              </div>
          </div>
          <div className="flex justify-end pt-4">
            <Button type="submit" variant="primary">Save Configuration</Button>
          </div>
      </form>
  );

  const renderSecurityTab = () => (
      <form onSubmit={handlePasswordUpdate} className="space-y-4 max-w-md">
          <Input 
            type="password"
            label="Current Password"
            value={passwordData.current_password}
            onChange={(e) => setPasswordData({...passwordData, current_password: e.target.value})}
            required
          />
          <Input 
            type="password"
            label="New Password"
            value={passwordData.password}
            onChange={(e) => setPasswordData({...passwordData, password: e.target.value})}
            required
          />
          <Input 
            type="password"
            label="Confirm New Password"
            value={passwordData.password_confirmation}
            onChange={(e) => setPasswordData({...passwordData, password_confirmation: e.target.value})}
            required
          />
          <div className="flex justify-end pt-4">
            <Button type="submit" variant="destructive">Update Password</Button>
          </div>
      </form>
  );

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar">
      <Header title="Settings" />
      
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
                <Card className="h-full">
                    <div className="p-2 space-y-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                                    activeTab === tab.id 
                                    ? 'bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400' 
                                    : 'text-slate-600 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-white/5'
                                }`}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
                <Card>
                    <Card.Header>
                        <Card.Title>{tabs.find(t => t.id === activeTab)?.label}</Card.Title>
                    </Card.Header>
                    <Card.Content>
                        {loading ? (
                             <div className="py-12 text-center">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                            </div>
                        ) : (
                            <>
                                {activeTab === 'profile' && renderProfileTab()}
                                {activeTab === 'system' && renderSystemTab()}
                                {activeTab === 'team' && <TeamSettings />}
                                {activeTab === 'security' && renderSecurityTab()}
                            </>
                        )}
                    </Card.Content>
                </Card>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
