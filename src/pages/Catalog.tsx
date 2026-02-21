import React from 'react';
import { Logo } from '@/components/Logo';
import { Link } from 'react-router-dom';

import { products } from '@/data/products';
import { ProductCard } from '@/components/catalog/ProductCard';

const Catalog: React.FC = () => {
    return (
        <div className="min-h-screen bg-cream font-sans text-chocolate">
            {/* Mini Header */}
            <header className="fixed top-0 w-full bg-cream/80 backdrop-blur-md z-50 border-b border-gold/20 p-4">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <Link to="/" className="w-24 md:w-32">
                        <Logo />
                    </Link>
                    <nav className="flex gap-6 text-sm uppercase tracking-widest font-medium">
                        <Link to="/" className="hover:text-gold transition-colors">Inicio</Link>
                        <span className="text-gold">Catálogo</span>
                    </nav>
                </div>
            </header>

            {/* Hero Section */}
            <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h1 className="font-serif text-4xl md:text-6xl mb-4 animate-reveal-up opacity-0 fill-mode-forwards" style={{ animationDelay: '200ms' }}>Nuestro Catálogo</h1>
                    <div className="h-[2px] w-20 bg-gold mx-auto mb-6"></div>
                    <p className="text-lg text-chocolate/70 max-w-2xl mx-auto animate-reveal-up opacity-0 fill-mode-forwards" style={{ animationDelay: '400ms' }}>
                        Explora nuestra colección exclusiva de alta costura para ceremonias.
                        Cada pieza es diseñada con amor y atención al detalle.
                    </p>
                </div>

                {/* Product Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 animate-reveal-up opacity-0 fill-mode-forwards" style={{ animationDelay: '600ms' }}>
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </main>

            <footer className="bg-chocolate text-cream py-12 px-6">
                <div className="max-w-7xl mx-auto text-center">
                    <div className="w-32 mx-auto mb-8 invert opacity-80">
                        <Logo />
                    </div>
                    <p className="text-sm opacity-60 tracking-widest uppercase">
                        &copy; 2026 Arcángel Ceremonias. Todos los derechos reservados.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default Catalog;
