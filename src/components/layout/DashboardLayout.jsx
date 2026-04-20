import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { motion, AnimatePresence } from 'framer-motion';
import useUIStore from '../../store/uiStore';
import { Bell, Search, Menu, User, Briefcase, Loader2, X } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import ThemeToggle from '../ui/ThemeToggle';
import api from '../../services/api';

const DashboardLayout = () => {
  const { mobileMenuOpen, setMobileMenuOpen, toggleMobileMenu } = useUIStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ customers: [], loans: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchInputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Keyboard Shortcuts (Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setShowSearchResults(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) && 
          searchInputRef.current && !searchInputRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced Search Logic
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.length >= 2) {
        setIsSearching(true);
        setShowSearchResults(true);
        try {
          const response = await api.get(`/search/global?query=${searchQuery}`);
          setSearchResults(response.data.data);
        } catch (error) {
          console.error("Search failed:", error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults({ customers: [], loans: [] });
        setShowSearchResults(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleResultClick = (type, item) => {
    setShowSearchResults(false);
    setSearchQuery('');
    if (type === 'customer') {
      navigate(`/app/customers?search=${item.first_name}`); // Or just go to customers and let it filter
    } else if (type === 'loan') {
      navigate(`/app/loans?search=${item.loan_number}`);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-slate-950 font-sans selection:bg-emerald-500/30 selection:text-emerald-900 leading-relaxed">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}
      {mobileMenuOpen && (
        <>
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-[50] lg:hidden"
          />
          <div className="fixed inset-y-0 left-0 z-[60] lg:hidden w-[280px]">
            <Sidebar />
          </div>
        </>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Top Navigation / Header */}
        <header className="h-20 flex-shrink-0 border-b border-slate-100 dark:border-white/5 px-6 lg:px-10 flex items-center justify-between z-30 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl">
          <div className="flex items-center gap-4">
             <button 
               onClick={toggleMobileMenu}
               className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-colors border border-slate-200 dark:border-white/10"
             >
               <Menu size={20} className="text-slate-600 dark:text-slate-400" />
             </button>
             
             <div className="hidden md:flex items-center relative group">
                <div className="flex items-center bg-slate-100 dark:bg-white/5 rounded-2xl px-4 py-2 w-72 focus-within:ring-2 focus-within:ring-emerald-500/50 transition-all border border-transparent focus-within:border-emerald-500/20 group">
                    <Search size={18} className="text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                    <input 
                      ref={searchInputRef}
                      type="text" 
                      placeholder="Global search..." 
                      className="bg-transparent border-none focus:outline-none ml-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-500 w-full"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => searchQuery.length >= 2 && setShowSearchResults(true)}
                    />
                    {searchQuery && (
                        <button onClick={() => setSearchQuery('')} className="p-1 hover:bg-slate-200 dark:hover:bg-white/10 rounded-full transition-colors mr-1">
                            <X size={12} className="text-slate-400" />
                        </button>
                    )}
                    <span className="text-[10px] font-bold text-slate-400 border border-slate-300 dark:border-white/10 px-1.5 py-0.5 rounded-md ml-auto uppercase tracking-tighter">Ctrl K</span>
                </div>

                {/* Search Results Dropdown */}
                <AnimatePresence>
                    {showSearchResults && (
                        <motion.div 
                            ref={dropdownRef}
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="absolute top-14 left-0 w-[400px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden z-50 backdrop-blur-xl"
                        >
                            {isSearching ? (
                                <div className="p-8 text-center">
                                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-emerald-500 mb-2" />
                                    <p className="text-xs text-slate-500">Searching everything...</p>
                                </div>
                            ) : (
                                <div className="max-h-[80vh] overflow-y-auto p-2 custom-scrollbar">
                                    {searchResults.customers.length === 0 && searchResults.loans.length === 0 ? (
                                        <div className="p-8 text-center text-slate-500">
                                            <p className="text-sm font-medium">No results found</p>
                                            <p className="text-xs mt-1">Try a different name or loan number</p>
                                        </div>
                                    ) : (
                                        <>
                                            {/* Customers Section */}
                                            {searchResults.customers.length > 0 && (
                                                <div className="mb-2">
                                                    <h3 className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                                        <User size={12} />
                                                        Customers
                                                    </h3>
                                                    {searchResults.customers.map(customer => (
                                                        <button 
                                                            key={customer.id}
                                                            onClick={() => handleResultClick('customer', customer)}
                                                            className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group flex items-start gap-3"
                                                        >
                                                            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                                                                <User size={16} />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{customer.first_name} {customer.last_name}</p>
                                                                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{customer.email}</p>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Loans Section */}
                                            {searchResults.loans.length > 0 && (
                                                <div>
                                                    <h3 className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                                        <Briefcase size={12} />
                                                        Loans
                                                    </h3>
                                                    {searchResults.loans.map(loan => (
                                                        <button 
                                                            key={loan.id}
                                                            onClick={() => handleResultClick('loan', loan)}
                                                            className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group flex items-start gap-3"
                                                        >
                                                            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                                                                <Briefcase size={16} />
                                                            </div>
                                                            <div>
                                                                <div className="flex items-center gap-2">
                                                                    <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{loan.loan_number}</p>
                                                                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase ${
                                                                        loan.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-500' : 
                                                                        loan.status === 'PAID' ? 'bg-blue-500/10 text-blue-500' : 'bg-slate-500/10 text-slate-500'
                                                                    }`}>
                                                                        {loan.status}
                                                                    </span>
                                                                </div>
                                                                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                                                    {loan.customer?.first_name} {loan.customer?.last_name} • K{parseFloat(loan.principal_amount).toLocaleString()}
                                                                </p>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}
                            <div className="p-3 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-black/20 flex items-center justify-between">
                                <p className="text-[10px] text-slate-500 italic">Showing top results</p>
                                <div className="flex items-center gap-2">
                                    <span className="text-[9px] font-bold text-slate-400 bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-white/10 uppercase tracking-tighter">Enter to view</span>
                                    <span className="text-[9px] font-bold text-slate-400 bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-white/10 uppercase tracking-tighter">Esc to close</span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
             </div>

          </div>

          <div className="flex items-center gap-2 md:gap-4">
             <div className="hidden sm:flex items-center gap-1 bg-slate-100 dark:bg-white/5 p-1 rounded-2xl border border-slate-200 dark:border-white/10">
                <button className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all relative group text-slate-500 dark:text-slate-400">
                    <Bell size={18} />
                    <span className="absolute top-2 right-2.5 w-1.5 h-1.5 bg-rose-500 rounded-full border-2 border-white dark:border-slate-800" />
                    <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">Notifications</div>
                </button>
                <div className="w-px h-4 bg-slate-300 dark:bg-white/10 mx-1" />
                <ThemeToggle />
             </div>
             
             <div className="h-10 w-px bg-slate-200 dark:bg-white/10 mx-1 hidden lg:block" />
             
             <div className="flex items-center gap-3 pl-2">
                <div className="hidden lg:block text-right">
                   <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{user?.fullName}</p>
                   <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest leading-none mt-0.5">Administrator</p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-400 border-2 border-white dark:border-slate-800 shadow-md flex items-center justify-center text-white font-black text-sm">
                   {user?.fullName?.charAt(0)}
                </div>
             </div>
          </div>
        </header>

        {/* Scrollable Viewport */}
        <main className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/50 dark:bg-slate-900/10">
           <div className="max-w-[1600px] mx-auto p-6 lg:p-10">
              <Outlet />
           </div>
        </main>
      </div>

      {/* Global CSS for scrollbars (ensure it exists in index.css) */}
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.05); border-radius: 10px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(16, 185, 129, 0.2); }
      `}} />
    </div>
  );
};

export default DashboardLayout;
