import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faDiamond, faPhone, faUsers, faChartBar, faCog, faSave, faImage, faImages, faGlobe, faEnvelope, faFilePdf, faFileUpload, faEye
} from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp, faFacebook, faInstagram } from '@fortawesome/free-brands-svg-icons';
import { configService, SiteConfig } from '@/services/configService';
import { productService } from '@/services/productService';
import { MediaSelectorModal } from '../MediaSelectorModal';
import toast from 'react-hot-toast';

export const ConfigManager: React.FC = () => {
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
        favicon_url: '',
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
        cta_banner_bg_color: '#1B1411',
        cta_banner_bg_image_url: '',
        cta_banner_bg_opacity: 0.85,
        catalog_pdf_url: '',
        maintenance_mode: false,
        show_prices: true,
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'identity' | 'contact' | 'about' | 'marketing'>('identity');
    const [mediaSelector, setMediaSelector] = useState<{
        isOpen: boolean,
        field: 'logo_light' | 'logo_dark' | 'favicon' | 'pdf' | 'about' | 'cta_bg'
    }>({
        isOpen: false,
        field: 'logo_light'
    });

    useEffect(() => {
        const load = async () => {
            try {
                const data = await configService.getConfig();
                if (data) {
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
                        favicon_url: data.favicon_url || '',
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
                        show_prices: data.show_prices ?? true,
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
            toast.success('Configuración actualizada');
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

                                <div className="p-6 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
                                    <div className="space-y-1">
                                        <h3 className="text-[10px] uppercase tracking-widest font-bold text-chocolate">Visibilidad de Precios</h3>
                                        <p className="text-xs text-slate-400">Controla si los precios son visibles para los clientes en el catálogo.</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setConfig({ ...config, show_prices: !config.show_prices })}
                                        className={`px-6 py-2 text-[10px] font-bold uppercase tracking-widest transition-all border ${config.show_prices
                                            ? 'bg-emerald-100 text-emerald-600 border-emerald-200'
                                            : 'bg-amber-100 text-amber-600 border-amber-200'
                                            }`}
                                    >
                                        {config.show_prices ? 'Precios Visibles' : 'Precios Ocultos'}
                                    </button>
                                </div>

                                <div className="space-y-8">
                                    <h3 className="text-[10px] uppercase tracking-widest font-bold text-gold flex items-center gap-2">
                                        <div className="w-1 h-1 rounded-full bg-gold" /> Paleta de Colores
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {['primary_color', 'secondary_color', 'accent_color'].map((key) => (
                                            <div key={key} className="space-y-2">
                                                <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">{key.replace('_', ' ')}</label>
                                                <div className="flex gap-2">
                                                    <input type="color" value={(config as any)[key]} onChange={e => setConfig({ ...config, [key]: e.target.value })} className="h-12 w-12 border border-slate-200 cursor-pointer" />
                                                    <input type="text" value={(config as any)[key]} onChange={e => setConfig({ ...config, [key]: e.target.value })} className="flex-grow p-4 border border-slate-100 outline-none text-xs font-mono" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                                        {(['logo_light', 'logo_dark'] as const).map(type => (
                                            <div key={type} className="space-y-4">
                                                <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Logo ({type === 'logo_light' ? 'Modo Claro' : 'Modo Oscuro'})</label>
                                                <div className={`aspect-video ${type === 'logo_dark' ? 'bg-chocolate border-white/10' : 'bg-slate-50 border-slate-100'} border-2 border-dashed relative group overflow-hidden flex items-center justify-center`}>
                                                    {(config as any)[`${type}_url`] ? (
                                                        <>
                                                            <img src={(config as any)[`${type}_url`]} className="max-h-full object-contain p-4" />
                                                            <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white text-[10px] font-bold uppercase tracking-widest">Cambiar<input type="file" className="hidden" accept="image/*" onChange={e => handleLogoUpload(e, type === 'logo_light' ? 'light' : 'dark')} /></label>
                                                        </>
                                                    ) : (
                                                        <label className="cursor-pointer flex flex-col items-center gap-2 p-4 text-center">
                                                            <FontAwesomeIcon icon={faImage} className={`text-3xl ${type === 'logo_dark' ? 'text-white/20' : 'text-slate-200'}`} />
                                                            <span className={`text-[9px] uppercase font-bold ${type === 'logo_dark' ? 'text-white/30' : 'text-slate-300'}`}>Subir Logo</span>
                                                            <input type="file" className="hidden" accept="image/*" onChange={e => handleLogoUpload(e, type === 'logo_light' ? 'light' : 'dark')} />
                                                        </label>
                                                    )}
                                                </div>
                                                <button type="button" onClick={() => setMediaSelector({ isOpen: true, field: type })} className={`w-full py-2 border border-slate-100 text-[9px] uppercase font-bold tracking-widest transition-all flex items-center justify-center gap-2 ${type === 'logo_dark' ? 'hover:bg-chocolate hover:text-white' : 'hover:bg-slate-50'}`}>
                                                    <FontAwesomeIcon icon={faImages} className="text-gold" /> Galería de Medios
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="pt-8 border-t border-slate-50">
                                        <div className="space-y-4 max-w-sm">
                                            <div className="space-y-1">
                                                <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Favicon</label>
                                                <p className="text-[9px] text-slate-400 lowercase italic">Imagen cuadrada: .png, .ico o .jpg</p>
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
                                                        <input type="file" className="hidden" accept="image/*" onChange={e => handleLogoUpload(e, 'favicon')} />
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
                                <div className="space-y-6">
                                    <h3 className="text-[10px] uppercase tracking-widest font-bold text-gold flex items-center gap-2">
                                        <div className="w-1 h-1 rounded-full bg-gold" /> Canales Directos
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {[
                                            { key: 'whatsapp', label: 'WhatsApp', icon: faWhatsapp, placeholder: 'Ej. 523521681197' },
                                            { key: 'phone', label: 'Teléfono Oficina', icon: faPhone, placeholder: 'Ej. 352 52 62502' },
                                            { key: 'email', label: 'Correo Electrónico', icon: faEnvelope, placeholder: 'info@empresa.com' },
                                            { key: 'office_hours', label: 'Horarios', icon: null, placeholder: 'Lunes a Viernes 9:00 - 18:00' },
                                        ].map(field => (
                                            <div key={field.key} className="space-y-2">
                                                <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">{field.label}</label>
                                                <div className="relative">
                                                    {field.icon && <FontAwesomeIcon icon={field.icon} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />}
                                                    <input
                                                        type="text"
                                                        value={(config as any)[field.key] || ''}
                                                        onChange={e => setConfig({ ...config, [field.key]: e.target.value })}
                                                        className={`w-full p-4 ${field.icon ? 'pl-12' : ''} border border-slate-100 focus:border-gold outline-none text-sm`}
                                                        placeholder={field.placeholder}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                    <div className="space-y-6">
                                        <h3 className="text-[10px] uppercase tracking-widest font-bold text-gold flex items-center gap-2">
                                            <div className="w-1 h-1 rounded-full bg-gold" /> Redes Sociales
                                        </h3>
                                        <div className="space-y-4">
                                            {[
                                                { key: 'facebook_url', label: 'Facebook URL', icon: faFacebook },
                                                { key: 'instagram_url', label: 'Instagram URL', icon: faInstagram },
                                            ].map(field => (
                                                <div key={field.key} className="space-y-2">
                                                    <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">{field.label}</label>
                                                    <div className="relative">
                                                        <FontAwesomeIcon icon={field.icon} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                                        <input type="text" value={(config as any)[field.key]} onChange={e => setConfig({ ...config, [field.key]: e.target.value })} className="w-full p-4 pl-12 border border-slate-100 focus:border-gold outline-none text-sm" placeholder="https://..." />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-6">
                                        <h3 className="text-[10px] uppercase tracking-widest font-bold text-gold flex items-center gap-2">
                                            <div className="w-1 h-1 rounded-full bg-gold" /> Ubicación Física
                                        </h3>
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Dirección</label>
                                                <textarea value={config.address} onChange={e => setConfig({ ...config, address: e.target.value })} rows={2} className="w-full p-4 border border-slate-100 focus:border-gold outline-none text-sm" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Maps URL</label>
                                                <input type="text" value={config.google_maps_url} onChange={e => setConfig({ ...config, google_maps_url: e.target.value })} className="w-full p-4 border border-slate-100 focus:border-gold outline-none text-sm" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'about' && (
                            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="space-y-6">
                                    <h3 className="text-[10px] uppercase tracking-widest font-bold text-gold flex items-center gap-2">
                                        <div className="w-1 h-1 rounded-full bg-gold" /> Historia
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {['about_subtitle', 'about_title'].map(key => (
                                            <div key={key} className="space-y-2">
                                                <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">{key.replace('about_', '')}</label>
                                                <input type="text" value={(config as any)[key] || ''} onChange={e => setConfig({ ...config, [key]: e.target.value })} className="w-full p-4 border border-slate-100 focus:border-gold outline-none text-sm" />
                                            </div>
                                        ))}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Cita</label>
                                        <textarea rows={2} value={config.about_quote || ''} onChange={e => setConfig({ ...config, about_quote: e.target.value })} className="w-full p-4 border border-slate-100 focus:border-gold outline-none text-sm font-serif italic" />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {[1, 2, 3].map(n => (
                                            <div key={n} className="space-y-2">
                                                <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Párrafo {n}</label>
                                                <textarea rows={6} value={(config as any)[`about_body_${n}`] || ''} onChange={e => setConfig({ ...config, [`about_body_${n}`]: e.target.value })} className="w-full p-4 border border-slate-100 focus:border-gold outline-none text-xs leading-relaxed" />
                                            </div>
                                        ))}
                                    </div>
                                    <div className="pt-6">
                                        <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-2 block">Estadísticas</label>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {[1, 2, 3, 4].map(n => (
                                                <div key={n} className="space-y-2 p-4 border border-slate-50 bg-slate-50/50">
                                                    <input type="text" value={(config as any)[`about_stat_${n}_value`] || ''} onChange={e => setConfig({ ...config, [`about_stat_${n}_value`]: e.target.value })} className="w-full p-2 bg-transparent border-b border-gold/10 focus:border-gold outline-none text-sm font-serif text-gold text-center" placeholder="Valor" />
                                                    <input type="text" value={(config as any)[`about_stat_${n}_label`] || ''} onChange={e => setConfig({ ...config, [`about_stat_${n}_label`]: e.target.value })} className="w-full p-2 bg-transparent border-none outline-none text-[8px] uppercase tracking-wider font-bold text-slate-400 text-center" placeholder="Etiqueta" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-4 pt-6">
                                        <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Imagen Nosotros</label>
                                        <div className="flex gap-2">
                                            <input type="text" value={config.about_image_url || ''} onChange={e => setConfig({ ...config, about_image_url: e.target.value })} className="flex-grow p-4 border border-slate-100 focus:border-gold outline-none text-xs" />
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
                                <div className="space-y-6">
                                    <h3 className="text-[10px] uppercase tracking-widest font-bold text-gold flex items-center gap-2">
                                        <div className="w-1 h-1 rounded-full bg-gold" /> Banner CTA
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {['cta_banner_tag', 'cta_banner_title', 'cta_banner_subtitle'].map(key => (
                                            <div key={key} className="space-y-2">
                                                <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">{key.split('_').pop()}</label>
                                                <input type="text" value={(config as any)[key] || ''} onChange={e => setConfig({ ...config, [key]: e.target.value })} className="w-full p-4 border border-slate-100 focus:border-gold outline-none text-sm" />
                                            </div>
                                        ))}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Cuerpo</label>
                                        <textarea rows={3} value={config.cta_banner_body || ''} onChange={e => setConfig({ ...config, cta_banner_body: e.target.value })} className="w-full p-4 border border-slate-100 focus:border-gold outline-none text-sm" />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 bg-slate-50 border border-slate-100 rounded-xl">
                                        <div className="space-y-4">
                                            <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Color/Opacidad</label>
                                            <div className="flex gap-4">
                                                <input type="color" value={config.cta_banner_bg_color || '#1B1411'} onChange={e => setConfig({ ...config, cta_banner_bg_color: e.target.value })} className="w-12 h-12 rounded cursor-pointer" />
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="1"
                                                    step="0.05"
                                                    value={config.cta_banner_bg_opacity ?? 0.85}
                                                    onChange={e => setConfig({ ...config, cta_banner_bg_opacity: parseFloat(e.target.value) })}
                                                    className="flex-grow accent-gold"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Imagen Fondo</label>
                                            <div className="flex items-center gap-4">
                                                <div className="w-16 h-16 bg-white border border-slate-200 rounded flex items-center justify-center overflow-hidden">
                                                    {config.cta_banner_bg_image_url ? (
                                                        <img src={config.cta_banner_bg_image_url} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <FontAwesomeIcon icon={faImage} className="text-slate-200" />
                                                    )}
                                                </div>
                                                <button type="button" onClick={() => setMediaSelector({ isOpen: true, field: 'cta_bg' })} className="px-4 py-2 border border-slate-200 text-[10px] font-bold uppercase transition-all hover:text-gold">Cambiar</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6 pt-6 border-t border-slate-100">
                                    <h3 className="text-[10px] uppercase tracking-widest font-bold text-gold flex items-center gap-2">
                                        <div className="w-1 h-1 rounded-full bg-gold" /> Catálogo PDF
                                    </h3>
                                    <div className="p-8 bg-slate-50 border border-slate-100 flex flex-col md:flex-row items-center gap-8">
                                        <div className={`w-20 h-20 ${config.catalog_pdf_url ? 'bg-white text-red-500 shadow-sm border-red-100' : 'bg-slate-200 text-slate-400'} flex items-center justify-center rounded-xl text-3xl transition-all border border-slate-100`}>
                                            <FontAwesomeIcon icon={faFilePdf} />
                                        </div>
                                        <div className="flex-grow text-center md:text-left">
                                            <h4 className="text-sm font-serif mb-1">Catálogo General</h4>
                                            <div className="flex flex-wrap gap-3 mt-4 justify-center md:justify-start">
                                                <label className="cursor-pointer bg-chocolate text-white px-6 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-gold hover:text-chocolate transition-all flex items-center gap-2">
                                                    <FontAwesomeIcon icon={faFileUpload} />
                                                    {config.catalog_pdf_url ? 'Reemplazar' : 'Subir'}
                                                    <input type="file" className="hidden" accept="application/pdf" onChange={handlePdfUpload} />
                                                </label>
                                                {config.catalog_pdf_url && (
                                                    <a href={config.catalog_pdf_url} target="_blank" rel="noopener noreferrer" className="bg-white text-slate-400 border border-slate-200 px-6 py-3 text-[10px] font-bold uppercase tracking-widest hover:border-gold hover:text-gold transition-all flex items-center gap-2">
                                                        <FontAwesomeIcon icon={faEye} /> Ver
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
        </motion.div>
    );
};
