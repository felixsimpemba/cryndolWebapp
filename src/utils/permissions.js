export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  LOAN_OFFICER: 'loan_officer',
  VIEWER: 'viewer',
};

const PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: [
    'dashboard',
    'customers',
    'loans',
    'disbursements',
    'collections',
    'templates',
    'business',
    'settings',
    'ledger',
    'wallets',
    'reports',
    'branches',
    'team',
    'view_financial_summary',
    'manage_capital',
  ],
  [ROLES.ADMIN]: [
    'dashboard',
    'customers',
    'loans',
    'disbursements',
    'collections',
    'templates',
    'settings',
    'reports',
    'branches',
    'team',
    'view_financial_summary',
  ],
  [ROLES.LOAN_OFFICER]: [
    'dashboard',
    'customers',
    'loans',
    'disbursements',
    'collections',
  ],
  [ROLES.VIEWER]: [
    'dashboard',
    'customers',
    'loans',
    'reports',
  ],
};

/**
 * Check if a role has permission for a specific feature or page
 * @param {string} role - The user's role
 * @param {string} permission - The permission/feature key to check
 * @returns {boolean}
 */
export const hasPermission = (role, permission) => {
  if (!role) return false;
  
  // Backend returns uppercase role names, normalize them
  const normalizedRole = role.toLowerCase();
  const rolePermissions = PERMISSIONS[normalizedRole] || [];
  
  return rolePermissions.includes(permission);
};

/**
 * Check if a role is at least a certain level (hierarchy)
 * @param {string} userRole 
 * @param {string} requiredRole 
 * @returns {boolean}
 */
export const isAtLeast = (userRole, requiredRole) => {
  const normalizedUserRole = userRole?.toLowerCase();
  const normalizedRequiredRole = requiredRole?.toLowerCase();
  
  const hierarchy = [ROLES.VIEWER, ROLES.LOAN_OFFICER, ROLES.ADMIN, ROLES.SUPER_ADMIN];
  const userIndex = hierarchy.indexOf(normalizedUserRole);
  const requiredIndex = hierarchy.indexOf(normalizedRequiredRole);
  return userIndex >= requiredIndex;
};
