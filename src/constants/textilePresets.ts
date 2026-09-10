/**
 * Catálogo Curado de Telas y Tonos Textiles Ceremoniales
 * Diseñado para facilitar la selección de color a administradores del CMS
 * sin necesidad de conocimientos técnicos de códigos Hexadecimales.
 */

export interface TextilePreset {
    name: string;
    label: string;
    code: string;
    hex: string;
    family: string;
    description: string;
}

export interface TextileFamily {
    id: string;
    name: string;
    presets: TextilePreset[];
}

export const TEXTILE_FAMILIES: TextileFamily[] = [
    {
        id: 'blancos',
        name: 'Blancos & Marfiles',
        presets: [
            { name: 'blanco', label: 'Blanco Puro', code: 'BC', hex: '#FFFFFF', family: 'blancos', description: 'Blanco nupcial / bautizo puro' },
            { name: 'marfil', label: 'Marfil / Hueso', code: 'BH', hex: '#FDFBF7', family: 'blancos', description: 'Tono marfil cálido suave' },
            { name: 'crema', label: 'Crema / Lino', code: 'CR', hex: '#F5EFEB', family: 'blancos', description: 'Crema lino ceremonial' },
            { name: 'perla', label: 'Blanco Perla', code: 'BP', hex: '#F8F9FA', family: 'blancos', description: 'Satinado luminoso' },
        ]
    },
    {
        id: 'dorados_tierras',
        name: 'Champagne, Beiges & Tierras',
        presets: [
            { name: 'champagne', label: 'Champagne Real', code: 'CH', hex: '#DFCA9F', family: 'dorados_tierras', description: 'Champagne dorado clásico' },
            { name: 'beige', label: 'Beige Ceremonial', code: 'BG', hex: '#EADDC7', family: 'dorados_tierras', description: 'Beige neutro refinado' },
            { name: 'kaki', label: 'Kaki Gala', code: 'KK', hex: '#C4A47C', family: 'dorados_tierras', description: 'Kaki arena textil' },
            { name: 'dorado', label: 'Oro Satinado', code: 'DO', hex: '#D4AF37', family: 'dorados_tierras', description: 'Dorado fiesta brillante' },
            { name: 'cafe', label: 'Café Tabaco', code: 'CF', hex: '#5C4033', family: 'dorados_tierras', description: 'Marrón profundo' },
            { name: 'camel', label: 'Camel Suave', code: 'CM', hex: '#C19A6B', family: 'dorados_tierras', description: 'Tono camel cálido' },
        ]
    },
    {
        id: 'azules',
        name: 'Azules Ceremoniales',
        presets: [
            { name: 'azul', label: 'Azul Arcángel', code: 'AZ', hex: '#5B84B1', family: 'azules', description: 'Azul emblemático de ceremonia' },
            { name: 'marino', label: 'Azul Marino Gala', code: 'MR', hex: '#1B2A4A', family: 'azules', description: 'Azul marino noche formal' },
            { name: 'rey', label: 'Azul Rey Intenso', code: 'RY', hex: '#1B4F9B', family: 'azules', description: 'Azul rey vivo para trajes' },
            { name: 'celeste', label: 'Azul Celeste / Cielo', code: 'CL', hex: '#87CEEB', family: 'azules', description: 'Celeste suave bautizo/infantil' },
            { name: 'medianoche', label: 'Azul Medianoche', code: 'MD', hex: '#121927', family: 'azules', description: 'Azul casi negro súper elegante' },
            { name: 'acero', label: 'Azul Acero', code: 'AC', hex: '#4682B4', family: 'azules', description: 'Azul grisáceo moderno' },
        ]
    },
    {
        id: 'grises_negros',
        name: 'Grises & Negros',
        presets: [
            { name: 'gris', label: 'Gris Oxford', code: 'GR', hex: '#B0B7BC', family: 'grises_negros', description: 'Gris plata formal' },
            { name: 'gris_perla', label: 'Gris Perla Claro', code: 'GP', hex: '#D1D5DB', family: 'grises_negros', description: 'Gris muy claro iluminado' },
            { name: 'carbon', label: 'Gris Carbón', code: 'CB', hex: '#374151', family: 'grises_negros', description: 'Gris oscuro sobrio' },
            { name: 'negro', label: 'Negro Gala', code: 'NG', hex: '#1A1A1A', family: 'grises_negros', description: 'Negro esmoquin satinado' },
        ]
    },
    {
        id: 'gala_temporada',
        name: 'Gala, Pasteles & Temporada',
        presets: [
            { name: 'vino', label: 'Vino Tinto / Borgoña', code: 'VN', hex: '#581825', family: 'gala_temporada', description: 'Vino oscuro distinguido' },
            { name: 'rosa', label: 'Palo de Rosa', code: 'RS', hex: '#D4A5A5', family: 'gala_temporada', description: 'Rosa pastel ceremonial' },
            { name: 'esmeralda', label: 'Verde Esmeralda', code: 'VE', hex: '#124E3F', family: 'gala_temporada', description: 'Verde joya intenso' },
            { name: 'olivo', label: 'Verde Olivo', code: 'VO', hex: '#556B2F', family: 'gala_temporada', description: 'Verde olivo rústico / lino' },
            { name: 'terracota', label: 'Terracota / Teja', code: 'TR', hex: '#B85B35', family: 'gala_temporada', description: 'Tono arcilla rústico' },
            { name: 'lavanda', label: 'Lavanda / Lila', code: 'LV', hex: '#B5A3C7', family: 'gala_temporada', description: 'Lila suave ceremonial' },
            { name: 'menta', label: 'Verde Menta', code: 'MT', hex: '#A2E8DD', family: 'gala_temporada', description: 'Menta refrescante infantil' },
            { name: 'coral', label: 'Coral Pastel', code: 'CO', hex: '#F88379', family: 'gala_temporada', description: 'Coral suave verano' },
        ]
    }
];

export const ALL_TEXTILE_PRESETS: TextilePreset[] = TEXTILE_FAMILIES.flatMap(f => f.presets);

/**
 * Busca coincidencias inteligentes de presets según lo que el usuario esté escribiendo
 */
export function findMatchingPreset(input: string): TextilePreset | undefined {
    if (!input || input.trim().length === 0) return undefined;
    const clean = input.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    // 1. Coincidencia exacta por nombre o código
    const exact = ALL_TEXTILE_PRESETS.find(p => 
        p.name.toLowerCase() === clean || 
        p.code.toLowerCase() === clean ||
        p.label.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") === clean
    );
    if (exact) return exact;

    // 2. Coincidencia por inicio de palabra o contención
    const partial = ALL_TEXTILE_PRESETS.find(p => 
        clean.includes(p.name.toLowerCase()) || 
        p.name.toLowerCase().includes(clean) ||
        p.label.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(clean)
    );
    return partial;
}
