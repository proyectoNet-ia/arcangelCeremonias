import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { FileText, Search, Download, Calendar, Loader2, User } from 'lucide-react';
import toast from 'react-hot-toast';

interface Quote {
    id: string;
    user_name: string;
    user_company?: string;
    user_phone: string;
    user_email: string;
    total_amount: number;
    pdf_url: string;
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

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                <div>
                    <h1 className="text-2xl font-serif text-slate-800 flex items-center gap-2">
                        <FileText className="text-[#C5A059]" />
                        Historial de Cotizaciones
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Revisa y descarga los PDF de las cotizaciones generadas por los usuarios.
                    </p>
                </div>
                
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
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
                        <Loader2 className="animate-spin text-[#C5A059]" size={32} />
                    </div>
                ) : filteredQuotes.length === 0 ? (
                    <div className="p-12 text-center text-slate-500">
                        <FileText className="mx-auto mb-4 text-slate-300" size={48} />
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
                                    <th className="px-6 py-4 text-right">Documento</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredQuotes.map((quote) => (
                                    <tr key={quote.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-800 flex items-center gap-2">
                                                    <User size={14} className="text-[#C5A059]" />
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
                                                <Calendar size={14} />
                                                <span>{new Date(quote.created_at).toLocaleDateString('es-MX', {
                                                    day: 'numeric', month: 'short', year: 'numeric'
                                                })}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {quote.pdf_url ? (
                                                <a 
                                                    href={quote.pdf_url} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                                                >
                                                    <Download size={14} />
                                                    Ver PDF
                                                </a>
                                            ) : (
                                                <span className="text-xs text-slate-400 italic">No disponible</span>
                                            )}
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
