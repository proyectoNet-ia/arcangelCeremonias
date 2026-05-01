import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faInbox, faTrash, faEnvelope, faCheckCircle
} from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { contactService, ContactMessage } from '@/services/contactService';
import toast from 'react-hot-toast';

export const MessagesManager: React.FC = () => {
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-250px)] min-h-[600px]">
            <div className="lg:col-span-5 bg-white border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                    <h2 className="text-[10px] uppercase tracking-widest font-bold text-slate-500">Bandeja de Entrada</h2>
                    <span className="bg-gold/10 text-gold text-[10px] px-2 py-1 rounded font-bold">
                        {messages.filter(m => !m.is_read).length} nuevos
                    </span>
                </div>
                <div className="flex-grow overflow-y-auto no-scrollbar">
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
                                className={`p-6 border-b border-slate-50 cursor-pointer transition-all hover:bg-slate-100/50 ${selectedMessage?.id === msg.id ? 'bg-gold/5 border-l-4 border-l-gold' : ''} ${!msg.is_read ? 'bg-white font-bold' : 'opacity-70'}`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-[10px] uppercase tracking-wider text-slate-400">
                                        {msg.name}
                                    </span>
                                    <span className="text-[9px] text-slate-300">
                                        {msg.created_at ? new Date(msg.created_at).toLocaleDateString() : ''}
                                    </span>
                                </div>
                                <h3 className="text-sm truncate mb-1">{msg.subject}</h3>
                                <p className="text-xs text-slate-400 line-clamp-1">{msg.message}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="lg:col-span-7 bg-white border border-slate-200 shadow-sm flex flex-col">
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
                            <div className="bg-slate-50 p-6 rounded-lg border border-slate-100 italic text-slate-600 leading-relaxed whitespace-pre-wrap">
                                {selectedMessage.message}
                            </div>

                            <div className="mt-12 space-y-4">
                                <h4 className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Detalles del Envío</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 border border-slate-100 rounded">
                                        <p className="text-[9px] text-slate-400 uppercase mb-1">Enviado</p>
                                        <p className="text-xs">{selectedMessage.created_at ? new Date(selectedMessage.created_at).toLocaleString() : '-'}</p>
                                    </div>
                                    <div className="p-4 border border-slate-100 rounded">
                                        <p className="text-[9px] text-slate-400 uppercase mb-1">Estado Mail</p>
                                        <p className="text-xs">
                                            {selectedMessage.email_sent ? (
                                                <span className="text-emerald-500 flex items-center gap-2">
                                                    <FontAwesomeIcon icon={faCheckCircle} /> Entregado
                                                </span>
                                            ) : (
                                                <span className="text-slate-400 italic">No aplicable</span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="p-8 bg-slate-50 border-t border-slate-100">
                            <a
                                href={`https://wa.me/${selectedMessage.phone.replace(/[^0-9]/g, '')}?text=Hola ${selectedMessage.name}, te contacto desde Arcangel Ceremonias...`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full bg-emerald-500 text-white flex items-center justify-center gap-3 py-4 rounded font-bold text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-md"
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
                        <p className="text-[10px] uppercase tracking-widest font-bold">Selecciona un mensaje</p>
                    </div>
                )}
            </div>
        </div>
    );
};
