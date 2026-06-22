import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';

const SearchableSelect = ({
  options = [],
  value,
  onChange,
  placeholder = "Select an option...",
  label,
  error,
  leftIcon,
  className,
  containerClassName,
  required,
  loading = false,
  emptyMessage = "No results found",
  searchPlaceholder = "Search...",
  disabled = false,
  renderOption,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const selectedOption = options.find(opt => String(opt.value) === String(value));

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (option.subLabel && option.subLabel.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      if (inputRef.current) inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = (option) => {
    onChange(String(option.value));
    setIsOpen(false);
  };

  const clearSelection = (e) => {
    e.stopPropagation();
    onChange('');
  };

  return (
    <div className={cn("w-full relative", containerClassName)} ref={containerRef}>
      {label && (
        <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-gray-300 mb-1.5 sm:mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={cn(
          'relative flex items-center w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg transition-all duration-200 cursor-pointer',
          'bg-white dark:bg-slate-800/50',
          'border border-slate-300 dark:border-slate-700',
          'text-sm sm:text-base text-slate-900 dark:text-gray-100',
          'hover:border-slate-400 dark:hover:border-slate-600',
          isOpen && 'ring-2 ring-emerald-500/50 border-emerald-500',
          error && 'border-red-500 ring-red-500/50',
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
      >
        {leftIcon && (
          <div className="mr-3 text-slate-400 dark:text-gray-400">
            {leftIcon}
          </div>
        )}

        <div className="flex-1 truncate">
          {selectedOption ? (
            <span className="text-slate-900 dark:text-gray-100">{selectedOption.label}</span>
          ) : (
            <span className="text-slate-400 dark:text-gray-500">{placeholder}</span>
          )}
        </div>

        <div className="flex items-center ml-2">
          {value && !disabled && (
            <button
              onClick={clearSelection}
              className="p-1 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-red-500 mr-1"
            >
              <X size={14} />
            </button>
          )}
          <ChevronDown
            size={18}
            className={cn(
              "text-slate-400 transition-transform duration-200",
              isOpen && "rotate-180"
            )}
          />
        </div>
      </div>

      {error && (
        <p className="mt-1.5 text-sm text-red-400 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 4, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.1 }}
            className="absolute z-[110] left-0 right-0 top-full bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[300px]"
          >
            <div className="p-3 border-b border-slate-100 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900 z-10">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  ref={inputRef}
                  type="text"
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                  placeholder={searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>

            <div className="overflow-y-auto custom-scrollbar flex-1">
              {loading ? (
                <div className="p-4 text-center">
                  <div className="inline-block animate-spin h-5 w-5 border-2 border-emerald-500 border-t-transparent rounded-full" />
                </div>
              ) : filteredOptions.length > 0 ? (
                <div className="py-1">
                  {filteredOptions.map((option) => (
                    <div
                      key={option.value}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelect(option);
                      }}
                      className={cn(
                        "px-4 py-2 text-sm cursor-pointer flex items-center justify-between transition-colors",
                        String(value) === String(option.value)
                          ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium"
                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5"
                      )}
                    >
                      <div className="flex-1">
                        {renderOption ? renderOption(option) : (
                          <>
                            <div className="font-medium">{option.label}</div>
                            {option.subLabel && (
                              <div className="text-[10px] opacity-70 mt-0.5">{option.subLabel}</div>
                            )}
                          </>
                        )}
                      </div>
                      {String(value) === String(option.value) && (
                        <Check size={16} className="text-emerald-500 ml-2" />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-sm text-slate-500 dark:text-slate-400">
                  {emptyMessage}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchableSelect;
