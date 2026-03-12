export const generateSlug = (name: string) => {
    return name
        .toLowerCase()
        .trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Eliminar acentos
        .replace(/[^a-z0-9\s-]/g, "")    // Eliminar caracteres especiales
        .replace(/[\s_]+/g, "-")          // Espacios a guiones
        .replace(/-+/g, "-");             // Evitar guiones dobles
};

export const smartFormatTitle = (val: string) => {
    if (!val) return '';
    const minorWords = ['de', 'del', 'la', 'las', 'el', 'los', 'y', 'en', 'para', 'con', 'por', 'a', 'un', 'una', 'unas', 'unos'];
    return val
        .split(' ')
        .map((word, index) => {
            if (!word) return '';
            const lowerWord = word.toLowerCase();
            if (index > 0 && minorWords.includes(lowerWord)) {
                return lowerWord;
            }
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        })
        .join(' ');
}; 
