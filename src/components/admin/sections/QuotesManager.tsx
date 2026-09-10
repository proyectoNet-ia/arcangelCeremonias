import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { quoteService } from '../../../services/quoteService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faFileLines,
    faSearch,
    faDownload,
    faCalendar,
    faSpinner,
    faUser,
    faFileAlt
} from '@fortawesome/free-solid-svg-icons';
import toast from 'react-hot-toast';

interface Quote {
    id: string;
    user_name: string;
    user_company?: string;
    user_phone: string;
    user_email: string;
    total_amount: number;
    pdf_url: string;
    txt_url?: string;
    status: string;
    created_at: string;
}

export const QuotesManager: React.FC = () => {
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchQuotes = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('quotes')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setQuotes(data || []);
        } catch (error) {
            console.error('Error fetching quotes:', error);
            toast.error('Error al cargar cotizaciones');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQuotes();
    }, []);

    const filteredQuotes = quotes.filter(q => 
        q.user_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        q.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (q.user_company && q.user_company.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleDownloadTxt = async (quote: Quote, index: number) => {
        try {
            toast.loading('Generando archivo Ensamblex...', { id: 'txt-dl' });
            
            // Si ya existe la URL pública directa
            if (quote.txt_url) {
                window.open(quote.txt_url, '_blank');
                toast.success('Descargando archivo TXT...', { id: 'txt-dl' });
                return;
            }

            // Si no tiene txt_url, consultar los items de la cotización
            const { data: items, error } = await supabase
                .from('quote_items')
                .select('*')
                .eq('quote_id', quote.id);

            if (error) throw error;

            const consecutiveNumber = quotes.length - index;

            const mappedItems = (items || []).map(i => {
                let code = '';
                let size = '';
                let color = '';

                const codeMatch = i.product_name.match(/\[(.*?)\]/);
                if (codeMatch) code = codeMatch[1];

                const sizeMatch = i.product_name.match(/Talla:\s*([^|)]+)/i);
                if (sizeMatch) size = sizeMatch[1].trim();

                const colorMatch = i.product_name.match(/Color:\s*([^)]+)/i);
                if (colorMatch) color = colorMatch[1].trim();

                return {
                    id: i.product_id || i.id,
                    cartItemId: i.id,
                    name: i.product_name,
                    price: i.unit_price,
                    quantity: i.quantity,
                    code: code || '23303',
                    size: size || 'U',
                    color: color || 'BC'
                };
            });

            const { filename, blob } = quoteService.generateEnsamblexTXT(mappedItems, consecutiveNumber);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            toast.success(`Archivo ${filename} generado con éxito`, { id: 'txt-dl' });
        } catch (e) {
            console.error('Error generando TXT:', e);
            toast.error('Error al generar archivo TXT', { id: 'txt-dl' });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                <div>
                    <h1 className="text-2xl font-serif text-slate-800 flex items-center gap-2.5">
                        <FontAwesomeIcon icon={faFileLines} className="text-[#C5A059]" />
                        Historial de Cotizaciones
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Revisa y descarga los PDF de cotización y los archivos TXT para Ensamblex ERP.
                    </p>
                </div>
                
                <div className="relative w-full md:w-72">
                    <FontAwesomeIcon icon={faSearch} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                    <input
                        type="text"
                        placeholder="Buscar por cliente o correo..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C5A059]/30 focus:border-[#C5A059] transition-all text-sm"
                    />
                </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-12 flex justify-center items-center">
                        <FontAwesomeIcon icon={faSpinner} className="animate-spin text-[#C5A059] text-2xl" />
                    </div>
                ) : filteredQuotes.length === 0 ? (
                    <div className="p-12 text-center text-slate-500">
                        <FontAwesomeIcon icon={faFileLines} className="mx-auto mb-4 text-slate-300 text-4xl block" />
                        <p>No se encontraron cotizaciones.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4">Cliente / Contacto</th>
                                    <th className="px-6 py-4">Monto Total</th>
                                    <th className="px-6 py-4">Fecha</th>
                                    <th className="px-6 py-4 text-right">Archivos</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredQuotes.map((quote, index) => (
                                    <tr key={quote.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-800 flex items-center gap-2">
                                                    <FontAwesomeIcon icon={faUser} className="text-[#C5A059] text-xs" />
                                                    {quote.user_name}
                                                </span>
                                                {quote.user_company && (
                                                    <span className="text-xs text-slate-500 mt-0.5">Empresa: {quote.user_company}</span>
                                                )}
                                                <span className="text-xs text-slate-500 mt-1">{quote.user_email} • {quote.user_phone}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-bold text-slate-800">
                                                ${quote.total_amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-slate-600">
                                                <FontAwesomeIcon icon={faCalendar} className="text-xs text-slate-400" />
                                                <span>{new Date(quote.created_at).toLocaleDateString('es-MX', {
                                                    day: 'numeric', month: 'short', year: 'numeric'
                                                })}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="inline-flex items-center gap-2">
                                                {quote.pdf_url ? (
                                                    <a 
                                                        href={quote.pdf_url} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors"
                                                        title="Ver PDF"
                                                    >
                                                        <FontAwesomeIcon icon={faDownload} className="text-xs text-slate-500" />
                                                        PDF
                                                    </a>
                                                ) : null}
                                                
                                                <button 
                                                    onClick={() => handleDownloadTxt(quote, index)}
                                                    className="inline-flex items-center gap-1.5 bg-[#C5A059]/10 hover:bg-[#C5A059]/20 text-[#8B643C] px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors"
                                                    title="Descargar archivo .TXT para Ensamblex ERP"
                                                >
                                                    <FontAwesomeIcon icon={faFileAlt} className="text-xs text-[#C5A059]" />
                                                    TXT (Ensamblex)
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};
