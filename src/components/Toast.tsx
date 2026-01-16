import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

// Types
type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
    duration?: number;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType, duration?: number) => void;
}

// Context
const ToastContext = createContext<ToastContextType | null>(null);

// Hook
export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

// Provider Component
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType = 'info', duration: number = 3000) => {
        const id = `toast_${Date.now()}`;
        setToasts(prev => [...prev, { id, message, type, duration }]);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </ToastContext.Provider>
    );
};

// Toast Container
const ToastContainer: React.FC<{ toasts: Toast[]; onRemove: (id: string) => void }> = ({ toasts, onRemove }) => {
    return (
        <div className="position-fixed bottom-0 end-0 p-3 z-3" style={{ maxWidth: '350px' }}>
            {toasts.map(toast => (
                <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
            ))}
        </div>
    );
};

// Single Toast Item
const ToastItem: React.FC<{ toast: Toast; onRemove: (id: string) => void }> = ({ toast, onRemove }) => {
    useEffect(() => {
        if (toast.duration) {
            const timer = setTimeout(() => onRemove(toast.id), toast.duration);
            return () => clearTimeout(timer);
        }
    }, [toast, onRemove]);

    const icons = {
        success: <CheckCircle size={18} className="text-success" />,
        error: <AlertCircle size={18} className="text-danger" />,
        info: <Info size={18} className="text-primary" />,
        warning: <AlertTriangle size={18} className="text-warning" />,
    };

    const bgColors = {
        success: 'bg-success bg-opacity-10 border-success',
        error: 'bg-danger bg-opacity-10 border-danger',
        info: 'bg-primary bg-opacity-10 border-primary',
        warning: 'bg-warning bg-opacity-10 border-warning',
    };

    return (
        <div
            className={`d-flex align-items-start gap-2 p-3 mb-2 rounded-3 border shadow-sm fade-in ${bgColors[toast.type]}`}
            role="alert"
        >
            {icons[toast.type]}
            <span className="flex-grow-1 small">{toast.message}</span>
            <button
                onClick={() => onRemove(toast.id)}
                className="btn btn-sm btn-link text-muted p-0"
            >
                <X size={14} />
            </button>
        </div>
    );
};
