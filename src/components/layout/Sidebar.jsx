import React, { useState, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Wallet,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Briefcase,
  PieChart,
  BookOpen,
  MapPin,
  ShieldCheck,
  ChevronDown,
  Building2,
  Table as TableIcon,
  CreditCard,
  History,
  UserPlus
} from 'lucide-react';
import { cn } from '../../utils/cn';
import useUIStore from '../../store/uiStore';
import useAuthStore from '../../store/authStore';
import { hasPermission } from '../../utils/permissions';

// Move NavItem outside to prevent re-creation on every render
const NavItem = ({ item, isActive, isExpanded, onToggle, sidebarCollapsed, role, pathname, onClick }) => {
  // Permission check for parent or leaf node
  if (item.permission && !hasPermission(role, item.permission)) {
    return null;
  }

  const Icon = item.icon;
  const hasSubItems = item.subItems && item.subItems.length > 0;

  if (hasSubItems) {
    // Filter sub-items based on permissions
    const visibleSubItems = item.subItems.filter(si => !si.permission || hasPermission(role, si.permission));

    if (visibleSubItems.length === 0) return null;

    return (
      <div className="mb-1">
        <button
          onClick={() => onToggle(item.label)}
          className={cn(
            'w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all duration-200 group text-left',
            'hover:bg-slate-100 dark:hover:bg-white/5',
            isExpanded ? 'text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-white/5' : 'text-slate-500 dark:text-slate-400'
          )}
        >
          <div className="flex items-center overflow-hidden min-w-0">
            <Icon size={20} className={cn("flex-shrink-0 transition-colors", isExpanded ? "text-emerald-500" : "group-hover:text-slate-700 dark:group-hover:text-slate-200")} />
            {!sidebarCollapsed && <span className="ml-3 font-medium text-sm truncate">{item.label}</span>}
          </div>
          {!sidebarCollapsed && (
            <ChevronDown
              size={14}
              className={cn("transition-transform duration-200 flex-shrink-0 ml-2", isExpanded ? "rotate-180" : "")}
            />
          )}
        </button>

        <AnimatePresence initial={false}>
          {isExpanded && !sidebarCollapsed && (
            <motion.div
              key={`${item.label}-subitems`}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "circOut" }}
              className="overflow-hidden ml-4 pl-4 border-l border-slate-200 dark:border-white/10 mt-1 space-y-1"
            >
              {visibleSubItems.map(subItem => {
                const isSubActive = pathname === subItem.path;
                return (
                  <Link key={subItem.path} to={subItem.path} onClick={onClick}>
                    <div className={cn(
                      'flex items-center px-4 py-2 rounded-lg text-xs font-semibold transition-all group mb-0.5',
                      isSubActive
                        ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/5'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5'
                    )}>
                      <subItem.icon size={14} className="mr-2 flex-shrink-0" />
                      <span className="truncate">{subItem.label}</span>
                    </div>
                  </Link>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <Link to={item.path} onClick={onClick} className="block mb-1">
      <div className={cn(
        'flex items-center px-4 py-2.5 rounded-xl transition-all duration-200 group',
        isActive
          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-sm ring-1 ring-emerald-500/20'
          : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5'
      )}>
        <Icon size={20} className={cn("flex-shrink-0 transition-colors", isActive ? "text-emerald-600 dark:text-emerald-400" : "group-hover:text-emerald-500")} />
        {!sidebarCollapsed && <span className="ml-3 font-medium text-sm truncate">{item.label}</span>}
        {isActive && !sidebarCollapsed && (
          <div className="ml-auto w-1 h-4 bg-emerald-500 rounded-full" />
        )}
      </div>
    </Link>
  );
};

const Sidebar = () => {
  const { pathname } = useLocation();
  const { sidebarCollapsed, toggleSidebar, setMobileMenuOpen } = useUIStore();
  const { user, logout } = useAuthStore();
  const [expandedItems, setExpandedItems] = useState(['Management', 'Operations']);

  const toggleExpand = (label) => {
    setExpandedItems(prev =>
      prev.includes(label) ? prev.filter(i => i !== label) : [...prev, label]
    );
  };

  const handleNavItemClick = () => {
    // Close mobile menu on every interaction
    setMobileMenuOpen(false);
  };

  const navGroups = useMemo(() => [
    {
      group: "Core",
      items: [
        { path: '/app/dashboard', icon: LayoutDashboard, label: 'Dashboard', permission: 'dashboard' },
      ]
    },
    {
      group: "Portfolio",
      items: [
        {
          label: 'Management',
          icon: Wallet,
          permission: 'customers',
          subItems: [
            { path: '/app/loans', label: 'Active Loans', icon: Wallet, permission: 'loans' },
            { path: '/app/customers', label: 'Customers', icon: Users, permission: 'customers' },
            { path: '/app/templates', label: 'Loan Templates', icon: BookOpen, permission: 'templates' },
          ]
        },
        {
          label: 'Operations',
          icon: Briefcase,
          permission: 'disbursements',
          subItems: [
            { path: '/app/disbursements', label: 'Disbursements', icon: DollarSign, permission: 'disbursements' },
            { path: '/app/collections', label: 'Collections', icon: CreditCard, permission: 'collections' },
          ]
        }
      ]
    },
    {
      group: "Finance",
      items: [
        {
          label: 'Accounting',
          icon: TableIcon,
          permission: 'ledger',
          subItems: [
            { path: '/app/ledger', label: 'General Ledger', icon: History, permission: 'ledger' },
            { path: '/app/wallets', label: 'Wallets/Accounts', icon: Wallet, permission: 'wallets' },
          ]
        },
        { path: '/app/reports', icon: PieChart, label: 'Business Intelligence', permission: 'reports' },
      ]
    },
    {
      group: "Administration",
      items: [
        {
          label: 'Org Structure',
          icon: Building2,
          permission: 'team',
          subItems: [
            { path: '/app/branches', label: 'Branches', icon: MapPin, permission: 'branches' },
            { path: '/app/team', label: 'Staff Directory', icon: UserPlus, permission: 'team' },
          ]
        },
        { path: '/app/settings', icon: Settings, label: 'System Settings', permission: 'settings' },
      ]
    }
  ], []);

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/login';
    } catch (err) {
      console.error(err);
      window.location.href = '/login';
    }
  };

  return (
    <aside
      style={{ width: sidebarCollapsed ? '80px' : '280px' }}
      className="h-[100dvh] bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-white/10 flex flex-col sticky top-0 z-40 shadow-sm transition-none"
    >
      {/* Brand Section */}
      <div className="h-20 flex-shrink-0 flex items-center px-6 border-b border-slate-100 dark:border-white/5">
        <div className="flex items-center w-full min-w-0">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/20">
              <Building2 className="text-white" size={24} />
            </div>
            {!sidebarCollapsed && (
              <span className="text-xl font-black bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent truncate">
                Cryndol
              </span>
            )}
          </div>

          <button
            onClick={toggleSidebar}
            className="p-1.5 ml-auto hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
          >
            {sidebarCollapsed ? (
              <ChevronRight size={18} className="text-slate-400" />
            ) : (
              <ChevronLeft size={18} className="text-slate-400" />
            )}
          </button>
        </div>
      </div>

      {/* Nav Content */}
      <nav className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
        {navGroups.map((group, idx) => {
          const visibleItems = group.items.filter(item => {
            if (item.subItems) {
              return item.subItems.some(si => !si.permission || hasPermission(user?.role, si.permission));
            }
            return !item.permission || hasPermission(user?.role, item.permission);
          });

          if (visibleItems.length === 0) return null;

          return (
            <div key={group.group}>
              {!sidebarCollapsed && (
                <h3 className="px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-600 mb-3 ml-1">
                  {group.group}
                </h3>
              )}
              <div className="space-y-1">
                {visibleItems.map((item, i) => (
                  <NavItem
                    key={item.label}
                    item={item}
                    isActive={pathname === item.path}
                    isExpanded={expandedItems.includes(item.label)}
                    onToggle={toggleExpand}
                    onClick={handleNavItemClick}
                    sidebarCollapsed={sidebarCollapsed}
                    role={user?.role}
                    pathname={pathname}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </nav>

      {/* User Footer */}
      <div className="p-4 bg-slate-50 dark:bg-white/5 border-t border-slate-100 dark:border-white/5 flex-shrink-0">
        {!sidebarCollapsed && user && (
          <div className="flex items-center p-2 mb-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {user.fullName?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="ml-3 overflow-hidden">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user.fullName}</p>
              <p className="text-[10px] text-slate-500 truncate uppercase tracking-tighter">{user.role}</p>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          className={cn(
            'w-full flex items-center px-4 py-2.5 rounded-xl transition-all duration-200',
            sidebarCollapsed && 'justify-center',
            'text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 font-bold text-xs uppercase tracking-widest'
          )}
        >
          <LogOut size={16} />
          {!sidebarCollapsed && <span className="ml-3">Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
