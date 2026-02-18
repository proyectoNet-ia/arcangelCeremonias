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

  // Background image
  // OPCIÓN 1 (ANTERIOR): Bebé con cruz - Se mantiene por si se quiere regresar
  // const bgImageUrl = "https://img.freepik.com/foto-gratis/vista-lateral-lindo-bebe-sosteniendo-cruz_23-2149453491.jpg?t=st=1771026261~exp=1771029861~hmac=d8b6dee3e13a430c6c0b590acc23d57e9fe20926fb37a17dc37f6a61371cf171";

  // OPCIÓN 2 (NUEVA): Niño de traje azul
  // NOTA: Usamos la versión "raw" de GitHub para que cargue la imagen directamente
  const bgImageUrl = "https://raw.githubusercontent.com/proyectoNet-ia/arcangelCeremonias/d9a8db97fad8224e746dfc117386d6163641fcc7/fondo_bg.jpeg";

  return (
    <div className="relative h-[100dvh] w-full flex flex-col justify-between overflow-hidden bg-cream cursor-none selection:bg-gold/30 font-sans">

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

      {/* 2. Overlays for readability and mood - ENHANCED FOR CONTRAST */}
      {/* Capa oscura base para bajar el brillo de fondos claros */}
      <div className="fixed inset-0 z-[1] bg-black/40"></div>
      {/* Tinte de color de marca */}
      <div className="fixed inset-0 z-[1] bg-chocolate/40 mix-blend-multiply"></div>
      {/* Gradiente para profundidad y legibilidad en extremos */}
      <div className="fixed inset-0 z-[1] bg-gradient-to-t from-chocolate/95 via-transparent to-chocolate/40 opacity-90"></div>

      {/* 3. Texture: Noise & Marble */}
      <div className="fixed inset-0 z-[2] opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/marble-similar.png')]"></div>
      <div className="fixed inset-0 z-[2] opacity-[0.07] pointer-events-none bg-noise"></div>

      {/* --- CONTENT --- */}
      <div className="relative z-10 flex flex-col flex-grow items-center justify-center p-6 md:p-12 w-full h-full drop-shadow-lg">

        {/* Top: Logo */}
        <header className="absolute top-0 left-0 w-full p-6 md:p-12 flex justify-center fade-in-down">
          <div className="w-48 md:w-64 opacity-90 transition-transform duration-700 hover:scale-105 hover:opacity-100 drop-shadow-md">
            <div className="invert brightness-0 contrast-200 sepia-[.3] hue-rotate-[10deg] saturate-[.5]">
              <Logo />
            </div>
          </div>
        </header>

        {/* Center: Main Message */}
        <main className="flex flex-col items-center text-center space-y-3 md:space-y-8 max-w-5xl mx-auto mt-0 md:mt-8">

          <h1 className="flex flex-col items-center justify-center leading-[0.85] font-serif text-cream">
            <span className="block text-3xl md:text-4xl lg:text-[5.8rem] tracking-tighter mix-blend-overlay reveal-text delay-500 uppercase">
              Próximamente
            </span>
          </h1>

          <div className="h-[1px] w-24 bg-cream/30 my-4 md:my-5 reveal-line delay-1000"></div>

          <p className="max-w-2xl text-cream/90 text-sm md:text-base font-light tracking-wide leading-relaxed reveal-text delay-1000 px-4">
            Este año inicia una nueva etapa en Arcángel!<br /><br />
            Nos estamos renovando para seguir creciendo con ustedes, manteniendo nuestra esencia con un compromiso aún más fuerte con la calidad y atención al detalle, para seguir acompañando momentos llenos de significado.<br /><br />
            Próximamente nuevo catálogo disponible!
          </p>

        </main>

        {/* Bottom: Footer Info */}
        <footer className="absolute bottom-0 w-full pb-4 md:pb-12 flex flex-col items-center justify-end text-center fade-in-up z-20 pointer-events-none">

          <div className="flex flex-col items-center gap-3 md:gap-6 pointer-events-auto">

            <div className="flex flex-row gap-8 md:gap-24">

              {/* Call Center */}
              <div className="flex flex-col items-center gap-1 md:gap-2">
                <span className="text-[9px] md:text-xs text-cream/70 uppercase tracking-[0.2em] font-medium">
                  Call Center
                </span>
                <a
                  href="https://wa.me/523521681197"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lg md:text-2xl text-cream font-serif tracking-widest hover:text-gold transition-colors duration-300"
                >
                  352 168 1197
                </a>
              </div>

              {/* Empresa */}
              <div className="flex flex-col items-center gap-1 md:gap-2">
                <span className="text-[9px] md:text-xs text-cream/70 uppercase tracking-[0.2em] font-medium">
                  Empresa
                </span>
                <a
                  href="tel:+523525262502"
                  className="text-lg md:text-2xl text-cream font-serif tracking-widest hover:text-gold transition-colors duration-300"
                >
                  352 52 62502
                </a>
              </div>
            </div>

            {/* Facebook */}
            <a
              href="https://www.facebook.com/arcangel.ceremonias/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[9px] md:text-xs text-cream/60 uppercase tracking-[0.2em] font-medium hover:text-gold transition-colors duration-300 pb-2"
            >
              Facebook
            </a>

          </div>
        </footer>

      </div>
    </div>
  );
};

export default App;
