import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { productService } from '@/services/productService';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { MediaGallery } from '@/components/admin/MediaGallery';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Product, Category } from '@/types/product';
import toast from 'react-hot-toast';

// Lazy loading segments for Admin
const DashboardOverview = lazy(() => import('@/components/admin/sections/DashboardOverview').then(m => ({ default: m.DashboardOverview })));
const ProductsManager = lazy(() => import('@/components/admin/sections/ProductsManager').then(m => ({ default: m.ProductsManager })));
const CategoriesManager = lazy(() => import('@/components/admin/sections/CategoriesManager').then(m => ({ default: m.CategoriesManager })));
const HeroManager = lazy(() => import('@/components/admin/sections/HeroManager').then(m => ({ default: m.HeroManager })));
const ConfigManager = lazy(() => import('@/components/admin/sections/ConfigManager').then(m => ({ default: m.ConfigManager })));
const MessagesManager = lazy(() => import('@/components/admin/sections/MessagesManager').then(m => ({ default: m.MessagesManager })));
const UsersManager = lazy(() => import('@/components/admin/sections/UsersManager').then(m => ({ default: m.UsersManager })));

const LoadingSection = () => (
    <div className="h-96 flex items-center justify-center bg-white/50 backdrop-blur-sm rounded-xl border border-slate-100 shadow-sm">
        <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin" />
            <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 animate-pulse">Cargando sección...</p>
        </div>
    </div>
);

const Admin: React.FC = () => {
    const { isAdmin } = useAuth();
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
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
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <AdminLayout>
            {loading && products.length === 0 ? (
                <LoadingSection />
            ) : (
                <Suspense fallback={<LoadingSection />}>
                    <Routes>
                        <Route index element={
                            isAdmin ? (
                                <DashboardOverview products={products} categories={categories} refresh={fetchData} />
                            ) : (
                                <Navigate to="productos" replace />
                            )
                        } />
                        <Route path="productos" element={<ProductsManager products={products} categories={categories} refresh={fetchData} />} />
                        <Route path="categorias" element={<CategoriesManager categories={categories} refresh={fetchData} />} />

                        <Route path="hero" element={
                            <ProtectedRoute requireAdmin>
                                <HeroManager />
                            </ProtectedRoute>
                        } />

                        <Route path="galeria" element={<MediaGallery />} />

                        <Route path="mensajes" element={
                            <ProtectedRoute requireAdmin>
                                <MessagesManager />
                            </ProtectedRoute>
                        } />

                        <Route path="usuarios" element={
                            <ProtectedRoute requireAdmin>
                                <UsersManager />
                            </ProtectedRoute>
                        } />

                        <Route path="configuracion" element={
                            <ProtectedRoute requireAdmin>
                                <ConfigManager />
                            </ProtectedRoute>
                        } />

                        <Route path="*" element={<DashboardOverview products={products} categories={categories} refresh={fetchData} />} />
                    </Routes>
                </Suspense>
            )}
        </AdminLayout>
    );
};

export default Admin;
