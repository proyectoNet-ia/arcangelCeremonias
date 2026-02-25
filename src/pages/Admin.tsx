import React, { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faPlus, faTrash, faEdit, faSave, faTimes,
    faImage, faImages, faChevronRight, faDiamond,
    faBox, faUsers, faEye, faChartBar, faArrowUp,
    faCog, faGlobe, faPhone, faMapMarkerAlt, faEnvelope
} from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp, faFacebook, faInstagram } from '@fortawesome/free-brands-svg-icons';
import { productService } from '@/services/productService';
import { configService, SiteConfig } from '@/services/configService';
import { heroService, HeroSlide } from '@/services/heroService';
import { seedCatalog } from '@/services/seedData';
import { Product, Category } from '@/types/product';
import { AdminLayout } from '@/components/admin/AdminLayout';
import toast from 'react-hot-toast';

// --- Dashboard Component ---
const DashboardOverview: React.FC<{ products: Product[], categories: Category[] }> = ({ products, categories }) => {
    const stats = [
        { label: 'Productos Totales', value: products.length, icon: faBox, color: 'text-blue-500', bg: 'bg-blue-50' },
        { label: 'Categorías', value: categories.length, icon: faChartBar, color: 'text-purple-500', bg: 'bg-purple-50' },
        { label: 'Visitas Hoy', value: '1,284', icon: faEye, color: 'text-gold', bg: 'bg-gold/5', trend: '+12%' },
        { label: 'Consultas WhatsApp', value: '42', icon: faUsers, color: 'text-green-500', bg: 'bg-green-50', trend: '+5%' },
    ];

    return (
        <div className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={stat.label}
                        className="bg-white p-8 border border-slate-200 shadow-sm hover:shadow-md transition-shadow group"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className={`w-12 h-12 ${stat.bg} ${stat.color} flex items-center justify-center rounded-xl transition-transform group-hover:scale-110`}>
                                <FontAwesomeIcon icon={stat.icon} />
                            </div>
                            {stat.trend && (
                                <span className="text-[10px] font-bold text-green-500 bg-green-50 px-2 py-1 rounded">
                                    <FontAwesomeIcon icon={faArrowUp} className="mr-1" /> {stat.trend}
                                </span>
                            )}
                        </div>
                        <h3 className="text-slate-400 text-xs uppercase tracking-widest font-bold mb-1">{stat.label}</h3>
                        <p className="text-3xl font-serif text-slate-800">{stat.value}</p>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Quick Actions */}
                <div className="bg-white p-8 border border-slate-200">
                    <h3 className="font-serif text-xl mb-6 flex items-center gap-3">
                        <FontAwesomeIcon icon={faDiamond} className="text-[10px] text-gold" />
                        Acciones Rápidas
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => window.location.href = '/admin/productos'}
                            className="p-6 border border-slate-100 bg-slate-50 hover:bg-gold hover:text-white transition-all text-left space-y-2 group"
                        >
                            <FontAwesomeIcon icon={faPlus} className="text-gold group-hover:text-white" />
                            <p className="text-xs uppercase tracking-widest font-bold">Nuevo Producto</p>
                        </button>
                        <button
                            onClick={async () => {
                                if (confirm('¿Reiniciar catálogo con imágenes reales? (Esto borrará los productos actuales)')) {
                                    try {
                                        const success = await seedCatalog();
                                        if (success) {
                                            alert('¡Catálogo reiniciado con éxito!');
                                            window.location.reload();
                                        } else {
                                            alert('Error al reiniciar catálogo. Revisa la consola para más detalles.');
                                        }
                                    } catch (err) {
                                        alert('Error crítico: ' + (err as Error).message);
                                    }
                                }
                            }}
                            className="p-6 border border-slate-100 bg-slate-50 hover:bg-chocolate hover:text-white transition-all text-left space-y-2 group"
                        >
                            <FontAwesomeIcon icon={faBox} className="text-gold group-hover:text-white" />
                            <p className="text-xs uppercase tracking-widest font-bold">Reiniciar Datos</p>
                        </button>
                    </div>
                </div>

                {/* Recent Products */}
                <div className="bg-white p-8 border border-slate-200">
                    <h3 className="font-serif text-xl mb-6 flex items-center gap-3">
                        <FontAwesomeIcon icon={faDiamond} className="text-[10px] text-gold" />
                        Últimos Productos
                    </h3>
                    <div className="space-y-4">
                        {products.slice(0, 4).map(prod => (
                            <div key={prod.id} className="flex items-center gap-4 p-3 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0">
                                <img src={prod.main_image} className="w-10 h-10 object-cover rounded" alt="" />
                                <div className="flex-grow">
                                    <p className="text-sm font-medium">{prod.name}</p>
                                    <p className="text-[10px] text-slate-400 uppercase">{(prod as any).categories?.name}</p>
                                </div>
                                <span className="text-xs font-serif text-gold">${prod.price}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Image Optimization Helper ---
const optimizeImage = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                // Target: Vertical Aspect Ratio (2:3 or 3:4)
                const targetWidth = 800;
                const targetHeight = 1100;

                let width = img.width;
                let height = img.height;

                // Calculate cropping for vertical 
                const scale = Math.max(targetWidth / width, targetHeight / height);
                const drawWidth = width * scale;
                const drawHeight = height * scale;
                const x = (targetWidth - drawWidth) / 2;
                const y = (targetHeight - drawHeight) / 2;

                canvas.width = targetWidth;
                canvas.height = targetHeight;

                const ctx = canvas.getContext('2d');
                if (!ctx) return reject('Could not get canvas context');

                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, targetWidth, targetHeight);
                ctx.drawImage(img, x, y, drawWidth, drawHeight);

                canvas.toBlob(
                    (blob) => {
                        if (blob) resolve(blob);
                        else reject('Canvas toBlob failed');
                    },
                    'image/jpeg',
                    0.8 // 80% quality (good balance)
                );
            };
        };
        reader.onerror = (err) => reject(err);
    });
};

