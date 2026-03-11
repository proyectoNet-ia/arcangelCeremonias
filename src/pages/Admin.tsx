import React, { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faPlus, faTrash, faEdit, faSave, faTimes,
    faImage, faImages, faChevronRight, faDiamond,
    faBox, faUsers, faEye, faChartBar, faArrowUp,
    faCog, faGlobe, faPhone, faMapMarkerAlt, faEnvelope,
    faFilePdf, faFileUpload, faMagic, faInbox, faCheckCircle,
    faUserShield, faUserEdit, faUserMinus, faUserPlus,
    faChartLine, faArrowUpRightFromSquare, faTrophy
} from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp, faFacebook, faInstagram } from '@fortawesome/free-brands-svg-icons';
import { productService } from '@/services/productService';
import { configService, SiteConfig } from '@/services/configService';
import { contactService, ContactMessage } from '@/services/contactService';
import { heroService, HeroSlide } from '@/services/heroService';
import { seedCatalog } from '@/services/seedData';
import { statsService } from '@/services/statsService';
import { userService, Profile } from '@/services/userService';
import { useAuth } from '@/context/AuthContext';
import { Product, Category } from '@/types/product';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { MediaGallery } from '@/components/admin/MediaGallery';
import { MediaSelectorModal } from '@/components/admin/MediaSelectorModal';
import { ConfirmModal } from '@/components/admin/ConfirmModal';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import toast from 'react-hot-toast';
const generateSlug = (name: string) => {
    return name
        .toLowerCase()
        .trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Eliminar acentos
        .replace(/[^a-z0-9\s-]/g, "")    // Eliminar caracteres especiales
        .replace(/[\s_]+/g, "-")          // Espacios a guiones
        .replace(/-+/g, "-");             // Evitar guiones dobles
};

