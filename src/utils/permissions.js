import { useCallback } from 'react';

/**
 * Global permission validator
 * @param {string} permission - Permission key (e.g., 'loans.create')
 * @returns {boolean}
 */
export const hasPermission = (permission) => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return false;

    // Super admins have all permissions
    if (user.role === 'SUPER_ADMIN') return true;
    const permissions = user.permissions || [];
    return permissions.includes(permission);
  } catch (error) {
    console.error('Permission check failed:', error);
    return false;
  }
};

/**
 * React hook for permission checks
 */
export const usePermissions = () => {
  const check = useCallback((permission) => {
    return hasPermission(permission);
  }, []);

  return { can: check };
};

export const PERMISSIONS = {
  LOANS: {
    VIEW: 'loans.view',
    CREATE: 'loans.create',
    EDIT: 'loans.edit',
    DELETE: 'loans.delete',
    APPROVE: 'loans.approve',
  },
  DISBURSEMENTS: {
    VIEW: 'disbursements.view',
    PROCESS: 'disbursements.process',
  },
  CUSTOMERS: {
    VIEW: 'customers.view',
    CREATE: 'customers.create',
    EDIT: 'customers.edit',
  },
  REPORTS: {
    VIEW: 'reports.view',
  },
  SETTINGS: {
    VIEW: 'settings.view',
    EDIT: 'settings.edit',
  },
  TEAM: {
    VIEW: 'team.view',
    EDIT: 'team.edit',
  }
};
