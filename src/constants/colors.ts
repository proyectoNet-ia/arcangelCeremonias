// ─── Biblioteca Centralizada de Colores ───────────────────────────────────────────
export const COLOR_MAP: Record<string, string> = {
    // Colores Oficiales Ensamblex ERP (Calibrados a tonos textiles reales)
    'blanco': '#FFFFFF',
    'beige': '#EADDC7',
    'negro': '#1A1A1A',
    'kaki': '#C4A47C',
    'marino': '#1B2A4A',
    'gris': '#B0B7BC',
    'azul': '#5B84B1',
    'champagne': '#DFCA9F',
    'rey': '#1B4F9B',

    // Variantes adicionales y sinónimos
    'gris oscuro': '#36454F',
    'azul marino': '#1B2A4A',
    'azul celeste': '#7CA3CC',
    'azul rey': '#1B4F9B',
    'champan': '#DFCA9F',
    'caqui': '#C4A47C',
    'rojo': '#FF0000',
    'vino': '#800020',
    'rosa': '#FFC0CB',
    'verde': '#008000',
    'verde militar': '#556B2F',
    'café': '#4B3621',
    'naranja': '#FFA500',
    'mostaza': '#FFDB58',
    'lila': '#C8A2C8',
    
    // Variantes de ceremonia y otros
    'hueso': '#F9F6EE',
    'marfil': '#FFFFF0',
    'perla': '#EAE0C8',
    'crema': '#FFFDD0',
    'rosa pastel': '#FFD1DC',
    'oro': '#D4AF37',
    'dorado': '#D4AF37',
    'plata': '#C0C0C0',
    'arena': '#C2B280',
    'menta': '#98FF98',
    'hielo': '#F0F8FF'
};

export const COLOR_NAMES = Object.keys(COLOR_MAP);
