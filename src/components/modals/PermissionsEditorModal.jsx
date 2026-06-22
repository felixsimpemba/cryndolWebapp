import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, Check, Lock } from 'lucide-react';
import Button from '../ui/Button';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { PERMISSIONS } from '../../utils/permissions';

const PermissionsEditorModal = ({ isOpen, onClose, member, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState([]);

  useEffect(() => {
    if (member) {
      setSelectedPermissions(member.permissions || []);
    }
  }, [member, isOpen]);

  const togglePermission = (perm) => {
    setSelectedPermissions(prev => 
      prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]
    );
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await api.put(`/settings/team/${member.id}`, {
        permissions: selectedPermissions
      });
      toast.success('Permissions updated successfully');
      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error('Failed to update permissions');
    } finally {
      setIsLoading(false);
    }
  };

  const permissionGroups = [
    {
      title: 'Loans',
      perms: [
        { key: PERMISSIONS.LOANS.VIEW, label: 'View Loans' },
        { key: PERMISSIONS.LOANS.CREATE, label: 'Create Loans' },
        { key: PERMISSIONS.LOANS.EDIT, label: 'Edit/Manage Loans' },
        { key: PERMISSIONS.LOANS.APPROVE, label: 'Approve Loans' },
        { key: PERMISSIONS.LOANS.DELETE, label: 'Delete Loans' },
      ]
    },
    {
      title: 'Disbursements',
      perms: [
        { key: PERMISSIONS.DISBURSEMENTS.VIEW, label: 'View Queue' },
        { key: PERMISSIONS.DISBURSEMENTS.PROCESS, label: 'Process Payouts' },
      ]
    },
    {
      title: 'Customers',
      perms: [
        { key: PERMISSIONS.CUSTOMERS.VIEW, label: 'View Customers' },
        { key: PERMISSIONS.CUSTOMERS.CREATE, label: 'Register Customers' },
        { key: PERMISSIONS.CUSTOMERS.EDIT, label: 'Edit Customers' },
      ]
    },
    {
      title: 'Administration',
      perms: [
        { key: PERMISSIONS.TEAM.VIEW, label: 'View Team' },
        { key: PERMISSIONS.TEAM.EDIT, label: 'Manage Team' },
        { key: PERMISSIONS.SETTINGS.VIEW, label: 'View Settings' },
        { key: PERMISSIONS.SETTINGS.EDIT, label: 'Edit Settings' },
        { key: PERMISSIONS.REPORTS.VIEW, label: 'View Reports' },
      ]
    }
  ];

  if (!member) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100]"
          />
          <div className="fixed inset-0 flex items-center justify-center z-[101] p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-slate-900 rounded-[2rem] w-full max-w-2xl border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden pointer-events-auto max-h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-800/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center text-primary-500">
                    <Shield size={22} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Permissions Editor</h2>
                    <p className="text-xs text-slate-500 font-medium">Manage access for {member.fullName}</p>
                  </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg transition-colors">
                  <X size={20} className="text-slate-500" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8">
                {member.role === 'SUPER_ADMIN' ? (
                  <div className="p-8 text-center space-y-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-white/10">
                    <div className="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto">
                      <Lock size={32} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">Super Admin Full Access</h3>
                      <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1">
                        Super Admins have unrestricted access to all features by default. Individual permissions cannot be restricted for this role.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {permissionGroups.map((group) => (
                      <div key={group.title} className="space-y-3">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 px-1">{group.title}</h3>
                        <div className="space-y-2">
                          {group.perms.map((perm) => {
                            const isSelected = selectedPermissions.includes(perm.key);
                            return (
                              <button
                                key={perm.key}
                                onClick={() => togglePermission(perm.key)}
                                className={`w-full flex items-center justify-between p-3.5 rounded-xl border transition-all text-left group ${
                                  isSelected 
                                    ? 'bg-primary-500/5 border-primary-500/30 text-primary-600 dark:text-primary-400 shadow-sm' 
                                    : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-white/5 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-white/20'
                                }`}
                              >
                                <span className="text-sm font-medium">{perm.label}</span>
                                <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                                  isSelected 
                                    ? 'bg-primary-500 border-primary-500 text-white' 
                                    : 'border-slate-300 dark:border-slate-600 group-hover:border-primary-500'
                                }`}>
                                  {isSelected && <Check size={14} strokeWidth={3} />}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-6 sm:p-8 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-end gap-3">
                <Button variant="ghost" onClick={onClose} disabled={isLoading}>Cancel</Button>
                {member.role !== 'SUPER_ADMIN' && (
                  <Button 
                    variant="primary" 
                    isLoading={isLoading} 
                    onClick={handleSubmit}
                    className="px-8"
                  >
                    Save Changes
                  </Button>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default PermissionsEditorModal;
