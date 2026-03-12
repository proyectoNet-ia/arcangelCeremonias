import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faPlus, faBox, faChartBar, faEye, faArrowUp, faDiamond, faMagic, faTrophy
} from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { statsService } from '@/services/statsService';
import { productService } from '@/services/productService';
import { Product, Category } from '@/types/product';
import { ConfirmModal } from '../ConfirmModal';
import toast from 'react-hot-toast';

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

interface DashboardOverviewProps {
    products: Product[];
    categories: Category[];
    refresh: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ products, categories, refresh }) => {
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
                            ) : recentClicks.map((click) => (
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