// --- Products Manager Component ---
const ProductsManager: React.FC<{
    products: Product[],
    categories: Category[],
    refresh: () => void
}> = ({ products, categories, refresh }) => {
    const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

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
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar este producto?')) return;
        try {
            await productService.deleteProduct(id);
            toast.success('Producto eliminado', {
                style: { background: '#1e293b', color: '#fff', fontSize: '12px', fontWeight: 'bold' }
            });
            refresh();
        } catch (error) {
            toast.error('Error al eliminar');
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'main' | 'gallery', index?: number) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setIsUploading(true);
            const optimizedBlob = await optimizeImage(file);
            const optimizedFile = new File([optimizedBlob], `${Date.now()}.jpg`, { type: 'image/jpeg' });

            const url = await productService.uploadImage(optimizedFile, 'products');

            if (field === 'main') {
                setEditingProduct(prev => ({ ...prev, main_image: url }));
            } else if (field === 'gallery' && index !== undefined) {
                const newGallery = [...(editingProduct?.gallery || [])];
                newGallery[index] = url;
                setEditingProduct(prev => ({ ...prev, gallery: newGallery }));
            }
            toast.success('Imagen lista', { icon: '📸' });
        } catch (error) {
            console.error('Upload Error:', error);
            toast.error('Error al subir imagen');
        } finally {
            setIsUploading(false);
        }
    };

    const handleSave = async () => {
        if (!validateForm()) return;
        if (!editingProduct) return;

        try {
            // Extraer solo los campos que existen en la tabla 'products' de la DB
            // Removemos 'categories' (que viene del join) y campos de solo lectura para evitar el Error 400
            const { categories: _, created_at: __, ...productData } = editingProduct as any;

            // Limpiar gallery de strings vacíos antes de guardar
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
        <div className="space-y-8">
            <div className="flex justify-between items-center bg-white p-6 border border-slate-200">
                <p className="text-xs uppercase tracking-widest font-bold text-slate-400">Total: {products.length} productos / Auditoría: Activa</p>
                <button
                    onClick={() => {
                        setEditingProduct({
                            name: '', slug: '', description: '', price: 0,
                            show_price: true, main_image: '', gallery: ['', '', ''],
                            category_id: categories[0]?.id || '', stock_status: 'available'
                        });
                        setIsModalOpen(true);
                        setErrors({});
                    }}
                    className="bg-gold text-chocolate px-6 py-3 text-[10px] uppercase tracking-widest font-bold hover:bg-chocolate hover:text-white transition-all shadow-lg"
                >
                    + Nuevo Producto
                </button>
            </div>

            <div className="bg-white border border-slate-200 overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-8 py-4 text-[10px] uppercase tracking-widest font-bold text-slate-400">Preview (800x1100)</th>
                            <th className="px-8 py-4 text-[10px] uppercase tracking-widest font-bold text-slate-400">Información Técnica</th>
                            <th className="px-8 py-4 text-[10px] uppercase tracking-widest font-bold text-slate-400">Categoría</th>
                            <th className="px-8 py-4 text-[10px] uppercase tracking-widest font-bold text-slate-400 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map(prod => (
                            <tr key={prod.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors group">
                                <td className="px-8 py-4">
                                    <img src={prod.main_image} className="w-12 h-16 object-cover border border-slate-200 group-hover:scale-105 transition-transform" />
                                </td>
                                <td className="px-8 py-4">
                                    <div className="space-y-1">
                                        <p className="text-sm font-serif">{prod.name}</p>
                                        <div className="flex gap-2">
                                            <span className="text-[9px] text-slate-400 border border-slate-100 px-1">{prod.model_code || 'S/M'}</span>
                                            <span className="text-[9px] text-slate-400 border border-slate-100 px-1">{prod.color || 'Blanco'}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-4 text-xs">{(prod as any).categories?.name}</td>
                                <td className="px-8 py-4">
                                    <div className="flex justify-end gap-3">
                                        <button onClick={() => handleEdit(prod)} className="p-2 border border-slate-100 hover:bg-gold hover:text-white transition-all rounded shadow-sm">
                                            <FontAwesomeIcon icon={faEdit} className="text-xs" />
                                        </button>
                                        <button onClick={() => handleDelete(prod.id)} className="p-2 border border-slate-100 hover:bg-red-500 hover:text-white transition-all rounded shadow-sm">
                                            <FontAwesomeIcon icon={faTrash} className="text-xs" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <AnimatePresence>
                {isModalOpen && editingProduct && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="relative bg-white w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gold/20 flex flex-col">
                            <div className="p-8 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
                                <div>
                                    <h2 className="text-2xl font-serif">Gestión de Producto</h2>
                                    <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Optimización de imagen automática activa (Max 800px)</p>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="text-slate-300 hover:text-chocolate transition-colors"><FontAwesomeIcon icon={faTimes} className="text-xl" /></button>
                            </div>

                            <div className="p-10 grid grid-cols-1 lg:grid-cols-2 gap-12 overflow-y-auto">
                                <div className="space-y-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Información Principal</label>
                                        <div className="space-y-4">
                                            <input type="text" placeholder="Nombre del Producto *" value={editingProduct.name} onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })} className={`w-full p-4 border border-slate-100 focus:border-gold outline-none ${errors.name ? 'border-red-400' : ''}`} />
                                            {errors.name && <p className="text-red-400 text-[10px] font-bold uppercase">{errors.name}</p>}

                                            <input type="text" placeholder="Slug (URL Amigable) *" value={editingProduct.slug} onChange={e => setEditingProduct({ ...editingProduct, slug: e.target.value })} className={`w-full p-4 border border-slate-100 focus:border-gold outline-none font-mono text-xs ${errors.slug ? 'border-red-400' : ''}`} />

                                            <div className="grid grid-cols-2 gap-4">
                                                <input type="text" placeholder="Modelo / Código" value={editingProduct.model_code || ''} onChange={e => setEditingProduct({ ...editingProduct, model_code: e.target.value })} className="w-full p-4 border border-slate-100 focus:border-gold outline-none text-xs" />
                                                <input type="text" placeholder="Color Principal" value={editingProduct.color || ''} onChange={e => setEditingProduct({ ...editingProduct, color: e.target.value })} className="w-full p-4 border border-slate-100 focus:border-gold outline-none text-xs" />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[9px] uppercase tracking-widest font-bold text-slate-400 pl-1">Distintivos del Producto (Selección Predefinida)</label>
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
                                                <input type="number" placeholder="$ 0.00" value={editingProduct.price} onChange={e => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })} className="w-full p-4 border border-slate-100 focus:border-gold outline-none" />
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
                                            <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Subcategoría (Específica)</label>
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
                                                    }} className="w-1/3 p-3 border border-slate-100 outline-none text-xs" />
                                                    <input type="number" placeholder="Precio" value={v.price} onChange={e => {
                                                        const newV = [...(editingProduct.size_variants || [])];
                                                        newV[idx].price = Number(e.target.value);
                                                        setEditingProduct({ ...editingProduct, size_variants: newV });
                                                    }} className="flex-grow p-3 border border-slate-100 outline-none text-xs" />
                                                    <button onClick={() => setEditingProduct({ ...editingProduct, size_variants: editingProduct.size_variants?.filter((_, i) => i !== idx) })} className="text-slate-300 hover:text-red-400 p-2"><FontAwesomeIcon icon={faTimes} /></button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-10">
                                    <div className="space-y-4">
                                        <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Imagen Principal (Vertical 800x1100)</label>
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
                                                    <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Subir imagen principal<br /><span className="text-[8px] opacity-60">Se recortará automáticamente a formato vertical</span></p>
                                                    <input type="file" className="hidden" accept="image/*" onChange={e => handleFileUpload(e, 'main')} />
                                                </label>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Galería Secundaria</label>
                                        <div className="grid grid-cols-4 gap-4">
                                            {editingProduct.gallery?.map((url, idx) => (
                                                <div key={idx} className="relative aspect-square bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden">
                                                    {url ? (
                                                        <img src={url} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <label className="cursor-pointer flex items-center justify-center w-full h-full"><FontAwesomeIcon icon={faPlus} className="text-slate-200" /><input type="file" className="hidden" onChange={e => handleFileUpload(e, 'gallery', idx)} /></label>
                                                    )}
                                                    {url && <button onClick={() => { const g = [...(editingProduct.gallery || [])]; g[idx] = ''; setEditingProduct({ ...editingProduct, gallery: g }); }} className="absolute top-1 right-1 bg-white/80 w-5 h-5 flex items-center justify-center text-[10px] rounded-full text-red-500 shadow-sm"><FontAwesomeIcon icon={faTimes} /></button>}
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
        </div>
    );
};

// --- Hero Manager Component ---
const HeroManager: React.FC = () => {
    const [slides, setSlides] = useState<HeroSlide[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingSlide, setEditingSlide] = useState<Partial<HeroSlide> | null>(null);
    const [isUploading, setIsUploading] = useState(false);

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
            toast.success('Imagen subida');
        } catch (error) {
            toast.error('Error al subir imagen');
        } finally {
            setIsUploading(false);
        }
    };

    const handleSave = async () => {
        if (!editingSlide?.title_1) return toast.error('Falta el título');
        try {
            await heroService.upsertSlide(editingSlide);
            toast.success('Slide guardado');
            setEditingSlide(null);
            fetchSlides();
        } catch (error) {
            toast.error('Error al guardar');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Eliminar este slide?')) return;
        try {
            await heroService.deleteSlide(id);
            toast.success('Slide eliminado');
            fetchSlides();
        } catch (error) {
            toast.error('Error al eliminar');
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
                    className="bg-gold text-chocolate px-6 py-3 text-[10px] uppercase tracking-widest font-bold hover:bg-chocolate hover:text-white transition-all shadow-lg"
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
                        <div className="p-6 flex-grow space-y-4">
                            <div>
                                <h3 className="font-serif text-lg">{slide.title_1} {slide.title_2}</h3>
                                <p className="text-xs text-slate-400 line-clamp-2">{slide.subtitle}</p>
                            </div>
                            <div className="flex gap-2 pt-2">
                                <button onClick={() => setEditingSlide(slide)} className="flex-grow py-3 border border-slate-100 text-[9px] uppercase font-bold tracking-widest hover:border-gold hover:text-gold transition-all">Editar</button>
                                <button onClick={() => handleDelete(slide.id!)} className="px-4 py-3 border border-slate-100 text-red-300 hover:text-red-500 transition-all"><FontAwesomeIcon icon={faTrash} /></button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <AnimatePresence>
                {editingSlide && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setEditingSlide(null)} />
                        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="relative bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl p-10 space-y-8">
                            <div className="flex justify-between items-center">
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
                                            {editingSlide.bg_url ? (
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
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Imagen Mobile (Vertical)</label>
                                        <div className="aspect-[3/4] w-32 mx-auto bg-slate-50 border-2 border-dashed border-slate-100 relative group overflow-hidden flex items-center justify-center">
                                            {editingSlide.bg_mobile_url ? (
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
        </div>
    );
};

// --- Config Manager Component ---
const ConfigManager: React.FC = () => {
    const [config, setConfig] = useState<SiteConfig>({
        company_name: '',
        whatsapp: '',
        phone: '',
        email: '',
        facebook_url: '',
        instagram_url: '',
        address: '',
        google_maps_url: '',
        office_hours: '',
        primary_color: '#3E2723',
        secondary_color: '#C5A059',
        accent_color: '#FDF8F1',
        logo_light_url: '',
        logo_dark_url: '',
        about_title: '',
        about_subtitle: '',
        about_quote: '',
        about_body_1: '',
        about_body_2: '',
        about_body_3: '',
        about_image_url: '',
        about_stat_1_value: '', about_stat_1_label: '',
        about_stat_2_value: '', about_stat_2_label: '',
        about_stat_3_value: '', about_stat_3_label: '',
        about_stat_4_value: '', about_stat_4_label: '',
        cta_banner_title: '',
        cta_banner_subtitle: '',
        cta_banner_tag: '',
        cta_banner_body: '',
        cta_banner_btn1_label: '',
        cta_banner_btn2_label: '',
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await configService.getConfig();
                if (data) {
                    // Normalizar los datos para evitar nulls que rompen React Inputs
                    setConfig({
                        company_name: data.company_name || '',
                        whatsapp: data.whatsapp || '',
                        phone: data.phone || '',
                        email: data.email || '',
                        facebook_url: data.facebook_url || '',
                        instagram_url: data.instagram_url || '',
                        address: data.address || '',
                        google_maps_url: data.google_maps_url || '',
                        office_hours: data.office_hours || '',
                        primary_color: data.primary_color || '#3E2723',
                        secondary_color: data.secondary_color || '#C5A059',
                        accent_color: data.accent_color || '#FDF8F1',
                        logo_light_url: data.logo_light_url || '',
                        logo_dark_url: data.logo_dark_url || '',
                        about_title: data.about_title || '',
                        about_subtitle: data.about_subtitle || '',
                        about_quote: data.about_quote || '',
                        about_body_1: data.about_body_1 || '',
                        about_body_2: data.about_body_2 || '',
                        about_body_3: data.about_body_3 || '',
                        about_image_url: data.about_image_url || '',
                        about_stat_1_value: data.about_stat_1_value || '', about_stat_1_label: data.about_stat_1_label || '',
                        about_stat_2_value: data.about_stat_2_value || '', about_stat_2_label: data.about_stat_2_label || '',
                        about_stat_3_value: data.about_stat_3_value || '', about_stat_3_label: data.about_stat_3_label || '',
                        about_stat_4_value: data.about_stat_4_value || '', about_stat_4_label: data.about_stat_4_label || '',
                        cta_banner_title: data.cta_banner_title || '',
                        cta_banner_subtitle: data.cta_banner_subtitle || '',
                        cta_banner_tag: data.cta_banner_tag || '',
                        cta_banner_body: data.cta_banner_body || '',
                        cta_banner_btn1_label: data.cta_banner_btn1_label || '',
                        cta_banner_btn2_label: data.cta_banner_btn2_label || '',
                    });
                }
            } catch (error) {
                console.error('Error loading config:', error);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'light' | 'dark') => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            setSaving(true);
            const url = await productService.uploadImage(file, 'branding');
            if (type === 'light') setConfig(prev => ({ ...prev, logo_light_url: url }));
            else setConfig(prev => ({ ...prev, logo_dark_url: url }));
            toast.success('Logo cargado correctamente');
        } catch (error) {
            toast.error('Error al subir el logo');
        } finally {
            setSaving(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSaving(true);
            await configService.updateConfig(config);
            toast.success('Configuración actualizada', {
                style: { background: '#1e293b', color: '#fff', fontSize: '12px', fontWeight: 'bold' }
            });
        } catch (error) {
            console.error('Save error:', error);
            toast.error('Error al guardar configuración');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" /></div>;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl space-y-8"
        >
            <div className="bg-white p-8 border border-slate-200">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-10 h-10 bg-gold/10 text-gold flex items-center justify-center rounded-lg">
                        <FontAwesomeIcon icon={faCog} />
                    </div>
                    <div>
                        <h2 className="text-xl font-serif">Configuración General</h2>
                        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Datos de contacto y redes sociales globales</p>
                    </div>
                </div>

                <form onSubmit={handleSave} className="space-y-10">
                    {/* Brand & Colors */}
                    <div className="space-y-8">
                        <h3 className="text-[10px] uppercase tracking-widest font-bold text-gold border-b border-gold/10 pb-2">Identidad Visual y Colores</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Color Primario (Textos/Oscuros)</label>
                                <div className="flex gap-2">
                                    <input type="color" value={config.primary_color} onChange={e => setConfig({ ...config, primary_color: e.target.value })} className="h-12 w-12 border border-slate-200 cursor-pointer" />
                                    <input type="text" value={config.primary_color} onChange={e => setConfig({ ...config, primary_color: e.target.value })} className="flex-grow p-4 border border-slate-100 outline-none text-xs font-mono" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Color Secundario (Gold/Detalles)</label>
                                <div className="flex gap-2">
                                    <input type="color" value={config.secondary_color} onChange={e => setConfig({ ...config, secondary_color: e.target.value })} className="h-12 w-12 border border-slate-200 cursor-pointer" />
                                    <input type="text" value={config.secondary_color} onChange={e => setConfig({ ...config, secondary_color: e.target.value })} className="flex-grow p-4 border border-slate-100 outline-none text-xs font-mono" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Color de Acento (Fondo Claro)</label>
                                <div className="flex gap-2">
                                    <input type="color" value={config.accent_color} onChange={e => setConfig({ ...config, accent_color: e.target.value })} className="h-12 w-12 border border-slate-200 cursor-pointer" />
                                    <input type="text" value={config.accent_color} onChange={e => setConfig({ ...config, accent_color: e.target.value })} className="flex-grow p-4 border border-slate-100 outline-none text-xs font-mono" />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                            <div className="space-y-4">
                                <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Logo para Fondos Claros (Versión Oscura)</label>
                                <div className="aspect-video bg-slate-50 border-2 border-dashed border-slate-100 relative group overflow-hidden flex items-center justify-center">
                                    {config.logo_light_url ? (
                                        <>
                                            <img src={config.logo_light_url} className="max-h-full object-contain p-4" />
                                            <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white text-[10px] font-bold uppercase tracking-widest">Cambiar<input type="file" className="hidden" accept="image/*" onChange={e => handleLogoUpload(e, 'light')} /></label>
                                        </>
                                    ) : (
                                        <label className="cursor-pointer flex flex-col items-center gap-2 p-4 text-center">
                                            <FontAwesomeIcon icon={faImage} className="text-3xl text-slate-200" />
                                            <span className="text-[9px] uppercase font-bold text-slate-300">Subir Logo (Claro)</span>
                                            <input type="file" className="hidden" accept="image/*" onChange={e => handleLogoUpload(e, 'light')} />
                                        </label>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-4">
                                <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Logo para Fondos Oscuros (Versión Blanca/Gold)</label>
                                <div className="aspect-video bg-chocolate border-2 border-dashed border-white/10 relative group overflow-hidden flex items-center justify-center">
                                    {config.logo_dark_url ? (
                                        <>
                                            <img src={config.logo_dark_url} className="max-h-full object-contain p-4" />
                                            <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white text-[10px] font-bold uppercase tracking-widest">Cambiar<input type="file" className="hidden" accept="image/*" onChange={e => handleLogoUpload(e, 'dark')} /></label>
                                        </>
                                    ) : (
                                        <label className="cursor-pointer flex flex-col items-center gap-2 p-4 text-center">
                                            <FontAwesomeIcon icon={faImage} className="text-3xl text-white/20" />
                                            <span className="text-[9px] uppercase font-bold text-white/30">Subir Logo (Oscuro)</span>
                                            <input type="file" className="hidden" accept="image/*" onChange={e => handleLogoUpload(e, 'dark')} />
                                        </label>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Basic Info */}
                    <div className="space-y-6">
                        <h3 className="text-[10px] uppercase tracking-widest font-bold text-gold border-b border-gold/10 pb-2">Información de Identidad</h3>
                        <div className="grid grid-cols-1 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Nombre de la Empresa</label>
                                <div className="relative">
                                    <FontAwesomeIcon icon={faGlobe} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                    <input
                                        type="text"
                                        value={config.company_name}
                                        onChange={e => setConfig({ ...config, company_name: e.target.value })}
                                        className="w-full p-4 pl-12 border border-slate-100 focus:border-gold outline-none text-sm"
                                        placeholder="Ej. Arcángel Ceremonias"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-6">
                        <h3 className="text-[10px] uppercase tracking-widest font-bold text-gold border-b border-gold/10 pb-2">Canales de Contacto</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">WhatsApp (Número 10 dig + prefijo)</label>
                                <div className="relative">
                                    <FontAwesomeIcon icon={faWhatsapp} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                    <input
                                        type="text"
                                        value={config.whatsapp}
                                        onChange={e => setConfig({ ...config, whatsapp: e.target.value })}
                                        className="w-full p-4 pl-12 border border-slate-100 focus:border-gold outline-none text-sm"
                                        placeholder="Ej. 523521681197"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Teléfono Oficina</label>
                                <div className="relative">
                                    <FontAwesomeIcon icon={faPhone} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                    <input
                                        type="text"
                                        value={config.phone}
                                        onChange={e => setConfig({ ...config, phone: e.target.value })}
                                        className="w-full p-4 pl-12 border border-slate-100 focus:border-gold outline-none text-sm"
                                        placeholder="Ej. 352 52 62502"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Correo Electrónico</label>
                                <div className="relative">
                                    <FontAwesomeIcon icon={faEnvelope} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                    <input
                                        type="email"
                                        value={config.email}
                                        onChange={e => setConfig({ ...config, email: e.target.value })}
                                        className="w-full p-4 pl-12 border border-slate-100 focus:border-gold outline-none text-sm"
                                        placeholder="info@empresa.com"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Horarios</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={config.office_hours || ''}
                                        onChange={e => setConfig({ ...config, office_hours: e.target.value })}
                                        className="w-full p-4 border border-slate-100 focus:border-gold outline-none text-sm"
                                        placeholder="Lunes a Viernes 9:00 - 18:00"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Social Media */}
                    <div className="space-y-6">
                        <h3 className="text-[10px] uppercase tracking-widest font-bold text-gold border-b border-gold/10 pb-2">Redes Sociales (URLs)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Facebook URL</label>
                                <div className="relative">
                                    <FontAwesomeIcon icon={faFacebook} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                    <input
                                        type="text"
                                        value={config.facebook_url}
                                        onChange={e => setConfig({ ...config, facebook_url: e.target.value })}
                                        className="w-full p-4 pl-12 border border-slate-100 focus:border-gold outline-none text-sm"
                                        placeholder="https://facebook.com/..."
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Instagram URL</label>
                                <div className="relative">
                                    <FontAwesomeIcon icon={faInstagram} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                    <input
                                        type="text"
                                        value={config.instagram_url}
                                        onChange={e => setConfig({ ...config, instagram_url: e.target.value })}
                                        className="w-full p-4 pl-12 border border-slate-100 focus:border-gold outline-none text-sm"
                                        placeholder="https://instagram.com/..."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Physical Address */}
                    <div className="space-y-6">
                        <h3 className="text-[10px] uppercase tracking-widest font-bold text-gold border-b border-gold/10 pb-2">Ubicación Física</h3>
                        <div className="grid grid-cols-1 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Dirección Completa</label>
                                <div className="relative">
                                    <FontAwesomeIcon icon={faMapMarkerAlt} className="absolute left-4 top-4 text-slate-300" />
                                    <textarea
                                        value={config.address}
                                        onChange={e => setConfig({ ...config, address: e.target.value })}
                                        rows={3}
                                        className="w-full p-4 pl-12 border border-slate-100 focus:border-gold outline-none text-sm"
                                        placeholder="Calle, Número, Colonia, CP, Ciudad..."
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Google Maps URL (Iframe o Enlace)</label>
                                <input
                                    type="text"
                                    value={config.google_maps_url}
                                    onChange={e => setConfig({ ...config, google_maps_url: e.target.value })}
                                    className="w-full p-4 border border-slate-100 focus:border-gold outline-none text-sm"
                                    placeholder="https://goo.gl/maps/..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* ── Nosotros ── */}
                    <div className="space-y-6">
                        <h3 className="text-[10px] uppercase tracking-widest font-bold text-gold border-b border-gold/10 pb-2">Página "Nosotros"</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Subtítulo (Etiqueta superior)</label>
                                <input type="text" value={config.about_subtitle || ''} onChange={e => setConfig({ ...config, about_subtitle: e.target.value })} className="w-full p-4 border border-slate-100 focus:border-gold outline-none text-sm" placeholder="Ej: Nuestra Historia" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Título Principal</label>
                                <input type="text" value={config.about_title || ''} onChange={e => setConfig({ ...config, about_title: e.target.value })} className="w-full p-4 border border-slate-100 focus:border-gold outline-none text-sm" placeholder="Ej: Más de 30 años de tradición" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Frase Destacada (Cita en itálica)</label>
                            <textarea rows={2} value={config.about_quote || ''} onChange={e => setConfig({ ...config, about_quote: e.target.value })} className="w-full p-4 border border-slate-100 focus:border-gold outline-none text-sm" placeholder="Nuestra misión es..." />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Párrafo 1</label>
                                <textarea rows={4} value={config.about_body_1 || ''} onChange={e => setConfig({ ...config, about_body_1: e.target.value })} className="w-full p-4 border border-slate-100 focus:border-gold outline-none text-sm" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Párrafo 2</label>
                                <textarea rows={4} value={config.about_body_2 || ''} onChange={e => setConfig({ ...config, about_body_2: e.target.value })} className="w-full p-4 border border-slate-100 focus:border-gold outline-none text-sm" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Párrafo 3</label>
                                <textarea rows={4} value={config.about_body_3 || ''} onChange={e => setConfig({ ...config, about_body_3: e.target.value })} className="w-full p-4 border border-slate-100 focus:border-gold outline-none text-sm" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">URL de Imagen Principal</label>
                            <input type="text" value={config.about_image_url || ''} onChange={e => setConfig({ ...config, about_image_url: e.target.value })} className="w-full p-4 border border-slate-100 focus:border-gold outline-none text-sm" placeholder="/catalog/portrait-child.jpg o URL de Supabase" />
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {([1, 2, 3, 4] as const).map(n => (
                                <div key={n} className="space-y-2 p-4 border border-slate-100">
                                    <label className="text-[9px] uppercase tracking-widest font-bold text-slate-400">Estadística {n}</label>
                                    <input type="text" value={(config as any)[`about_stat_${n}_value`] || ''} onChange={e => setConfig({ ...config, [`about_stat_${n}_value`]: e.target.value })} className="w-full p-2 border border-slate-100 focus:border-gold outline-none text-sm font-bold" placeholder="30+" />
                                    <input type="text" value={(config as any)[`about_stat_${n}_label`] || ''} onChange={e => setConfig({ ...config, [`about_stat_${n}_label`]: e.target.value })} className="w-full p-2 border border-slate-100 focus:border-gold outline-none text-xs" placeholder="Años de Experiencia" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ── CTA Banner (Mayoreo) ── */}
                    <div className="space-y-6">
                        <h3 className="text-[10px] uppercase tracking-widest font-bold text-gold border-b border-gold/10 pb-2">Banner CTA — Venta al por Mayor (Home)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Etiqueta Superior</label>
                                <input type="text" value={config.cta_banner_tag || ''} onChange={e => setConfig({ ...config, cta_banner_tag: e.target.value })} className="w-full p-4 border border-slate-100 focus:border-gold outline-none text-sm" placeholder="Socios Comerciales" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Título</label>
                                <input type="text" value={config.cta_banner_title || ''} onChange={e => setConfig({ ...config, cta_banner_title: e.target.value })} className="w-full p-4 border border-slate-100 focus:border-gold outline-none text-sm" placeholder="Venta al por mayor" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Subtítulo (Dorado)</label>
                                <input type="text" value={config.cta_banner_subtitle || ''} onChange={e => setConfig({ ...config, cta_banner_subtitle: e.target.value })} className="w-full p-4 border border-slate-100 focus:border-gold outline-none text-sm" placeholder="& Boutiques" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Texto del Banner</label>
                            <textarea rows={3} value={config.cta_banner_body || ''} onChange={e => setConfig({ ...config, cta_banner_body: e.target.value })} className="w-full p-4 border border-slate-100 focus:border-gold outline-none text-sm" placeholder="Descripción para socios..." />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Texto Botón 1 (WhatsApp/Verde)</label>
                                <input type="text" value={config.cta_banner_btn1_label || ''} onChange={e => setConfig({ ...config, cta_banner_btn1_label: e.target.value })} className="w-full p-4 border border-slate-100 focus:border-gold outline-none text-sm" placeholder="Catálogo Mayoreo" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Texto Botón 2 (Teléfono/Outline)</label>
                                <input type="text" value={config.cta_banner_btn2_label || ''} onChange={e => setConfig({ ...config, cta_banner_btn2_label: e.target.value })} className="w-full p-4 border border-slate-100 focus:border-gold outline-none text-sm" placeholder="Línea de Negocios" />
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-slate-100">
                        <button
                            type="submit"
                            disabled={saving}
                            className="bg-gold text-chocolate px-12 py-5 text-[10px] uppercase tracking-[0.3em] font-bold shadow-xl hover:bg-chocolate hover:text-white transition-all disabled:opacity-50"
                        >
                            {saving ? 'Guardando Cambios...' : 'Guardar Configuración Global'}
                        </button>
                    </div>
                </form>
            </div>
        </motion.div>
    );
};

// --- Main Admin Entry Point ---
const Admin: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [prods, cats] = await Promise.all([
                productService.getProducts(),
                productService.getCategories()
            ]);
            setProducts(prods);
            setCategories(cats);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    if (loading && products.length === 0) return <div className="h-screen flex items-center justify-center bg-slate-50"><div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" /></div>;

    return (
        <AdminLayout>
            <Routes>
                <Route index element={<DashboardOverview products={products} categories={categories} />} />
                <Route path="productos" element={<ProductsManager products={products} categories={categories} refresh={fetchData} />} />
                <Route path="hero" element={<HeroManager />} />
                <Route path="configuracion" element={<ConfigManager />} />
                <Route path="*" element={<DashboardOverview products={products} categories={categories} />} />
            </Routes>
        </AdminLayout>
    );
};

export default Admin;
