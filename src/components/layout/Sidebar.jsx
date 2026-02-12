import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Wallet,
  Building2,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Briefcase,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import useUIStore from '../../store/uiStore';
import useAuthStore from '../../store/authStore';
import logoDark from '../../assets/images/logo_darkmode.png';
import logoLight from '../../assets/images/logo_lightmode.png';

const Sidebar = () => {
  const location = useLocation();
  const { sidebarCollapsed, toggleSidebar, theme } = useUIStore(); // Added theme
  const { user, logout } = useAuthStore();

  const logo = theme === 'dark' ? logoDark : logoLight;


  const menuItems = [
    { path: '/app/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/app/customers', icon: Users, label: 'Customers' },
    { path: '/app/loans', icon: Wallet, label: 'Loans' },
    { path: '/app/disbursements', icon: DollarSign, label: 'Disbursements' },
    { path: '/app/collections', icon: Briefcase, label: 'Collections' },
    { path: '/app/products', icon: Wallet, label: 'Products' },
    { path: '/app/business', icon: Building2, label: 'Business' },
    { path: '/app/settings', icon: Settings, label: 'Settings' },
  ];

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  return (
    <motion.aside
      initial={false}
      animate={{
        width: sidebarCollapsed ? '80px' : '260px',
      }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="h-[100dvh] glass border-r border-slate-200 dark:border-white/10 flex flex-col sticky top-0"
    >
      {/* Logo */}
      <div className="p-6 border-b border-slate-200 dark:border-white/10">
        <div className="flex items-center justify-between">
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center space-x-3"
            >
              <img src={logo} alt="Cryndol Logo" className="h-8 w-auto object-contain" />
            </motion.div>
          )}
          {sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center w-full"
            >
              <img src={logo} alt="Cryndol" className="h-8 w-auto object-contain" />
            </motion.div>
          )}
          <button
            onClick={toggleSidebar}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors ml-auto"
          >
            {sidebarCollapsed ? (
              <ChevronRight size={20} className="text-gray-400" />
            ) : (
              <ChevronLeft size={20} className="text-gray-400" />
            )}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => useUIStore.getState().setMobileMenuOpen(false)}
            >
              <div
                className={cn(
                  'flex items-center px-4 py-3 mx-2 rounded-xl transition-all duration-200 group',
                  'hover:bg-slate-100 dark:hover:bg-white/5',
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-sm ring-1 ring-emerald-500/20'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                )}
              >
                <Icon size={20} className={cn("flex-shrink-0 transition-colors", isActive ? "text-emerald-600 dark:text-emerald-400" : "group-hover:text-slate-900 dark:group-hover:text-slate-200")} />
                {!sidebarCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="ml-3 font-medium"
                  >
                    {item.label}
                  </motion.span>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* User Profile & Logout */}
      <div className="p-4 border-t border-slate-200 dark:border-white/10">
        {!sidebarCollapsed && user && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-3 p-3 glass-hover rounded-lg"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 dark:text-gray-200 truncate">{user.name || 'User'}</p>
                <p className="text-xs text-slate-500 dark:text-gray-400 truncate">{user.email}</p>
              </div>
            </div>
          </motion.div>
        )}

        <button
          onClick={handleLogout}
          className={cn(
            'w-full flex items-center px-3 py-3 rounded-lg transition-all duration-200',
            sidebarCollapsed && 'justify-center',
            'text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-300'
          )}
        >
          <LogOut size={20} />
          {!sidebarCollapsed && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="ml-3 font-medium"
            >
              Logout
            </motion.span>
          )}
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
