import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { faArrowLeft, faChevronRight, faChevronLeft, faShareNodes } from '@fortawesome/free-solid-svg-icons';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Logo } from '@/components/Logo';
import { productService } from '@/services/productService';
import { Product } from '@/types/product';

const ProductDetail: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState(0);
    const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });

    useEffect(() => {
        const fetchProduct = async () => {
            if (!slug) return;
            try {
                setLoading(true);
                const data = await productService.getProductBySlug(slug);
                setProduct(data);
            } catch (error) {
                console.error('Error fetching product:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
        window.scrollTo(0, 0);
    }, [slug]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - left) / width) * 100;
        const y = ((e.clientY - top) / height) * 100;
        setZoomPos({ x, y });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-cream flex items-center justify-center">
                <div className="w-12 h-12 border-2 border-gold border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-cream flex flex-col items-center justify-center space-y-6">
                <h2 className="font-serif text-3xl text-chocolate">Producto no encontrado</h2>
                <Link to="/catalogo" className="text-gold uppercase tracking-widest text-xs hover:underline underline-offset-4">
                    Volver al catálogo
                </Link>
            </div>
        );
    }

    const images = [product.main_image, ...(product.gallery || [])];

    return (
        <div className="min-h-screen bg-cream font-sans text-chocolate selection:bg-gold/20">
            <Header />

            <main className="pt-32 pb-20 px-6 md:px-12 max-w-[1600px] mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-20">

                    {/* Left: Image Gallery */}
                    <div className="lg:col-span-7 space-y-4">
                        <div
                            className="relative aspect-[3/4] overflow-hidden bg-white shadow-sm cursor-zoom-in"
                            onMouseMove={handleMouseMove}
                        >
                            <AnimatePresence mode="wait">
                                <motion.img
                                    key={activeImage}
                                    src={images[activeImage]}
                                    alt={product.name}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.5 }}
                                    style={{
                                        originX: `${zoomPos.x}%`,
                                        originY: `${zoomPos.y}%`
                                    }}
                                    whileHover={{ scale: 2 }}
                                    className="w-full h-full object-cover"
                                />
                            </AnimatePresence>
                        </div>

                        {/* Thumbnails */}
                        {images.length > 1 && (
                            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
                                {images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveImage(idx)}
                                        className={`relative flex-shrink-0 w-24 aspect-[3/4] bg-white transition-opacity duration-300 ${activeImage === idx ? 'ring-1 ring-gold opacity-100' : 'opacity-40 hover:opacity-100'}`}
                                    >
                                        <img src={img} className="w-full h-full object-cover" alt="" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right: Product Details */}
                    <div className="lg:col-span-5 space-y-10 py-4">
                        <div className="space-y-4">
                            <nav className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-chocolate/40 mb-8 font-medium">
                                <Link to="/catalogo" className="hover:text-gold transition-colors">Colección</Link>
                                <FontAwesomeIcon icon={faChevronRight} className="text-[6px]" />
                                <span className="text-chocolate/60">{product.name}</span>
                            </nav>

                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-4xl md:text-5xl xl:text-6xl font-serif text-chocolate leading-tight"
                            >
                                {product.name}
                            </motion.h1>

                            <div className="flex items-center gap-6 pt-2">
                                {product.show_price && product.price ? (
                                    <span className="text-2xl font-sans text-gold">${product.price.toLocaleString('es-MX')}</span>
                                ) : (
                                    <span className="text-sm uppercase tracking-widest text-gold italic font-medium">Precio bajo consulta</span>
                                )}
                                <div className="h-[1px] flex-grow bg-gold/20" />
                            </div>
                        </div>

                        {/* Product Attributes */}
                        <div className="grid grid-cols-2 gap-y-8 border-y border-gold/10 py-8">
                            <div className="space-y-2">
                                <span className="text-[10px] uppercase tracking-[0.2em] text-chocolate/40 font-bold block">Material</span>
                                <p className="text-sm font-light italic">{product.material || 'Premium Fabric'}</p>
                            </div>
                            <div className="space-y-2 text-right">
                                <span className="text-[10px] uppercase tracking-[0.2em] text-chocolate/40 font-bold block">Tallas</span>
                                <p className="text-sm font-light italic">{product.sizes?.join(', ') || 'A medida'}</p>
                            </div>
                            <div className="col-span-2 space-y-2">
                                <span className="text-[10px] uppercase tracking-[0.2em] text-chocolate/40 font-bold block">Incluye</span>
                                <p className="text-sm font-light italic">{product.includes || 'Consulta con un asesor'}</p>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-6">
                            <p className="text-base text-chocolate/70 leading-relaxed font-light">
                                {product.detailed_description || product.description}
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="pt-8 space-y-6">
                            <div className="flex gap-4">
                                <button
                                    onClick={() => window.open(`https://wa.me/523521681197?text=Hola, me gustaría recibir más información y tallas sobre el modelo: ${product.name}`, '_blank')}
                                    className="flex-grow bg-chocolate text-cream py-6 flex items-center justify-center gap-4 group transition-all duration-500 hover:bg-gold hover:shadow-2xl hover:shadow-gold/20"
                                >
                                    <FontAwesomeIcon icon={faWhatsapp} className="text-xl" />
                                    <span className="text-xs uppercase tracking-[0.4em] font-medium">WhatsApp</span>
                                </button>

                                <button
                                    onClick={() => {
                                        if (navigator.share) {
                                            navigator.share({
                                                title: `Arcángel Ceremonias - ${product.name}`,
                                                text: `Mira este producto en Arcángel Ceremonias: ${product.name}`,
                                                url: window.location.href,
                                            }).catch(console.error);
                                        } else {
                                            navigator.clipboard.writeText(window.location.href);
                                            alert('¡Enlace copiado al portapapeles!');
                                        }
                                    }}
                                    className="w-20 bg-white border border-gold/20 text-chocolate flex items-center justify-center hover:bg-gold hover:text-white transition-all duration-500 hover:shadow-xl group"
                                    title="Compartir"
                                >
                                    <FontAwesomeIcon icon={faShareNodes} className="text-lg group-hover:scale-110 transition-transform" />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[9px] uppercase tracking-[0.2em] text-chocolate/40 font-medium">
                                <div className="flex items-center gap-3 bg-white/50 p-4 border border-gold/5 rounded-sm">
                                    <div className="w-2 h-2 bg-gold/40 rounded-full" /> Piezas Artesanales
                                </div>
                                <div className="flex items-center gap-3 bg-white/50 p-4 border border-gold/5 rounded-sm">
                                    <div className="w-2 h-2 bg-gold/40 rounded-full" /> Envío Asegurado
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default ProductDetail;
