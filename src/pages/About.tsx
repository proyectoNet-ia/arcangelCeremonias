import React from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

const About: React.FC = () => {
    return (
        <div className="min-h-screen bg-cream font-sans text-chocolate selection:bg-gold/20">
            <Header />

            <main className="pt-40 pb-20 px-6 md:px-12 max-w-[1200px] mx-auto overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="space-y-8"
                    >
                        <span className="text-[10px] uppercase tracking-[0.4em] text-gold font-semibold">Nuestra Historia</span>
                        <h1 className="text-5xl md:text-7xl font-serif leading-tight">
                            Más de 30 años de <span className="italic text-gold/80">tradición</span>
                        </h1>
                        <div className="h-[1px] w-20 bg-gold/30"></div>
                        <div className="space-y-6 text-chocolate/80 leading-relaxed font-light">
                            <p className="text-lg italic font-serif text-chocolate">
                                "Nuestra misión es ser líderes en la fabricación y manufactura de productos ceremoniales para las nuevas generaciones."
                            </p>
                            <p>
                                Con más de tres décadas en el ramo textil, en Arcángel Ceremonias nos dedicamos a satisfacer las necesidades de nuestros clientes con la más alta calidad y un precio justo.
                            </p>
                            <p>
                                Creemos firmemente en el comercio justo y en la vocación de servir a nuestros clientes con valores fundamentales: calidad, honradez, amabilidad y especial atención a los detalles de cada uno de nuestros productos, que están elaborados con la dedicación y talento de muchas personas.
                            </p>
                            <p>
                                Cada pieza que sale de nuestro taller lleva consigo el compromiso de honrar los momentos más importantes de las familias, vistiendo de elegancia y significado cada ceremonia.
                            </p>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="relative"
                    >
                        <div className="aspect-[4/5] bg-chocolate/5 overflow-hidden">
                            <img
                                src="https://images.unsplash.com/photo-1551028150-64b9f398f678?auto=format&fit=crop&q=80&w=1000"
                                alt="Artesanía Textil"
                                className="w-full h-full object-cover mix-blend-multiply opacity-80"
                            />
                        </div>
                        <div className="absolute -bottom-10 -right-10 w-64 h-64 border border-gold/20 -z-10 hidden md:block"></div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[1px] bg-gold/10 rotate-[25deg] -z-10"></div>
                    </motion.div>
                </div>

                <section className="mt-40 grid grid-cols-1 md:grid-cols-3 gap-12 text-center pb-20">
                    <div className="space-y-4">
                        <span className="text-gold text-2xl font-serif">Honradez</span>
                        <p className="text-[10px] uppercase tracking-widest text-chocolate/60">Compromiso total</p>
                    </div>
                    <div className="space-y-4">
                        <span className="text-gold text-2xl font-serif">Calidad</span>
                        <p className="text-[10px] uppercase tracking-widest text-chocolate/60">Excelencia en cada fibra</p>
                    </div>
                    <div className="space-y-4">
                        <span className="text-gold text-2xl font-serif">Amabilidad</span>
                        <p className="text-[10px] uppercase tracking-widest text-chocolate/60">Atención personalizada</p>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default About;
