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
                                if (confirm('¿Reiniciar catálogo con imágenes reales?')) {
                                    await seedCatalog();
                                    window.location.reload();
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

// --- Products Table Component (Moved from previous Admin.tsx) ---
const ProductsManager: React.FC<{
    products: Product[],
    categories: Category[],
    refresh: () => void
}> = ({ products, categories, refresh }) => {
    const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleEdit = (product: Product) => {
        setEditingProduct({ ...product });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar este producto?')) return;
        await productService.deleteProduct(id);
        refresh();
    };

    const handleSave = async () => {
        if (!editingProduct) return;
        await productService.upsertProduct(editingProduct);
        setIsModalOpen(false);
        refresh();
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center bg-white p-6 border border-slate-200">
                <p className="text-xs uppercase tracking-widest font-bold text-slate-400">Total: {products.length} productos</p>
                <button
                    onClick={() => {
                        setEditingProduct({
                            name: '', slug: '', description: '', price: 0,
                            show_price: true, main_image: '', gallery: ['', '', ''],
                            category_id: categories[0]?.id || '', stock_status: 'available'
                        });
                        setIsModalOpen(true);
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
                            <th className="px-8 py-4 text-[10px] uppercase tracking-widest font-bold text-slate-400">Preview</th>
                            <th className="px-8 py-4 text-[10px] uppercase tracking-widest font-bold text-slate-400">Información</th>
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
                                        <p className="text-[10px] text-slate-400 font-mono italic">{prod.slug}</p>
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

            {/* Modal de Edición (Copiado de Admin.tsx previo) */}
            <AnimatePresence>
                {isModalOpen && editingProduct && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="relative bg-white w-full max-w-4xl max-h-[85vh] overflow-y-auto shadow-2xl border border-gold/20">
                            {/* ... Content of the Modal we built before ... */}
                            <div className="p-10">
                                <div className="flex justify-between items-center mb-10 pb-6 border-b border-slate-100">
                                    <h2 className="text-2xl font-serif">Gestión de Producto</h2>
                                    <button onClick={() => setIsModalOpen(false)}><FontAwesomeIcon icon={faTimes} className="text-slate-400" /></button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Nombre</label>
                                            <input type="text" value={editingProduct.name} onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })} className="w-full p-4 border border-slate-100 focus:border-gold outline-none" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Slug</label>
                                            <input type="text" value={editingProduct.slug} onChange={e => setEditingProduct({ ...editingProduct, slug: e.target.value })} className="w-full p-4 border border-slate-100 focus:border-gold outline-none font-mono text-xs" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Modelo</label>
                                                <input type="text" value={editingProduct.model_code || ''} onChange={e => setEditingProduct({ ...editingProduct, model_code: e.target.value })} className="w-full p-4 border border-slate-100 focus:border-gold outline-none text-xs" placeholder="Ej: ARG-001" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Color</label>
                                                <input type="text" value={editingProduct.color || ''} onChange={e => setEditingProduct({ ...editingProduct, color: e.target.value })} className="w-full p-4 border border-slate-100 focus:border-gold outline-none text-xs" placeholder="Ej: Blanco" />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Precio</label>
                                                <input type="number" value={editingProduct.price} onChange={e => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })} className="w-full p-4 border border-slate-100 focus:border-gold outline-none" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Categoría</label>
                                                <select value={editingProduct.category_id} onChange={e => setEditingProduct({ ...editingProduct, category_id: e.target.value })} className="w-full p-4 border border-slate-100 focus:border-gold outline-none">
                                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                        {/* Size Variants Editor */}
                                        <div className="space-y-4 pt-4 border-t border-slate-100">
                                            <div className="flex items-center justify-between">
                                                <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Variantes de Precio por Talla</label>
                                                <button
                                                    onClick={() => {
                                                        const current = editingProduct.size_variants || [];
                                                        setEditingProduct({ ...editingProduct, size_variants: [...current, { size: '', price: editingProduct.price || 0 }] });
                                                    }}
                                                    className="text-[10px] text-gold font-bold uppercase tracking-widest"
                                                >
                                                    + Añadir Talla
                                                </button>
                                            </div>

                                            <div className="space-y-3">
                                                {editingProduct.size_variants?.map((v, idx) => (
                                                    <div key={idx} className="flex gap-2 items-center">
                                                        <input
                                                            type="text"
                                                            placeholder="Talla (e.g. 4)"
                                                            value={v.size}
                                                            onChange={(e) => {
                                                                const newV = [...(editingProduct.size_variants || [])];
                                                                newV[idx].size = e.target.value;
                                                                setEditingProduct({ ...editingProduct, size_variants: newV });
                                                            }}
                                                            className="w-1/3 p-3 border border-slate-100 outline-none text-xs"
                                                        />
                                                        <input
                                                            type="number"
                                                            placeholder="Precio"
                                                            value={v.price}
                                                            onChange={(e) => {
                                                                const newV = [...(editingProduct.size_variants || [])];
                                                                newV[idx].price = Number(e.target.value);
                                                                setEditingProduct({ ...editingProduct, size_variants: newV });
                                                            }}
                                                            className="flex-grow p-3 border border-slate-100 outline-none text-xs"
                                                        />
                                                        <button
                                                            onClick={() => {
                                                                const newV = editingProduct.size_variants?.filter((_, i) => i !== idx);
                                                                setEditingProduct({ ...editingProduct, size_variants: newV });
                                                            }}
                                                            className="text-red-400 p-2"
                                                        >
                                                            <FontAwesomeIcon icon={faTimes} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Imagen Principal (URL)</label>
                                            <input type="text" value={editingProduct.main_image} onChange={e => setEditingProduct({ ...editingProduct, main_image: e.target.value })} className="w-full p-4 border border-slate-100 focus:border-gold outline-none text-xs" />
                                            {editingProduct.main_image && <img src={editingProduct.main_image} className="w-full h-32 object-cover mt-2" />}
                                        </div>
                                    </div>
                                </div>

                                <button onClick={handleSave} className="w-full bg-gold text-chocolate mt-10 py-5 font-bold uppercase tracking-[0.2em] shadow-xl hover:bg-chocolate hover:text-white transition-all">
                                    Guardar Cambios
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
