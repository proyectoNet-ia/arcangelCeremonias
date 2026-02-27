import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faUser, faEnvelope, faEye, faEyeSlash, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

const Login: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Si ya está logueado, redirigir al admin
    React.useEffect(() => {
        if (user) {
            navigate('/admin', { replace: true });
        }
    }, [user, navigate]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!supabase) {
            toast.error('Error de configuración: Supabase no detectado.');
            return;
        }

        try {
            setLoading(true);
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;
            toast.success('Acceso concedido');
            navigate('/admin');
        } catch (error: any) {
            console.error('Login error:', error.message);
            toast.error(error.message === 'Invalid login credentials'
                ? 'Credenciales inválidas. Verifica tu correo y contraseña.'
                : 'Error al iniciar sesión: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-cream flex items-center justify-center p-6 bg-[url('https://www.transparenttextures.com/patterns/pinstriped-suit.png')]">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-white border border-gold/10 shadow-[0_50px_100px_-20px_rgba(62,39,35,0.2)] p-10 md:p-14 relative overflow-hidden"
            >
                {/* Decorative border */}
                <div className="absolute inset-0 border-[1px] border-gold/5 pointer-events-none m-2" />

                <div className="relative z-10 space-y-10">
                    <div className="text-center space-y-4">
                        <div className="w-16 h-16 bg-chocolate text-gold rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                            <FontAwesomeIcon icon={faLock} className="text-2xl" />
                        </div>
                        <h1 className="text-3xl font-serif text-chocolate uppercase tracking-widest">Admin Panel</h1>
                        <p className="text-[10px] uppercase tracking-[0.3em] text-gold font-bold">Arcángel Ceremonias</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-8">
                        <div className="space-y-6">
                            <div className="relative group">
                                <label className="text-[10px] uppercase tracking-widest font-bold text-chocolate/40 block mb-2">Correo Electrónico</label>
                                <div className="relative">
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-slate-50 border-b border-chocolate/10 py-4 pl-12 pr-4 outline-none focus:border-gold transition-colors text-sm font-medium"
                                        placeholder="ejemplo@correo.com"
                                    />
                                    <FontAwesomeIcon icon={faEnvelope} className="absolute left-4 top-1/2 -translate-y-1/2 text-chocolate/20 group-focus-within:text-gold transition-colors" />
                                </div>
                            </div>

                            <div className="relative group">
                                <label className="text-[10px] uppercase tracking-widest font-bold text-chocolate/40 block mb-2">Contraseña</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-slate-50 border-b border-chocolate/10 py-4 pl-12 pr-12 outline-none focus:border-gold transition-colors text-sm font-medium"
                                        placeholder="••••••••"
                                    />
                                    <FontAwesomeIcon icon={faLock} className="absolute left-4 top-1/2 -translate-y-1/2 text-chocolate/20 group-focus-within:text-gold transition-colors" />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-chocolate/20 hover:text-chocolate transition-colors"
                                    >
                                        <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-chocolate text-cream py-5 text-[10px] uppercase tracking-[0.4em] font-bold hover:bg-gold transition-all duration-500 shadow-xl relative overflow-hidden group disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center gap-3">
                                    <div className="w-4 h-4 border-2 border-cream/30 border-t-cream rounded-full animate-spin" />
                                    <span>Verificando...</span>
                                </div>
                            ) : (
                                "Ingresar al Sistema"
                            )}
                            <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none" />
                        </button>
                    </form>

                    <div className="text-center pt-4 space-y-6">
                        <p className="text-[9px] uppercase tracking-widest text-chocolate/30 leading-relaxed">
                            Solo personal autorizado. <br />
                            Todos los intentos fallidos son registrados.
                        </p>

                        <div className="pt-4 border-t border-gold/5">
                            <Link to="/" className="text-[10px] uppercase tracking-[0.2em] text-chocolate/40 hover:text-gold transition-colors flex items-center justify-center gap-2 font-bold group">
                                <FontAwesomeIcon icon={faArrowLeft} className="text-[8px] group-hover:-translate-x-1 transition-transform" />
                                Regresar al sitio
                            </Link>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
