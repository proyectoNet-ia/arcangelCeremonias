import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faImages } from '@fortawesome/free-solid-svg-icons';
import { MediaGallery } from './MediaGallery';

interface MediaSelectorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (url: string) => void;
    title?: string;
}

export const MediaSelectorModal: React.FC<MediaSelectorModalProps> = ({
    isOpen,
    onClose,
    onSelect,
    title = "Seleccionar Medio"
}) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ y: 50, opacity: 0, scale: 0.95 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        exit={{ y: 50, opacity: 0, scale: 0.95 }}
                        className="relative bg-white w-full max-w-6xl h-[85vh] overflow-hidden shadow-2xl flex flex-col border border-gold/20"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-gold/10 text-gold flex items-center justify-center rounded-lg">
                                    <FontAwesomeIcon icon={faImages} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-serif">{title}</h2>
                                    <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                                        Explora archivos existentes o sube nuevos desde las pestañas correspondientes
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-chocolate hover:bg-slate-50 rounded-full transition-all"
                            >
                                <FontAwesomeIcon icon={faTimes} className="text-xl" />
                            </button>
                        </div>

                        {/* Gallery Content */}
                        <div className="flex-grow overflow-y-auto p-8 bg-slate-50/50">
                            <MediaGallery
                                allowSelection={true}
                                onSelect={(url) => {
                                    onSelect(url);
                                    onClose();
                                }}
                            />
                        </div>

                        {/* Footer Notification */}
                        <div className="p-4 bg-chocolate text-gold text-[10px] uppercase tracking-[0.2em] font-bold text-center">
                            Haz clic en "Seleccionar" para aplicar la imagen al campo
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
