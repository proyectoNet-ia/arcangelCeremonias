import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

interface SubCategory {
    name: string;
    slug: string;
}

interface MainCategory {
    title: string;
    slug: string;
    subcategories: SubCategory[];
}

const menuData: MainCategory[] = [
    {
        title: 'Bautizo',
        slug: 'bautizo',
        subcategories: [
            { name: 'Ropón Niña', slug: 'ropon-nina' },
            { name: 'Ropón Niño', slug: 'ropon-nino' },
        ]
    },
    {
        title: 'Traje Charro',
        slug: 'traje-charro',
        subcategories: [
            { name: 'Con Virgen Blanco', slug: 'con-virgen-blanco' },
            { name: 'Con Virgen Beige', slug: 'con-virgen-beige' },
            { name: 'Con Virgen Negro', slug: 'con-virgen-negro' },
            { name: 'Clásico Azul Rey', slug: 'clasico-azul-rey' },
            { name: 'Clásico Beige', slug: 'clasico-beige' },
            { name: 'Clásico Blanco', slug: 'clasico-blanco' },
            { name: 'Clásico Kaki', slug: 'clasico-kaki' },
            { name: 'Clásico Gris', slug: 'clasico-gris' },
        ]
    },
    {
        title: 'Guayabera',
        slug: 'guayabera',
        subcategories: [
            { name: 'Tropical', slug: 'tropical' },
            { name: 'Chazarilla', slug: 'chazarilla' },
            { name: 'Caribeña', slug: 'caribena' },
            { name: 'Paraíso', slug: 'paraiso' },
            { name: 'Primavera', slug: 'primavera' },
            { name: 'Verano', slug: 'verano' },
            { name: 'Bebé', slug: 'bebe' },
        ]
    },
    {
        title: 'Túnica',
        slug: 'tunica',
        subcategories: [
            { name: 'Modelo 1', slug: 'modelo-1' },
            { name: 'Modelo 2', slug: 'modelo-2' },
        ]
    },
    {
        title: 'Esmoquin',
        slug: 'esmoquin',
        subcategories: [
            { name: 'San Gabriel', slug: 'san-gabriel' },
            { name: 'Celestial', slug: 'celestial' },
        ]
    },
    {
        title: 'Traje',
        slug: 'traje',
        subcategories: [
            { name: 'San Pedro', slug: 'san-pedro' },
            { name: 'San José', slug: 'san-jose' },
            { name: 'Arcángel', slug: 'arcangel' },
        ]
    },
    {
        title: 'Traje de Estola',
        slug: 'traje-estola',
        subcategories: [
            { name: 'Uvas', slug: 'uvas' },
            { name: 'Cruz', slug: 'cruz' },
        ]
    }
];

export const Megamenu: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={isOpen ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className={`absolute top-full left-0 w-full bg-cream border-b border-gold/10 shadow-2xl z-40 ${!isOpen && 'pointer-events-none'}`}
            onMouseLeave={onClose}
        >
            <div className="max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 p-12 lg:p-16">
                {menuData.map((category) => (
                    <div key={category.title} className="space-y-6">
                        <h4 className="text-[10px] uppercase tracking-[0.4em] text-gold font-bold border-b border-gold/10 pb-2">
                            {category.title}
                        </h4>
                        <ul className="space-y-4">
                            {category.subcategories.map((sub) => (
                                <li key={sub.slug}>
                                    <Link
                                        to={`/catalogo?categoria=${category.slug}&subcategoria=${sub.slug}`}
                                        className="text-sm text-chocolate/70 hover:text-gold transition-colors duration-300 font-light block"
                                        onClick={onClose}
                                    >
                                        {sub.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            {/* Visual Accent */}
            <div className="bg-chocolate/5 h-20 flex items-center justify-center px-12">
                <p className="text-[9px] uppercase tracking-[0.5em] text-chocolate/40 italic">
                    Cada pieza cuenta una historia de fe y tradición
                </p>
            </div>
        </motion.div>
    );
};
