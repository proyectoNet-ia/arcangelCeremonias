import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faUserPlus, faTrash, faKey, faTimes, faUserShield, faCog, faSave
} from '@fortawesome/free-solid-svg-icons';
import { useAuth, Profile } from '@/context/AuthContext';
import { userService } from '@/services/userService';
import { ConfirmModal } from '../ConfirmModal';
import toast from 'react-hot-toast';

export const UsersManager: React.FC = () => {
    const { isAdmin, user: currentUser } = useAuth();
    const [users, setUsers] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newUser, setNewUser] = useState({ email: '', password: '', fullName: '', role: 'editor' });
    const [isSaving, setIsSaving] = useState(false);
    const [resetModal, setResetModal] = useState<{ isOpen: boolean, userId: string, userEmail: string, newPassword: '' }>({
        isOpen: false,
        userId: '',
        userEmail: '',
        newPassword: ''
    });

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
            onConfirm: () => handleUpdateRole(userId, newRole as 'admin' | 'editor')
        });
    };

    const handleUpdateRole = async (userId: string, newRole: 'admin' | 'editor') => {
        const success = await userService.updateRole(userId, newRole);
        if (success) {
            toast.success('Rol actualizado con éxito');
            fetchUsers();
            setConfirmModal(prev => ({ ...prev, isOpen: false }));
        } else {
            toast.error('Error al actualizar rol');
        }
    };

    const triggerDeleteUser = (userId: string, email: string) => {
        setConfirmModal({
            isOpen: true,
            title: 'Eliminar Usuario',
            message: `¿Estás seguro de que deseas eliminar permanentemente a ${email}?`,
            onConfirm: () => handleDeleteUser(userId)
        });
    };

    const handleDeleteUser = async (userId: string) => {
        try {
            const success = await userService.deleteProfile(userId);
            if (success) {
                toast.success('Usuario eliminado');
                fetchUsers();
                setConfirmModal(prev => ({ ...prev, isOpen: false }));
            } else {
                toast.error('No se pudo eliminar');
            }
        } catch (error) {
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
            await userService.createUser(newUser.email, newUser.password, newUser.fullName, newUser.role as 'admin' | 'editor');
            toast.success('Usuario creado');
            setIsCreateModalOpen(false);
            setNewUser({ email: '', password: '', fullName: '', role: 'editor' });
            fetchUsers();
        } catch (error: any) {
            toast.error(error.message || 'Error al crear usuario');
        } finally {
            setIsSaving(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!resetModal.newPassword || resetModal.newPassword.length < 6) {
            toast.error('Mínimo 6 caracteres');
            return;
        }

        try {
            setIsSaving(true);
            await userService.resetPassword(resetModal.userId, resetModal.newPassword);
            toast.success('Contraseña actualizada');
            setResetModal({ ...resetModal, isOpen: false, newPassword: '' });
        } catch (error: any) {
            toast.error(error.message || 'Error al restablecer');
        } finally {
            setIsSaving(false);
        }
    };

    if (!isAdmin) {
        return (
            <div className="flex flex-col items-center justify-center p-20 text-center">
                <FontAwesomeIcon icon={faUserShield} className="text-6xl text-slate-200 mb-6" />
                <h2 className="font-serif text-2xl text-slate-400">Acceso Restringido</h2>
                <p className="text-slate-400 text-sm italic">Solo los administradores generales pueden gestionar usuarios.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div className="space-y-1">
                    <h2 className="text-3xl font-serif text-slate-800">Cuentas de Acceso</h2>
                    <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Gestión de privilegios administrativos</p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="w-full sm:w-auto bg-gold text-chocolate px-6 py-3 text-[10px] uppercase font-bold tracking-widest hover:bg-chocolate hover:text-white transition-all shadow-lg flex items-center justify-center gap-2"
                >
                    <FontAwesomeIcon icon={faUserPlus} /> Nuevo Usuario
                </button>
            </div>

            <div className="bg-white border border-slate-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-8 py-4 text-[10px] uppercase tracking-widest font-bold text-slate-400">Perfil</th>
                                <th className="px-8 py-4 text-[10px] uppercase tracking-widest font-bold text-slate-400">Permisos</th>
                                <th className="hidden md:table-cell px-8 py-4 text-[10px] uppercase tracking-widest font-bold text-slate-400">Registro</th>
                                <th className="px-8 py-4 text-[10px] uppercase tracking-widest font-bold text-slate-400 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan={4} className="p-12 text-center text-slate-300 animate-pulse">Consultando base de datos...</td></tr>
                            ) : users.length === 0 ? (
                                <tr><td colSpan={4} className="p-12 text-center text-slate-300">Vacío</td></tr>
                            ) : users.map(user => (
                                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-gold/10 text-gold rounded-full flex items-center justify-center font-bold text-xs uppercase">
                                                {user.email?.[0] || 'U'}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-700 text-sm">{user.full_name || 'Sin nombre'}</p>
                                                <p className="text-[10px] text-slate-400">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest ${user.role === 'admin' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="hidden md:table-cell px-8 py-6 text-xs text-slate-400">
                                        {new Date(user.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => triggerUpdateRole(user.id, user.role as any)} className="text-[9px] uppercase font-bold text-gold border-b border-gold/20 hover:text-chocolate transition-all">Alternar Rol</button>
                                            <button onClick={() => setResetModal({ isOpen: true, userId: user.id, userEmail: user.email, newPassword: '' })} className="p-2 text-slate-300 hover:text-gold transition-colors"><FontAwesomeIcon icon={faKey} /></button>
                                            {user.id !== currentUser?.id && (
                                                <button onClick={() => triggerDeleteUser(user.id, user.email)} className="p-2 text-slate-300 hover:text-red-500 transition-colors"><FontAwesomeIcon icon={faTrash} /></button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="bg-slate-50 p-8 border border-slate-200">
                <h4 className="text-[10px] uppercase tracking-widest font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <FontAwesomeIcon icon={faUserShield} className="text-gold" /> Jerarquía de Accesos
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs leading-relaxed text-slate-500">
                    <div className="space-y-1">
                        <p className="font-bold text-chocolate uppercase text-[9px]">Admin (Maestro)</p>
                        <p>Total control. Gestión de inventario, finanzas (si aplica), banners y toda la configuración global, incluyendo el borrado de otros usuarios.</p>
                    </div>
                    <div className="space-y-1">
                        <p className="font-bold text-slate-400 uppercase text-[9px]">Editor (Operativo)</p>
                        <p>Solo puede modificar catálogo de productos y categorías. No tiene acceso a la configuración técnica ni a otros usuarios.</p>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {isCreateModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => !isSaving && setIsCreateModalOpen(false)} />
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative bg-white w-full max-w-md shadow-2xl border border-gold/20 flex flex-col focus:outline-none">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
                                <h3 className="text-xl font-serif">Alta de Usuario</h3>
                                <button onClick={() => !isSaving && setIsCreateModalOpen(false)} className="text-slate-300"><FontAwesomeIcon icon={faTimes} /></button>
                            </div>
                            <form onSubmit={handleCreateUser} className="p-8 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-bold text-slate-400">Nombre</label>
                                    <input required type="text" className="w-full p-4 bg-slate-50 border border-slate-100 outline-none text-sm" value={newUser.fullName} onChange={e => setNewUser({ ...newUser, fullName: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-bold text-slate-400">Email</label>
                                    <input required type="email" className="w-full p-4 bg-slate-50 border border-slate-100 outline-none text-sm" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase font-bold text-slate-400">Clave</label>
                                        <input required type="password" minLength={6} className="w-full p-4 bg-slate-50 border border-slate-100 outline-none text-sm" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase font-bold text-slate-400">Privilegio</label>
                                        <select className="w-full p-4 bg-slate-50 border border-slate-100 outline-none text-sm h-full" value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })}>
                                            <option value="editor">Editor</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>
                                </div>
                                <button disabled={isSaving} type="submit" className="w-full bg-chocolate text-white py-4 font-bold uppercase tracking-widest hover:bg-gold hover:text-chocolate transition-all shadow-xl">
                                    {isSaving ? 'Registrando...' : 'Crear Usuario'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                title={confirmModal.title}
                message={confirmModal.message}
                onConfirm={confirmModal.onConfirm}
                onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                confirmLabel="Confirmar"
                variant="warning"
            />

            <AnimatePresence>
                {resetModal.isOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => !isSaving && setResetModal({ ...resetModal, isOpen: false })} />
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="relative bg-white w-full max-w-sm p-8 flex flex-col gap-6 focus:outline-none">
                            <h3 className="text-xl font-serif">Restablecer Clave</h3>
                            <input type="password" required minLength={6} className="w-full p-4 border border-slate-100 outline-none text-sm" placeholder="Nueva contraseña" value={resetModal.newPassword} onChange={e => setResetModal({ ...resetModal, newPassword: e.target.value as any })} />
                            <div className="flex gap-4">
                                <button onClick={() => setResetModal({ ...resetModal, isOpen: false })} className="flex-grow p-4 text-[10px] uppercase font-bold text-slate-400">Cancelar</button>
                                <button onClick={handleResetPassword} disabled={isSaving} className="flex-grow bg-chocolate text-gold p-4 font-bold uppercase text-[10px] tracking-widest">Guardar</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
