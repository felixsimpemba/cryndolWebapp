import React, { useState, useEffect } from 'react';
import { User, Shield, Briefcase, Sliders, Building2, Edit, Trash2 } from 'lucide-react';
import Header from '../components/layout/Header';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import api from '../services/api';
import authService from '../services/auth.service';
import dashboardService from '../services/dashboard.service';
import toast from 'react-hot-toast';
import TeamSettings from './settings/TeamSettings';

import useAuthStore from '../store/authStore';
import { useConfirmation } from '../context/ConfirmationContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { formatCurrency } from '../utils/formatters';

const Settings = () => {
  const { user, updateUser } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { confirm } = useConfirmation();

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
  const ASSET_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, '');

  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState({});
  const [systemSettings, setSystemSettings] = useState({});
  const [passwordData, setPasswordData] = useState({ current_password: '', password: '', password_confirmation: '' });

  // Business profile extras (logo + working capital)
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [workingCapital, setWorkingCapital] = useState(0);
  const [isEditingCapital, setIsEditingCapital] = useState(false);
  const [newCapital, setNewCapital] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  // Support deep-linking to `/app/settings?tab=profile` (used by /app/business redirect)
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (!tab) return;

    const role = user?.role?.toLowerCase();
    const teamAllowed = role === 'super_admin' || role === 'admin';

    const allowedTabs = ['profile', 'system', 'security'];
    if (allowedTabs.includes(tab) || (tab === 'team' && teamAllowed)) {
      setActiveTab(tab);
    }
  }, [searchParams, user?.role]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const [settingsResponse, profileResponse] = await Promise.all([
        api.get('/settings'),
        authService.getProfile(),
      ]);

      const fetchedProfile = settingsResponse.data.data.profile || {};
      setProfileData({
        businessName: fetchedProfile.businessName || '',
        tagline: fetchedProfile.tagline || '',
        primary_color: fetchedProfile.primary_color || '#0F172A',
        secondary_color: fetchedProfile.secondary_color || '',
        currency_code: fetchedProfile.currency_code || 'ZMW',
        locale: fetchedProfile.locale || 'en-ZM',
        timezone: fetchedProfile.timezone || '',
        contact_email: fetchedProfile.contact_email || user?.email || '',
        contact_phone: fetchedProfile.contact_phone || '',
        address: fetchedProfile.address || '',
        logo_url: fetchedProfile.logo_url || null,
        created_at: fetchedProfile.created_at,
        updated_at: fetchedProfile.updated_at,
        ...fetchedProfile,
      });

      setSystemSettings(settingsResponse.data.data.system || {});
      setWorkingCapital(profileResponse.data?.user?.working_capital || 0);
      return fetchedProfile;
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      toast.error('Failed to load settings');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const businessName = profileData.businessName?.trim();
      if (!businessName) {
        toast.error('Business Name is required');
        return;
      }

      setIsSavingProfile(true);
      const previewToRevoke = logoPreview;

      // Use FormData so logo uploads work (backend supports PUT override via _method)
      const data = new FormData();
      data.append('businessName', businessName);
      data.append('tagline', profileData.tagline || '');
      data.append('currency_code', profileData.currency_code || 'ZMW');
      data.append('locale', profileData.locale || 'en-ZM');
      data.append('timezone', profileData.timezone || '');

      // Backend validates contact_email as an email; fall back to the logged-in user email
      const contactEmail = profileData.contact_email || user?.email || '';
      data.append('contact_email', contactEmail);
      data.append('contact_phone', profileData.contact_phone || '');
      data.append('address', profileData.address || '');

      if (logoFile) {
        data.append('logo', logoFile);
      }

      await authService.updateBusinessProfile(data);
      toast.success('Business profile updated successfully');

      const updatedProfile = await fetchSettings();

      // Only clear preview if backend confirms it has a logo_url now.
      setLogoFile(null);
      if (updatedProfile?.logo_url && previewToRevoke) {
        URL.revokeObjectURL(previewToRevoke);
        setLogoPreview(null);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update business profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Prevent leaking object URLs when switching files
    if (logoPreview) {
      URL.revokeObjectURL(logoPreview);
    }

    // Keep aligned with Onboarding limits
    const maxSizeBytes = 2 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      toast.error('Logo must be less than 2MB');
      return;
    }

    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleUpdateCapital = async () => {
    const amount = parseFloat(newCapital);
    if (isNaN(amount) || amount < 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      await dashboardService.updateCapital(amount);
      setWorkingCapital(amount);
      setIsEditingCapital(false);
      toast.success('Working Capital updated!');
    } catch (error) {
      toast.error('Failed to update capital');
      console.error(error);
    }
  };

  const handleDeleteBusinessProfile = async () => {
    const isConfirmed = await confirm({
      title: 'Delete Business Profile',
      message: 'This will permanently delete your business profile. You will be redirected to setup again.',
      confirmText: 'Delete',
      type: 'danger',
    });

    if (!isConfirmed) return;

    try {
      await api.delete('/auth/business-profile');
      updateUser({ hasBusinessProfile: false });
      toast.success('Business profile deleted');
      navigate('/onboarding', { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete business profile');
      console.error(error);
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
    ...(user?.role?.toLowerCase() === 'super_admin' || user?.role?.toLowerCase() === 'admin' 
        ? [{ id: 'team', label: 'Team Management', icon: <User size={18} /> }] 
        : []),
    { id: 'security', label: 'Security', icon: <Shield size={18} /> },
  ];

  const renderProfileTab = () => {
    const resolveLogoSrc = (logoUrl) => {
      if (!logoUrl) return null;
      const normalized = typeof logoUrl === 'string' ? logoUrl.replace(/\\/g, '/') : logoUrl;
      if (logoUrl.startsWith('http')) return logoUrl;
      // Always build the `/storage/...` URL against the backend origin.
      if (normalized.startsWith('/storage/')) return `${ASSET_BASE_URL}${normalized}`;
      if (normalized.startsWith('storage/')) return `${ASSET_BASE_URL}/${normalized}`;
      if (normalized.startsWith('/')) return `${ASSET_BASE_URL}${normalized}`;
      return `${ASSET_BASE_URL}/storage/${normalized}`;
    };

    const currentLogoSrc = resolveLogoSrc(profileData.logo_url);

    const logoSrc = logoPreview || currentLogoSrc;
    const createdAt = profileData.createdAt || profileData.created_at;

    return (
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center overflow-hidden">
              {logoSrc ? (
                <img src={logoSrc} alt="Business logo" className="w-full h-full object-contain" />
              ) : (
                <Building2 size={32} className="text-white" />
              )}
            </div>
            <div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                {profileData.businessName || 'Business'}
              </h3>
              <p className="text-sm text-slate-500 dark:text-gray-400">
                {user?.email || profileData.contact_email || ''}
                {createdAt ? ` • Created ${new Date(createdAt).toLocaleDateString()}` : ''}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleProfileUpdate} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
                Business Logo
              </label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10 overflow-hidden flex items-center justify-center">
                  {logoSrc ? (
                    <img src={logoSrc} alt="Logo preview" className="w-full h-full object-contain" />
                  ) : (
                    <Building2 size={20} className="text-slate-400" />
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="block w-full text-sm text-slate-600 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary-50 dark:file:bg-primary-500/10 file:text-primary-700 dark:file:text-primary-300"
                  />
                  <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">
                    Square PNG or JPG recommended (max 2MB)
                  </p>
                </div>
              </div>
            </div>

            <Input
              label="Business Name"
              value={profileData.businessName || ''}
              required
              onChange={(e) => setProfileData({ ...profileData, businessName: e.target.value })}
            />

            <Input
              label="Tagline"
              value={profileData.tagline || ''}
              onChange={(e) => setProfileData({ ...profileData, tagline: e.target.value })}
            />

            <Input
              label="Contact Email"
              value={profileData.contact_email || user?.email || ''}
              onChange={(e) => setProfileData({ ...profileData, contact_email: e.target.value })}
            />

            <Input
              label="Contact Phone"
              value={profileData.contact_phone || ''}
              onChange={(e) => setProfileData({ ...profileData, contact_phone: e.target.value })}
            />

            <Input
              label="Currency Code"
              value={profileData.currency_code || 'ZMW'}
              onChange={(e) => setProfileData({ ...profileData, currency_code: e.target.value })}
            />

            <Input
              label="Locale"
              value={profileData.locale || 'en-ZM'}
              onChange={(e) => setProfileData({ ...profileData, locale: e.target.value })}
            />

            <Input
              label="Time Zone"
              value={profileData.timezone || ''}
              onChange={(e) => setProfileData({ ...profileData, timezone: e.target.value })}
            />

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
                Physical Address
              </label>
              <textarea
                rows={3}
                value={profileData.address || ''}
                onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                className="block w-full rounded-lg border-slate-200 dark:border-white/10 dark:bg-slate-900/50 bg-white px-4 py-2.5 text-slate-900 dark:text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                placeholder="Street name, City, Country"
              />
            </div>

            {/* Primary/secondary color fields removed intentionally */}
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" variant="primary" isLoading={isSavingProfile}>
              Save Changes
            </Button>
          </div>
        </form>

        <div className="pt-6 border-t border-slate-100 dark:border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <label className="block text-lg font-medium text-slate-900 dark:text-white">Working Capital</label>

            {!isEditingCapital ? (
              <Button
                type="button"
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
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditingCapital(false)}
                >
                  Cancel
                </Button>
                <Button type="button" variant="primary" size="sm" onClick={handleUpdateCapital}>
                  Save
                </Button>
              </div>
            )}
          </div>

          {!isEditingCapital ? (
            <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(workingCapital, profileData.currency_code || 'ZMW')}
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

        <div className="pt-6 border-t border-slate-100 dark:border-white/5">
          <Button
            type="button"
            variant="danger"
            leftIcon={<Trash2 size={18} />}
            onClick={handleDeleteBusinessProfile}
          >
            Delete Business Profile
          </Button>
        </div>
      </div>
    );
  };

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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Header title="Settings" />
      
      <div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
                <Card className="h-full p-0 sm:p-0">
                    <div className="p-1.5 sm:p-2 flex lg:flex-col overflow-x-auto lg:overflow-x-visible no-scrollbar space-x-1 lg:space-x-0 lg:space-y-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-shrink-0 lg:w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                                    activeTab === tab.id 
                                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' 
                                    : 'text-slate-600 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-white/5'
                                }`}
                            >
                                <span className={activeTab === tab.id ? 'text-emerald-500' : 'text-slate-400'}>{tab.icon}</span>
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
