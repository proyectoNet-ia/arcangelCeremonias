export interface EnsamblexColor {
    code: string;
    name: string;
    label: string;
    hex: string;
}

export const DEFAULT_OFFICIAL_COLORS: EnsamblexColor[] = [
    { code: 'BC', name: 'blanco', label: 'Blanco (BC)', hex: '#FFFFFF' },
    { code: 'BG', name: 'beige', label: 'Beige (BG)', hex: '#EADDC7' },
    { code: 'NG', name: 'negro', label: 'Negro (NG)', hex: '#1A1A1A' },
    { code: 'KK', name: 'kaki', label: 'Kaki (KK)', hex: '#C4A47C' },
    { code: 'MR', name: 'marino', label: 'Marino (MR)', hex: '#1B2A4A' },
    { code: 'GR', name: 'gris', label: 'Gris (GR)', hex: '#B0B7BC' },
    { code: 'AZ', name: 'azul', label: 'Azul (AZ)', hex: '#5B84B1' },
    { code: 'CH', name: 'champagne', label: 'Champagne (CH)', hex: '#DFCA9F' },
    { code: 'RY', name: 'rey', label: 'Rey (RY)', hex: '#1B4F9B' }
];

export const OFFICIAL_ENSAMBLEX_COLORS = DEFAULT_OFFICIAL_COLORS;

export const ENSAMBLEX_COLOR_MAP: Record<string, string> = {
    // Códigos directos
    'BC': 'BC',
    'BG': 'BG',
    'NG': 'NG',
    'KK': 'KK',
    'MR': 'MR',
    'GR': 'GR',
    'AZ': 'AZ',
    'CH': 'CH',
    'RY': 'RY',

    // Nombres oficiales según especificación Ensamblex
    'BLANCO': 'BC',
    'BEIGE': 'BG',
    'NEGRO': 'NG',
    'KAKI': 'KK',
    'CAQUI': 'KK',
    'MARINO': 'MR',
    'AZUL MARINO': 'MR',
    'GRIS': 'GR',
    'GRIS OSCURO': 'GR',
    'AZUL': 'AZ',
    'AZUL CELESTE': 'AZ',
    'CHAMPAGNE': 'CH',
    'CHAMPAN': 'CH',
    'CHAMPÁN': 'CH',
    'REY': 'RY',
    'AZUL REY': 'RY',

    // Variantes comunes del catálogo
    'HUESO': 'BG',
    'MARFIL': 'BG',
    'PERLA': 'BC',
    'CREMA': 'BG',
    'ARENA': 'BG',
    'ORO': 'CH',
    'DORADO': 'CH',
    'PLATA': 'GR',
    'HIELO': 'AZ'
};

/**
 * Obtiene el mapa dinámico de Nombre -> HEX combinando la configuración activa
 */
export function getDynamicColorMap(customColors?: EnsamblexColor[]): Record<string, string> {
    const list = customColors && customColors.length > 0 ? customColors : DEFAULT_OFFICIAL_COLORS;
    const map: Record<string, string> = {};
    list.forEach(c => {
        map[c.name.toLowerCase().trim()] = c.hex;
        map[c.code.toLowerCase().trim()] = c.hex;
    });
    return map;
}

/**
 * Normaliza y obtiene el código de color de 2 letras para Ensamblex
 */
export function getEnsamblexColorCode(color?: string, customList?: EnsamblexColor[]): string {
    if (!color || !color.trim()) return 'BC';
    
    // Normalizar texto: mayúsculas, sin acentos
    const clean = color
        .toUpperCase()
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

    // Si se pasa una lista personalizada activa
    if (customList && customList.length > 0) {
        const found = customList.find(c => 
            c.name.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') === clean ||
            c.code.toUpperCase() === clean
        );
        if (found) return found.code.toUpperCase();
    }

    // 1. Coincidencia exacta
    if (ENSAMBLEX_COLOR_MAP[clean]) {
        return ENSAMBLEX_COLOR_MAP[clean];
    }

    // 2. Coincidencia por palabra clave contenida
    for (const [key, code] of Object.entries(ENSAMBLEX_COLOR_MAP)) {
        if (clean.includes(key)) {
            return code;
        }
    }

    // 3. Fallback: Si ya viene como código de 2 letras
    if (clean.length === 2 && /^[A-Z]{2}$/.test(clean)) {
        return clean;
    }

    // 4. Default estándar
    return 'BC';
}

/**
 * Formatea el SKU completo para Ensamblex: [CODIGO_BASE][COLOR]-[TALLA]
 * Ejemplo: 23303BC-10
 */
export function formatEnsamblexSku(code?: string, color?: string, size?: string, customList?: EnsamblexColor[]): string {
    const cleanBaseCode = (code || 'PRENDA')
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '');

    const colorCode = getEnsamblexColorCode(color, customList);

    const cleanSize = (size || 'U')
        .toUpperCase()
        .trim()
        .replace(/[^A-Z0-9]/g, '');

    return `${cleanBaseCode}${colorCode}-${cleanSize}`;
}
