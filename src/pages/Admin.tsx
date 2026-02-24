import React, { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faPlus, faTrash, faEdit, faSave, faTimes,
    faImage, faImages, faChevronRight, faDiamond,
    faBox, faUsers, faEye, faChartBar, faArrowUp
} from '@fortawesome/free-solid-svg-icons';
import { productService } from '@/services/productService';
import { seedCatalog } from '@/services/seedData';
import { Product, Category } from '@/types/product';
import { AdminLayout } from '@/components/admin/AdminLayout';

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
        await productService.deleteProduct(id);
        refresh();
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
        } catch (error) {
            console.error('Upload Error:', error);
            alert('Error al subir imagen. Asegúrate de que el bucket "catalog" exista en Supabase.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleSave = async () => {
        if (!validateForm()) return;
        if (!editingProduct) return;

        try {
            // Limpiar gallery de strings vacíos antes de guardar
            const cleanedGallery = (editingProduct.gallery || []).filter(url => url.trim() !== '');
            await productService.upsertProduct({ ...editingProduct, gallery: cleanedGallery });
            setIsModalOpen(false);
            refresh();
        } catch (error) {
            console.error('Save Error:', error);
            alert('Error al guardar el producto');
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
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Precios y Categoría</label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <input type="number" placeholder="Precio Base" value={editingProduct.price} onChange={e => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })} className="w-full p-4 border border-slate-100 focus:border-gold outline-none" />
                                            <select value={editingProduct.category_id} onChange={e => setEditingProduct({ ...editingProduct, category_id: e.target.value })} className="w-full p-4 border border-slate-100 focus:border-gold outline-none">
                                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
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
                <Route path="*" element={<DashboardOverview products={products} categories={categories} />} />
            </Routes>
        </AdminLayout>
    );
};

export default Admin;
