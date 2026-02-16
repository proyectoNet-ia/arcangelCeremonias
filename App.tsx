import React, { useEffect, useState } from 'react';
import { Logo } from './components/Logo';

const App: React.FC = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Background image - keeping the one provided as requested
  const bgImageUrl = "https://img.freepik.com/foto-gratis/vista-lateral-lindo-bebe-sosteniendo-cruz_23-2149453491.jpg?t=st=1771026261~exp=1771029861~hmac=d8b6dee3e13a430c6c0b590acc23d57e9fe20926fb37a17dc37f6a61371cf171";

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-hidden bg-cream cursor-none selection:bg-gold/30 font-sans">

      {/* --- CUSTOM CURSOR --- */}
      <div
        className="fixed pointer-events-none z-[100] hidden md:block mix-blend-difference"
        style={{
          left: mousePosition.x,
          top: mousePosition.y,
          transform: 'translate(-50%, -50%)'
        }}
      >
        <div className="w-4 h-4 bg-white/80 rounded-full blur-[1px]" />
        <div className="w-12 h-12 border border-white/40 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ease-out scale-100 opacity-50" />
      </div>

      {/* --- BACKGROUND LAYERS --- */}

      {/* 1. Main Image with slow zoom */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat transition-transform duration-[60s] ease-linear scale-110 motion-safe:animate-[zoom_60s_linear_infinite_alternate]"
        style={{
          backgroundImage: `url('${bgImageUrl}')`,
          backgroundAttachment: 'fixed',
          backgroundPosition: 'center 40%',
          filter: 'sepia(0.2) brightness(0.9) contrast(0.95)'
        }}
      />

      {/* 2. Overlays for readability and mood */}
      <div className="fixed inset-0 z-[1] bg-chocolate/30 mix-blend-multiply"></div>
      <div className="fixed inset-0 z-[1] bg-gradient-to-t from-chocolate/90 via-transparent to-chocolate/40 opacity-80"></div>

      {/* 3. Texture: Noise & Marble */}
      <div className="fixed inset-0 z-[2] opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/marble-similar.png')]"></div>
      <div className="fixed inset-0 z-[2] opacity-[0.07] pointer-events-none bg-noise"></div>

      {/* --- CONTENT --- */}
      <div className="relative z-10 flex flex-col flex-grow items-center justify-center p-6 md:p-12 w-full h-full">

        {/* Top: Logo */}
        <header className="absolute top-0 left-0 w-full p-8 md:p-12 flex justify-center fade-in-down">
          <div className="w-48 md:w-64 opacity-90 transition-transform duration-700 hover:scale-105 hover:opacity-100">
            <div className="invert brightness-0 contrast-200 sepia-[.3] hue-rotate-[10deg] saturate-[.5]">
              <Logo />
            </div>
          </div>
        </header>

        {/* Center: Main Message */}
        <main className="flex flex-col items-center text-center space-y-8 md:space-y-12 max-w-5xl mx-auto mt-32 md:mt-12">

          <div className="overflow-hidden">
            <p className="text-gold/80 text-[10px] md:text-xs tracking-[0.5em] uppercase font-bold reveal-text delay-300">
              Sitio en Construcción
            </p>
          </div>

          <h1 className="flex flex-col items-center justify-center leading-[0.85] font-serif text-cream">
            <span className="block text-4xl md:text-5xl lg:text-[6.5rem] tracking-tighter mix-blend-overlay reveal-text delay-500 uppercase">
              Próximamente
            </span>
          </h1>

          <div className="h-[1px] w-24 bg-cream/30 my-8 reveal-line delay-1000"></div>

          <p className="max-w-md text-cream/70 text-xs md:text-sm font-light tracking-[0.1em] leading-relaxed reveal-text delay-1000">
            EL ARTE DE LA CEREMONIA REINVENTADO.<br />
            COLECCIÓN 2026 EN PROCESO.
          </p>

        </main>

        {/* Bottom: Footer Info */}
        <footer className="absolute bottom-0 w-full p-8 md:p-12 flex flex-col md:flex-row justify-between items-center text-[10px] md:text-[11px] text-cream/40 tracking-[0.2em] font-medium uppercase fade-in-up">
          <div className="mb-4 md:mb-0">
            México, {new Date().getFullYear()}
          </div>

          <div className="flex items-center space-x-8">
            <a href="https://www.facebook.com/arcangel.ceremonias/" className="hover:text-gold transition-colors duration-300">Facebook</a>
            <a href="https://wa.me/523521681197" target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors duration-300">WhatsApp</a>
          </div>
        </footer>

      </div>
    </div>
  );
};

export default App;
