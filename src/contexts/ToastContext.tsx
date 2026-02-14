import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

interface Toast {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info';
    duration: number;
}

interface ToastContextType {
    addToast: (message: string, type?: Toast['type'], duration?: number) => void;
}

const ToastContext = createContext<ToastContextType>({ addToast: () => { } });

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const addToast = useCallback((message: string, type: Toast['type'] = 'info', duration = 3000) => {
        const id = crypto.randomUUID();
        setToasts(prev => [...prev, { id, message, type, duration }]);
        setTimeout(() => removeToast(id), duration);
    }, [removeToast]);

    const iconMap = {
        success: <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />,
        error: <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />,
        info: <Info className="w-4 h-4 text-blue-500 shrink-0" />,
    };

    const bgMap = {
        success: 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/50',
        error: 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/50',
        info: 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/50',
    };

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            {/* Toast Container */}
            <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg backdrop-blur-sm min-w-[280px] max-w-[400px] animate-slide-in-right ${bgMap[toast.type]}`}
                    >
                        {iconMap[toast.type]}
                        <span className="text-sm font-medium text-gray-800 dark:text-gray-200 flex-1">{toast.message}</span>
                        <button
                            onClick={() => removeToast(toast.id)}
                            className="p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors shrink-0"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                ))}
            </div>
            {/* Animation styles */}
            <style>{`
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                .animate-slide-in-right {
                    animation: slideInRight 0.3s ease-out;
                }
            `}</style>
        </ToastContext.Provider>
    );
};
