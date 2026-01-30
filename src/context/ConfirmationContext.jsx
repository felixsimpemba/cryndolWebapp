import React, { createContext, useContext, useState, useCallback } from 'react';
import ConfirmationModal from '../components/modals/ConfirmationModal';

const ConfirmationContext = createContext();

export const ConfirmationProvider = ({ children }) => {
    const [modalState, setModalState] = useState({
        isOpen: false,
        title: '',
        message: '',
        confirmText: 'Confirm',
        cancelText: 'Cancel',
        type: 'warning',
    });

    const [resolver, setResolver] = useState(null);

    const confirm = useCallback(({
        title = 'Confirm Action',
        message = 'Are you sure you want to proceed?',
        confirmText = 'Confirm',
        cancelText = 'Cancel',
        type = 'warning'
    } = {}) => {
        setModalState({
            isOpen: true,
            title,
            message,
            confirmText,
            cancelText,
            type,
        });

        return new Promise((resolve) => {
            setResolver(() => resolve);
        });
    }, []);

    const handleConfirm = useCallback(() => {
        if (resolver) {
            resolver(true);
        }
        setModalState((prev) => ({ ...prev, isOpen: false }));
    }, [resolver]);

    const handleCancel = useCallback(() => {
        if (resolver) {
            resolver(false);
        }
        setModalState((prev) => ({ ...prev, isOpen: false }));
    }, [resolver]);

    return (
        <ConfirmationContext.Provider value={{ confirm }}>
            {children}
            <ConfirmationModal
                isOpen={modalState.isOpen}
                onClose={handleCancel}
                onConfirm={handleConfirm}
                title={modalState.title}
                message={modalState.message}
                confirmText={modalState.confirmText}
                cancelText={modalState.cancelText}
                type={modalState.type}
            />
        </ConfirmationContext.Provider>
    );
};

export const useConfirmation = () => {
    const context = useContext(ConfirmationContext);
    if (!context) {
        throw new Error('useConfirmation must be used within a ConfirmationProvider');
    }
    return context;
};
