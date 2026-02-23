import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash, faEdit, faSave, faTimes, faImage, faImages, faChevronRight, faDiamond } from '@fortawesome/free-solid-svg-icons';
import { productService } from '@/services/productService';
import { seedCatalog } from '@/services/seedData';
import { Product, Category } from '@/types/product';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

const Admin: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

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
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (product: Product) => {
        setEditingProduct({ ...product });
        setIsModalOpen(true);
    };

    const handleAddNew = () => {
        setEditingProduct({
            name: '',
            slug: '',
            description: '',
            price: 0,
            show_price: true,
            main_image: '',
            gallery: ['', '', ''],
            category_id: categories[0]?.id || '',
            stock_status: 'available'
        });
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        if (!editingProduct) return;
        try {
            // Clean up gallery (remove empty strings)
            const cleanedGallery = (editingProduct.gallery || []).filter(url => url.trim() !== '');
            const productToSave = { ...editingProduct, gallery: cleanedGallery };

            await productService.upsertProduct(productToSave);
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            console.error('Error saving product:', error);
            alert('Error al guardar el producto');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar este producto?')) return;
        try {
            await productService.deleteProduct(id);
            fetchData();
        } catch (error) {
            console.error('Error deleting product:', error);
        }
    };

    const handleGalleryChange = (index: number, value: string) => {
        if (!editingProduct) return;
        const newGallery = [...(editingProduct.gallery || [])];
        newGallery[index] = value;
        setEditingProduct({ ...editingProduct, gallery: newGallery });
    };

    const addGalleryField = () => {
        if (!editingProduct) return;
        setEditingProduct({
            ...editingProduct,
            gallery: [...(editingProduct.gallery || []), '']
        });
    };

    if (loading && products.length === 0) {
        return (
            <div className="min-h-screen bg-cream flex items-center justify-center">
                <div className="w-12 h-12 border-2 border-gold border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-cream font-sans text-chocolate selection:bg-gold/20">
            <Header />

            <main className="pt-32 pb-20 px-6 md:px-12 max-w-[1600px] mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <FontAwesomeIcon icon={faDiamond} className="text-[10px] text-gold" />
                            <h1 className="text-4xl font-serif">Panel de Gestión</h1>
                        </div>
                        <p className="text-xs uppercase tracking-[0.4em] text-chocolate/40 font-medium">Administración de Catálogo</p>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={async () => {
                                if (confirm('¿Reiniciar catálogo con datos de prueba?')) {
                                    await seedCatalog();
                                    fetchData();
                                }
                            }}
                            className="border border-gold/30 text-gold px-6 py-4 hover:bg-gold/10 transition-all duration-300"
                        >
                            <span className="text-[10px] uppercase tracking-[0.3em] font-bold">Reiniciar Datos</span>
                        </button>

                        <button
                            onClick={handleAddNew}
                            className="bg-chocolate text-cream px-8 py-4 flex items-center gap-3 hover:bg-gold transition-all duration-500 group shadow-xl shadow-chocolate/10"
                        >
                            <FontAwesomeIcon icon={faPlus} className="text-xs group-hover:rotate-90 transition-transform duration-500" />
                            <span className="text-[10px] uppercase tracking-[0.3em] font-bold">Añadir Producto</span>
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white border border-gold/10 shadow-2xl shadow-chocolate/5 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gold/5 bg-chocolate text-cream">
                                <th className="px-8 py-6 text-[10px] uppercase tracking-[0.2em] font-bold w-24">Imagen</th>
                                <th className="px-8 py-6 text-[10px] uppercase tracking-[0.2em] font-bold">Producto</th>
                                <th className="px-8 py-6 text-[10px] uppercase tracking-[0.2em] font-bold">Categoría</th>
                                <th className="px-8 py-6 text-[10px] uppercase tracking-[0.2em] font-bold">Precio</th>
                                <th className="px-8 py-6 text-[10px] uppercase tracking-[0.2em] font-bold text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((prod) => (
                                <tr key={prod.id} className="border-b border-gold/5 hover:bg-cream/30 transition-colors group">
                                    <td className="px-8 py-4">
                                        <div className="w-12 h-16 bg-cream overflow-hidden border border-gold/10 group-hover:scale-110 transition-transform duration-500">
                                            <img src={prod.main_image} alt="" className="w-full h-full object-cover" />
                                        </div>
                                    </td>
                                    <td className="px-8 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-serif">{prod.name}</span>
                                            <span className="text-[10px] text-chocolate/40 uppercase tracking-widest">{prod.slug}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-4">
                                        <span className="text-[10px] uppercase tracking-widest px-3 py-1 bg-gold/5 border border-gold/10 text-gold font-bold">
                                            {(prod as any).categories?.name || 'S/C'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-4 font-serif text-gold">
                                        ${prod.price?.toLocaleString()}
                                    </td>
                                    <td className="px-8 py-4 text-right">
                                        <div className="flex justify-end gap-4">
                                            <button
                                                onClick={() => handleEdit(prod)}
                                                className="w-10 h-10 border border-gold/10 flex items-center justify-center hover:bg-gold hover:text-cream transition-all duration-300"
                                            >
                                                <FontAwesomeIcon icon={faEdit} className="text-[10px]" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(prod.id)}
                                                className="w-10 h-10 border border-red-100 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all duration-300"
                                            >
                                                <FontAwesomeIcon icon={faTrash} className="text-[10px]" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>

            {/* Modal Edit/Create */}
            <AnimatePresence>
                {isModalOpen && editingProduct && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-chocolate/80 backdrop-blur-md"
                            onClick={() => setIsModalOpen(false)}
                        />

                        <motion.div
                            initial={{ y: 50, opacity: 0, scale: 0.95 }}
                            animate={{ y: 0, opacity: 1, scale: 1 }}
                            exit={{ y: 50, opacity: 0, scale: 0.95 }}
                            className="relative bg-cream w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gold/20"
                        >
                            <div className="sticky top-0 bg-cream z-10 border-b border-gold/10 p-8 flex justify-between items-center">
                                <div className="space-y-1">
                                    <h2 className="text-2xl font-serif">{editingProduct.id ? 'Editar Producto' : 'Nuevo Producto'}</h2>
                                    <div className="h-[1px] w-12 bg-gold"></div>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="text-chocolate/40 hover:text-chocolate transition-colors">
                                    <FontAwesomeIcon icon={faTimes} className="text-xl" />
                                </button>
                            </div>

                            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-12">
                                {/* Left Side: Basic Info */}
                                <div className="space-y-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-chocolate/60">Nombre del Producto</label>
                                        <input
                                            type="text"
                                            value={editingProduct.name}
                                            onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                                            className="w-full bg-white border border-gold/10 p-4 font-serif focus:outline-none focus:border-gold transition-colors"
                                            placeholder="Ej. Ropón Gema"
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-chocolate/60">Slug (URL)</label>
                                        <input
                                            type="text"
                                            value={editingProduct.slug}
                                            onChange={(e) => setEditingProduct({ ...editingProduct, slug: e.target.value })}
                                            className="w-full bg-white border border-gold/10 p-4 text-xs font-mono focus:outline-none focus:border-gold transition-colors"
                                            placeholder="ej-ropon-gema"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-chocolate/60">Precio ($)</label>
                                            <input
                                                type="number"
                                                value={editingProduct.price}
                                                onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                                                className="w-full bg-white border border-gold/10 p-4 font-serif focus:outline-none focus:border-gold transition-colors"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-chocolate/60">Categoría</label>
                                            <select
                                                value={editingProduct.category_id}
                                                onChange={(e) => setEditingProduct({ ...editingProduct, category_id: e.target.value })}
                                                className="w-full bg-white border border-gold/10 p-4 text-xs uppercase tracking-widest focus:outline-none focus:border-gold transition-colors appearance-none"
                                            >
                                                {categories.map(cat => (
                                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-chocolate/60">Descripción Corta</label>
                                        <textarea
                                            value={editingProduct.description}
                                            onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                                            rows={2}
                                            className="w-full bg-white border border-gold/10 p-4 text-sm font-light leading-relaxed focus:outline-none focus:border-gold transition-colors"
                                        />
                                    </div>
                                </div>

                                {/* Right Side: Images */}
                                <div className="space-y-8">
                                    {/* Main Image */}
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            <FontAwesomeIcon icon={faImage} className="text-gold text-xs" />
                                            <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-chocolate/60">Imagen de Portada (URL)</label>
                                        </div>
                                        <div className="flex gap-4 items-start">
                                            <div className="w-20 h-28 bg-white border border-gold/10 overflow-hidden flex-shrink-0">
                                                {editingProduct.main_image ? (
                                                    <img src={editingProduct.main_image} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-chocolate/10">
                                                        <FontAwesomeIcon icon={faImage} />
                                                    </div>
                                                )}
                                            </div>
                                            <input
                                                type="text"
                                                value={editingProduct.main_image}
                                                onChange={(e) => setEditingProduct({ ...editingProduct, main_image: e.target.value })}
                                                className="flex-grow bg-white border border-gold/10 p-4 text-[10px] font-mono focus:outline-none focus:border-gold transition-colors"
                                                placeholder="https://images.unsplash.com/..."
                                            />
                                        </div>
                                    </div>

                                    {/* Gallery Images */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <FontAwesomeIcon icon={faImages} className="text-gold text-xs" />
                                                <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-chocolate/60">Galería Secundaria (URLs)</label>
                                            </div>
                                            <button
                                                onClick={addGalleryField}
                                                className="text-[8px] uppercase tracking-widest text-gold hover:text-chocolate transition-colors font-bold"
                                            >
                                                + Añadir Foto
                                            </button>
                                        </div>

                                        <div className="space-y-3">
                                            {editingProduct.gallery?.map((url, idx) => (
                                                <div key={idx} className="flex gap-3 items-center">
                                                    <div className="w-10 h-10 bg-white border border-gold/5 flex-shrink-0 overflow-hidden">
                                                        {url ? <img src={url} className="w-full h-full object-cover" /> : null}
                                                    </div>
                                                    <input
                                                        type="text"
                                                        value={url}
                                                        onChange={(e) => handleGalleryChange(idx, e.target.value)}
                                                        className="flex-grow bg-white border border-gold/10 p-3 text-[9px] font-mono focus:outline-none focus:border-gold transition-colors"
                                                        placeholder={`URL de Imagen ${idx + 1}`}
                                                    />
                                                    <button
                                                        onClick={() => {
                                                            const newG = editingProduct.gallery?.filter((_, i) => i !== idx);
                                                            setEditingProduct({ ...editingProduct, gallery: newG });
                                                        }}
                                                        className="text-chocolate/20 hover:text-red-500 transition-colors"
                                                    >
                                                        <FontAwesomeIcon icon={faTimes} className="text-xs" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 bg-white border-t border-gold/10 sticky bottom-0 z-10">
                                <button
                                    onClick={handleSave}
                                    className="w-full bg-chocolate text-cream py-6 flex items-center justify-center gap-4 hover:bg-gold transition-all duration-500 group shadow-xl shadow-chocolate/10"
                                >
                                    <FontAwesomeIcon icon={faSave} className="text-xs" />
                                    <span className="text-[10px] uppercase tracking-[0.4em] font-bold">Guardar Producto</span>
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <Footer />
        </div>
    );
};

export default Admin;
