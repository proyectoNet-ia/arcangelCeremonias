import React from 'react';
import { useConfig } from '@/context/ConfigContext';

interface LogoProps {
  className?: string;
  /** 'light' = logo para fondos claros (logo oscuro), 'dark' = logo para fondos oscuros (logo claro/dorado) */
  variant?: 'light' | 'dark';
}

export const Logo: React.FC<LogoProps> = ({ className = "w-full max-w-[400px]", variant = 'light' }) => {
  const { config } = useConfig();

  const logoUrl = variant === 'dark' ? config?.logo_dark_url : config?.logo_light_url;

  // Si hay un logo subido desde el CMS, lo usamos
  if (logoUrl) {
    return (
      <div className={`${className} mb-4`}>
        <img
          src={logoUrl}
          alt={config?.company_name || 'Arcángel Ceremonias'}
          className="w-full h-auto object-contain"
        />
      </div>
    );
  }

  // Fallback: Logo Reconstruido y Elegante
  return (
    <div className={`${className} flex flex-col items-center justify-center text-center reveal`} style={{ animationDelay: '0s' }}>
      <div className="relative flex items-center justify-center gap-4 mb-1">
        {/* Usamos partes del SVG pero agrupadas de forma compacta */}
        <svg
          viewBox="0 0 200 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-12 h-12 md:w-16 md:h-16 shrink-0"
        >
          <g fill={variant === 'dark' ? '#C5A059' : '#3E2723'}>
            {/* Icono de Alas / Angelico simplificado o parte del original */}
            <path d="M100 20C80 20 60 35 60 60C60 85 80 100 100 100C120 100 140 85 140 60C140 35 120 20 100 20ZM100 90C85 90 75 80 75 60C75 40 85 30 100 30C115 30 125 40 125 60C125 80 115 90 100 90Z" opacity="0.2" />
            <path d="M160 40C150 35 140 35 130 40C120 45 115 55 115 65C115 75 120 85 130 90C140 95 150 95 160 90C170 85 175 75 175 65C175 55 170 45 160 40Z" fillOpacity="0.8" />
            <path d="M40 40C50 35 60 35 70 40C80 45 85 55 85 65C85 75 80 85 70 90C60 95 50 95 40 90C30 85 25 75 25 65C25 55 30 45 40 40Z" fillOpacity="0.8" />
          </g>
        </svg>
      </div>

      <div className="flex flex-col items-center">
        <span className="text-3xl md:text-4xl lg:text-5xl font-serif-elegant italic tracking-widest text-inherit" style={{ fontFamily: 'var(--font-serif-elegant)' }}>
          Arcángel
        </span>
        <span className="text-[10px] md:text-xs lg:text-[14px] uppercase tracking-[0.6em] font-serif mt-1 opacity-80" style={{ fontFamily: 'var(--font-serif)' }}>
          Ceremonias
        </span>
      </div>
    </div>
  );
};
