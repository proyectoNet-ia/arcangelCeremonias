import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faImage, faTrash, faCopy, faTimes, faSearch,
    faFolder, faSync, faExternalLinkAlt, faCheck,
    faLock
} from '@fortawesome/free-solid-svg-icons';
import { mediaService, MediaFile, ALL_ALLOWED_FORMATS } from '@/services/mediaService';
import { ConfirmModal } from './ConfirmModal';
import toast from 'react-hot-toast';

interface MediaGalleryProps {
    onSelect?: (url: string) => void;
    allowSelection?: boolean;
}

export const MediaGallery: React.FC<MediaGalleryProps> = ({ onSelect, allowSelection = false }) => {
    const [files, setFiles] = useState<MediaFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterFolder, setFilterFolder] = useState<string>('all');
    const [uploading, setUploading] = useState(false);
    const [optimizationStats, setOptimizationStats] = useState<{ original: number, optimized: number } | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean, file: MediaFile | null }>({
        isOpen: false,
        file: null
    });

    const loadMedia = async () => {
        try {
            setLoading(true);
            const data = await mediaService.getAllMedia();
            setFiles(data);
        } catch (error) {
            console.error('Error loading media:', error);
            toast.error('Error al cargar la galería');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadMedia();
    }, []);

    const handleDelete = async () => {
        if (!confirmDelete.file) return;

        const file = confirmDelete.file;
        const path = `${file.folder}/${file.name}`;

        try {
            console.log('Intentando eliminar:', path);
            await mediaService.deleteFile(path);

            toast.success('Archivo eliminado definitivamente');

            // Actualización más precisa del estado local
            setFiles(prev => prev.filter(f => !(f.name === file.name && f.folder === file.folder)));
            setConfirmDelete({ isOpen: false, file: null });
        } catch (error: any) {
            console.error('Error al eliminar:', error);
            toast.error(error.message || 'Error al intentar eliminar el archivo');
        }
    };

    const copyToClipboard = (url: string) => {
        navigator.clipboard.writeText(url);
        toast.success('URL copiada al portapapeles', {
            style: { background: '#1e293b', color: '#fff', fontSize: '12px' }
        });
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const targetFolder = filterFolder === 'all' ? 'products' : filterFolder;
        let toastId = '';

        try {
            setUploading(true);
            toastId = toast.loading(`Subiendo a /${targetFolder}...`);

            const url = await mediaService.uploadFile(file, targetFolder);

            toast.success('Archivo optimizado y subido con éxito', { id: toastId });
            loadMedia();
        } catch (error: any) {
            console.error('Upload error:', error);
            if (toastId) {
                toast.error(error.message || 'Error al subir archivo', { id: toastId });
            } else {
                toast.error(error.message || 'Error al subir archivo');
            }
        } finally {
            setUploading(false);
            if (e.target) e.target.value = '';
        }
    };

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const filteredFiles = files.filter(file => {
        const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFolder = filterFolder === 'all' || file.folder === filterFolder;
        return matchesSearch && matchesFolder;
    });

    const folders = ['all', 'products', 'hero', 'branding', 'files'];

    return (
        <div className="space-y-8 min-h-[600px] flex flex-col">
            {/* Toolbar */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6 bg-white p-6 border border-slate-200">
                {/* Search Bar */}
                <div className="w-full lg:max-w-md">
                    <div className="relative">
                        <FontAwesomeIcon icon={faSearch} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-xs" />
                        <input
                            type="text"
                            placeholder="Buscar por nombre..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-slate-100 focus:border-gold outline-none text-xs"
                        />
                    </div>
                </div>

                {/* Actions & Categories Wrapper */}
                <div className="w-full lg:w-auto flex flex-col md:flex-row items-center gap-6">
                    <div className="w-full md:w-auto flex items-center justify-between gap-4">
                        {/* Botón de Carga */}
                        <label className={`flex-grow md:flex-grow-0 flex items-center justify-center gap-2 px-6 py-3 bg-chocolate text-gold text-[10px] font-bold uppercase tracking-widest cursor-pointer hover:bg-gold hover:text-chocolate transition-all shadow-lg ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                            <FontAwesomeIcon icon={uploading ? faSync : faImage} className={uploading ? 'animate-spin' : ''} />
                            {uploading ? 'Subiendo...' : 'Subir Archivo'}
                            <input type="file" className="hidden" onChange={handleUpload} accept={ALL_ALLOWED_FORMATS.join(',')} />
                        </label>

                        <button
                            onClick={loadMedia}
                            className="p-3 text-slate-400 hover:text-gold transition-colors block lg:hidden"
                            title="Actualizar"
                        >
                            <FontAwesomeIcon icon={faSync} className={loading ? 'animate-spin' : ''} />
                        </button>
                    </div>

                    {/* Categorías (Scrollable) */}
                    <div className="w-full md:w-auto flex bg-slate-50 p-1 overflow-x-auto no-scrollbar border border-slate-100">
                        {folders.map(folder => (
                            <button
                                key={folder}
                                onClick={() => setFilterFolder(folder)}
                                className={`flex-shrink-0 px-4 py-2 text-[10px] uppercase font-bold tracking-widest transition-all ${filterFolder === folder
                                    ? 'bg-white text-gold shadow-sm'
                                    : 'text-slate-400 hover:text-chocolate'
                                    }`}
                            >
                                {folder === 'all' ? 'Ver Todo' : folder}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={loadMedia}
                        className="hidden lg:block p-3 text-slate-400 hover:text-gold transition-colors"
                        title="Actualizar"
                    >
                        <FontAwesomeIcon icon={faSync} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* Security Note */}
            <div className="bg-blue-50/50 p-4 border-l-4 border-blue-400 flex items-center gap-4">
                <FontAwesomeIcon icon={faLock} className="text-blue-400" />
                <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500">
                    Seguridad Activa: Formatos permitidos: JPG, PNG, WEBP, GIF, SVG, PDF. Tamaño máx: 15MB.
                </p>
            </div>

            {/* Content grid */}
            {loading ? (
                <div className="flex-grow flex items-center justify-center py-20">
                    <div className="flex flex-col items-center gap-4 text-slate-400">
                        <div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                        <p className="text-[10px] uppercase tracking-widest font-bold">Escaneando Storage...</p>
                    </div>
                </div>
            ) : filteredFiles.length === 0 ? (
                <div className="flex-grow flex flex-col items-center justify-center py-20 text-slate-300 space-y-4 border-2 border-dashed border-slate-100">
                    <FontAwesomeIcon icon={faImage} className="text-5xl opacity-20" />
                    <p className="font-serif text-lg">No se encontraron archivos</p>
                    <p className="text-[10px] uppercase tracking-widest">Intenta cambiar el filtro o subir nuevos archivos</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 overflow-y-auto pr-2 pb-10">
                    <AnimatePresence>
                        {filteredFiles.map((file, idx) => {
                            const size = file.metadata?.size || 0;
                            const mime = file.metadata?.mimetype || 'unknown';
                            const isPdf = mime === 'application/pdf';
                            const isUnauthorized = !ALL_ALLOWED_FORMATS.includes(mime);

                            return (
                                <motion.div
                                    key={`${file.folder}-${file.name}`}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ delay: idx * 0.02 }}
                                    className={`group relative aspect-square bg-slate-50 border border-slate-200 overflow-hidden cursor-default transition-all duration-300 hover:border-gold hover:shadow-lg ${allowSelection ? 'active:scale-95' : ''} ${isUnauthorized ? 'border-red-400' : ''}`}
                                >
                                    {/* Preview */}
                                    {isPdf ? (
                                        <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-slate-100 p-4">
                                            <div className="w-12 h-12 bg-red-50 text-red-500 flex items-center justify-center rounded-lg">
                                                <span className="font-bold text-lg">PDF</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <img src={file.url} alt={file.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" loading="lazy" />
                                    )}

                                    {/* Format Badge */}
                                    <div className="absolute top-2 right-2 px-2 py-0.5 bg-white/80 text-[8px] text-chocolate font-bold uppercase tracking-tighter backdrop-blur-sm z-10 border border-slate-200">
                                        {mime.split('/').pop()}
                                    </div>

                                    {/* Folder Badge */}
                                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 text-[8px] text-white uppercase tracking-widest backdrop-blur-sm z-10">
                                        {file.folder}
                                    </div>

                                    {/* Size Badge */}
                                    <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-white text-[8px] text-chocolate font-bold uppercase tracking-widest z-10 border border-slate-100 shadow-sm">
                                        {formatSize(size)}
                                    </div>

                                    {/* Overlay Buttons */}
                                    <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 z-20">
                                        {allowSelection ? (
                                            <button
                                                onClick={() => onSelect?.(file.url)}
                                                className="bg-gold text-chocolate px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-white transition-all shadow-xl"
                                            >
                                                <FontAwesomeIcon icon={faCheck} className="mr-2" /> Seleccionar
                                            </button>
                                        ) : (
                                            <>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => copyToClipboard(file.url)}
                                                        className="w-10 h-10 bg-white/20 text-white hover:bg-white hover:text-chocolate rounded-full transition-all flex items-center justify-center"
                                                        title="Copiar URL"
                                                    >
                                                        <FontAwesomeIcon icon={faCopy} />
                                                    </button>
                                                    <a
                                                        href={file.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="w-10 h-10 bg-white/20 text-white hover:bg-white hover:text-chocolate rounded-full transition-all flex items-center justify-center"
                                                        title="Ver original"
                                                    >
                                                        <FontAwesomeIcon icon={faExternalLinkAlt} />
                                                    </a>
                                                </div>
                                                <button
                                                    onClick={() => setConfirmDelete({ isOpen: true, file })}
                                                    className="mt-2 text-white/50 hover:text-red-400 text-[10px] uppercase font-bold tracking-widest transition-colors flex items-center gap-2"
                                                >
                                                    <FontAwesomeIcon icon={faTrash} className="text-xs" /> Eliminar
                                                </button>
                                            </>
                                        )}
                                    </div>

                                    {/* Filename Footer */}
                                    <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm p-2 border-t border-slate-100 transform translate-y-full group-hover:translate-y-0 transition-transform z-30">
                                        <p className="text-[9px] font-medium truncate text-slate-800" title={file.name}>
                                            {file.name}
                                        </p>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            )}

            <ConfirmModal
                isOpen={confirmDelete.isOpen}
                title="Eliminar Archivo"
                message={`¿Estás seguro de que deseas eliminar "${confirmDelete.file?.name}"? Esta acción no se puede deshacer y el archivo desaparecerá de todos los productos que lo usen.`}
                onConfirm={handleDelete}
                onCancel={() => setConfirmDelete({ isOpen: false, file: null })}
                confirmLabel="Eliminar Permanentemente"
                variant="danger"
            />
        </div>
    );
};
