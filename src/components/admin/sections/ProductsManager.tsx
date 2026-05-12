import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faPlus, faTrash, faEdit, faTimes, faImage, faImages, faChevronLeft, faChevronRight, faCopy, faSort, faSortUp, faSortDown, faSearch, faCheck
} from '@fortawesome/free-solid-svg-icons';
import { productService } from '@/services/productService';
import { Product, Category } from '@/types/product';
import { useAuth } from '@/context/AuthContext';
import { MediaSelectorModal } from '../MediaSelectorModal';
import { ConfirmModal } from '../ConfirmModal';
import { generateSlug, smartFormatTitle } from '@/lib/adminUtils';
import toast from 'react-hot-toast';
import { COLOR_NAMES, COLOR_MAP } from '@/constants/colors';

interface ProductsManagerProps {
    products: Product[];
    categories: Category[];
    refresh: () => void;
}

export const ProductsManager: React.FC<ProductsManagerProps> = ({ products, categories, refresh }) => {
    const { profile } = useAuth();
    const isAdmin = profile?.role === 'admin';

    const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [mediaSelector, setMediaSelector] = useState<{ isOpen: boolean, field: 'main' | 'gallery', index?: number }>({
        isOpen: false,
        field: 'main'
    });
    const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean, id: string | null }>({
        isOpen: false,
        id: null
    });
    const [isSlugCustomized, setIsSlugCustomized] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);
    const [colorSuggestions, setColorSuggestions] = useState<string[]>([]);
    const [showColorSuggestions, setShowColorSuggestions] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: 'name' | 'category' | 'status', direction: 'asc' | 'desc' } | null>(null);
    const [inlineEditId, setInlineEditId] = useState<string | null>(null);
    const [inlineEditData, setInlineEditData] = useState<Partial<Product> | null>(null);
    const [isSavingInline, setIsSavingInline] = useState(false);

    const sortedProducts = React.useMemo(() => {
        let sortableItems = [...products];

        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase();
            sortableItems = sortableItems.filter(p => 
                p.name.toLowerCase().includes(lowerSearch) ||
                (p.model_code && p.model_code.toLowerCase().includes(lowerSearch)) ||
                (p.material && p.material.toLowerCase().includes(lowerSearch)) ||
                ((p as any).categories?.name && (p as any).categories.name.toLowerCase().includes(lowerSearch))
            );
        }

        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                let aValue: any = a[sortConfig.key as keyof Product] || '';
                let bValue: any = b[sortConfig.key as keyof Product] || '';
                
                if (sortConfig.key === 'category') {
                    aValue = (a as any).categories?.name || '';
                    bValue = (b as any).categories?.name || '';
                } else if (sortConfig.key === 'status') {
                    aValue = a.is_active === false ? 0 : 1;
                    bValue = b.is_active === false ? 0 : 1;
                }

                if (aValue < bValue) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [products, sortConfig, searchTerm]);

    const requestSort = (key: 'name' | 'category' | 'status') => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (columnName: string) => {
        if (!sortConfig || sortConfig.key !== columnName) {
            return faSort;
        }
        return sortConfig.direction === 'asc' ? faSortUp : faSortDown;
    };

    const getPriceDisplay = (val: number | undefined, fieldId: string) => {
        const num = val || 0;
        if (focusedField === fieldId) {
            return num === 0 ? '' : num.toString();
        }
        return num === 0 ? '' : new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN',
            minimumFractionDigits: 2
        }).format(num);
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        if (!editingProduct?.name) newErrors.name = 'El nombre es obligatorio';
        if (!editingProduct?.slug) newErrors.slug = 'El slug es obligatorio';
        if (!editingProduct?.price && !editingProduct?.size_variants?.length) newErrors.price = 'Debe indicar un precio o variantes';
        if (!editingProduct?.category_id) newErrors.category = 'Seleccione una categoría';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleEdit = (product: Product) => {
        setEditingProduct({ ...product });
        setIsModalOpen(true);
        setErrors({});
        setIsSlugCustomized(true);
    };

    const handleDuplicate = (product: Product) => {
        const { id, created_at, categories, ...rest } = product as any;
        const duplicatedName = `Copia de ${product.name}`;
        
        setEditingProduct({ 
            ...rest, 
            name: duplicatedName,
            slug: generateSlug(duplicatedName),
            main_image: '',
            gallery: []
        });
        setIsModalOpen(true);
        setErrors({});
        setIsSlugCustomized(false);
    };

    const handleInlineEditStart = (product: Product) => {
        setInlineEditId(product.id || null);
        setInlineEditData({ ...product });
    };

    const handleInlineSave = async () => {
        if (!inlineEditData || !inlineEditId) return;
        setIsSavingInline(true);
        try {
            const { categories: _, created_at: __, ...productData } = inlineEditData as any;
            await productService.upsertProduct(productData);
            toast.success('Cambios rápidos guardados');
            setInlineEditId(null);
            refresh();
        } catch (error) {
            toast.error('Error al guardar cambios');
        } finally {
            setIsSavingInline(false);
        }
    };

    const handleQuickUpdate = async (product: Product, updates: Partial<Product>) => {
        try {
            const { categories: _, created_at: __, ...productData } = product as any;
            await productService.upsertProduct({ ...productData, ...updates });
            toast.success('Actualizado correctamente');
            refresh();
        } catch (error) {
            toast.error('Error al actualizar');
        }
    };

    const handleDelete = async () => {
        if (!confirmDelete.id) return;
        try {
            if (isAdmin) {
                // Admin: Borrado físico
                await productService.deleteProduct(confirmDelete.id);
                toast.success('Producto eliminado definitivamente');
            } else {
                // Editor: Soft Delete (Desactivar)
                const prod = products.find(p => p.id === confirmDelete.id);
                if (prod) {
                    await productService.upsertProduct({ ...prod, is_active: false });
                    toast.success('Producto ocultado del catálogo (Soft Delete)');
                }
            }
            refresh();
            setConfirmDelete({ isOpen: false, id: null });
        } catch (error) {
            toast.error(isAdmin ? 'Error al eliminar' : 'Error al ocultar producto');
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'main' | 'gallery', index?: number) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setIsUploading(true);
            const url = await productService.uploadImage(file, 'products');

            if (field === 'main') {
                setEditingProduct(prev => ({ ...prev, main_image: url }));
            } else if (field === 'gallery' && index !== undefined) {
                const newGallery = [...(editingProduct?.gallery || [])];
                newGallery[index] = url;
                setEditingProduct(prev => ({ ...prev, gallery: newGallery }));
            }
            toast.success('Imagen lista', { icon: '📸' });
        } catch (error: any) {
            console.error('Upload Error:', error);
            toast.error(error.message || 'Error al subir imagen');
        } finally {
            setIsUploading(false);
        }
    };

    const handleSave = async () => {
        if (!validateForm()) return;
        if (!editingProduct) return;

        try {
            const { categories: _, created_at: __, ...productData } = editingProduct as any;
            const cleanedGallery = (productData.gallery || []).filter((url: string) => url.trim() !== '');

            await productService.upsertProduct({ ...productData, gallery: cleanedGallery });
            toast.success('Producto guardado correctamente', {
                style: { background: '#1e293b', color: '#fff', fontSize: '12px', fontWeight: 'bold' }
            });
            setIsModalOpen(false);
            refresh();
        } catch (error) {
            console.error('Save Error:', error);
            toast.error('Error al guardar. Revisa la consola.', {
                style: { background: '#ef4444', color: '#fff', fontSize: '12px', fontWeight: 'bold' }
            });
        }
    };

    return (
        <div className="space-y-6 md:space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 md:p-6 border border-slate-200 gap-4">
                <div className="flex items-center gap-4 w-full sm:w-auto flex-grow max-w-md">
                    <div className="relative w-full">
                        <input
                            type="text"
                            placeholder="Buscar por nombre, código o categoría..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-slate-200 text-xs focus:border-gold outline-none"
                        />
                        <FontAwesomeIcon icon={faSearch} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                    </div>
                </div>
                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                    <p className="hidden md:block text-[10px] uppercase tracking-widest font-bold text-slate-400">Total: {sortedProducts.length}</p>
                    <button
                        onClick={() => {
                            setEditingProduct({
                                name: '', slug: '', description: '', price: 0,
                                category_id: categories[0]?.id, gallery: [],
                                stock_status: 'available', is_active: true
                            });
                            setIsModalOpen(true);
                            setIsSlugCustomized(false);
                            setErrors({});
                        }}
                        className="w-full sm:w-auto bg-gold text-chocolate px-6 py-3 text-[10px] uppercase tracking-widest font-bold hover:bg-chocolate hover:text-white transition-all shadow-lg text-center whitespace-nowrap"
                    >
                        + Nuevo Producto
                    </button>
                </div>
            </div>

            <div className="bg-white border border-slate-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 md:px-8 py-4 text-[9px] uppercase tracking-widest font-bold text-slate-400">Preview</th>
                                <th className="px-4 md:px-8 py-4 text-[9px] uppercase tracking-widest font-bold text-slate-400 cursor-pointer hover:text-chocolate transition-colors" onClick={() => requestSort('name')}>
                                    Información <FontAwesomeIcon icon={getSortIcon('name')} className="ml-1" />
                                </th>
                                <th className="hidden md:table-cell px-8 py-4 text-[9px] uppercase tracking-widest font-bold text-slate-400 cursor-pointer hover:text-chocolate transition-colors" onClick={() => requestSort('category')}>
                                    Categoría <FontAwesomeIcon icon={getSortIcon('category')} className="ml-1" />
                                </th>
                                <th className="hidden lg:table-cell px-8 py-4 text-[9px] uppercase tracking-widest font-bold text-slate-400">Subcategoría</th>
                                <th className="px-4 md:px-8 py-4 text-[9px] uppercase tracking-widest font-bold text-slate-400 text-right cursor-pointer hover:text-chocolate transition-colors" onClick={() => requestSort('status')}>
                                    Estado <FontAwesomeIcon icon={getSortIcon('status')} className="ml-1" />
                                </th>
                                <th className="px-4 md:px-8 py-4 text-[9px] uppercase tracking-widest font-bold text-slate-400 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedProducts.map(prod => {
                                const isInline = inlineEditId === prod.id;
                                return (
                                <tr key={prod.id} className={`border-b border-slate-100 hover:bg-slate-50/50 transition-colors ${isInline ? 'bg-gold/5' : 'group'}`}>
                                    <td className="px-4 md:px-8 py-4">
                                        <img src={prod.main_image} className="w-10 h-14 md:w-12 md:h-16 object-cover border border-slate-200 group-hover:scale-105 transition-transform" />
                                    </td>
                                    <td className="px-4 md:px-8 py-4">
                                        {isInline ? (
                                            <div className="space-y-2">
                                                <input 
                                                    type="text" 
                                                    value={inlineEditData?.name || ''} 
                                                    onChange={e => setInlineEditData({...inlineEditData, name: e.target.value})}
                                                    className="w-full text-[10px] md:text-xs font-serif p-1 border border-gold outline-none"
                                                    placeholder="Nombre del producto"
                                                />
                                                <input 
                                                    type="text" 
                                                    value={inlineEditData?.model_code || ''} 
                                                    onChange={e => setInlineEditData({...inlineEditData, model_code: e.target.value})}
                                                    className="w-24 text-[8px] p-1 border border-gold outline-none"
                                                    placeholder="Código"
                                                />
                                            </div>
                                        ) : (
                                            <div className="space-y-0.5">
                                                <p className="text-[10px] md:text-xs font-serif truncate max-w-[120px] md:max-w-none cursor-text hover:text-gold" onClick={() => handleInlineEditStart(prod)} title="Clic para editar rápido">{prod.name}</p>
                                                <div className="flex flex-wrap gap-1 md:gap-2 items-center">
                                                    <span className="text-[7px] md:text-[8px] text-slate-400 border border-slate-100 px-1 cursor-text hover:border-gold" onClick={() => handleInlineEditStart(prod)} title="Clic para editar rápido">{prod.model_code || 'S/M'}</span>
                                                    <span className="md:hidden text-[7px] text-gold font-bold">{(prod as any).categories?.name}</span>
                                                </div>
                                            </div>
                                        )}
                                    </td>
                                    <td className="hidden md:table-cell px-8 py-4 text-[9px]">
                                        {isInline ? (
                                            <select
                                                value={inlineEditData?.category_id || ''}
                                                onChange={e => setInlineEditData({...inlineEditData, category_id: e.target.value, subcategory: ''})}
                                                className="w-full p-1 border border-gold outline-none text-[9px]"
                                            >
                                                {categories.filter(c => !c.parent_id).map(c => (
                                                    <option key={c.id} value={c.id}>{c.name}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <select
                                                value={prod.category_id || ''}
                                                onChange={e => handleQuickUpdate(prod, { category_id: e.target.value, subcategory: '' })}
                                                className="w-full p-1 border border-transparent hover:border-slate-200 outline-none text-[9px] bg-transparent cursor-pointer"
                                                title="Cambio rápido de categoría"
                                            >
                                                {categories.filter(c => !c.parent_id).map(c => (
                                                    <option key={c.id} value={c.id}>{c.name}</option>
                                                ))}
                                            </select>
                                        )}
                                    </td>
                                    <td className="hidden lg:table-cell px-8 py-4 text-[9px]">
                                        {isInline ? (
                                            <select
                                                value={inlineEditData?.subcategory || ''}
                                                onChange={e => setInlineEditData({...inlineEditData, subcategory: e.target.value})}
                                                className="w-full p-1 border border-gold outline-none text-[9px]"
                                                disabled={!inlineEditData?.category_id}
                                            >
                                                <option value="">Ninguna</option>
                                                {categories
                                                    .filter(c => c.parent_id === inlineEditData?.category_id)
                                                    .map(c => (
                                                        <option key={c.id} value={c.slug}>{c.name}</option>
                                                    ))
                                                }
                                            </select>
                                        ) : (
                                            <select
                                                value={prod.subcategory || ''}
                                                onChange={e => handleQuickUpdate(prod, { subcategory: e.target.value })}
                                                className="w-full p-1 border border-transparent hover:border-slate-200 outline-none text-[9px] bg-transparent cursor-pointer"
                                                disabled={!prod.category_id}
                                                title="Cambio rápido de subcategoría"
                                            >
                                                <option value="">Ninguna</option>
                                                {categories
                                                    .filter(c => c.parent_id === prod.category_id)
                                                    .map(c => (
                                                        <option key={c.id} value={c.slug}>{c.name}</option>
                                                    ))
                                                }
                                            </select>
                                        )}
                                    </td>
                                    <td className="px-4 md:px-8 py-4 text-right">
                                        {isInline ? (
                                            <button 
                                                onClick={() => setInlineEditData({...inlineEditData, is_active: inlineEditData?.is_active === false ? true : false})}
                                                className={`text-[7px] md:text-[8px] font-bold px-2 py-1 rounded border uppercase tracking-tighter inline-block transition-colors ${inlineEditData?.is_active === false ? 'bg-red-50 text-red-500 border-red-100' : 'bg-green-50 text-green-500 border-green-100'}`}
                                            >
                                                {inlineEditData?.is_active === false ? 'OCULTO' : 'PÚBLICO'}
                                            </button>
                                        ) : (
                                            <button 
                                                onClick={() => handleQuickUpdate(prod, { is_active: prod.is_active === false ? true : false })} 
                                                className={`cursor-pointer text-[7px] md:text-[8px] font-bold px-2 py-1 rounded border uppercase inline-block transition-all hover:scale-105 ${prod.is_active === false ? 'bg-red-50 text-red-500 border-red-100 hover:bg-red-100' : 'bg-green-50 text-green-500 border-green-100 tracking-tighter hover:bg-green-100'}`} 
                                                title="Clic para cambiar estado"
                                            >
                                                {prod.is_active === false ? 'OCULTO' : 'PÚBLICO'}
                                            </button>
                                        )}
                                    </td>
                                    <td className="px-4 md:px-8 py-4">
                                        {isInline ? (
                                            <div className="flex justify-end gap-2 md:gap-3">
                                                <button onClick={() => setInlineEditId(null)} title="Cancelar" className="p-2 border border-slate-100 hover:bg-slate-200 text-slate-500 transition-all rounded shadow-sm">
                                                    <FontAwesomeIcon icon={faTimes} className="text-[10px] md:text-xs" />
                                                </button>
                                                <button onClick={handleInlineSave} disabled={isSavingInline} title="Guardar Cambios Rápidos" className="p-2 border border-green-500 bg-green-500 text-white hover:bg-green-600 transition-all rounded shadow-sm">
                                                    <FontAwesomeIcon icon={faCheck} className={`text-[10px] md:text-xs ${isSavingInline ? 'animate-pulse' : ''}`} />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex justify-end gap-2 md:gap-3">
                                                <button onClick={() => handleDuplicate(prod)} title="Duplicar Producto" className="p-2 border border-slate-100 hover:bg-blue-500 hover:text-white transition-all rounded shadow-sm">
                                                    <FontAwesomeIcon icon={faCopy} className="text-[10px] md:text-xs" />
                                                </button>
                                                <button onClick={() => handleEdit(prod)} title="Editar Producto (Avanzado)" className="p-2 border border-slate-100 hover:bg-gold hover:text-white transition-all rounded shadow-sm">
                                                    <FontAwesomeIcon icon={faEdit} className="text-[10px] md:text-xs" />
                                                </button>
                                                <button onClick={() => setConfirmDelete({ isOpen: true, id: prod.id })} title="Eliminar Producto" className="p-2 border border-slate-100 hover:bg-red-500 hover:text-white transition-all rounded shadow-sm">
                                                    <FontAwesomeIcon icon={faTrash} className="text-[10px] md:text-xs" />
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            <AnimatePresence>
                {isModalOpen && editingProduct && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="relative bg-white w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gold/20 flex flex-col focus:outline-none">
                            <div className="p-8 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
                                <div>
                                    <h2 className="text-2xl font-serif">Gestión de Producto</h2>
                                    <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Optimización de imagen automática activa (WebP)</p>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="text-slate-300 hover:text-chocolate transition-colors"><FontAwesomeIcon icon={faTimes} className="text-xl" /></button>
                            </div>

                            <div className="p-10 grid grid-cols-1 lg:grid-cols-2 gap-12 overflow-y-auto">
                                <div className="space-y-8">
                                    <div className="space-y-4 bg-slate-50 p-4 border border-slate-100 rounded">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-[10px] uppercase tracking-widest font-bold text-slate-800">Estado de Visibilidad</p>
                                                <p className="text-[9px] text-slate-400">Determina si el producto aparece en el catálogo público</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setEditingProduct({ ...editingProduct, is_active: !editingProduct.is_active })}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${editingProduct.is_active !== false ? 'bg-green-500' : 'bg-slate-300'}`}
                                            >
                                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${editingProduct.is_active !== false ? 'translate-x-6' : 'translate-x-1'}`} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Información Principal</label>
                                        <div className="space-y-4">
                                            <input
                                                type="text"
                                                placeholder="Nombre del Producto *"
                                                value={editingProduct.name}
                                                onChange={e => {
                                                    const newName = e.target.value;
                                                    const updates: any = { name: newName };
                                                    if (!isSlugCustomized) {
                                                        updates.slug = generateSlug(newName);
                                                    }
                                                    setEditingProduct({ ...editingProduct, ...updates });
                                                }}
                                                onBlur={e => {
                                                    const formatted = smartFormatTitle(e.target.value);
                                                    const updates: any = { name: formatted };
                                                    if (!isSlugCustomized) {
                                                        updates.slug = generateSlug(formatted);
                                                    }
                                                    setEditingProduct({ ...editingProduct, ...updates });
                                                }}
                                                className={`w-full p-4 border border-slate-100 focus:border-gold outline-none ${errors.name ? 'border-red-400' : ''}`}
                                            />
                                            {errors.name && <p className="text-red-400 text-[10px] font-bold uppercase">{errors.name}</p>}

                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    placeholder="Slug (URL Amigable) *"
                                                    value={editingProduct.slug}
                                                    onChange={e => {
                                                        setEditingProduct({ ...editingProduct, slug: e.target.value });
                                                        setIsSlugCustomized(true);
                                                    }}
                                                    className={`w-full p-4 border border-slate-100 focus:border-gold outline-none font-mono text-xs ${errors.slug ? 'border-red-400' : ''}`}
                                                />
                                                {!isSlugCustomized && editingProduct.name && (
                                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[8px] text-gold font-bold uppercase tracking-tighter bg-white px-1">Auto</span>
                                                )}
                                            </div>

                                            <div className="space-y-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-1">
                                                        <label className="text-[9px] uppercase tracking-widest font-bold text-slate-400 pl-1">Codigo Padre</label>
                                                        <input type="text" placeholder="Ej. AC2024" value={editingProduct.model_code || ''} onChange={e => setEditingProduct({ ...editingProduct, model_code: e.target.value })} className="w-full p-4 border border-slate-100 focus:border-gold outline-none text-xs" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-[9px] uppercase tracking-widest font-bold text-slate-400 pl-1">Material</label>
                                                        <input type="text" placeholder="Material (Ej. Raso, Tul)" value={editingProduct.material || ''} onChange={e => setEditingProduct({ ...editingProduct, material: e.target.value })} className="w-full p-4 border border-slate-100 focus:border-gold outline-none text-xs" />
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-[9px] uppercase tracking-widest font-bold text-slate-400 pl-1">Colores Disponibles (Enter o coma para agregar)</label>
                                                    <div className="flex flex-wrap gap-2 p-3 border border-slate-100 bg-slate-50/30 min-h-[50px]">
                                                        {editingProduct.color?.split(',').filter(c => c.trim()).map((c, i) => (
                                                            <span key={i} className="flex items-center gap-1.5 px-3 py-1 bg-gold/10 text-gold text-[10px] uppercase tracking-widest font-bold border border-gold/20 rounded-full">
                                                                {c.trim()}
                                                                <button 
                                                                    onClick={() => {
                                                                        const colors = editingProduct.color?.split(',').filter((_, idx) => idx !== i) || [];
                                                                        setEditingProduct({ ...editingProduct, color: colors.join(',') });
                                                                    }}
                                                                    className="hover:text-chocolate transition-colors"
                                                                >
                                                                    ×
                                                                </button>
                                                            </span>
                                                        ))}
                                                    <div className="relative flex-grow">
                                                        <input 
                                                            type="text" 
                                                            placeholder={!editingProduct.color ? "Escribe un color..." : ""}
                                                            className="w-full bg-transparent outline-none text-xs min-w-[120px]"
                                                            onChange={e => {
                                                                const val = e.target.value.toLowerCase();
                                                                const isCombinedSearch = val.includes(' con ');
                                                                
                                                                if (val.trim()) {
                                                                    let searchTerm = val.trim();
                                                                    if (isCombinedSearch) {
                                                                        const parts = val.split(' con ');
                                                                        searchTerm = parts[parts.length - 1].trim();
                                                                    }
                                                                    
                                                                    if (searchTerm) {
                                                                        const filtered = COLOR_NAMES.filter(name => name.includes(searchTerm));
                                                                        setColorSuggestions(filtered);
                                                                        setShowColorSuggestions(true);
                                                                    } else {
                                                                        setShowColorSuggestions(false);
                                                                    }
                                                                } else {
                                                                    setShowColorSuggestions(false);
                                                                }
                                                            }}
                                                            onBlur={() => {
                                                                // Pequeño delay para permitir el click en la sugerencia
                                                                setTimeout(() => setShowColorSuggestions(false), 200);
                                                            }}
                                                            onKeyDown={e => {
                                                                if (e.key === 'Enter' || e.key === ',') {
                                                                    e.preventDefault();
                                                                    const val = e.currentTarget.value.trim();
                                                                    if (val) {
                                                                        const current = editingProduct.color ? editingProduct.color.split(',').map(c => c.trim()) : [];
                                                                        if (!current.includes(val)) {
                                                                            setEditingProduct({ ...editingProduct, color: [...current, val].join(',') });
                                                                        }
                                                                        e.currentTarget.value = '';
                                                                        setShowColorSuggestions(false);
                                                                    }
                                                                }
                                                            }}
                                                        />
                                                        {/* Sugerencias de Colores */}
                                                        {showColorSuggestions && colorSuggestions.length > 0 && (
                                                            <div className="absolute left-0 bottom-full mb-2 w-64 bg-white border border-slate-200 shadow-2xl z-[110] rounded-sm max-h-48 overflow-y-auto overflow-x-hidden">
                                                                <div className="p-2 border-b border-slate-50 bg-slate-50/50">
                                                                    <p className="text-[8px] uppercase tracking-widest font-bold text-slate-400">Tonos Sugeridos</p>
                                                                </div>
                                                                {colorSuggestions.map(name => (
                                                                    <button
                                                                        key={name}
                                                                        type="button"
                                                                        onClick={() => {
                                                                            const input = document.querySelector('input[placeholder="Escribe un color..."]') as HTMLInputElement;
                                                                            let finalName = name;
                                                                            
                                                                            if (input && input.value.toLowerCase().includes(' con ')) {
                                                                                const parts = input.value.split(/ con /i);
                                                                                finalName = `${parts[0].trim()} con ${name}`;
                                                                            }

                                                                            const current = editingProduct.color ? editingProduct.color.split(',').map(c => c.trim()) : [];
                                                                            if (!current.includes(finalName)) {
                                                                                setEditingProduct({ ...editingProduct, color: [...current, finalName].join(',') });
                                                                            }
                                                                            setShowColorSuggestions(false);
                                                                            if (input) input.value = '';
                                                                        }}
                                                                        className="w-full text-left px-3 py-2.5 hover:bg-gold/5 flex items-center gap-3 transition-colors border-b border-slate-50 last:border-0 group"
                                                                    >
                                                                        <div 
                                                                            className="w-3 h-3 rounded-full border border-slate-200 shadow-sm"
                                                                            style={{ backgroundColor: COLOR_MAP[name] }}
                                                                        />
                                                                        <span className="text-[10px] uppercase tracking-widest font-bold text-chocolate group-hover:text-gold transition-colors">{name}</span>
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-1">
                                                    <label className="text-[9px] uppercase tracking-widest font-bold text-slate-400 pl-1">¿Qué incluye?</label>
                                                    <input type="text" placeholder="Ej. Tiara, Crinolina" value={editingProduct.includes || ''} onChange={e => setEditingProduct({ ...editingProduct, includes: e.target.value })} className="w-full p-4 border border-slate-100 focus:border-gold outline-none text-xs" />
                                                </div>
                                            </div>

                                            <textarea
                                                placeholder="Descripción del Producto"
                                                value={editingProduct.description || ''}
                                                onChange={e => setEditingProduct({ ...editingProduct, description: e.target.value })}
                                                rows={3}
                                                className="w-full p-4 border border-slate-100 focus:border-gold outline-none text-xs resize-none"
                                            />

                                            <div className="space-y-2">
                                                <label className="text-[9px] uppercase tracking-widest font-bold text-slate-400 pl-1">Distintivos del Producto</label>
                                                <div className="flex flex-wrap gap-2">
                                                    {['Premium', 'Edición Especial', 'Pieza Única', 'Lo más vendido'].map((badge) => {
                                                        const isActive = editingProduct.badges?.includes(badge);
                                                        return (
                                                            <button
                                                                key={badge}
                                                                type="button"
                                                                onClick={() => {
                                                                    const currentBadges = editingProduct.badges || [];
                                                                    const newBadges = isActive
                                                                        ? currentBadges.filter(b => b !== badge)
                                                                        : [...currentBadges, badge];
                                                                    setEditingProduct({ ...editingProduct, badges: newBadges });
                                                                }}
                                                                className={`px-4 py-2 text-[10px] uppercase font-bold tracking-widest border transition-all duration-300 ${isActive
                                                                    ? 'bg-chocolate text-gold border-gold'
                                                                    : 'bg-white text-slate-400 border-slate-100 hover:border-gold/30'
                                                                    }`}
                                                            >
                                                                {badge}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Precios y Clasificación</label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Precio Base</label>
                                                <input
                                                    type="text"
                                                    placeholder="$ 0.00"
                                                    value={getPriceDisplay(editingProduct.price, 'base_price')}
                                                    onChange={e => {
                                                        const val = e.target.value.replace(/[^0-9.]/g, '');
                                                        setEditingProduct({ ...editingProduct, price: Number(val) });
                                                    }}
                                                    onFocus={() => setFocusedField('base_price')}
                                                    onBlur={() => setFocusedField(null)}
                                                    className="w-full p-4 border border-slate-100 focus:border-gold outline-none"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Categoría Padre</label>
                                                <select
                                                    value={editingProduct.category_id}
                                                    onChange={e => setEditingProduct({ ...editingProduct, category_id: e.target.value, subcategory: '' })}
                                                    className="w-full p-4 border border-slate-100 focus:border-gold outline-none"
                                                >
                                                    <option value="">Seleccione Categoría</option>
                                                    {categories.filter(c => !c.parent_id).map(c => (
                                                        <option key={c.id} value={c.id}>{c.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Subcategoría</label>
                                            <select
                                                value={editingProduct.subcategory || ''}
                                                onChange={e => setEditingProduct({ ...editingProduct, subcategory: e.target.value })}
                                                className="w-full p-4 border border-slate-100 focus:border-gold outline-none"
                                                disabled={!editingProduct.category_id}
                                            >
                                                <option value="">Ninguna / Ver Todas</option>
                                                {categories
                                                    .filter(c => c.parent_id === editingProduct.category_id)
                                                    .map(c => (
                                                        <option key={c.id} value={c.slug}>{c.name}</option>
                                                    ))
                                                }
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-4 pt-4 border-t border-slate-100">
                                        <div className="flex items-center justify-between">
                                            <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Variantes de Talla</label>
                                            <button onClick={() => setEditingProduct({ ...editingProduct, size_variants: [...(editingProduct.size_variants || []), { size: '', price: editingProduct.price || 0 }] })} className="text-[10px] text-gold font-bold uppercase tracking-widest">+ Añadir Talla</button>
                                        </div>
                                        <div className="space-y-2">
                                            {editingProduct.size_variants?.map((v, idx) => (
                                                <div key={idx} className="flex gap-2">
                                                    <input type="text" placeholder="Talla" value={v.size} onChange={e => {
                                                        const newV = [...(editingProduct.size_variants || [])];
                                                        newV[idx].size = e.target.value;
                                                        setEditingProduct({ ...editingProduct, size_variants: newV });
                                                    }} className="w-1/4 p-3 border border-slate-100 outline-none text-xs" />
                                                    <input type="text" placeholder="Código Hijo" value={v.sku || ''} onChange={e => {
                                                        const newV = [...(editingProduct.size_variants || [])];
                                                        newV[idx].sku = e.target.value;
                                                        setEditingProduct({ ...editingProduct, size_variants: newV });
                                                    }} className="w-1/4 p-3 border border-slate-100 outline-none text-xs" />
                                                    <input
                                                        type="text"
                                                        placeholder="Precio"
                                                        value={getPriceDisplay(v.price, `variant_${idx}`)}
                                                        onChange={e => {
                                                            const val = e.target.value.replace(/[^0-9.]/g, '');
                                                            const newV = [...(editingProduct.size_variants || [])];
                                                            newV[idx].price = Number(val);
                                                            setEditingProduct({ ...editingProduct, size_variants: newV });
                                                        }}
                                                        onFocus={() => setFocusedField(`variant_${idx}`)}
                                                        onBlur={() => setFocusedField(null)}
                                                        className="flex-grow p-3 border border-slate-100 outline-none text-xs"
                                                    />
                                                    <button onClick={() => setEditingProduct({ ...editingProduct, size_variants: editingProduct.size_variants?.filter((_, i) => i !== idx) })} className="text-slate-300 hover:text-red-400 p-2"><FontAwesomeIcon icon={faTimes} /></button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-10">
                                    <div className="space-y-4">
                                        <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Imagen Principal (Vertical)</label>
                                        <div className="relative group aspect-[3/4] bg-slate-50 border-2 border-dashed border-slate-100 flex items-center justify-center overflow-hidden">
                                            {isUploading ? (
                                                <div className="flex flex-col items-center gap-2"><div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" /><p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Optimizando...</p></div>
                                            ) : editingProduct.main_image ? (
                                                <>
                                                    <img src={editingProduct.main_image} className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <label className="cursor-pointer bg-white text-chocolate px-4 py-2 text-[10px] font-bold uppercase tracking-widest">Cambiar Imagen<input type="file" className="hidden" accept="image/*" onChange={e => handleFileUpload(e, 'main')} /></label>
                                                    </div>
                                                </>
                                            ) : (
                                                <label className="cursor-pointer flex flex-col items-center gap-4 p-10 text-center">
                                                    <FontAwesomeIcon icon={faImage} className="text-4xl text-slate-200" />
                                                    <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Subir imagen principal<br /><span className="text-[8px] opacity-60">Se optimizará automáticamente</span></p>
                                                    <input type="file" className="hidden" accept="image/*" onChange={e => handleFileUpload(e, 'main')} />
                                                </label>
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setMediaSelector({ isOpen: true, field: 'main' })}
                                            className="w-full py-3 border border-slate-200 text-[10px] uppercase font-bold tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                                        >
                                            <FontAwesomeIcon icon={faImages} className="text-gold" /> Elegir de Galería existante
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Galería Secundaria</label>
                                        <div className="grid grid-cols-4 gap-4">
                                            {editingProduct.gallery?.map((url, idx) => (
                                                <div key={idx} className="relative aspect-square bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden group/img">
                                                    {url ? (
                                                        <>
                                                            <img src={url} className="w-full h-full object-cover" />
                                                            {/* Controles de Orden */}
                                                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                                <button 
                                                                    disabled={idx === 0}
                                                                    onClick={() => {
                                                                        const g = [...(editingProduct.gallery || [])];
                                                                        [g[idx], g[idx - 1]] = [g[idx - 1], g[idx]];
                                                                        setEditingProduct({ ...editingProduct, gallery: g });
                                                                    }}
                                                                    className="w-7 h-7 bg-white text-chocolate rounded-full flex items-center justify-center hover:bg-gold hover:text-white transition-all disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-chocolate"
                                                                >
                                                                    <FontAwesomeIcon icon={faChevronLeft} className="text-[10px]" />
                                                                </button>
                                                                <button 
                                                                    disabled={idx === (editingProduct.gallery?.length || 0) - 1}
                                                                    onClick={() => {
                                                                        const g = [...(editingProduct.gallery || [])];
                                                                        [g[idx], g[idx + 1]] = [g[idx + 1], g[idx]];
                                                                        setEditingProduct({ ...editingProduct, gallery: g });
                                                                    }}
                                                                    className="w-7 h-7 bg-white text-chocolate rounded-full flex items-center justify-center hover:bg-gold hover:text-white transition-all disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-chocolate"
                                                                >
                                                                    <FontAwesomeIcon icon={faChevronRight} className="text-[10px]" />
                                                                </button>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <label className="cursor-pointer flex items-center justify-center w-full h-full"><FontAwesomeIcon icon={faPlus} className="text-slate-200" /><input type="file" className="hidden" onChange={e => handleFileUpload(e, 'gallery', idx)} /></label>
                                                    )}
                                                    {url && (
                                                        <button 
                                                            onClick={() => { 
                                                                const g = [...(editingProduct.gallery || [])]; 
                                                                g.splice(idx, 1); // Borrado real del elemento
                                                                setEditingProduct({ ...editingProduct, gallery: g }); 
                                                            }} 
                                                            className="absolute top-1 right-1 bg-white/80 w-5 h-5 flex items-center justify-center text-[10px] rounded-full text-red-500 shadow-sm hover:bg-red-500 hover:text-white transition-all"
                                                        >
                                                            <FontAwesomeIcon icon={faTimes} />
                                                        </button>
                                                    )}
                                                    {!url && (
                                                        <button
                                                            type="button"
                                                            onClick={() => setMediaSelector({ isOpen: true, field: 'gallery', index: idx })}
                                                            className="absolute bottom-1 right-1 bg-white/80 w-5 h-5 flex items-center justify-center text-[10px] rounded-full text-gold shadow-sm hover:scale-110 transition-transform"
                                                        >
                                                            <FontAwesomeIcon icon={faImages} />
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                            <button onClick={() => setEditingProduct({ ...editingProduct, gallery: [...(editingProduct.gallery || []), ''] })} className="aspect-square border-2 border-dashed border-slate-100 flex items-center justify-center text-slate-200 hover:text-gold hover:border-gold transition-all"><FontAwesomeIcon icon={faPlus} /></button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 border-t border-slate-100 flex gap-4 bg-slate-50">
                                <button onClick={() => setIsModalOpen(false)} className="px-10 py-5 text-[10px] uppercase tracking-widest font-bold text-slate-400 hover:text-chocolate transition-colors border border-slate-200">Cancelar</button>
                                <button onClick={handleSave} disabled={isUploading} className="flex-grow bg-gold text-chocolate py-5 font-bold uppercase tracking-[0.2em] shadow-xl hover:bg-chocolate hover:text-white transition-all disabled:opacity-50">
                                    {isUploading ? 'Subiendo Imágenes...' : 'Guardar Producto Auditado'}
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
                    if (mediaSelector.field === 'main') {
                        setEditingProduct(prev => ({ ...prev, main_image: url }));
                    } else if (mediaSelector.field === 'gallery' && mediaSelector.index !== undefined) {
                        const newGallery = [...(editingProduct?.gallery || [])];
                        newGallery[mediaSelector.index] = url;
                        setEditingProduct(prev => ({ ...prev, gallery: newGallery }));
                    }
                    toast.success('Imagen vinculada desde la galería');
                }}
            />

            <ConfirmModal
                isOpen={confirmDelete.isOpen}
                onCancel={() => setConfirmDelete({ isOpen: false, id: null })}
                onConfirm={handleDelete}
                title={isAdmin ? "Eliminar Producto" : "Ocultar Producto"}
                message={isAdmin
                    ? "¿Estás seguro de que quieres eliminar este producto? Esta acción es irreversible."
                    : "¿Deseas ocultar este producto del catálogo público? Podrá ser reactivado después por un administrador."}
                variant={isAdmin ? 'danger' : 'warning'}
            />
        </div>
    );
};
