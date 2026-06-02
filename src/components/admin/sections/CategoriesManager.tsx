import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faTrash, faEdit, faTimes, faImages, faSearch, faSort, faChevronLeft, faChevronRight
} from '@fortawesome/free-solid-svg-icons';
import { productService } from '@/services/productService';
import { Category } from '@/types/product';
import { useAuth } from '@/context/AuthContext';
import { MediaSelectorModal } from '../MediaSelectorModal';
import { ConfirmModal } from '../ConfirmModal';
import { generateSlug, smartFormatTitle } from '@/lib/adminUtils';
import toast from 'react-hot-toast';

interface CategoriesManagerProps {
    categories: Category[];
    refresh: () => void;
}

export const CategoriesManager: React.FC<CategoriesManagerProps> = ({ categories, refresh }) => {
    const { profile } = useAuth();
    const isAdmin = profile?.role === 'admin';

    const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSlugCustomized, setIsSlugCustomized] = useState(false);
    const [mediaSelector, setMediaSelector] = useState<{ isOpen: boolean, field: 'image' | 'size_guide' }>({
        isOpen: false,
        field: 'image'
    });
    const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean, id: string | null }>({
        isOpen: false,
        id: null
    });

    const [activeTab, setActiveTab] = useState<'parents' | 'subs'>('parents');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const sortedCategories = React.useMemo(() => {
        let sortableItems = [...categories];
        
        // Filter by Tab
        if (activeTab === 'parents') {
            sortableItems = sortableItems.filter(c => !c.parent_id);
        } else {
            sortableItems = sortableItems.filter(c => c.parent_id);
        }

        // Filter by Search
        if (searchTerm) {
            const lower = searchTerm.toLowerCase();
            sortableItems = sortableItems.filter(c => 
                c.name.toLowerCase().includes(lower) || 
                c.slug.toLowerCase().includes(lower) ||
                (c.description?.toLowerCase().includes(lower) ?? false)
            );
        }

        // Sort
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                let aValue: any = a[sortConfig.key as keyof Category] || '';
                let bValue: any = b[sortConfig.key as keyof Category] || '';
                
                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return sortableItems;
    }, [categories, sortConfig, searchTerm, activeTab]);

    const paginatedCategories = React.useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return sortedCategories.slice(startIndex, startIndex + itemsPerPage);
    }, [sortedCategories, currentPage]);

    const totalPages = Math.ceil(sortedCategories.length / itemsPerPage);

    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, sortConfig, activeTab]);

    const requestSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key: string) => {
        if (!sortConfig || sortConfig.key !== key) return faSort;
        return sortConfig.direction === 'asc' ? faSort : faSort; // We can add specific icons if needed
    };

    const handleEdit = (category: Category) => {
        setEditingCategory({ ...category });
        setIsModalOpen(true);
        // Solo marcar como personalizado si el slug actual es diferente al generado automáticamente
        setIsSlugCustomized(category.slug !== generateSlug(category.name));
    };

    const handleDelete = async () => {
        if (!confirmDelete.id) return;
        try {
            if (isAdmin) {
                await productService.deleteCategory(confirmDelete.id);
                toast.success('Categoría eliminada definitivamente');
            } else {
                const cat = categories.find(c => c.id === confirmDelete.id);
                if (cat) {
                    await productService.upsertCategory({ ...cat, is_active: false });
                    toast.success('Categoría ocultada (Soft Delete)');
                }
            }
            refresh();
            setConfirmDelete({ isOpen: false, id: null });
        } catch (error: any) {
            toast.error(error.message || 'Error al procesar la solicitud');
        }
    };

    const handleSave = async () => {
        if (!editingCategory?.name || !editingCategory?.slug) {
            toast.error('Nombre y Slug son obligatorios');
            return;
        }

        try {
            await productService.upsertCategory(editingCategory as Category);
            toast.success('Categoría guardada');
            setIsModalOpen(false);
            refresh();
        } catch (error) {
            toast.error('Error al guardar');
        }
    };

    const paginationUI = totalPages > 1 ? (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 border border-slate-200">
            <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">
                Mostrando {Math.min(sortedCategories.length, (currentPage - 1) * itemsPerPage + 1)}-{Math.min(sortedCategories.length, currentPage * itemsPerPage)} de {sortedCategories.length} categorías
            </p>
            <div className="flex items-center gap-2">
                <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-slate-200 text-[10px] uppercase font-bold tracking-widest hover:bg-slate-50 disabled:opacity-30 transition-colors"
                >
                    <FontAwesomeIcon icon={faChevronLeft} className="mr-2" />
                    Anterior
                </button>
                <div className="flex gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`w-8 h-8 flex items-center justify-center text-[10px] font-bold border transition-colors ${
                                currentPage === page 
                                ? 'bg-gold text-chocolate border-gold' 
                                : 'border-slate-200 text-slate-400 hover:bg-slate-50'
                            }`}
                        >
                            {page}
                        </button>
                    ))}
                </div>
                <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-slate-200 text-[10px] uppercase font-bold tracking-widest hover:bg-slate-50 disabled:opacity-30 transition-colors"
                >
                    Siguiente
                    <FontAwesomeIcon icon={faChevronRight} className="ml-2" />
                </button>
            </div>
        </div>
    ) : null;

    return (
        <div className="space-y-6 md:space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 md:p-6 border border-slate-200 gap-4">
                <div className="flex items-center gap-4 w-full sm:w-auto flex-grow max-w-md">
                    <div className="relative w-full">
                        <input
                            type="text"
                            placeholder="Buscar por nombre, slug o descripción..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-slate-200 text-xs focus:border-gold outline-none"
                        />
                        <FontAwesomeIcon icon={faSearch} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                    </div>
                </div>
                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                    <p className="hidden md:block text-[10px] uppercase tracking-widest font-bold text-slate-400">Total: {sortedCategories.length}</p>
                    <button
                        onClick={() => {
                            setEditingCategory({ name: '', slug: '', description: '', image_url: '' });
                            setIsModalOpen(true);
                            setIsSlugCustomized(false);
                        }}
                        className="w-full sm:w-auto bg-gold text-chocolate px-6 py-3 text-[10px] uppercase tracking-widest font-bold hover:bg-chocolate hover:text-white transition-all shadow-lg text-center whitespace-nowrap"
                    >
                        + Nueva Categoría
                    </button>
                </div>
            </div>

            <div className="flex border-b border-slate-200">
                <button
                    onClick={() => setActiveTab('parents')}
                    className={`px-8 py-4 text-[10px] uppercase tracking-[0.2em] font-bold transition-all border-b-2 ${activeTab === 'parents' ? 'border-gold text-chocolate bg-gold/5' : 'border-transparent text-slate-400 hover:text-chocolate'}`}
                >
                    Categorías Principales
                </button>
                <button
                    onClick={() => setActiveTab('subs')}
                    className={`px-8 py-4 text-[10px] uppercase tracking-[0.2em] font-bold transition-all border-b-2 ${activeTab === 'subs' ? 'border-gold text-chocolate bg-gold/5' : 'border-transparent text-slate-400 hover:text-chocolate'}`}
                >
                    Subcategorías
                </button>
            </div>

            {paginationUI}

            <div className="bg-white border border-slate-200 overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                            <th className="px-4 md:px-8 py-4 text-[10px] uppercase tracking-widest font-bold text-slate-400">Imagen</th>
                            <th className="px-4 md:px-8 py-4 text-[10px] uppercase tracking-widest font-bold text-slate-400 cursor-pointer hover:text-chocolate transition-colors" onClick={() => requestSort('name')}>
                                Nombre / URL <FontAwesomeIcon icon={getSortIcon('name')} className="ml-1" />
                            </th>
                            <th className="px-4 md:px-8 py-4 text-[10px] uppercase tracking-widest font-bold text-slate-400 cursor-pointer hover:text-chocolate transition-colors" onClick={() => requestSort('description')}>
                                Descripción <FontAwesomeIcon icon={getSortIcon('description')} className="ml-1" />
                            </th>
                            <th className="px-4 md:px-8 py-4 text-[10px] uppercase tracking-widest font-bold text-slate-400 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {paginatedCategories.map(cat => {
                            const parent = categories.find(c => c.id === cat.parent_id);
                            return (
                                <tr key={cat.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-4 md:px-8 py-4">
                                        <div className="w-12 h-12 bg-slate-100 flex items-center justify-center overflow-hidden rounded border border-slate-200">
                                            {cat.image_url ? (
                                                <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <FontAwesomeIcon icon={faImages} className="text-slate-300 text-xs" />
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 md:px-8 py-4">
                                        <div className="flex items-center gap-2">
                                            {cat.parent_id && <span className="text-slate-300">└</span>}
                                            <p className={`text-sm font-serif font-bold ${cat.parent_id ? 'text-slate-500' : 'text-slate-800'}`}>
                                                {cat.name}
                                                {cat.is_active === false && (
                                                    <span className="ml-3 text-[7px] bg-red-50 text-red-500 font-black px-1.5 py-0.5 rounded border border-red-100 uppercase">Oculto</span>
                                                )}
                                            </p>
                                        </div>
                                        <div className="flex gap-2 items-center mt-1">
                                            <p className="text-[10px] text-gold font-mono uppercase tracking-tighter">/{cat.slug}</p>
                                            {parent && (
                                                <span className="text-[8px] bg-slate-100 text-slate-400 px-2 py-0.5 rounded-full uppercase font-bold tracking-widest">
                                                    Sub de: {parent.name}
                                                </span>
                                            )}
                                            {!cat.parent_id && (
                                                <span className="text-[8px] bg-gold/10 text-gold px-2 py-0.5 rounded-full uppercase font-bold tracking-widest">
                                                    Padre
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 md:px-8 py-4">
                                        <p className="text-xs text-slate-400 line-clamp-1 italic">{cat.description || 'Sin descripción'}</p>
                                    </td>
                                    <td className="px-4 md:px-8 py-4">
                                        <div className="flex justify-end gap-3">
                                            <button onClick={() => handleEdit(cat)} className="p-2 border border-slate-100 hover:bg-gold hover:text-white transition-all rounded shadow-sm">
                                                <FontAwesomeIcon icon={faEdit} className="text-xs" />
                                            </button>
                                            <button onClick={() => setConfirmDelete({ isOpen: true, id: cat.id })} className="p-2 border border-slate-100 hover:bg-red-500 hover:text-white transition-all rounded shadow-sm">
                                                <FontAwesomeIcon icon={faTrash} className="text-xs" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {paginationUI}

            <AnimatePresence>
                {isModalOpen && editingCategory && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="relative bg-white w-full max-w-2xl shadow-2xl border border-gold/20 flex flex-col focus:outline-none">
                            <div className="p-8 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
                                <h2 className="text-2xl font-serif">Editar Categoría</h2>
                                <button onClick={() => setIsModalOpen(false)} className="text-slate-300 hover:text-chocolate transition-colors"><FontAwesomeIcon icon={faTimes} className="text-xl" /></button>
                            </div>

                            <div className="p-10 space-y-8 overflow-y-auto">
                                <div className="space-y-4 bg-slate-50 p-4 border border-slate-100 rounded">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-[10px] uppercase tracking-widest font-bold text-slate-800">Visibilidad de Categoría</p>
                                            <p className="text-[9px] text-slate-400">Si se oculta, no aparecerá en los filtros del catálogo</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setEditingCategory({ ...editingCategory, is_active: !editingCategory.is_active })}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${editingCategory.is_active !== false ? 'bg-green-500' : 'bg-slate-300'}`}
                                        >
                                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${editingCategory.is_active !== false ? 'translate-x-6' : 'translate-x-1'}`} />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Nombre de la Categoría</label>
                                            <input
                                                type="text"
                                                value={editingCategory.name}
                                                onChange={e => {
                                                    const newName = e.target.value;
                                                    const updates: any = { name: newName };
                                                    if (!isSlugCustomized) updates.slug = generateSlug(newName);
                                                    setEditingCategory({ ...editingCategory, ...updates });
                                                }}
                                                onBlur={e => {
                                                    const formatted = smartFormatTitle(e.target.value);
                                                    const updates: any = { name: formatted };
                                                    if (!isSlugCustomized) updates.slug = generateSlug(formatted);
                                                    setEditingCategory({ ...editingCategory, ...updates });
                                                }}
                                                className="w-full p-4 border border-slate-100 focus:border-gold outline-none text-sm"
                                                placeholder="Ej: Ceremonia de Bodas"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Jerarquía</label>
                                            <select
                                                value={editingCategory.parent_id || ''}
                                                onChange={e => setEditingCategory({ ...editingCategory, parent_id: e.target.value || null })}
                                                className="w-full p-4 border border-slate-100 focus:border-gold outline-none text-sm bg-white"
                                            >
                                                <option value="">Ninguna (Es Categoría Padre/Principal)</option>
                                                {categories
                                                    .filter(c => c.id !== editingCategory.id && !c.parent_id)
                                                    .map(c => (
                                                        <option key={c.id} value={c.id}>Hija de: {c.name}</option>
                                                    ))
                                                }
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Slug (URL)</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={editingCategory.slug}
                                                onChange={e => {
                                                    setEditingCategory({ ...editingCategory, slug: e.target.value });
                                                    setIsSlugCustomized(true);
                                                }}
                                                className="w-full p-4 border border-slate-100 focus:border-gold outline-none font-mono text-xs"
                                                placeholder="url-amigable"
                                            />
                                            {!isSlugCustomized && editingCategory.name && (
                                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[8px] text-gold font-bold uppercase tracking-tighter bg-white px-1">Auto</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="hidden space-y-2">
                                        <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Descripción Corta</label>
                                        <textarea
                                            value={editingCategory.description || ''}
                                            onChange={e => setEditingCategory({ ...editingCategory, description: e.target.value })}
                                            className="w-full p-4 border border-slate-100 focus:border-gold outline-none text-sm"
                                            rows={2}
                                            placeholder="Una breve descripción..."
                                        />
                                    </div>

                                    {!editingCategory.parent_id && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="hidden space-y-2">
                                                <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Imagen Representativa</label>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        value={editingCategory.image_url || ''}
                                                        onChange={e => setEditingCategory({ ...editingCategory, image_url: e.target.value })}
                                                        className="flex-grow p-4 border border-slate-100 focus:border-gold outline-none text-sm"
                                                        placeholder="Galería..."
                                                    />
                                                    <button onClick={() => setMediaSelector({ isOpen: true, field: 'image' })} className="px-6 py-4 border border-slate-200 hover:bg-slate-50 text-gold transition-all">
                                                        <FontAwesomeIcon icon={faImages} />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Guía de Tallas (Tallero)</label>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        value={editingCategory.size_guide_url || ''}
                                                        onChange={e => setEditingCategory({ ...editingCategory, size_guide_url: e.target.value })}
                                                        className="flex-grow p-4 border border-slate-100 focus:border-gold outline-none text-sm"
                                                        placeholder="Imagen de referencia..."
                                                    />
                                                    <button onClick={() => setMediaSelector({ isOpen: true, field: 'size_guide' })} className="px-6 py-4 border border-slate-200 hover:bg-slate-50 text-gold transition-all">
                                                        <FontAwesomeIcon icon={faImages} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="p-8 border-t border-slate-100 flex gap-4 bg-slate-50">
                                <button onClick={() => setIsModalOpen(false)} className="px-8 py-4 text-[10px] uppercase tracking-widest font-bold text-slate-400 hover:text-chocolate transition-colors border border-slate-200">Cancelar</button>
                                <button onClick={handleSave} className="flex-grow bg-gold text-chocolate py-4 font-bold uppercase tracking-[0.2em] shadow-xl hover:bg-chocolate hover:text-white transition-all">
                                    Guardar Categoría
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <MediaSelectorModal
                isOpen={mediaSelector.isOpen}
                onClose={() => setMediaSelector({ ...mediaSelector, isOpen: false })}
                onSelect={(url) => {
                    if (mediaSelector.field === 'image') {
                        setEditingCategory(prev => ({ ...prev, image_url: url }));
                    } else {
                        setEditingCategory(prev => ({ ...prev, size_guide_url: url }));
                    }
                    toast.success('Imagen seleccionada');
                }}
            />

            <ConfirmModal
                isOpen={confirmDelete.isOpen}
                onCancel={() => setConfirmDelete({ isOpen: false, id: null })}
                onConfirm={handleDelete}
                title={isAdmin ? "Eliminar Categoría" : "Ocultar Categoría"}
                message={isAdmin
                    ? "¿Estás seguro de que deseas eliminar esta categoría? Si tiene productos asociados, la acción será bloqueada por seguridad."
                    : "¿Deseas ocultar esta categoría del catálogo público? Los productos asociados podrían dejar de ser visibles correctamente."}
                variant={isAdmin ? 'danger' : 'warning'}
                confirmLabel={isAdmin ? "Eliminar Definitivamente" : "Ocultar Ahora"}
            />
        </div>
    );
};
