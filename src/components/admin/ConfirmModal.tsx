import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faTimes } from '@fortawesome/free-solid-svg-icons';

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'danger' | 'warning' | 'info';
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    title,
    message,
    onConfirm,
    onCancel,
    confirmLabel = "Aceptar",
    cancelLabel = "Cancelar",
    variant = 'danger'
}) => {
    const colors = {
        danger: 'text-red-500 bg-red-50 hover:bg-red-500 hover:text-white',
        warning: 'text-amber-500 bg-amber-50 hover:bg-amber-500 hover:text-white',
        info: 'text-blue-500 bg-blue-50 hover:bg-blue-500 hover:text-white'
    };

    const iconColors = {
        danger: 'text-red-500 bg-red-50',
        warning: 'text-amber-500 bg-amber-50',
        info: 'text-blue-500 bg-blue-50'
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        onClick={onCancel}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="relative bg-white w-full max-w-md shadow-2xl rounded-sm border border-slate-100 overflow-hidden"
                    >
                        <div className="p-8">
                            <div className="flex items-start gap-6">
                                <div className={`w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-full ${iconColors[variant]}`}>
                                    <FontAwesomeIcon icon={faExclamationTriangle} className="text-xl" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-serif text-slate-900">{title}</h3>
                                    <p className="text-sm text-slate-500 leading-relaxed font-light">{message}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-50 p-6 flex justify-end gap-3 border-t border-slate-100">
                            <button
                                onClick={onCancel}
                                className="px-6 py-3 text-[10px] uppercase tracking-widest font-bold text-slate-400 hover:text-chocolate transition-colors"
                            >
                                {cancelLabel}
                            </button>
                            <button
                                onClick={() => {
                                    onConfirm();
                                    onCancel();
                                }}
                                className={`px-8 py-3 text-[10px] uppercase tracking-widest font-bold rounded-sm transition-all duration-300 shadow-sm ${colors[variant]}`}
                            >
                                {confirmLabel}
                            </button>
                        </div>

                        <button
                            onClick={onCancel}
                            className="absolute top-4 right-4 text-slate-300 hover:text-slate-500 transition-colors"
                        >
                            <FontAwesomeIcon icon={faTimes} />
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
