import React from 'react';
import { Bell, Menu, Search } from 'lucide-react';
import useUIStore from '../../store/uiStore';
import useAuthStore from '../../store/authStore';
import ThemeToggle from '../ui/ThemeToggle';

const Header = ({ title }) => {
  const { toggleMobileMenu } = useUIStore();
  const { user } = useAuthStore();

  return (
    <header className="bg-white/80 dark:bg-[#0F172A]/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left:Title & Mobile Menu */}
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleMobileMenu}
              className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors"
            >
              <Menu size={24} className="text-gray-400" />
            </button>
            {title && <h1 className="text-2xl font-bold text-slate-900 dark:text-gray-100">{title}</h1>}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center space-x-4">
            {/* Search (future enhancement) */}
            <button className="hidden md:flex items-center space-x-2 px-4 py-2 glass-hover rounded-lg transition-colors">
              <Search size={18} className="text-slate-500 dark:text-gray-400" />
              <span className="text-sm text-slate-500 dark:text-gray-400">Search...</span>
            </button>

            {/* Notifications */}
            <button className="relative p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors">
              <Bell size={20} className="text-slate-500 dark:text-gray-400" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* User Avatar */}
            <div className="hidden md:flex items-center space-x-3 pl-4 border-l border-slate-200 dark:border-white/10">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800 dark:text-gray-200">{user?.name || 'User'}</p>
                <p className="text-xs text-slate-500 dark:text-gray-400">Administrator</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