const smartFormatTitle = (val: string) => {
    if (!val) return '';
    const minorWords = ['de', 'del', 'la', 'las', 'el', 'los', 'y', 'en', 'para', 'con', 'por', 'a', 'un', 'una', 'unas', 'unos'];
    return val
        .split(' ')
        .map((word, index) => {
            if (!word) return '';
            const lowerWord = word.toLowerCase();
            if (index > 0 && minorWords.includes(lowerWord)) {
                return lowerWord;
            }
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        })
        .join(' ');
};
// --- Dashboard Component ---
const DashboardOverview: React.FC<{ products: Product[], categories: Category[], refresh: () => void }> = ({ products, categories, refresh }) => {
    const [isStandardizing, setIsStandardizing] = useState(false);
    const [statsData, setStatsData] = useState({ pageViews: 0, whatsappClicks: 0, conversionRate: '0' });
    const [recentClicks, setRecentClicks] = useState<any[]>([]);
    const [topProducts, setTopProducts] = useState<any[]>([]);

    useEffect(() => {
        const fetchStats = async () => {
            const [data, clicks, top] = await Promise.all([
                statsService.getDashboardStats(),
                statsService.getRecentWhatsAppClicks(5),
                statsService.getTopProducts(3)
            ]);
            setStatsData(data);
            setRecentClicks(clicks);
            setTopProducts(top);
        };
        fetchStats();
    }, []);

    const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean, onConfirm: () => void, title: string, message: string }>({
        isOpen: false,
        onConfirm: () => { },
        title: '',
        message: ''
    });

    const triggerStandardize = () => {
        setConfirmModal({
            isOpen: true,
            title: 'Estandarizar Catálogo',
            message: '¿Deseas aplicar el nuevo formato "Smart Title Case" (Ej: Toalla para Bautizo) a todos los productos y categorías? Esta acción actualizará la base de datos de forma masiva.',
            onConfirm: handleStandardizeTitles
        });
    };

    const handleStandardizeTitles = async () => {
        try {
            setIsStandardizing(true);
            const toastId = toast.loading('Estandarizando catálogo...');
            // ... (rest of logic remains same)

            // 1. Estandarizar Categorías
            for (const cat of categories) {
                const newName = smartFormatTitle(cat.name);
                if (newName !== cat.name) {
                    await productService.upsertCategory({ ...cat, name: newName });
                }
            }

            // 2. Estandarizar Productos
            for (const prod of products) {
                const newName = smartFormatTitle(prod.name);
                if (newName !== prod.name) {
                    // Removemos campos de join para el upsert
                    const { categories: _, created_at: __, ...prodData } = prod as any;
                    await productService.upsertProduct({ ...prodData, name: newName });
                }
            }

            toast.success('¡Catálogo estandarizado con éxito!', { id: toastId });
            refresh();
        } catch (error) {
            console.error(error);
            toast.error('Error durante la estandarización');
        } finally {
            setIsStandardizing(false);
        }
    };

    const stats = [
        { label: 'Catálogo', value: products.length, icon: faBox, color: 'text-blue-500', bg: 'bg-blue-50', sub: 'Productos' },
        { label: 'Secciones', value: categories.length, icon: faChartBar, color: 'text-purple-500', bg: 'bg-purple-50', sub: 'Categorías' },
        { label: 'Visitas Reales', value: statsData.pageViews.toLocaleString(), icon: faEye, color: 'text-gold', bg: 'bg-gold/5', trend: 'Global' },
        { label: 'Efectividad', value: `${statsData.conversionRate}%`, icon: faWhatsapp, color: 'text-green-500', bg: 'bg-green-50', trend: 'WA Click' },
    ];

    return (
        <div className="space-y-6 md:space-y-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {stats.map((stat, i) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={stat.label}
                        className="bg-white p-6 md:p-8 border border-slate-200 shadow-sm hover:shadow-md transition-shadow group"
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div className={`w-14 h-14 ${stat.bg} ${stat.color} flex items-center justify-center rounded-2xl transition-transform group-hover:scale-110 shadow-sm text-xl`}>
                                <FontAwesomeIcon icon={stat.icon} />
                            </div>
                            {stat.trend && (
                                <span className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-lg border border-green-100">
                                    <FontAwesomeIcon icon={faArrowUp} className="mr-1.5" /> {stat.trend}
                                </span>
                            )}
                        </div>
                        <h3 className="text-slate-500 text-[10px] md:text-sm uppercase tracking-[0.2em] font-black mb-2">{stat.label}</h3>
                        <div className="flex items-baseline gap-3">
                            <p className="text-3xl md:text-5xl font-serif text-slate-900 leading-none">{stat.value}</p>
                            {stat.sub && (
                                <span className="text-xs text-slate-500 uppercase font-black tracking-widest bg-slate-100 px-2 py-1 rounded">
                                    {stat.sub}
                                </span>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                {/* Quick Actions */}
                <div className="bg-white p-6 md:p-8 border border-slate-200">
                    <h3 className="font-serif text-xl mb-6 flex items-center gap-3">
                        <FontAwesomeIcon icon={faDiamond} className="text-[10px] text-gold" />
                        Acciones Rápidas
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => window.location.href = '/admin/productos'}
                            className="p-4 md:p-6 border border-slate-100 bg-slate-50 hover:bg-gold hover:text-white transition-all text-left space-y-2 group"
                        >
                            <FontAwesomeIcon icon={faPlus} className="text-gold group-hover:text-white" />
                            <p className="text-xs uppercase tracking-widest font-bold">Nuevo Producto</p>
                        </button>
                        <button
                            onClick={triggerStandardize}
                            disabled={isStandardizing}
                            className="p-4 md:p-6 border border-slate-100 bg-slate-50 hover:bg-gold hover:text-white transition-all text-left space-y-2 group disabled:opacity-50"
                        >
                            <FontAwesomeIcon icon={faMagic} className={`text-gold group-hover:text-white ${isStandardizing ? 'animate-spin' : ''}`} />
                            <p className="text-xs uppercase tracking-widest font-bold">Estandarizar Títulos</p>
                            <p className="text-[8px] opacity-60">Corrige mayúsculas en todo el catálogo</p>
                        </button>
                    </div>
                </div>

                {/* Popular Selection */}
                <div className="bg-white p-6 md:p-8 border border-slate-200">
                    <h3 className="font-serif text-xl mb-6 flex items-center gap-3">
                        <FontAwesomeIcon icon={faTrophy} className="text-gold" />
                        Más Populares (Clicks)
                    </h3>
                    <div className="space-y-4">
                        {topProducts.length === 0 ? (
                            <p className="text-sm text-slate-500 italic">Datos insuficientes...</p>
                        ) : topProducts.map((prod, idx) => (
                            <div key={idx} className="flex items-center gap-4 p-3 bg-slate-50/80 rounded-xl border border-slate-100 shadow-sm transition-all hover:bg-gold/5">
                                <div className="w-8 h-8 rounded-full bg-gold text-white flex items-center justify-center text-xs font-black shadow-sm">
                                    {idx + 1}
                                </div>
                                <img src={prod.main_image} className="w-10 h-10 object-cover rounded-md shadow-sm border border-white" />
                                <div className="flex-grow min-w-0">
                                    <p className="text-xs font-black truncate text-slate-800 uppercase tracking-tight">{prod.name}</p>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Modelo: {prod.model_code}</p>
                                </div>
                                <div className="text-right pl-2">
                                    <p className="text-xl font-black text-gold leading-none">{prod.clicks}</p>
                                    <p className="text-[9px] uppercase font-black text-slate-400 mt-1">Clicks</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Products */}
                <div className="bg-white p-6 md:p-8 border border-slate-200">
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

            {/* WhatsApp Clicks Activity */}
            <div className="bg-white p-6 md:p-8 border border-slate-200">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="font-serif text-xl flex items-center gap-3">
                        <FontAwesomeIcon icon={faWhatsapp} className="text-[#25D366]" />
                        Seguimiento WhatsApp (Tiempo Real)
                    </h3>
                    <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-50 px-3 py-1 border border-slate-100">Últimas Interacciones</span>
                </div>

                <div className="overflow-x-auto overflow-hidden">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-6 py-5 text-[11px] uppercase tracking-[0.2em] font-black text-slate-600">Fecha / Hora</th>
                                <th className="px-6 py-5 text-[11px] uppercase tracking-[0.2em] font-black text-slate-600">Origen / Página</th>
                                <th className="px-6 py-5 text-[11px] uppercase tracking-[0.2em] font-black text-slate-600">Producto Relacionado</th>
                                <th className="px-6 py-5 text-[11px] uppercase tracking-[0.2em] font-black text-slate-600 text-right">Canal</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {recentClicks.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="py-20 text-center text-slate-300 italic font-serif text-lg">
                                        No se han registrado clics recientemente
                                    </td>
                                </tr>
                            ) : recentClicks.map((click, idx) => (
                                <tr key={click.id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="px-6 py-6">
                                        <p className="text-sm font-black text-slate-800">{new Date(click.created_at).toLocaleDateString()}</p>
                                        <p className="text-xs text-slate-500 font-bold">{new Date(click.created_at).toLocaleTimeString()}</p>
                                    </td>
                                    <td className="px-6 py-6">
                                        <div className="max-w-xs truncate text-xs text-slate-600 font-bold bg-slate-100 px-3 py-1.5 border border-slate-200 rounded">
                                            {click.page_url.replace(window.location.origin, '') || '/'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-6">
                                        {click.products ? (
                                            <div className="flex items-center gap-4">
                                                <img src={click.products.main_image} className="w-10 h-12 object-cover rounded-lg shadow-sm border-2 border-white" />
                                                <div>
                                                    <p className="text-sm font-black text-slate-800 leading-tight uppercase tracking-tight">{click.products.name}</p>
                                                    <p className="text-[10px] text-gold uppercase font-black tracking-widest mt-1">Mod: {click.products.model_code}</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-slate-500 uppercase font-black tracking-widest bg-slate-50 px-3 py-1.5 rounded border border-slate-100 italic">Interés General</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-6 text-right">
                                        <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center ml-auto border border-green-200 shadow-sm transition-transform group-hover:scale-110">
                                            <FontAwesomeIcon icon={faWhatsapp} className="text-sm" />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                title={confirmModal.title}
                message={confirmModal.message}
                onConfirm={confirmModal.onConfirm}
                onCancel={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                confirmLabel="Confirmar Acción"
                variant="info"
            />
        </div>
    );
};

// --- (optimizeImage removed, imported from lib) ---

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

    const handleDelete = async () => {
        if (!confirmDelete.id) return;
        try {
            await productService.deleteProduct(confirmDelete.id);
            toast.success('Producto eliminado definitivamente');
            refresh();
            setConfirmDelete({ isOpen: false, id: null });
        } catch (error) {
            toast.error('Error al eliminar el producto');
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
        <div className="space-y-6 md:space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 md:p-6 border border-slate-200 gap-4">
                <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Total: {products.length} productos / Auditoría: Activa</p>
                <button
                    onClick={() => {
                        setEditingProduct({
                            name: '', slug: '', description: '', price: 0,
                            category_id: categories[0]?.id, images: [], gallery: [],
                            stock: 10, is_active: true
                        });
                        setIsModalOpen(true);
                        setIsSlugCustomized(false);
                        setErrors({});
                    }}
                    className="w-full sm:w-auto bg-gold text-chocolate px-6 py-3 text-[10px] uppercase tracking-widest font-bold hover:bg-chocolate hover:text-white transition-all shadow-lg text-center"
                >
                    + Nuevo Producto
                </button>
            </div>

            <div className="bg-white border border-slate-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 md:px-8 py-4 text-[10px] uppercase tracking-widest font-bold text-slate-400">Preview</th>
                                <th className="px-4 md:px-8 py-4 text-[10px] uppercase tracking-widest font-bold text-slate-400">Información</th>
                                <th className="hidden md:table-cell px-8 py-4 text-[10px] uppercase tracking-widest font-bold text-slate-400">Categoría</th>
                                <th className="px-4 md:px-8 py-4 text-[10px] uppercase tracking-widest font-bold text-slate-400 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(prod => (
                                <tr key={prod.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-4 md:px-8 py-4">
                                        <img src={prod.main_image} className="w-10 h-14 md:w-12 md:h-16 object-cover border border-slate-200 group-hover:scale-105 transition-transform" />
                                    </td>
                                    <td className="px-4 md:px-8 py-4">
                                        <div className="space-y-1">
                                            <p className="text-xs md:text-sm font-serif truncate max-w-[120px] md:max-w-none">{prod.name}</p>
                                            <div className="flex flex-wrap gap-1 md:gap-2">
                                                <span className="text-[8px] md:text-[9px] text-slate-400 border border-slate-100 px-1">{prod.model_code || 'S/M'}</span>
                                                <span className="md:hidden text-[8px] text-gold font-bold">{(prod as any).categories?.name}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="hidden md:table-cell px-8 py-4 text-xs">{(prod as any).categories?.name}</td>
                                    <td className="px-4 md:px-8 py-4">
                                        <div className="flex justify-end gap-2 md:gap-3">
                                            <button onClick={() => handleEdit(prod)} className="p-2 border border-slate-100 hover:bg-gold hover:text-white transition-all rounded shadow-sm">
                                                <FontAwesomeIcon icon={faEdit} className="text-[10px] md:text-xs" />
                                            </button>
                                            <button onClick={() => setConfirmDelete({ isOpen: true, id: prod.id })} className="p-2 border border-slate-100 hover:bg-red-500 hover:text-white transition-all rounded shadow-sm">
                                                <FontAwesomeIcon icon={faTrash} className="text-[10px] md:text-xs" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
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
                                                <div key={idx} className="relative aspect-square bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden">
                                                    {url ? (
                                                        <img src={url} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <label className="cursor-pointer flex items-center justify-center w-full h-full"><FontAwesomeIcon icon={faPlus} className="text-slate-200" /><input type="file" className="hidden" onChange={e => handleFileUpload(e, 'gallery', idx)} /></label>
                                                    )}
                                                    {url && <button onClick={() => { const g = [...(editingProduct.gallery || [])]; g[idx] = ''; setEditingProduct({ ...editingProduct, gallery: g }); }} className="absolute top-1 right-1 bg-white/80 w-5 h-5 flex items-center justify-center text-[10px] rounded-full text-red-500 shadow-sm"><FontAwesomeIcon icon={faTimes} /></button>}
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
                title="Eliminar Producto"
                message="¿Estás seguro de que quieres eliminar este producto? Esta acción es irreversible."
            />
        </div>
    );
};

// --- Categories Manager Component ---
const CategoriesManager: React.FC<{
    categories: Category[],
    refresh: () => void
}> = ({ categories, refresh }) => {
    const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSlugCustomized, setIsSlugCustomized] = useState(false);
    const [mediaSelector, setMediaSelector] = useState<{ isOpen: boolean, field: 'image' }>({
        isOpen: false,
        field: 'image'
    });
    const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean, id: string | null }>({
        isOpen: false,
        id: null
    });


    const handleEdit = (category: Category) => {
        setEditingCategory({ ...category });
        setIsModalOpen(true);
        setIsSlugCustomized(true);
    };

    const handleDelete = async () => {
        if (!confirmDelete.id) return;
        try {
            await productService.deleteCategory(confirmDelete.id);
            toast.success('Categoría eliminada');
            refresh();
            setConfirmDelete({ isOpen: false, id: null });
        } catch (error: any) {
            toast.error(error.message || 'Error al eliminar');
        }
    };

    const handleSave = async () => {
        if (!editingCategory?.name || !editingCategory?.slug) {
            toast.error('Nombre y Slug son obligatorios');
            return;
        }

        try {
            await productService.upsertCategory(editingCategory);
            toast.success('Categoría guardada');
            setIsModalOpen(false);
            refresh();
        } catch (error) {
            toast.error('Error al guardar');
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center bg-white p-6 border border-slate-200">
                <h2 className="text-xl font-serif">Gestión de Categorías</h2>
                <button
                    onClick={() => {
                        setEditingCategory({ name: '', slug: '', description: '', image_url: '' });
                        setIsModalOpen(true);
                        setIsSlugCustomized(false);
                    }}
                    className="bg-gold text-chocolate px-6 py-3 text-[10px] uppercase tracking-widest font-bold hover:bg-chocolate hover:text-white transition-all shadow-lg"
                >
                    + Nueva Categoría
                </button>
            </div>

            <div className="bg-white border border-slate-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                            <th className="px-8 py-4 text-[10px] uppercase tracking-widest font-bold text-slate-400">Imagen</th>
                            <th className="px-8 py-4 text-[10px] uppercase tracking-widest font-bold text-slate-400">Nombre / URL</th>
                            <th className="px-8 py-4 text-[10px] uppercase tracking-widest font-bold text-slate-400">Descripción</th>
                            <th className="px-8 py-4 text-[10px] uppercase tracking-widest font-bold text-slate-400 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {categories.map(cat => {
                            const parent = categories.find(c => c.id === cat.parent_id);
                            return (
                                <tr key={cat.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-8 py-4">
                                        <div className="w-12 h-12 bg-slate-100 flex items-center justify-center overflow-hidden rounded border border-slate-200">
                                            {cat.image_url ? (
                                                <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <FontAwesomeIcon icon={faImages} className="text-slate-300 text-xs" />
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-8 py-4">
                                        <div className="flex items-center gap-2">
                                            {cat.parent_id && <span className="text-slate-300">└</span>}
                                            <p className={`text-sm font-serif font-bold ${cat.parent_id ? 'text-slate-500' : 'text-slate-800'}`}>
                                                {cat.name}
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
                                    <td className="px-8 py-4">
                                        <p className="text-xs text-slate-400 line-clamp-1 italic">{cat.description || 'Sin descripción'}</p>
                                    </td>
                                    <td className="px-8 py-4">
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

            <AnimatePresence>
                {isModalOpen && editingCategory && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="relative bg-white w-full max-w-2xl shadow-2xl border border-gold/20 flex flex-col">
                            <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                                <h2 className="text-2xl font-serif">Editar Categoría</h2>
                                <button onClick={() => setIsModalOpen(false)} className="text-slate-300 hover:text-chocolate transition-colors"><FontAwesomeIcon icon={faTimes} className="text-xl" /></button>
                            </div>

                            <div className="p-10 space-y-8">
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
                                            <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Jerarquía (¿Es Subcategoría?)</label>
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

                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Descripción Corta</label>
                                        <textarea
                                            value={editingCategory.description || ''}
                                            onChange={e => setEditingCategory({ ...editingCategory, description: e.target.value })}
                                            className="w-full p-4 border border-slate-100 focus:border-gold outline-none text-sm"
                                            rows={2}
                                            placeholder="Una breve descripción para la página de catálogo..."
                                        />
                                    </div>

                                    {!editingCategory.parent_id && (
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Imagen Representativa (Solo Padres)</label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={editingCategory.image_url || ''}
                                                    onChange={e => setEditingCategory({ ...editingCategory, image_url: e.target.value })}
                                                    className="flex-grow p-4 border border-slate-100 focus:border-gold outline-none text-sm"
                                                    placeholder="Selecciona desde la galería"
                                                />
                                                <button onClick={() => setMediaSelector({ isOpen: true, field: 'image' })} className="px-6 py-4 border border-slate-200 hover:bg-slate-50 text-gold transition-all">
                                                    <FontAwesomeIcon icon={faImages} />
                                                </button>
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
                    setEditingCategory(prev => ({ ...prev, image_url: url }));
                    toast.success('Imagen seleccionada');
                }}
            />

            <ConfirmModal
                isOpen={confirmDelete.isOpen}
                title="Eliminar Categoría"
                message="¿Estás seguro de que deseas eliminar esta categoría? Si tiene productos asociados, la acción será bloqueada por seguridad."
                confirmLabel="Eliminar Definitivamente"
                onConfirm={handleDelete}
                onCancel={() => setConfirmDelete({ isOpen: false, id: null })}
                variant="danger"
            />
        </div>
    );
};

// --- Hero Manager Component ---
const HeroManager: React.FC = () => {
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
            toast.error(`Error al subir imagen: ${error?.message ?? 'Verifica permisos del bucket en Supabase'}`);
        } finally {
            setIsUploading(false);
            // reset el input para poder volver a subir el mismo archivo
            e.target.value = '';
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
                                        {/* Fallback: pegar URL directamente */}
                                        <input
                                            type="url"
                                            placeholder="O pega aquí la URL de la imagen (https://...)..."
                                            value={editingSlide.bg_url || ''}
                                            onChange={e => setEditingSlide({ ...editingSlide, bg_url: e.target.value })}
                                            className="w-full p-3 border border-slate-100 outline-none text-xs text-slate-500 font-mono"
                                        />
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
                                        {/* Fallback: URL manual */}
                                        <input
                                            type="url"
                                            placeholder="O pega aquí la URL..."
                                            value={editingSlide.bg_mobile_url || ''}
                                            onChange={e => setEditingSlide({ ...editingSlide, bg_mobile_url: e.target.value })}
                                            className="w-full p-3 border border-slate-100 outline-none text-xs text-slate-500 font-mono"
                                        />
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
        catalog_pdf_url: '',
        maintenance_mode: false,
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'identity' | 'contact' | 'about' | 'marketing'>('identity');
    const [mediaSelector, setMediaSelector] = useState<{ isOpen: boolean, field: 'logo_light' | 'logo_dark' | 'pdf' | 'about' }>({
        isOpen: false,
        field: 'logo_light'
    });

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
                        cta_banner_bg_color: data.cta_banner_bg_color || '#1B1411',
                        cta_banner_bg_image_url: data.cta_banner_bg_image_url || '',
                        cta_banner_bg_opacity: data.cta_banner_bg_opacity ?? 0.85,
                        catalog_pdf_url: data.catalog_pdf_url || '',
                        maintenance_mode: data.maintenance_mode ?? false,
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

    const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setSaving(true);
            const url = await productService.uploadFile(file, 'catalog', 'files');
            setConfig(prev => ({ ...prev, catalog_pdf_url: url }));
            toast.success('Catálogo PDF actualizado');
        } catch (error: any) {
            console.error('PDF Upload Error:', error);
            toast.error(error.message || 'Error al subir el catálogo');
        } finally {
            setSaving(false);
        }
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'light' | 'dark' | 'favicon') => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            setSaving(true);
            const url = await productService.uploadImage(file, 'branding');
            if (type === 'light') setConfig(prev => ({ ...prev, logo_light_url: url }));
            else if (type === 'dark') setConfig(prev => ({ ...prev, logo_dark_url: url }));
            else if (type === 'favicon') setConfig(prev => ({ ...prev, favicon_url: url }));
            toast.success(type === 'favicon' ? 'Favicon cargado' : 'Logo cargado correctamente');
        } catch (error: any) {
            toast.error(error.message || 'Error al subir el archivo');
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
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full space-y-8"
        >
            <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
                {/* Sidebar Navigation - Responsive scroll on mobile */}
                <div className="lg:w-1/4">
                    <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible no-scrollbar pb-2 lg:pb-0">
                        {[
                            { id: 'identity', label: 'Identidad Visual', icon: faDiamond },
                            { id: 'contact', label: 'Contacto & Redes', icon: faPhone },
                            { id: 'about', label: 'Sección Nosotros', icon: faUsers },
                            { id: 'marketing', label: 'Marketing & PDF', icon: faChartBar },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex-shrink-0 lg:w-full flex items-center gap-3 p-3 md:p-4 text-[9px] md:text-[10px] uppercase tracking-widest font-bold transition-all border ${activeTab === tab.id
                                    ? 'bg-chocolate text-white border-chocolate shadow-md'
                                    : 'bg-white text-slate-400 border-slate-100 hover:border-gold/50 text-left cursor-pointer'
                                    }`}
                            >
                                <FontAwesomeIcon icon={tab.icon} className={activeTab === tab.id ? 'text-gold' : 'text-slate-300'} />
                                <span className="whitespace-nowrap">{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content Area */}
                <div className="lg:w-3/4 bg-white p-6 md:p-8 lg:p-12 border border-slate-200 shadow-sm min-h-[400px] lg:min-h-[600px]">
                    <div className="mb-10 border-b border-slate-50 pb-6 flex justify-between items-end">
                        <div>
                            <h2 className="text-2xl font-serif text-slate-800">
                                {activeTab === 'identity' && 'Identidad de Marca'}
                                {activeTab === 'contact' && 'Canales de Comunicación'}
                                {activeTab === 'about' && 'Contenido "Nosotros"'}
                                {activeTab === 'marketing' && 'Estrategia & Catálogo'}
                            </h2>
                            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mt-1">
                                {activeTab === 'identity' && 'Logos, colores y esencia visual del sitio'}
                                {activeTab === 'contact' && 'Atención al cliente, redes sociales y ubicación'}
                                {activeTab === 'about' && 'Personaliza la historia y estadísticas de tu empresa'}
                                {activeTab === 'marketing' && 'Configura el catálogo descargable y banners promocionales'}
                            </p>
                        </div>
                        <button
                            type="submit"
                            form="config-form"
                            disabled={saving}
                            className="bg-gold text-chocolate px-6 py-3 text-[10px] uppercase tracking-widest font-bold hover:bg-chocolate hover:text-white transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {saving ? <FontAwesomeIcon icon={faCog} className="animate-spin" /> : <FontAwesomeIcon icon={faSave} />}
                            <span>Guardar</span>
                        </button>
                    </div>

                    <form id="config-form" onSubmit={handleSave} className="space-y-12">
                        {activeTab === 'identity' && (
                            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {/* Maintenance Mode Toggle */}
                                <div className="p-6 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
                                    <div className="space-y-1">
                                        <h3 className="text-[10px] uppercase tracking-widest font-bold text-chocolate">Estado del Sitio Público</h3>
                                        <p className="text-xs text-slate-400">Si activas el modo mantenimiento, los visitantes verán la página "Próximamente".</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setConfig({ ...config, maintenance_mode: !config.maintenance_mode })}
                                        className={`px-6 py-2 text-[10px] font-bold uppercase tracking-widest transition-all border ${config.maintenance_mode
                                            ? 'bg-amber-100 text-amber-600 border-amber-200'
                                            : 'bg-emerald-100 text-emerald-600 border-emerald-200'
                                            }`}
                                    >
                                        {config.maintenance_mode ? 'Modo Mantenimiento ON' : 'Sitio Público ON'}
                                    </button>
                                </div>

                                {/* Logos */}
                                <div className="space-y-8">
                                    <h3 className="text-[10px] uppercase tracking-widest font-bold text-gold flex items-center gap-2">
                                        <div className="w-1 h-1 rounded-full bg-gold" /> Paleta de Colores
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Color Primario</label>
                                            <div className="flex gap-2">
                                                <input type="color" value={config.primary_color} onChange={e => setConfig({ ...config, primary_color: e.target.value })} className="h-12 w-12 border border-slate-200 cursor-pointer" />
                                                <input type="text" value={config.primary_color} onChange={e => setConfig({ ...config, primary_color: e.target.value })} className="flex-grow p-4 border border-slate-100 outline-none text-xs font-mono" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Color Secundario</label>
                                            <div className="flex gap-2">
                                                <input type="color" value={config.secondary_color} onChange={e => setConfig({ ...config, secondary_color: e.target.value })} className="h-12 w-12 border border-slate-200 cursor-pointer" />
                                                <input type="text" value={config.secondary_color} onChange={e => setConfig({ ...config, secondary_color: e.target.value })} className="flex-grow p-4 border border-slate-100 outline-none text-xs font-mono" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Color de Acento</label>
                                            <div className="flex gap-2">
                                                <input type="color" value={config.accent_color} onChange={e => setConfig({ ...config, accent_color: e.target.value })} className="h-12 w-12 border border-slate-200 cursor-pointer" />
                                                <input type="text" value={config.accent_color} onChange={e => setConfig({ ...config, accent_color: e.target.value })} className="flex-grow p-4 border border-slate-100 outline-none text-xs font-mono" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                                        <div className="space-y-4">
                                            <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Logo (Modo Claro)</label>
                                            <div className="aspect-video bg-slate-50 border-2 border-dashed border-slate-100 relative group overflow-hidden flex items-center justify-center">
                                                {config.logo_light_url ? (
                                                    <>
                                                        <img src={config.logo_light_url} className="max-h-full object-contain p-4" />
                                                        <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white text-[10px] font-bold uppercase tracking-widest">Cambiar<input type="file" className="hidden" accept="image/*" onChange={e => handleLogoUpload(e, 'light')} /></label>
                                                    </>
                                                ) : (
                                                    <label className="cursor-pointer flex flex-col items-center gap-2 p-4 text-center">
                                                        <FontAwesomeIcon icon={faImage} className="text-3xl text-slate-200" />
                                                        <span className="text-[9px] uppercase font-bold text-slate-300">Subir Logo</span>
                                                        <input type="file" className="hidden" accept="image/*" onChange={e => handleLogoUpload(e, 'light')} />
                                                    </label>
                                                )}
                                            </div>
                                            <button type="button" onClick={() => setMediaSelector({ isOpen: true, field: 'logo_light' })} className="w-full py-2 border border-slate-100 text-[9px] uppercase font-bold tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                                                <FontAwesomeIcon icon={faImages} className="text-gold" /> Galería de Medios
                                            </button>
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Logo (Modo Oscuro)</label>
                                            <div className="aspect-video bg-chocolate border-2 border-dashed border-white/10 relative group overflow-hidden flex items-center justify-center">
                                                {config.logo_dark_url ? (
                                                    <>
                                                        <img src={config.logo_dark_url} className="max-h-full object-contain p-4" />
                                                        <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white text-[10px] font-bold uppercase tracking-widest">Cambiar<input type="file" className="hidden" accept="image/*" onChange={e => handleLogoUpload(e, 'dark')} /></label>
                                                    </>
                                                ) : (
                                                    <label className="cursor-pointer flex flex-col items-center gap-2 p-4 text-center">
                                                        <FontAwesomeIcon icon={faImage} className="text-3xl text-white/20" />
                                                        <span className="text-[9px] uppercase font-bold text-white/30">Subir Logo</span>
                                                        <input type="file" className="hidden" accept="image/*" onChange={e => handleLogoUpload(e, 'dark')} />
                                                    </label>
                                                )}
                                            </div>
                                            <button type="button" onClick={() => setMediaSelector({ isOpen: true, field: 'logo_dark' })} className="w-full py-2 border border-slate-100 text-[9px] uppercase font-bold tracking-widest hover:bg-chocolate hover:text-white transition-all flex items-center justify-center gap-2">
                                                <FontAwesomeIcon icon={faImages} className="text-gold" /> Galería de Medios
                                            </button>
                                        </div>
                                    </div>

                                    {/* Favicon Section */}
                                    <div className="pt-8 border-t border-slate-50">
                                        <div className="space-y-4 max-w-sm">
                                            <div className="space-y-1">
                                                <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Favicon (Icono de Pestaña)</label>
                                                <p className="text-[9px] text-slate-400 lowercase italic">Se recomienda un archivo .png o .ico cuadrado (32x32 o 64x64px)</p>
                                            </div>
                                            <div className="flex items-center gap-6">
                                                <div className="w-16 h-16 bg-white border border-slate-100 rounded shadow-sm flex items-center justify-center overflow-hidden">
                                                    {config.favicon_url ? (
                                                        <img src={config.favicon_url} className="w-10 h-10 object-contain" />
                                                    ) : (
                                                        <FontAwesomeIcon icon={faGlobe} className="text-2xl text-slate-100" />
                                                    )}
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    <label className="cursor-pointer bg-slate-50 text-slate-600 px-4 py-2 text-[9px] font-bold uppercase tracking-widest border border-slate-100 hover:border-gold transition-all text-center">
                                                        Subir Nuevo
                                                        <input type="file" className="hidden" accept="image/png,image/x-icon,image/jpeg" onChange={e => handleLogoUpload(e, 'favicon')} />
                                                    </label>
                                                    <button type="button" onClick={() => setMediaSelector({ isOpen: true, field: 'favicon' })} className="px-4 py-2 border border-slate-100 text-[9px] uppercase font-bold tracking-widest text-slate-400 hover:text-gold transition-all">
                                                        Usar Galería
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-6">
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
                            </div>
                        )}

                        {activeTab === 'contact' && (
                            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {/* Contact Info */}
                                <div className="space-y-6">
                                    <h3 className="text-[10px] uppercase tracking-widest font-bold text-gold flex items-center gap-2">
                                        <div className="w-1 h-1 rounded-full bg-gold" /> Canales Directos
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">WhatsApp</label>
                                            <div className="relative">
                                                <FontAwesomeIcon icon={faWhatsapp} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                                <input type="text" value={config.whatsapp} onChange={e => setConfig({ ...config, whatsapp: e.target.value })} className="w-full p-4 pl-12 border border-slate-100 focus:border-gold outline-none text-sm" placeholder="Ej. 523521681197" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Teléfono Oficina</label>
                                            <div className="relative">
                                                <FontAwesomeIcon icon={faPhone} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                                <input type="text" value={config.phone} onChange={e => setConfig({ ...config, phone: e.target.value })} className="w-full p-4 pl-12 border border-slate-100 focus:border-gold outline-none text-sm" placeholder="Ej. 352 52 62502" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Correo Electrónico</label>
                                            <div className="relative">
                                                <FontAwesomeIcon icon={faEnvelope} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                                <input type="email" value={config.email} onChange={e => setConfig({ ...config, email: e.target.value })} className="w-full p-4 pl-12 border border-slate-100 focus:border-gold outline-none text-sm" placeholder="info@empresa.com" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Horarios de Atención</label>
                                            <input type="text" value={config.office_hours || ''} onChange={e => setConfig({ ...config, office_hours: e.target.value })} className="w-full p-4 border border-slate-100 focus:border-gold outline-none text-sm" placeholder="Lunes a Viernes 9:00 - 18:00" />
                                        </div>
                                    </div>
                                </div>

                                {/* Social & Maps */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                    <div className="space-y-6">
                                        <h3 className="text-[10px] uppercase tracking-widest font-bold text-gold flex items-center gap-2">
                                            <div className="w-1 h-1 rounded-full bg-gold" /> Redes Sociales
                                        </h3>
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Facebook URL</label>
                                                <div className="relative">
                                                    <FontAwesomeIcon icon={faFacebook} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                                    <input type="text" value={config.facebook_url} onChange={e => setConfig({ ...config, facebook_url: e.target.value })} className="w-full p-4 pl-12 border border-slate-100 focus:border-gold outline-none text-sm" placeholder="https://facebook.com/..." />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Instagram URL</label>
                                                <div className="relative">
                                                    <FontAwesomeIcon icon={faInstagram} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                                    <input type="text" value={config.instagram_url} onChange={e => setConfig({ ...config, instagram_url: e.target.value })} className="w-full p-4 pl-12 border border-slate-100 focus:border-gold outline-none text-sm" placeholder="https://instagram.com/..." />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <h3 className="text-[10px] uppercase tracking-widest font-bold text-gold flex items-center gap-2">
                                            <div className="w-1 h-1 rounded-full bg-gold" /> Ubicación Física
                                        </h3>
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Dirección Completa</label>
                                                <textarea value={config.address} onChange={e => setConfig({ ...config, address: e.target.value })} rows={2} className="w-full p-4 border border-slate-100 focus:border-gold outline-none text-sm" placeholder="Calle, Número, Colonia..." />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Google Maps URL</label>
                                                <input type="text" value={config.google_maps_url} onChange={e => setConfig({ ...config, google_maps_url: e.target.value })} className="w-full p-4 border border-slate-100 focus:border-gold outline-none text-sm" placeholder="https://goo.gl/maps/..." />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'about' && (
                            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {/* Nosotros */}
                                <div className="space-y-6">
                                    <h3 className="text-[10px] uppercase tracking-widest font-bold text-gold flex items-center gap-2">
                                        <div className="w-1 h-1 rounded-full bg-gold" /> Historia y Narrativa
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Subtítulo Descriptivo</label>
                                            <input type="text" value={config.about_subtitle || ''} onChange={e => setConfig({ ...config, about_subtitle: e.target.value })} className="w-full p-4 border border-slate-100 focus:border-gold outline-none text-sm" placeholder="Ej: Nuestra Historia" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Título Principal</label>
                                            <input type="text" value={config.about_title || ''} onChange={e => setConfig({ ...config, about_title: e.target.value })} className="w-full p-4 border border-slate-100 focus:border-gold outline-none text-sm" placeholder="Ej: Más de 30 años de tradición" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Frase Destacada (Cita)</label>
                                        <textarea rows={2} value={config.about_quote || ''} onChange={e => setConfig({ ...config, about_quote: e.target.value })} className="w-full p-4 border border-slate-100 focus:border-gold outline-none text-sm font-serif italic" placeholder="Nuestra misión es..." />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {[1, 2, 3].map(n => (
                                            <div key={n} className="space-y-2">
                                                <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Párrafo {n}</label>
                                                <textarea rows={6} value={(config as any)[`about_body_${n}`] || ''} onChange={e => setConfig({ ...config, [`about_body_${n}`]: e.target.value })} className="w-full p-4 border border-slate-100 focus:border-gold outline-none text-xs leading-relaxed text-slate-500" />
                                            </div>
                                        ))}
                                    </div>

                                    <div className="pt-6">
                                        <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-2 block">Cifras Relevantes (Estadísticas)</label>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {([1, 2, 3, 4] as const).map(n => (
                                                <div key={n} className="space-y-2 p-4 border border-slate-50 bg-slate-50/50">
                                                    <input type="text" value={(config as any)[`about_stat_${n}_value`] || ''} onChange={e => setConfig({ ...config, [`about_stat_${n}_value`]: e.target.value })} className="w-full p-2 bg-transparent border-b border-gold/10 focus:border-gold outline-none text-sm font-serif text-gold text-center" placeholder="30+" />
                                                    <input type="text" value={(config as any)[`about_stat_${n}_label`] || ''} onChange={e => setConfig({ ...config, [`about_stat_${n}_label`]: e.target.value })} className="w-full p-2 bg-transparent border-none outline-none text-[8px] uppercase tracking-wider font-bold text-slate-400 text-center" placeholder="Años Experiencia" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-4 pt-6">
                                        <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Imagen de Portada "Nosotros"</label>
                                        <div className="flex gap-2">
                                            <input type="text" value={config.about_image_url || ''} onChange={e => setConfig({ ...config, about_image_url: e.target.value })} className="flex-grow p-4 border border-slate-100 focus:border-gold outline-none text-xs" placeholder="URL de la imagen..." />
                                            <button type="button" onClick={() => setMediaSelector({ isOpen: true, field: 'about' })} className="px-6 bg-slate-50 hover:bg-gold hover:text-white transition-all text-gold flex items-center justify-center">
                                                <FontAwesomeIcon icon={faImages} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'marketing' && (
                            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {/* Banner CTA */}
                                <div className="space-y-6">
                                    <h3 className="text-[10px] uppercase tracking-widest font-bold text-gold flex items-center gap-2">
                                        <div className="w-1 h-1 rounded-full bg-gold" /> Banner — Venta al por Mayor
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Etiqueta Superior</label>
                                            <input type="text" value={config.cta_banner_tag || ''} onChange={e => setConfig({ ...config, cta_banner_tag: e.target.value })} className="w-full p-4 border border-slate-100 focus:border-gold outline-none text-sm" placeholder="Socios Comerciales" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Título Principal</label>
                                            <input type="text" value={config.cta_banner_title || ''} onChange={e => setConfig({ ...config, cta_banner_title: e.target.value })} className="w-full p-4 border border-slate-100 focus:border-gold outline-none text-sm" placeholder="Venta al por mayor" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Destaque (Dorado)</label>
                                            <input type="text" value={config.cta_banner_subtitle || ''} onChange={e => setConfig({ ...config, cta_banner_subtitle: e.target.value })} className="w-full p-4 border border-slate-100 focus:border-gold outline-none text-sm" placeholder="& Boutiques" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Cuerpo del Mensaje</label>
                                        <textarea rows={3} value={config.cta_banner_body || ''} onChange={e => setConfig({ ...config, cta_banner_body: e.target.value })} className="w-full p-4 border border-slate-100 focus:border-gold outline-none text-sm" />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Botón Primario (WhatsApp)</label>
                                            <input type="text" value={config.cta_banner_btn1_label || ''} onChange={e => setConfig({ ...config, cta_banner_btn1_label: e.target.value })} className="w-full p-4 border border-slate-100 focus:border-gold outline-none text-sm" placeholder="Consultar Mayoreo" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Botón Secundario (Teléfono)</label>
                                            <input type="text" value={config.cta_banner_btn2_label || ''} onChange={e => setConfig({ ...config, cta_banner_btn2_label: e.target.value })} className="w-full p-4 border border-slate-100 focus:border-gold outline-none text-sm" placeholder="Llamar hoy" />
                                        </div>
                                    </div>
                                    {/* Visual Customization */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 bg-slate-50 border border-slate-100 rounded-xl">
                                        <div className="space-y-4">
                                            <h4 className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Personalización Visual</h4>
                                            <div className="flex items-center gap-6">
                                                <div className="space-y-2 flex-grow">
                                                    <label className="text-[10px] font-bold text-slate-500">Color de Fondo</label>
                                                    <div className="flex gap-3">
                                                        <input type="color" value={config.cta_banner_bg_color || '#1B1411'} onChange={e => setConfig({ ...config, cta_banner_bg_color: e.target.value })} className="w-12 h-12 rounded cursor-pointer border-none bg-transparent" />
                                                        <input type="text" value={config.cta_banner_bg_color || '#1B1411'} onChange={e => setConfig({ ...config, cta_banner_bg_color: e.target.value })} className="flex-grow p-3 border border-slate-200 text-xs outline-none focus:border-gold" />
                                                    </div>
                                                </div>
                                                <div className="space-y-2 w-32">
                                                    <label className="text-[10px] font-bold text-slate-500">Opacidad ({Math.round((config.cta_banner_bg_opacity ?? 0.85) * 100)}%)</label>
                                                    <input
                                                        type="range"
                                                        min="0"
                                                        max="1"
                                                        step="0.05"
                                                        value={config.cta_banner_bg_opacity ?? 0.85}
                                                        onChange={e => setConfig({ ...config, cta_banner_bg_opacity: parseFloat(e.target.value) })}
                                                        className="w-full accent-gold"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <h4 className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Imagen de Fondo</h4>
                                            <div className="flex items-center gap-4">
                                                <div className="w-16 h-16 bg-white border border-slate-200 rounded flex items-center justify-center overflow-hidden">
                                                    {config.cta_banner_bg_image_url ? (
                                                        <img src={config.cta_banner_bg_image_url} alt="CTA Bg" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <FontAwesomeIcon icon={faImage} className="text-slate-200 text-xl" />
                                                    )}
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setMediaSelector({ isOpen: true, field: 'cta_bg' })}
                                                    className="px-4 py-2 bg-white border border-slate-200 text-[10px] font-bold uppercase tracking-widest hover:border-gold hover:text-gold transition-all"
                                                >
                                                    Seleccionar Imagen
                                                </button>
                                                {config.cta_banner_bg_image_url && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setConfig({ ...config, cta_banner_bg_image_url: '' })}
                                                        className="text-red-400 hover:text-red-600 text-[10px] font-bold uppercase tracking-widest"
                                                    >
                                                        Quitar
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Catálogo PDF */}
                                <div className="space-y-6 pt-6 border-t border-slate-100">
                                    <h3 className="text-[10px] uppercase tracking-widest font-bold text-gold flex items-center gap-2">
                                        <div className="w-1 h-1 rounded-full bg-gold" /> Catálogo Digital (PDF)
                                    </h3>
                                    <div className="p-8 bg-slate-50 border border-slate-100 flex flex-col md:flex-row items-center gap-8">
                                        <div className={`w-20 h-20 ${config.catalog_pdf_url ? 'bg-white text-red-500 shadow-sm' : 'bg-slate-200 text-slate-400'} flex items-center justify-center rounded-xl text-3xl transition-all border border-slate-100`}>
                                            <FontAwesomeIcon icon={faFilePdf} />
                                        </div>
                                        <div className="flex-grow text-center md:text-left">
                                            <h4 className="text-sm font-serif mb-1">Archivo de Catálogo General</h4>
                                            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-4">
                                                {config.catalog_pdf_url ? 'Archivo listo para descarga' : 'No se ha subido ningún catálogo'}
                                            </p>
                                            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                                                <label className="cursor-pointer bg-chocolate text-white px-6 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-gold hover:text-chocolate transition-all flex items-center gap-2">
                                                    <FontAwesomeIcon icon={faFileUpload} />
                                                    {config.catalog_pdf_url ? 'Reemplazar PDF' : 'Subir Catálogo PDF'}
                                                    <input type="file" className="hidden" accept="application/pdf" onChange={handlePdfUpload} />
                                                </label>
                                                {config.catalog_pdf_url && (
                                                    <a href={config.catalog_pdf_url} target="_blank" rel="noopener noreferrer" className="bg-white text-slate-400 border border-slate-200 px-6 py-3 text-[10px] font-bold uppercase tracking-widest hover:border-gold hover:text-gold transition-all flex items-center gap-2">
                                                        <FontAwesomeIcon icon={faEye} />
                                                        Ver Actual
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </form>
                </div>
            </div>

            <MediaSelectorModal
                isOpen={mediaSelector.isOpen}
                onClose={() => setMediaSelector({ ...mediaSelector, isOpen: false })}
                onSelect={(url) => {
                    const field = mediaSelector.field;
                    if (field === 'logo_light') setConfig(prev => ({ ...prev, logo_light_url: url }));
                    else if (field === 'logo_dark') setConfig(prev => ({ ...prev, logo_dark_url: url }));
                    else if (field === 'favicon') setConfig(prev => ({ ...prev, favicon_url: url }));
                    else if (field === 'about') setConfig(prev => ({ ...prev, about_image_url: url }));
                    else if (field === 'cta_bg') setConfig(prev => ({ ...prev, cta_banner_bg_image_url: url }));
                    else if (field === 'pdf') setConfig(prev => ({ ...prev, catalog_pdf_url: url }));
                    toast.success('Cambio aplicado');
                }}
            />
        </motion.div >
    );
};

// --- Messages Manager Component ---
const MessagesManager: React.FC = () => {
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

    const fetchMessages = async () => {
        try {
            setLoading(true);
            const data = await contactService.getMessages();
            setMessages(data);
        } catch (error) {
            console.error(error);
            toast.error('Error al cargar mensajes');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    const handleMarkAsRead = async (id: string) => {
        try {
            await contactService.markAsRead(id);
            setMessages(prev => prev.map(m => m.id === id ? { ...m, is_read: true } : m));
            if (selectedMessage?.id === id) {
                setSelectedMessage({ ...selectedMessage, is_read: true });
            }
        } catch (error) {
            toast.error('Error al actualizar mensaje');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Seguro que deseas eliminar este mensaje?')) return;
        try {
            await contactService.deleteMessage(id);
            setMessages(prev => prev.filter(m => m.id !== id));
            if (selectedMessage?.id === id) setSelectedMessage(null);
            toast.success('Mensaje eliminado');
        } catch (error) {
            toast.error('Error al eliminar mensaje');
        }
    };

    if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" /></div>;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Inbox List */}
            <div className="lg:col-span-5 bg-white border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[700px]">
                <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                    <h2 className="text-xs uppercase tracking-widest font-bold text-slate-500">Bandeja de Entrada</h2>
                    <span className="bg-gold/10 text-gold text-[10px] px-2 py-1 rounded font-bold">
                        {messages.filter(m => !m.is_read).length} nuevos
                    </span>
                </div>
                <div className="flex-grow overflow-y-auto">
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-slate-300 space-y-4">
                            <FontAwesomeIcon icon={faInbox} className="text-4xl" />
                            <p className="text-[10px] uppercase tracking-widest font-bold">Sin mensajes</p>
                        </div>
                    ) : (
                        messages.map(msg => (
                            <div
                                key={msg.id}
                                onClick={() => {
                                    setSelectedMessage(msg);
                                    if (!msg.is_read && msg.id) handleMarkAsRead(msg.id);
                                }}
                                className={`p-6 border-b border-slate-50 cursor-pointer transition-all hover:bg-slate-50 ${selectedMessage?.id === msg.id ? 'bg-gold/5 border-l-4 border-l-gold' : ''} ${!msg.is_read ? 'bg-white font-bold' : 'opacity-70'}`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-[10px] uppercase tracking-wider text-slate-400">
                                        {msg.name}
                                    </span>
                                    <span className="text-[9px] text-slate-300">
                                        {msg.created_at ? new Date(msg.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' }) : ''}
                                    </span>
                                </div>
                                <h3 className="text-sm truncate mb-1">{msg.subject}</h3>
                                <p className="text-xs text-slate-400 line-clamp-1">{msg.message}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Message Detail */}
            <div className="lg:col-span-7 bg-white border border-slate-200 shadow-sm flex flex-col h-[700px]">
                {selectedMessage ? (
                    <motion.div
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex flex-col h-full"
                    >
                        <div className="p-8 border-b border-slate-100 flex justify-between items-start gap-4">
                            <div>
                                <h1 className="text-2xl font-serif text-slate-800 mb-2">{selectedMessage.subject}</h1>
                                <div className="flex items-center gap-3 text-xs text-slate-500">
                                    <span className="font-bold text-slate-700">{selectedMessage.name}</span>
                                    <span>•</span>
                                    <span>{selectedMessage.phone}</span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleDelete(selectedMessage.id!)}
                                    className="p-3 text-slate-300 hover:text-red-500 transition-colors"
                                >
                                    <FontAwesomeIcon icon={faTrash} />
                                </button>
                            </div>
                        </div>
                        <div className="p-8 flex-grow overflow-y-auto">
                            <div className="bg-slate-50 p-6 rounded-lg border border-slate-100 italic text-slate-600 leading-relaxed">
                                {selectedMessage.message}
                            </div>

                            <div className="mt-12 space-y-4">
                                <h4 className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Datos de seguimiento</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 border border-slate-100 rounded">
                                        <p className="text-[9px] text-slate-400 uppercase mb-1">Enviado el</p>
                                        <p className="text-sm">{selectedMessage.created_at ? new Date(selectedMessage.created_at).toLocaleString() : '-'}</p>
                                    </div>
                                    <div className="p-4 border border-slate-100 rounded">
                                        <p className="text-[9px] text-slate-400 uppercase mb-1">Email Resend</p>
                                        <p className="text-xs">
                                            {selectedMessage.email_sent ? (
                                                <span className="text-green-500 flex items-center gap-2">
                                                    <FontAwesomeIcon icon={faCheckCircle} /> Enviado con éxito
                                                </span>
                                            ) : (
                                                <span className="text-slate-400">No enviado (Solo DB)</span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="p-8 bg-slate-50 border-t border-slate-100">
                            <a
                                href={`https://wa.me/${selectedMessage.phone.replace(/[^0-9]/g, '')}?text=Hola ${selectedMessage.name}, gracias por escribirnos desde el sitio web de Arcangel Ceremonias...`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full bg-green-500 text-white flex items-center justify-center gap-3 py-4 rounded font-bold text-xs uppercase tracking-widest hover:bg-green-600 transition-all shadow-md"
                            >
                                <FontAwesomeIcon icon={faWhatsapp} className="text-lg" />
                                Responder por WhatsApp
                            </a>
                        </div>
                    </motion.div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-300 space-y-6">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center">
                            <FontAwesomeIcon icon={faEnvelope} className="text-4xl" />
                        </div>
                        <p className="text-[10px] uppercase tracking-widest font-bold">Selecciona un mensaje para leerlo</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const UsersManager: React.FC = () => {
    const { isAdmin } = useAuth();
    const [users, setUsers] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newUser, setNewUser] = useState({ email: '', password: '', fullName: '', role: 'editor' });
    const [isSaving, setIsSaving] = useState(false);

    const fetchUsers = async () => {
        setLoading(true);
        const data = await userService.getProfiles();
        setUsers(data);
        setLoading(false);
    };

    useEffect(() => {
        if (isAdmin) fetchUsers();
    }, [isAdmin]);

    const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean, onConfirm: () => void, title: string, message: string }>({
        isOpen: false,
        onConfirm: () => { },
        title: '',
        message: ''
    });

    const triggerUpdateRole = (userId: string, currentRole: 'admin' | 'editor') => {
        const newRole = currentRole === 'admin' ? 'editor' : 'admin';
        setConfirmModal({
            isOpen: true,
            title: 'Cambiar Rol de Usuario',
            message: `¿Deseas cambiar el rol de este usuario a ${newRole.toUpperCase()}?`,
            onConfirm: () => handleUpdateRole(userId, newRole)
        });
    };

    const handleUpdateRole = async (userId: string, newRole: 'admin' | 'editor') => {
        const success = await userService.updateRole(userId, newRole);
        if (success) {
            toast.success('Rol actualizado con éxito');
            fetchUsers();
            setConfirmModal({ ...confirmModal, isOpen: false });
        } else {
            toast.error('Error al actualizar rol');
        }
    };

    const triggerDeleteUser = (userId: string, email: string) => {
        setConfirmModal({
            isOpen: true,
            title: 'Eliminar Usuario',
            message: `¿Estás seguro de que deseas eliminar permanentemente a ${email}? Esta acción no se puede deshacer.`,
            onConfirm: () => handleDeleteUser(userId)
        });
    };

    const handleDeleteUser = async (userId: string) => {
        try {
            const success = await userService.deleteProfile(userId);
            if (success) {
                toast.success('Usuario eliminado correctamente');
                fetchUsers();
                setConfirmModal({ ...confirmModal, isOpen: false });
            } else {
                toast.error('No se pudo eliminar el usuario');
            }
        } catch (error) {
            console.error(error);
            toast.error('Error al intentar eliminar');
        }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newUser.email || !newUser.password || !newUser.fullName) {
            toast.error('Todos los campos son obligatorios');
            return;
        }

        try {
            setIsSaving(true);
            await userService.createUser(newUser.email, newUser.password, newUser.fullName, newUser.role);
            toast.success('Usuario creado correctamente');
            setIsCreateModalOpen(false);
            setNewUser({ email: '', password: '', fullName: '', role: 'editor' });
            fetchUsers();
        } catch (error: any) {
            toast.error(error.message || 'Error al crear usuario');
        } finally {
            setIsSaving(false);
        }
    };

    if (!isAdmin) {
        return (
            <div className="flex flex-col items-center justify-center p-20 text-center">
                <FontAwesomeIcon icon={faUserShield} className="text-6xl text-slate-200 mb-6" />
                <h2 className="font-serif text-2xl text-slate-400 mb-2">Acceso Restringido</h2>
                <p className="text-slate-400 text-sm">Solo los administradores generales pueden gestionar usuarios.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div className="space-y-2">
                    <h2 className="text-3xl font-serif text-slate-800">Gestión de Usuarios</h2>
                    <p className="text-xs uppercase tracking-widest text-slate-400 font-bold">Control de accesos y roles (Admin / Editor)</p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="w-full sm:w-auto bg-gold text-chocolate px-6 py-3 text-[10px] uppercase tracking-widest font-bold hover:bg-chocolate hover:text-white transition-all shadow-lg flex items-center justify-center gap-2"
                >
                    <FontAwesomeIcon icon={faUserPlus} />
                    Nuevo Usuario
                </button>
            </div>

            <div className="bg-white border border-slate-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-8 py-4 text-[10px] uppercase tracking-widest font-bold text-slate-400">Usuario</th>
                                <th className="px-8 py-4 text-[10px] uppercase tracking-widest font-bold text-slate-400">Rol Corriente</th>
                                <th className="hidden md:table-cell px-8 py-4 text-[10px] uppercase tracking-widest font-bold text-slate-400">Fecha Registro</th>
                                <th className="px-8 py-4 text-[10px] uppercase tracking-widest font-bold text-slate-400 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan={4} className="p-12 text-center text-slate-300">Cargando usuarios...</td></tr>
                            ) : users.length === 0 ? (
                                <tr><td colSpan={4} className="p-12 text-center text-slate-300">No hay usuarios registrados</td></tr>
                            ) : users.map(user => (
                                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-gold/10 text-gold rounded-full flex items-center justify-center font-bold text-xs">
                                                {user.email ? user.email[0].toUpperCase() : '?'}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-700 text-sm">{user.full_name || 'Sin nombre'}</p>
                                                <p className="text-[10px] text-slate-400 truncate max-w-[150px] sm:max-w-none">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest ${user.role === 'admin' ? 'bg-gold/10 text-gold' : 'bg-slate-100 text-slate-500'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="hidden md:table-cell px-8 py-6 text-xs text-slate-400">
                                        {new Date(user.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end gap-3">
                                            <button
                                                onClick={() => triggerUpdateRole(user.id, user.role)}
                                                className="text-[9px] uppercase tracking-widest font-bold text-gold hover:text-chocolate transition-colors border-b border-gold/30 hover:border-chocolate whitespace-nowrap"
                                            >
                                                {user.role === 'admin' ? 'Hacer Editor' : 'Hacer Admin'}
                                            </button>

                                            {/* Impedir que un admin se borre a sí mismo */}
                                            {user.id !== useAuth().user?.id && (
                                                <button
                                                    onClick={() => triggerDeleteUser(user.id, user.email)}
                                                    className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-red-500 transition-colors"
                                                    title="Eliminar Usuario"
                                                >
                                                    <FontAwesomeIcon icon={faTrash} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                title={confirmModal.title}
                message={confirmModal.message}
                onConfirm={confirmModal.onConfirm}
                onCancel={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                confirmLabel="Confirmar Cambio"
                variant="warning"
            />

            <div className="bg-slate-50 p-6 md:p-8 border border-slate-200 space-y-4">
                <h4 className="text-[10px] md:text-xs uppercase tracking-widest font-bold text-slate-800 flex items-center gap-2">
                    <FontAwesomeIcon icon={faUserShield} className="text-gold" />
                    Guía de Permisos
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                    <div className="space-y-2">
                        <p className="text-[9px] md:text-[10px] font-bold text-gold uppercase">Administrador</p>
                        <p className="text-[11px] md:text-xs text-slate-500 leading-relaxed">
                            Acceso total al sistema. Puede gestionar productos, categorías, banners, mensajes y **otros usuarios / permisos**.
                        </p>
                    </div>
                    <div className="space-y-2">
                        <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase">Editor</p>
                        <p className="text-[11px] md:text-xs text-slate-500 leading-relaxed">
                            Acceso limitado. Puede gestionar el contenido del sitio (catálogo, galería, banners) pero no tiene acceso a la configuración de usuarios ni seguridad.
                        </p>
                    </div>
                </div>
            </div>

            {/* Modal de Creación */}
            <AnimatePresence>
                {isCreateModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => !isSaving && setIsCreateModalOpen(false)} />
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative bg-white w-full max-w-lg shadow-2xl border border-gold/20 flex flex-col overflow-hidden">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
                                <h3 className="text-xl font-serif text-slate-800">Nuevo Usuario Administrativo</h3>
                                <button onClick={() => !isSaving && setIsCreateModalOpen(false)} className="text-slate-300 hover:text-chocolate transition-colors"><FontAwesomeIcon icon={faTimes} className="text-lg" /></button>
                            </div>

                            <form onSubmit={handleCreateUser} className="p-8 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Nombre Completo</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full p-4 bg-slate-50 border border-slate-100 focus:border-gold outline-none text-sm"
                                        placeholder="Ej. Juan Pérez"
                                        value={newUser.fullName}
                                        onChange={e => setNewUser({ ...newUser, fullName: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Correo Electrónico</label>
                                    <input
                                        type="email"
                                        required
                                        className="w-full p-4 bg-slate-50 border border-slate-100 focus:border-gold outline-none text-sm"
                                        placeholder="correo@ejemplo.com"
                                        value={newUser.email}
                                        onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Contraseña Inicial</label>
                                        <input
                                            type="password"
                                            required
                                            minLength={6}
                                            className="w-full p-4 bg-slate-50 border border-slate-100 focus:border-gold outline-none text-sm"
                                            placeholder="******"
                                            value={newUser.password}
                                            onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                                        />
                                        <p className="text-[8px] text-slate-400">Mínimo 6 caracteres</p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Rol Asignado</label>
                                        <select
                                            className="w-full p-4 bg-slate-50 border border-slate-100 focus:border-gold outline-none text-sm h-[54px] appearance-none"
                                            value={newUser.role}
                                            onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                                        >
                                            <option value="editor">Editor (Limitado)</option>
                                            <option value="admin">Administrador (Total)</option>
                                        </select>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="w-full bg-chocolate text-white p-5 text-[10px] uppercase tracking-widest font-bold hover:bg-gold hover:text-chocolate transition-all flex items-center justify-center gap-3 shadow-xl"
                                >
                                    {isSaving ? <FontAwesomeIcon icon={faCog} className="animate-spin" /> : <FontAwesomeIcon icon={faUserPlus} />}
                                    Registrar Usuario
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

// --- Main Admin Entry Point ---
const Admin: React.FC = () => {
    const { isAdmin } = useAuth();
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        const timeoutId = setTimeout(() => {
            if (loading) {
                console.warn('Admin fetchData timed out');
                setLoading(false);
            }
        }, 10000); // 10 seconds safety

        try {
            setLoading(true);
            const [prods, cats] = await Promise.all([
                productService.getProducts(),
                productService.getCategories()
            ]);
            setProducts(prods);
            setCategories(cats);
        } catch (error) {
            console.error('Error fetching admin data:', error);
            toast.error('Error al cargar datos del panel');
        } finally {
            clearTimeout(timeoutId);
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    if (loading && products.length === 0) return <div className="h-screen flex items-center justify-center bg-slate-50"><div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" /></div>;

    return (
        <AdminLayout>
            <Routes>
                <Route index element={<DashboardOverview products={products} categories={categories} refresh={fetchData} />} />
                <Route path="productos" element={<ProductsManager products={products} categories={categories} refresh={fetchData} />} />
                <Route path="categorias" element={<CategoriesManager categories={categories} refresh={fetchData} />} />
                <Route path="hero" element={<HeroManager />} />
                <Route path="galeria" element={<MediaGallery />} />
                <Route path="mensajes" element={<MessagesManager />} />
                <Route path="usuarios" element={<ProtectedRoute requireAdmin><UsersManager /></ProtectedRoute>} />
                <Route path="configuracion" element={<ConfigManager />} />
                <Route path="*" element={<DashboardOverview products={products} categories={categories} refresh={fetchData} />} />
            </Routes>
        </AdminLayout>
    );
};

export default Admin;
