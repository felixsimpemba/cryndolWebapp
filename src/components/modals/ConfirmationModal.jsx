import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle, HelpCircle, X } from 'lucide-react';
import Button from '../ui/Button';

const ConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    type = 'warning'
}) => {

    // Close on Escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const getIcon = () => {
        switch (type) {
            case 'danger': return <AlertCircle size={32} className="text-red-500" />;
            case 'success': return <CheckCircle size={32} className="text-emerald-500" />;
            case 'info': return <HelpCircle size={32} className="text-blue-500" />;
            default: return <AlertCircle size={32} className="text-amber-500" />;
        }
    };

    const getButtonVariant = () => {
        switch (type) {
            case 'danger': return 'danger';
            case 'success': return 'primary'; // Assuming primary is green/success
            case 'info': return 'primary';
            default: return 'primary'; // Warning usually uses primary or specific warning
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="p-6 text-center">
                        <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 
              ${type === 'danger' ? 'bg-red-100 dark:bg-red-500/10' :
                                type === 'success' ? 'bg-emerald-100 dark:bg-emerald-500/10' :
                                    'bg-amber-100 dark:bg-amber-500/10'}`}>
                            {getIcon()}
                        </div>

                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                            {title}
                        </h3>

                        <p className="text-slate-600 dark:text-gray-300 mb-8">
                            {message}
                        </p>

                        <div className="flex gap-3 justify-center">
                            <Button variant="ghost" onClick={onClose}>
                                {cancelText}
                            </Button>
                            <Button variant={getButtonVariant()} onClick={onConfirm}>
                                {confirmText}
                            </Button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default ConfirmationModal;
