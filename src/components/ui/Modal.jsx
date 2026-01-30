import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';

const Modal = ({ isOpen, onClose, title, children, size = 'md', showCloseButton = true }) => {
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-6xl',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.3 }}
              className={cn('w-full', sizes[size])}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="glass rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
                {/* Header */}
                {(title || showCloseButton) && (
                  <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                    {title && <h2 className="text-xl font-bold text-gray-100">{title}</h2>}
                    {showCloseButton && (
                      <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-200 transition-colors p-1 hover:bg-white/10 rounded-lg"
                      >
                        <X size={20} />
                      </button>
                    )}
                  </div>
                )}

                {/* Content */}
                <div className="px-6 py-4 max-h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar">
                  {children}
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Modal;
