import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faTrash, faTimes, faImage, faImages
} from '@fortawesome/free-solid-svg-icons';
import { heroService, HeroSlide } from '@/services/heroService';
import { productService } from '@/services/productService';
import { MediaSelectorModal } from '../MediaSelectorModal';
import { ConfirmModal } from '../ConfirmModal';
import toast from 'react-hot-toast';

export const HeroManager: React.FC = () => {
    const [slides, setSlides] = useState<HeroSlide[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingSlide, setEditingSlide] = useState<Partial<HeroSlide> | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [mediaSelector, setMediaSelector] = useState<{ isOpen: boolean, field: 'bg' | 'mobile' }>({
        isOpen: false,
        field: 'bg'
    });
    const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean, id: string | null }>({
        isOpen: false,
        id: null
    });

    const fetchSlides = async () => {
        try {
            setLoading(true);
            const data = await heroService.getSlides();
            setSlides(data);
        } catch (error) {
            console.error('Error fetching slides:', error);
            toast.error('Error al cargar slides');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchSlides(); }, []);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'bg' | 'mobile') => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            setIsUploading(true);
            const url = await productService.uploadImage(file, 'hero');
            if (field === 'bg') setEditingSlide(prev => ({ ...prev, bg_url: url }));
            else setEditingSlide(prev => ({ ...prev, bg_mobile_url: url }));
            toast.success('Imagen subida correctamente');
        } catch (error: any) {
            console.error('[Hero upload error]', error);
            toast.error(`Error al subir imagen: ${error?.message ?? 'Error desconocido'}`);
        } finally {
            setIsUploading(false);
            e.target.value = '';
        }
    };

    const handleSave = async () => {
        if (!editingSlide?.title_1) return toast.error('Falta el título');
        try {
            await heroService.upsertSlide(editingSlide as HeroSlide);
            toast.success('Slide guardado');
            setEditingSlide(null);
            fetchSlides();
        } catch (error) {
            toast.error('Error al guardar');
        }
    };

    const handleDelete = async () => {
        if (!confirmDelete.id) return;
        try {
            await heroService.deleteSlide(confirmDelete.id);
            toast.success('Diapositiva eliminada');
            fetchSlides();
            setConfirmDelete({ isOpen: false, id: null });
        } catch (error) {
            toast.error('Error al intentar eliminar');
        }
    };

    if (loading && slides.length === 0) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" /></div>;

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center bg-white p-6 border border-slate-200">
                <h2 className="text-xl font-serif">Gestión de Hero Slider</h2>
                <button
                    onClick={() => setEditingSlide({
                        title_1: '', title_2: '', subtitle: '', tag: '',
                        bg_url: '', cta_label: 'Explorar', cta_link: '/catalogo',
                        order_index: slides.length, is_active: true
                    })}
                    className="bg-gold text-chocolate px-6 py-3 text-[10px] uppercase tracking-widest font-bold hover:bg-chocolate hover:text-white transition-all shadow-lg text-center"
                >
                    + Nuevo Slide
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {slides.map(slide => (
                    <motion.div key={slide.id} layout className="bg-white border border-slate-200 group overflow-hidden flex flex-col">
                        <div className="relative aspect-[16/9] bg-slate-100 overflow-hidden">
                            <img src={slide.bg_url} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                            <div className="absolute top-2 left-2 bg-black/60 text-[8px] text-white px-2 py-1 uppercase tracking-widest">{slide.tag}</div>
                        </div>
                        <div className="p-6 flex-grow space-y-4 flex flex-col justify-between">
                            <div className="space-y-2">
                                <h3 className="font-serif text-lg leading-tight">{slide.title_1} {slide.title_2}</h3>
                                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{slide.subtitle}</p>
                            </div>
                            <div className="flex bg-slate-50 p-1 mt-2">
                                <button onClick={() => setEditingSlide(slide)} className="flex-grow py-3 border border-slate-100 text-[9px] uppercase font-bold tracking-widest hover:border-gold hover:text-gold transition-all">Editar</button>
                                <button onClick={() => setConfirmDelete({ isOpen: true, id: slide.id })} className="px-4 py-3 border border-slate-100 text-red-300 hover:text-red-500 transition-all"><FontAwesomeIcon icon={faTrash} /></button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <AnimatePresence>
                {editingSlide && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setEditingSlide(null)} />
                        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="relative bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl p-10 space-y-8 focus:outline-none">
                            <div className="flex justify-between items-center sticky top-0 bg-white z-10 pb-4">
                                <h2 className="text-2xl font-serif">Editar Diapositiva</h2>
                                <button onClick={() => setEditingSlide(null)} className="text-slate-300 hover:text-chocolate transition-colors"><FontAwesomeIcon icon={faTimes} className="text-xl" /></button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-6">
                                    <div className="space-y-4">
                                        <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Contenido Textual</label>
                                        <input type="text" placeholder="Tag (Ej: Colección 2026)" value={editingSlide.tag} onChange={e => setEditingSlide({ ...editingSlide, tag: e.target.value })} className="w-full p-4 border border-slate-100 outline-none text-sm" />
                                        <div className="flex gap-2">
                                            <input type="text" placeholder="Título 1" value={editingSlide.title_1} onChange={e => setEditingSlide({ ...editingSlide, title_1: e.target.value })} className="w-1/2 p-4 border border-slate-100 outline-none text-sm" />
                                            <input type="text" placeholder="Título 2" value={editingSlide.title_2} onChange={e => setEditingSlide({ ...editingSlide, title_2: e.target.value })} className="w-1/2 p-4 border border-slate-100 outline-none text-sm" />
                                        </div>
                                        <textarea placeholder="Descripción / Subtítulo" value={editingSlide.subtitle} onChange={e => setEditingSlide({ ...editingSlide, subtitle: e.target.value })} rows={3} className="w-full p-4 border border-slate-100 outline-none text-sm resize-none" />
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Botón de Acción (CTA)</label>
                                        <div className="flex gap-2">
                                            <input type="text" placeholder="Etiqueta Botón" value={editingSlide.cta_label} onChange={e => setEditingSlide({ ...editingSlide, cta_label: e.target.value })} className="w-1/2 p-4 border border-slate-100 outline-none text-sm" />
                                            <input type="text" placeholder="Enlace (Ej: /catalogo)" value={editingSlide.cta_link} onChange={e => setEditingSlide({ ...editingSlide, cta_link: e.target.value })} className="w-1/2 p-4 border border-slate-100 outline-none text-sm" />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-4">
                                        <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Imagen de Fondo (Desktop)</label>
                                        <div className="aspect-video bg-slate-50 border-2 border-dashed border-slate-100 relative group overflow-hidden flex items-center justify-center">
                                            {isUploading && mediaSelector.field === 'bg' ? (
                                                <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                                            ) : editingSlide.bg_url ? (
                                                <>
                                                    <img src={editingSlide.bg_url} className="w-full h-full object-cover" />
                                                    <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white text-[10px] font-bold uppercase tracking-widest">Cambiar<input type="file" className="hidden" accept="image/*" onChange={e => handleFileUpload(e, 'bg')} /></label>
                                                </>
                                            ) : (
                                                <label className="cursor-pointer flex flex-col items-center gap-2 p-4 text-center">
                                                    <FontAwesomeIcon icon={faImage} className="text-3xl text-slate-200" />
                                                    <span className="text-[9px] uppercase font-bold text-slate-300">Subir imagen 16:9</span>
                                                    <input type="file" className="hidden" accept="image/*" onChange={e => handleFileUpload(e, 'bg')} />
                                                </label>
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setMediaSelector({ isOpen: true, field: 'bg' })}
                                            className="w-full py-2 border border-slate-100 text-[9px] uppercase font-bold tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                                        >
                                            <FontAwesomeIcon icon={faImages} className="text-gold" /> Galería de Medios
                                        </button>
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Imagen Mobile (Vertical)</label>
                                        <div className="aspect-[3/4] w-32 mx-auto bg-slate-50 border-2 border-dashed border-slate-100 relative group overflow-hidden flex items-center justify-center">
                                            {isUploading && mediaSelector.field === 'mobile' ? (
                                                <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                                            ) : editingSlide.bg_mobile_url ? (
                                                <>
                                                    <img src={editingSlide.bg_mobile_url} className="w-full h-full object-cover" />
                                                    <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white text-[10px] font-bold uppercase tracking-widest text-center">Cambiar<input type="file" className="hidden" accept="image/*" onChange={e => handleFileUpload(e, 'mobile')} /></label>
                                                </>
                                            ) : (
                                                <label className="cursor-pointer flex flex-col items-center gap-2 p-4 text-center">
                                                    <FontAwesomeIcon icon={faImage} className="text-2xl text-slate-200" />
                                                    <span className="text-[8px] uppercase font-bold text-slate-300">Subir Vertical</span>
                                                    <input type="file" className="hidden" accept="image/*" onChange={e => handleFileUpload(e, 'mobile')} />
                                                </label>
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setMediaSelector({ isOpen: true, field: 'mobile' })}
                                            className="w-full py-2 border border-slate-100 text-[9px] uppercase font-bold tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                                        >
                                            <FontAwesomeIcon icon={faImages} className="text-gold" /> Galería de Medios
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-10 border-t border-slate-100">
                                <button onClick={() => setEditingSlide(null)} className="px-8 py-4 text-[10px] uppercase font-bold tracking-widest text-slate-400 hover:text-chocolate transition-colors border border-slate-100">Cerrar</button>
                                <button onClick={handleSave} className="flex-grow bg-chocolate text-gold py-4 font-bold uppercase tracking-[0.2em] hover:bg-gold hover:text-chocolate transition-all">Guardar Slide Maestro</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <MediaSelectorModal
                isOpen={mediaSelector.isOpen}
                onClose={() => setMediaSelector({ ...mediaSelector, isOpen: false })}
                onSelect={(url) => {
                    if (mediaSelector.field === 'bg') {
                        setEditingSlide(prev => ({ ...prev, bg_url: url }));
                    } else {
                        setEditingSlide(prev => ({ ...prev, bg_mobile_url: url }));
                    }
                    toast.success('Imagen vinculada');
                }}
            />

            <ConfirmModal
                isOpen={confirmDelete.isOpen}
                title="Eliminar Diapositiva"
                message="¿Estás seguro de que deseas eliminar esta diapositiva del carrusel principal? Esta acción no se puede deshacer."
                confirmLabel="Eliminar Diapositiva"
                onConfirm={handleDelete}
                onCancel={() => setConfirmDelete({ isOpen: false, id: null })}
                variant="danger"
            />
        </div>
    );
};
