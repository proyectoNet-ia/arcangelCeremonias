import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faImage, faTrash, faCopy, faTimes, faSearch,
    faFolder, faSync, faExternalLinkAlt, faCheck,
    faLock, faSort, faSortAmountDown, faChevronLeft, faChevronRight,
    faTh, faList, faEye
} from '@fortawesome/free-solid-svg-icons';
import { mediaService, MediaFile, ALL_ALLOWED_FORMATS } from '@/services/mediaService';
import { cleanupService } from '@/services/cleanupService';
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
    const [previewImage, setPreviewImage] = useState<MediaFile | null>(null);

    const [isScanning, setIsScanning] = useState(false);
    const [unusedUrls, setUnusedUrls] = useState<Set<string>>(new Set());
    const [showOnlyUnused, setShowOnlyUnused] = useState(false);

    const [viewType, setViewType] = useState<'grid' | 'list'>('grid');
    const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>({ key: 'name', direction: 'asc' });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 24;

    const sortedFiles = React.useMemo(() => {
        let items = files.filter(file => {
            const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesFolder = filterFolder === 'all' || file.folder === filterFolder;
            const matchesUnused = !showOnlyUnused || unusedUrls.has(file.url);
            return matchesSearch && matchesFolder && matchesUnused;
        });

        if (sortConfig) {
            items.sort((a, b) => {
                let aValue: any;
                let bValue: any;

                if (sortConfig.key === 'size') {
                    aValue = a.metadata?.size || 0;
                    bValue = b.metadata?.size || 0;
                } else if (sortConfig.key === 'name') {
                    aValue = a.name.toLowerCase();
                    bValue = b.name.toLowerCase();
                } else if (sortConfig.key === 'date') {
                    // Si no hay fecha en metadata, intentamos usar el nombre si tiene timestamp o simplemente 0
                    aValue = new Date(a.metadata?.lastModified || 0).getTime();
                    bValue = new Date(b.metadata?.lastModified || 0).getTime();
                }

                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return items;
    }, [files, searchTerm, filterFolder, sortConfig]);

    const paginatedFiles = React.useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return sortedFiles.slice(startIndex, startIndex + itemsPerPage);
    }, [sortedFiles, currentPage]);

    const totalPages = Math.ceil(sortedFiles.length / itemsPerPage);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterFolder, sortConfig]);

    const requestSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const handleScanUnused = async () => {
        setIsScanning(true);
        try {
            const unused = await cleanupService.findUnusedMedia();
            setUnusedUrls(new Set(unused.map(f => f.url)));
            setShowOnlyUnused(true);
            
            if (unused.length > 0) {
                toast.success(`Se encontraron ${unused.length} archivos sin usar`, { icon: '🔍' });
            } else {
                toast.success('¡Todos los archivos están en uso!', { icon: '✨' });
            }
        } catch (error) {
            console.error('Scan error:', error);
            toast.error('Error al analizar archivos');
        } finally {
            setIsScanning(false);
        }
    };

    const loadMedia = async (silent = false) => {
        try {
            if (!silent && files.length === 0) setLoading(true);
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
        const selectedFiles = e.target.files;
        if (!selectedFiles || selectedFiles.length === 0) return;

        const targetFolder = filterFolder === 'all' ? 'products' : filterFolder;
        const filesArray = Array.from(selectedFiles);
        const total = filesArray.length;

        setUploading(true);
        let successCount = 0;
        let failCount = 0;

        const mainToastId = toast.loading(
            total > 1 ? `Subiendo ${total} archivos...` : 'Subiendo archivo...'
        );

        try {
            await Promise.all(
                (filesArray as File[]).map(async (file: File) => {
                    try {
                        await mediaService.uploadFile(file, targetFolder);
                        successCount++;
                        if (total > 1) {
                            toast.loading(`Progreso: ${successCount}/${total} archivos`, { id: mainToastId });
                        }
                    } catch (err) {
                        failCount++;
                        console.error(`Error subiendo ${file.name}:`, err);
                    }
                })
            );

            if (failCount === 0) {
                toast.success(total > 1 ? `${total} archivos subidos con éxito` : 'Archivo subido con éxito', { id: mainToastId });
            } else if (successCount > 0) {
                toast.success(`${successCount} subidos, ${failCount} fallaron`, { id: mainToastId });
            } else {
                toast.error('Error al subir los archivos', { id: mainToastId });
            }

            loadMedia(true);
        } catch (error: any) {
            console.error('Batch upload error:', error);
            toast.error('Ocurrió un error inesperado', { id: mainToastId });
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

    const folders = ['all', 'products', 'hero', 'branding', 'files'];

    const paginationUI = totalPages > 1 ? (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 border border-slate-200">
            <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">
                Mostrando {Math.min(sortedFiles.length, (currentPage - 1) * itemsPerPage + 1)}-{Math.min(sortedFiles.length, currentPage * itemsPerPage)} de {sortedFiles.length} archivos
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
        <div className="space-y-8 min-h-[600px] flex flex-col">
            {/* Toolbar */}
            {/* Toolbar - New Organized Layout */}
            <div className="space-y-4">
                {/* Main Actions Row */}
                <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-white p-4 md:p-6 border border-slate-200 shadow-sm">
                    {/* Search Bar */}
                    <div className="relative flex-grow max-w-xl">
                        <FontAwesomeIcon icon={faSearch} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-xs" />
                        <input
                            type="text"
                            placeholder="Buscar por nombre..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-4 border border-slate-100 focus:border-gold outline-none text-xs bg-slate-50/50"
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleScanUnused}
                            disabled={isScanning}
                            className={`flex items-center gap-2 px-4 py-4 text-[10px] font-bold uppercase tracking-widest transition-all border ${isScanning ? 'opacity-50' : showOnlyUnused ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-slate-50 text-slate-500 border-slate-100 hover:text-gold'}`}
                            title="Buscar archivos que no se usan en ninguna sección"
                        >
                            <FontAwesomeIcon icon={faSearch} className={isScanning ? 'animate-pulse' : ''} />
                            {isScanning ? 'Escaneando...' : showOnlyUnused ? 'Viendo Sin Uso' : 'Detectar Sin Uso'}
                        </button>

                        <button
                            onClick={() => {
                                setShowOnlyUnused(false);
                                setUnusedUrls(new Set());
                                loadMedia();
                            }}
                            className="p-4 text-slate-400 hover:text-gold transition-colors border border-slate-100 bg-slate-50/30"
                            title="Actualizar Galería"
                        >
                            <FontAwesomeIcon icon={faSync} className={loading ? 'animate-spin' : ''} />
                        </button>
                        
                        <label className={`flex-grow lg:flex-grow-0 flex items-center justify-center gap-3 px-8 py-4 bg-chocolate text-gold text-[10px] font-bold uppercase tracking-[0.2em] cursor-pointer hover:bg-gold hover:text-chocolate transition-all shadow-xl active:scale-95 ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                            <FontAwesomeIcon icon={uploading ? faSync : faImage} className={uploading ? 'animate-spin' : ''} />
                            {uploading ? 'Subiendo...' : 'Subir Archivo'}
                            <input type="file" className="hidden" onChange={handleUpload} accept={ALL_ALLOWED_FORMATS.join(',')} multiple />
                        </label>
                    </div>
                </div>

                {/* Filters & Display Row */}
                <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4 bg-white p-3 md:p-4 border border-slate-200">
                    <div className="flex flex-wrap items-center gap-4">
                        {/* Sort Bar */}
                        <div className="flex items-center gap-1 bg-slate-50 p-1 border border-slate-100 rounded">
                            <span className="text-[8px] uppercase font-black text-slate-400 px-3 py-1">Ordenar:</span>
                            {[
                                { key: 'name', label: 'Nombre' },
                                { key: 'size', label: 'Tamaño' },
                                { key: 'date', label: 'Fecha' }
                            ].map(opt => (
                                <button
                                    key={opt.key}
                                    onClick={() => requestSort(opt.key)}
                                    className={`px-4 py-2 text-[9px] uppercase font-bold tracking-widest transition-all rounded ${sortConfig?.key === opt.key ? 'bg-white text-gold shadow-sm ring-1 ring-gold/10' : 'text-slate-400 hover:text-chocolate'}`}
                                >
                                    {opt.label}
                                    {sortConfig?.key === opt.key && (
                                        <FontAwesomeIcon icon={sortConfig.direction === 'asc' ? faSort : faSortAmountDown} className="ml-2" />
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* View Switcher */}
                        <div className="flex bg-slate-50 p-1 border border-slate-100 rounded">
                            <button
                                onClick={() => setViewType('grid')}
                                className={`px-4 py-2 text-xs transition-all rounded ${viewType === 'grid' ? 'bg-white text-gold shadow-sm ring-1 ring-gold/10' : 'text-slate-400 hover:text-chocolate'}`}
                                title="Vista Cuadrícula"
                            >
                                <FontAwesomeIcon icon={faTh} />
                            </button>
                            <button
                                onClick={() => setViewType('list')}
                                className={`px-4 py-2 text-xs transition-all rounded ${viewType === 'list' ? 'bg-white text-gold shadow-sm ring-1 ring-gold/10' : 'text-slate-400 hover:text-chocolate'}`}
                                title="Vista Detallada"
                            >
                                <FontAwesomeIcon icon={faList} />
                            </button>
                        </div>
                    </div>

                    {/* Categorías / Carpetas */}
                    <div className="flex items-center gap-2 bg-slate-50 p-1 overflow-x-auto no-scrollbar border border-slate-100 rounded">
                        <span className="text-[8px] uppercase font-black text-slate-400 px-3 hidden sm:block">Filtro:</span>
                        {folders.map(folder => (
                            <button
                                key={folder}
                                onClick={() => setFilterFolder(folder)}
                                className={`flex-shrink-0 px-4 py-2 text-[10px] uppercase font-bold tracking-widest transition-all rounded ${filterFolder === folder
                                    ? 'bg-white text-gold shadow-sm ring-1 ring-gold/10'
                                    : 'text-slate-400 hover:text-chocolate'
                                    }`}
                            >
                                {folder === 'all' ? 'Ver Todo' : folder}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Security Note */}
            <div className="bg-blue-50/50 p-4 border-l-4 border-blue-400 flex items-center gap-4">
                <FontAwesomeIcon icon={faLock} className="text-blue-400" />
                <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500">
                    Seguridad Activa: Formatos permitidos: JPG, PNG, WEBP, GIF, SVG, PDF. Tamaño máx: 15MB.
                </p>
            </div>

            {paginationUI}

            {/* Content grid */}
            {loading ? (
                <div className="flex-grow flex items-center justify-center py-20">
                    <div className="flex flex-col items-center gap-4 text-slate-400">
                        <div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                        <p className="text-[10px] uppercase tracking-widest font-bold">Escaneando Storage...</p>
                    </div>
                </div>
            ) : sortedFiles.length === 0 ? (
                <div className="flex-grow flex flex-col items-center justify-center py-20 text-slate-300 space-y-4 border-2 border-dashed border-slate-100">
                    <FontAwesomeIcon icon={faImage} className="text-5xl opacity-20" />
                    <p className="font-serif text-lg">No se encontraron archivos</p>
                    <p className="text-[10px] uppercase tracking-widest">Intenta cambiar el filtro o subir nuevos archivos</p>
                </div>
            ) : viewType === 'grid' ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 overflow-y-auto pr-2 pb-10">
                    <AnimatePresence>
                        {paginatedFiles.map((file, idx) => {
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
                                    {/* Unused Indicator */}
                                    {unusedUrls.has(file.url) && (
                                        <div className="absolute top-10 left-2 px-2 py-0.5 bg-amber-500 text-[7px] text-white font-black uppercase tracking-widest z-10 shadow-sm animate-pulse">
                                            Sin Uso detectado
                                        </div>
                                    )}

                                    {/* Preview */}
                                    {isPdf ? (
                                        <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-slate-100 p-4">
                                            <div className="w-12 h-12 bg-red-50 text-red-500 flex items-center justify-center rounded-lg">
                                                <span className="font-bold text-lg">PDF</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <img src={file.url} alt={file.name} className={`w-full h-full transition-transform group-hover:scale-110 ${file.folder === 'products' ? 'object-contain p-2 bg-white' : 'object-cover'}`} loading="lazy" />
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
                                            <>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setPreviewImage(file);
                                                    }}
                                                    className="w-10 h-10 bg-white/20 text-white hover:bg-white hover:text-chocolate rounded-full transition-all flex items-center justify-center mb-2"
                                                    title="Ver en grande"
                                                >
                                                    <FontAwesomeIcon icon={faEye} />
                                                </button>
                                                <button
                                                    onClick={() => onSelect?.(file.url)}
                                                    className="bg-gold text-chocolate px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-white transition-all shadow-xl"
                                                >
                                                    <FontAwesomeIcon icon={faCheck} className="mr-2" /> Seleccionar
                                                </button>
                                            </>
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
                                                    <button
                                                        onClick={() => setPreviewImage(file)}
                                                        className="w-10 h-10 bg-white/20 text-white hover:bg-white hover:text-chocolate rounded-full transition-all flex items-center justify-center"
                                                        title="Ver en grande"
                                                    >
                                                        <FontAwesomeIcon icon={faEye} />
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
            ) : (
                <div className="bg-white border border-slate-200 overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-slate-400">Miniatura</th>
                                <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-slate-400">Nombre</th>
                                <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-slate-400 text-center">Formato</th>
                                <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-slate-400 text-center">Tamaño</th>
                                <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-slate-400 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {paginatedFiles.map(file => (
                                <tr key={`${file.folder}-${file.name}`} className="hover:bg-slate-50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <img src={file.url} className="w-12 h-12 object-cover rounded border border-slate-100" alt="" />
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-bold text-slate-800 truncate max-w-xs">{file.name}</p>
                                        <p className="text-[10px] text-slate-400 uppercase tracking-widest">{file.folder}</p>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[8px] font-black uppercase tracking-tighter border border-slate-200 rounded">
                                            {file.metadata?.mimetype?.split('/').pop()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                        {formatSize(file.metadata?.size || 0)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-end gap-2">
                                            {allowSelection ? (
                                                <>
                                                    <button onClick={() => setPreviewImage(file)} className="p-2 border border-slate-100 hover:bg-gold hover:text-white transition-all rounded shadow-sm" title="Ver en grande">
                                                        <FontAwesomeIcon icon={faEye} className="text-xs" />
                                                    </button>
                                                    <button onClick={() => onSelect?.(file.url)} className="px-4 py-2 bg-gold text-chocolate text-[10px] font-bold uppercase tracking-widest hover:bg-chocolate hover:text-white transition-all">
                                                        Seleccionar
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button onClick={() => copyToClipboard(file.url)} className="p-2 border border-slate-100 hover:bg-gold hover:text-white transition-all rounded shadow-sm" title="Copiar URL">
                                                        <FontAwesomeIcon icon={faCopy} className="text-xs" />
                                                    </button>
                                                    <button onClick={() => setPreviewImage(file)} className="p-2 border border-slate-100 hover:bg-gold hover:text-white transition-all rounded shadow-sm" title="Ver en grande">
                                                        <FontAwesomeIcon icon={faEye} className="text-xs" />
                                                    </button>
                                                    <a href={file.url} target="_blank" rel="noopener noreferrer" className="p-2 border border-slate-100 hover:bg-gold hover:text-white transition-all rounded shadow-sm">
                                                        <FontAwesomeIcon icon={faExternalLinkAlt} className="text-xs" />
                                                    </a>
                                                    <button onClick={() => setConfirmDelete({ isOpen: true, file })} className="p-2 border border-slate-100 hover:bg-red-500 hover:text-white transition-all rounded shadow-sm">
                                                        <FontAwesomeIcon icon={faTrash} className="text-xs" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {paginationUI}

            <ConfirmModal
                isOpen={confirmDelete.isOpen}
                title="Eliminar Archivo"
                message={`¿Estás seguro de que deseas eliminar "${confirmDelete.file?.name}"? Esta acción no se puede deshacer y el archivo desaparecerá de todos los productos que lo usen.`}
                onConfirm={handleDelete}
                onCancel={() => setConfirmDelete({ isOpen: false, file: null })}
                confirmLabel="Eliminar Permanentemente"
                variant="danger"
            />

            {/* Image Preview Modal */}
            <AnimatePresence>
                {previewImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 bg-black/80 backdrop-blur-sm"
                        onClick={() => setPreviewImage(null)}
                    >
                        <button
                            onClick={() => setPreviewImage(null)}
                            className="absolute top-6 right-6 w-12 h-12 flex items-center justify-center text-white bg-white/10 rounded-full hover:bg-white/20 transition-all z-50"
                        >
                            <FontAwesomeIcon icon={faTimes} className="text-xl" />
                        </button>
                        <motion.img
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.9 }}
                            src={previewImage.url}
                            alt={previewImage.name}
                            className="max-w-full max-h-full object-contain rounded-md shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
