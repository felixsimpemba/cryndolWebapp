import React, { useState, useEffect, useCallback } from 'react';
import {
  User, Shield, Briefcase, Sliders, Building2, Trash2,
  Save, CheckCircle2, AlertCircle, Loader2, ChevronRight,
  Bell, Lock, Users, Zap, Clock, DollarSign, ToggleLeft
} from 'lucide-react';
import Header from '../components/layout/Header';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import api from '../services/api';
import authService from '../services/auth.service';
import toast from 'react-hot-toast';
import TeamSettings from './settings/TeamSettings';
import useAuthStore from '../store/authStore';
import { useConfirmation } from '../context/ConfirmationContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { formatCurrency } from '../utils/formatters';

// ── Reusable Toggle ────────────────────────────────────────────────────────────
const Toggle = ({ checked, onChange, disabled }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    disabled={disabled}
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900 ${
      checked ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'
    } disabled:opacity-40 disabled:cursor-not-allowed`}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
        checked ? 'translate-x-6' : 'translate-x-1'
      }`}
    />
  </button>
);

// ── Setting Row (toggle row) ───────────────────────────────────────────────────
const SettingRow = ({ icon: Icon, label, description, settingKey, value, onChange, disabled }) => (
  <div className="flex items-center justify-between gap-4 py-4 border-b border-slate-100 dark:border-white/5 last:border-0">
    <div className="flex items-start gap-3 min-w-0">
      {Icon && (
        <div className="mt-0.5 flex-shrink-0 w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
          <Icon size={15} className="text-emerald-600 dark:text-emerald-400" />
        </div>
      )}
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-800 dark:text-white">{label}</p>
        {description && <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5 leading-relaxed">{description}</p>}
      </div>
    </div>
    <Toggle checked={!!value} onChange={(v) => onChange(settingKey, v)} disabled={disabled} />
  </div>
);

// ── Section Header ─────────────────────────────────────────────────────────────
const SectionHeader = ({ icon: Icon, title, description }) => (
  <div className="flex items-center gap-3 mb-5">
    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-sm">
      <Icon size={17} className="text-white" />
    </div>
    <div>
      <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{title}</h3>
      {description && <p className="text-xs text-slate-500 dark:text-gray-400">{description}</p>}
    </div>
  </div>
);

// ── Save Status Badge ──────────────────────────────────────────────────────────
const SaveBadge = ({ state }) => {
  if (state === 'idle') return null;
  if (state === 'saving') return (
    <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-gray-400">
      <Loader2 size={12} className="animate-spin" /> Saving…
    </span>
  );
  if (state === 'saved') return (
    <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
      <CheckCircle2 size={12} /> Saved
    </span>
  );
  if (state === 'error') return (
    <span className="inline-flex items-center gap-1.5 text-xs text-red-500">
      <AlertCircle size={12} /> Error
    </span>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
const Settings = () => {
  const { user, updateUser } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { confirm } = useConfirmation();

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
  const ASSET_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, '');

  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);

  // Profile state
  const [profileData, setProfileData] = useState({
    businessName: '', contact_email: '', contact_phone: '', address: '', working_capital: 0,
  });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoUrl, setLogoUrl] = useState(null);
  const [profileSave, setProfileSave] = useState('idle'); // idle|saving|saved|error

  // System settings state
  const [systemSettings, setSystemSettings] = useState({
    'workflow.auto_approve': false,
    'workflow.late_fee_enabled': true,
    'workflow.require_collateral': false,
    'workflow.send_reminders': true,
    'workflow.allow_early_repayment': true,
    'notification.email_on_disbursement': true,
    'notification.email_on_payment': true,
    'notification.email_on_overdue': true,
  });
  const [systemSave, setSystemSave] = useState('idle');

  // Password state
  const [passwordData, setPasswordData] = useState({ current_password: '', password: '', password_confirmation: '' });
  const [passwordSave, setPasswordSave] = useState('idle');

  // ── Tab config ──────────────────────────────────────────────────────────────
  const isAdmin = ['super_admin', 'admin'].includes(user?.role?.toLowerCase());
  const tabs = [
    { id: 'profile',  label: 'Business Profile',   icon: Briefcase },
    { id: 'system',   label: 'System & Workflow',   icon: Sliders },
    ...(isAdmin ? [{ id: 'team', label: 'Team', icon: Users }] : []),
    { id: 'security', label: 'Security',            icon: Shield },
  ];

  // ── Deep-link support ───────────────────────────────────────────────────────
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (!tab) return;
    const allowed = ['profile', 'system', 'security', ...(isAdmin ? ['team'] : [])];
    if (allowed.includes(tab)) setActiveTab(tab);
  }, [searchParams, isAdmin]);

  // ── Fetch ───────────────────────────────────────────────────────────────────
  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/settings');
      const { profile, system } = res.data.data;

      setProfileData({
        businessName:    profile?.businessName    || '',
        contact_email:   profile?.contact_email   || user?.email || '',
        contact_phone:   profile?.contact_phone   || '',
        address:         profile?.address         || '',
        working_capital: profile?.working_capital || 0,
      });
      setLogoUrl(profile?.logo_url || null);

      if (system && typeof system === 'object') {
        setSystemSettings(prev => ({ ...prev, ...system }));
      }
    } catch {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, [user?.email]);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  // ── Unified save (profile + system) ────────────────────────────────────────
  const saveAll = async (section) => {
    const setSave = section === 'profile' ? setProfileSave : setSystemSave;
    setSave('saving');
    try {
      const body = {};
      if (section === 'profile') {
        body.profile = {
          businessName:    profileData.businessName,
          contact_email:   profileData.contact_email,
          contact_phone:   profileData.contact_phone,
          address:         profileData.address,
          working_capital: parseFloat(profileData.working_capital) || 0,
        };
      } else {
        body.system = systemSettings;
      }
      await api.put('/settings', body);
      setSave('saved');
      toast.success(section === 'profile' ? 'Profile saved!' : 'Workflow settings saved!');
      setTimeout(() => setSave('idle'), 2500);
    } catch (err) {
      setSave('error');
      toast.error(err.response?.data?.message || 'Failed to save settings');
      setTimeout(() => setSave('idle'), 2500);
    }
  };

  // ── Logo upload (still uses FormData) ──────────────────────────────────────
  const handleLogoUpload = async () => {
    if (!logoFile) return;
    const fd = new FormData();
    fd.append('businessName', profileData.businessName);
    fd.append('contact_email', profileData.contact_email);
    fd.append('contact_phone', profileData.contact_phone);
    fd.append('address', profileData.address);
    fd.append('logo', logoFile);
    fd.append('_method', 'PUT');
    setProfileSave('saving');
    try {
      await api.post('/settings/profile', fd);
      await fetchSettings();
      setLogoFile(null);
      if (logoPreview) { URL.revokeObjectURL(logoPreview); setLogoPreview(null); }
      setProfileSave('saved');
      toast.success('Profile saved!');
      setTimeout(() => setProfileSave('idle'), 2500);
    } catch {
      setProfileSave('error');
      toast.error('Failed to upload logo');
      setTimeout(() => setProfileSave('idle'), 2500);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!profileData.businessName?.trim()) { toast.error('Business name is required'); return; }
    if (logoFile) { await handleLogoUpload(); } else { await saveAll('profile'); }
  };

  const handleSystemSubmit = (e) => { e.preventDefault(); saveAll('system'); };

  const handleSystemChange = (key, value) => {
    setSystemSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error('Logo must be less than 2MB'); return; }
    if (logoPreview) URL.revokeObjectURL(logoPreview);
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordSave('saving');
    try {
      await api.put('/settings/password', passwordData);
      setPasswordSave('saved');
      toast.success('Password updated!');
      setPasswordData({ current_password: '', password: '', password_confirmation: '' });
      setTimeout(() => setPasswordSave('idle'), 2500);
    } catch (err) {
      setPasswordSave('error');
      const errors = err.response?.data?.errors;
      const msg = errors ? Object.values(errors).flat()[0] : 'Failed to update password';
      toast.error(msg);
      setTimeout(() => setPasswordSave('idle'), 2500);
    }
  };

  const handleDeleteBusiness = async () => {
    const ok = await confirm({
      title: 'Delete Business Profile',
      message: 'This will permanently delete your business profile. You will be redirected to setup.',
      confirmText: 'Delete', type: 'danger',
    });
    if (!ok) return;
    try {
      await api.delete('/auth/business-profile');
      updateUser({ hasBusinessProfile: false });
      toast.success('Business profile deleted');
      navigate('/onboarding', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  // ── Logo src resolver ───────────────────────────────────────────────────────
  const resolveLogoSrc = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    const n = url.replace(/\\/g, '/');
    if (n.startsWith('/storage/') || n.startsWith('storage/')) return `${ASSET_BASE_URL}/${n.replace(/^\//, '')}`;
    return `${ASSET_BASE_URL}/storage/${n}`;
  };
  const logoSrc = logoPreview || resolveLogoSrc(logoUrl);

  // ── RENDER: Profile Tab ─────────────────────────────────────────────────────
  const renderProfile = () => (
    <form onSubmit={handleProfileSubmit} className="space-y-8">
      {/* Business identity */}
      <div>
        <SectionHeader icon={Building2} title="Business Identity" description="Your brand information visible to clients" />

        {/* Logo */}
        <div className="flex items-center gap-5 mb-6 p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10">
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center overflow-hidden shadow-lg">
              {logoSrc
                ? <img src={logoSrc} alt="logo" className="w-full h-full object-contain" />
                : <Building2 size={32} className="text-white" />
              }
            </div>
            {logoFile && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                <CheckCircle2 size={11} className="text-white" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800 dark:text-white mb-1">{profileData.businessName || 'Your Business'}</p>
            <p className="text-xs text-slate-500 dark:text-gray-400 mb-3">{profileData.contact_email || user?.email}</p>
            <label className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 rounded-lg cursor-pointer transition-colors">
              Upload Logo
              <input type="file" accept="image/*" onChange={handleLogoChange} className="sr-only" />
            </label>
            <p className="text-xs text-slate-400 dark:text-gray-500 mt-1">PNG or JPG, max 2MB</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Business Name" required
            value={profileData.businessName}
            onChange={(e) => setProfileData(p => ({ ...p, businessName: e.target.value }))}
          />
          <Input
            label="Contact Email" type="email"
            value={profileData.contact_email}
            onChange={(e) => setProfileData(p => ({ ...p, contact_email: e.target.value }))}
          />
          <Input
            label="Contact Phone"
            value={profileData.contact_phone}
            onChange={(e) => setProfileData(p => ({ ...p, contact_phone: e.target.value }))}
          />
          <Input
            label="Working Capital (ZMW)" type="number"
            value={profileData.working_capital}
            onChange={(e) => setProfileData(p => ({ ...p, working_capital: e.target.value }))}
            helperText="Editing creates a balance adjustment"
          />
          <div className="md:col-span-2">
            <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-gray-300 mb-1.5">Physical Address</label>
            <textarea
              rows={3}
              value={profileData.address}
              onChange={(e) => setProfileData(p => ({ ...p, address: e.target.value }))}
              placeholder="Street, City, Country"
              className="block w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg bg-white dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-gray-100 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/5">
        <SaveBadge state={profileSave} />
        <Button type="submit" variant="primary" isLoading={profileSave === 'saving'} leftIcon={<Save size={15} />}>
          Save Profile
        </Button>
      </div>

      {/* Danger zone */}
      <div className="mt-2 p-4 rounded-xl border border-red-100 dark:border-red-500/20 bg-red-50/50 dark:bg-red-500/5">
        <p className="text-sm font-semibold text-red-700 dark:text-red-400 mb-1">Danger Zone</p>
        <p className="text-xs text-red-500/80 dark:text-red-400/70 mb-3">This action is irreversible and will remove all business data.</p>
        <Button type="button" variant="danger" size="sm" leftIcon={<Trash2 size={14} />} onClick={handleDeleteBusiness}>
          Delete Business Profile
        </Button>
      </div>
    </form>
  );

  // ── RENDER: System Tab ──────────────────────────────────────────────────────
  const renderSystem = () => (
    <form onSubmit={handleSystemSubmit} className="space-y-8">
      {/* Workflow */}
      <div>
        <SectionHeader icon={Zap} title="Loan Workflow" description="Control how loans are processed end-to-end" />
        <div className="space-y-0 rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden bg-white dark:bg-slate-900/50 px-4">
          <SettingRow
            icon={CheckCircle2}
            label="Auto-Approve Loans"
            description="Automatically approve loans that meet all criteria without manual review"
            settingKey="workflow.auto_approve"
            value={systemSettings['workflow.auto_approve']}
            onChange={handleSystemChange}
          />
          <SettingRow
            icon={DollarSign}
            label="Late Fee Charges"
            description="Automatically apply late fees to overdue loan repayments"
            settingKey="workflow.late_fee_enabled"
            value={systemSettings['workflow.late_fee_enabled']}
            onChange={handleSystemChange}
          />
          <SettingRow
            icon={Shield}
            label="Require Collateral"
            description="Mandate that all new loans must have at least one collateral item"
            settingKey="workflow.require_collateral"
            value={systemSettings['workflow.require_collateral']}
            onChange={handleSystemChange}
          />
          <SettingRow
            icon={ToggleLeft}
            label="Allow Early Repayment"
            description="Permit borrowers to repay their loans ahead of schedule"
            settingKey="workflow.allow_early_repayment"
            value={systemSettings['workflow.allow_early_repayment']}
            onChange={handleSystemChange}
          />
        </div>
      </div>

      {/* Notifications */}
      <div>
        <SectionHeader icon={Bell} title="Email Notifications" description="Choose which events trigger email alerts" />
        <div className="space-y-0 rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden bg-white dark:bg-slate-900/50 px-4">
          <SettingRow
            icon={DollarSign}
            label="Loan Disbursement"
            description="Send email confirmation when a loan is disbursed to the borrower"
            settingKey="notification.email_on_disbursement"
            value={systemSettings['notification.email_on_disbursement']}
            onChange={handleSystemChange}
          />
          <SettingRow
            icon={CheckCircle2}
            label="Payment Received"
            description="Notify on every successful repayment recorded"
            settingKey="notification.email_on_payment"
            value={systemSettings['notification.email_on_payment']}
            onChange={handleSystemChange}
          />
          <SettingRow
            icon={AlertCircle}
            label="Overdue Alerts"
            description="Send reminders when loans become overdue"
            settingKey="notification.email_on_overdue"
            value={systemSettings['notification.email_on_overdue']}
            onChange={handleSystemChange}
          />
          <SettingRow
            icon={Clock}
            label="Scheduled Reminders"
            description="Proactive reminders sent before a due date arrives"
            settingKey="workflow.send_reminders"
            value={systemSettings['workflow.send_reminders']}
            onChange={handleSystemChange}
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/5">
        <SaveBadge state={systemSave} />
        <Button type="submit" variant="primary" isLoading={systemSave === 'saving'} leftIcon={<Save size={15} />}>
          Save Configuration
        </Button>
      </div>
    </form>
  );

  // ── RENDER: Security Tab ────────────────────────────────────────────────────
  const renderSecurity = () => (
    <div className="space-y-8">
      <div>
        <SectionHeader icon={Lock} title="Change Password" description="Choose a strong password that is unique to this account" />
        <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-sm">
          <Input
            type="password" label="Current Password"
            value={passwordData.current_password} required
            onChange={(e) => setPasswordData(p => ({ ...p, current_password: e.target.value }))}
          />
          <Input
            type="password" label="New Password"
            value={passwordData.password} required
            helperText="Minimum 8 characters"
            onChange={(e) => setPasswordData(p => ({ ...p, password: e.target.value }))}
          />
          <Input
            type="password" label="Confirm New Password"
            value={passwordData.password_confirmation} required
            onChange={(e) => setPasswordData(p => ({ ...p, password_confirmation: e.target.value }))}
          />
          <div className="flex items-center justify-between pt-2">
            <SaveBadge state={passwordSave} />
            <Button type="submit" variant="primary" isLoading={passwordSave === 'saving'} leftIcon={<Lock size={15} />}>
              Update Password
            </Button>
          </div>
        </form>
      </div>

      {/* Session info */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
            <Shield size={15} className="text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-sm font-semibold text-slate-800 dark:text-white">Account Info</p>
        </div>
        <div className="space-y-2 text-xs text-slate-600 dark:text-gray-400">
          <div className="flex justify-between"><span>Email</span><span className="font-medium text-slate-800 dark:text-white">{user?.email}</span></div>
          <div className="flex justify-between"><span>Role</span><span className="font-medium text-slate-800 dark:text-white capitalize">{user?.role?.replace('_', ' ')}</span></div>
        </div>
      </div>
    </div>
  );

  // ── Main render ─────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Header title="Settings" />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card className="p-0 sm:p-0 sticky top-6">
            <div className="p-2 flex lg:flex-col overflow-x-auto lg:overflow-x-visible no-scrollbar gap-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    id={`settings-tab-${tab.id}`}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-shrink-0 lg:w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium rounded-xl transition-all whitespace-nowrap ${
                      active
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                        : 'text-slate-600 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-white/5'
                    }`}
                  >
                    <Icon size={16} className={active ? 'text-emerald-500' : 'text-slate-400 dark:text-gray-500'} />
                    <span className="hidden sm:inline lg:inline">{tab.label}</span>
                    {active && <ChevronRight size={14} className="ml-auto hidden lg:block text-emerald-400" />}
                  </button>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <Card>
            <Card.Header>
              <Card.Title>{tabs.find(t => t.id === activeTab)?.label}</Card.Title>
            </Card.Header>
            <Card.Content>
              {loading ? (
                <div className="py-16 flex flex-col items-center gap-3">
                  <Loader2 className="animate-spin text-emerald-500" size={28} />
                  <p className="text-sm text-slate-400">Loading settings…</p>
                </div>
              ) : (
                <>
                  {activeTab === 'profile'  && renderProfile()}
                  {activeTab === 'system'   && renderSystem()}
                  {activeTab === 'team'     && <TeamSettings />}
                  {activeTab === 'security' && renderSecurity()}
                </>
              )}
            </Card.Content>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;
