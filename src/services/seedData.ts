import { supabase } from '../lib/supabase';

export const seedCatalog = async () => {
    try {
        console.log('Iniciando carga de datos robusta...');

        // 1. Limpiar datos existentes (En orden: Productos -> Categorías)
        console.log('Limpiando productos...');
        const { error: delProdError } = await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        if (delProdError) {
            console.error('Error al borrar productos:', delProdError);
            throw delProdError;
        }

        console.log('Limpiando categorías...');
        const { error: delCatError } = await supabase.from('categories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        if (delCatError) {
            console.error('Error al borrar categorías:', delCatError);
            // No arrojamos error aquí si falla el borrado de categorías para permitir que el upsert intente arreglarlo
        }

        // 2. Crear Categorías (Jerárquicas: Padres y luego Hijos)
        console.log('Creando jerarquía de categorías...');

        // 2a. Categorías Padre con Meta-datos Visuales (10 Categorías para Escalamiento)
        const parentList = [
            {
                name: 'Bautizo',
                slug: 'bautizo',
                description: 'Tradición y pureza en cada detalle para el día más especial.',
                image_url: '/catalog/top-view-cute-baby-laying-bed.jpg'
            },
            {
                name: 'Traje Charro',
                slug: 'traje-charro',
                description: 'La elegancia de nuestra cultura plasmada en bordados artesanales.',
                image_url: '/catalog/medium-shot-kid-praying-with-crucifix.jpg'
            },
            {
                name: 'Guayabera',
                slug: 'guayabera',
                description: 'Frescura y distinción con el toque clásico del lino.',
                image_url: '/catalog/portrait-child-getting-ready-their-first-communion.jpg'
            },
            {
                name: 'Ceremonia Niños',
                slug: 'ceremonia-ninos',
                description: 'Etiqueta impecable para los pequeños caballeros en formación.',
                image_url: '/catalog/young-boy-church-experiencing-his-first-communion-ceremony.jpg'
            },
            {
                name: 'Accesorios',
                slug: 'accesorios',
                description: 'Complementos esenciales que dan el toque final a la ceremonia.',
                image_url: '/catalog/medium-shot-girls-holding-candles.jpg'
            },
            {
                name: 'Calzado',
                slug: 'calzado',
                description: 'Pasos de fe con suavidad y diseño artesanal.',
                image_url: '/catalog/top-view-hands-holding-baby-s-foot.jpg'
            },
            {
                name: 'Mantas y Velas',
                slug: 'mantas-y-velas',
                description: 'Símbolos de luz y calidez para la protección del pequeño.',
                image_url: '/catalog/medium-shot-girls-holding-candles.jpg'
            },
            {
                name: 'Joyería Religiosa',
                slug: 'joyería-religiosa',
                description: 'Recuerdos eternos en oro y plata laminada.',
                image_url: '/catalog/medium-shot-kid-praying-with-crucifix.jpg'
            },
            {
                name: 'Línea Blanca',
                slug: 'linea-blanca',
                description: 'Textiles premium para el confort absoluto en la ceremonia.',
                image_url: '/catalog/portrait-child-getting-ready-their-first-communion (1).jpg'
            },
            {
                name: 'Outlet',
                slug: 'outlet',
                description: 'Piezas únicas de temporadas anteriores con precios especiales.',
                image_url: '/catalog/young-boy-experiencing-his-first-communion-ceremony-church.jpg'
            }
        ];

        const { data: parents, error: parentError } = await supabase
            .from('categories')
            .upsert(parentList, { onConflict: 'slug' })
            .select();

        if (parentError) throw parentError;
        const findParentId = (slug: string) => parents.find(c => c.slug === slug)?.id;

        // 2b. Subcategorías (Hijos)
        const subList = [
            // Subs de Bautizo
            { name: 'Ropón Niña', slug: 'ropon-nina', parent_id: findParentId('bautizo') },
            { name: 'Ropón Niño', slug: 'ropon-nino', parent_id: findParentId('bautizo') },
            { name: 'Accesorios Bautizo', slug: 'accesorios-bautizo', parent_id: findParentId('bautizo') },
            // Subs de Traje Charro
            { name: 'Gala Individual', slug: 'gala-individual', parent_id: findParentId('traje-charro') },
            { name: 'Charro Bebé', slug: 'charro-bebe', parent_id: findParentId('traje-charro') },
            // Subs de Ceremonia
            { name: 'Esmoquin', slug: 'esmoquin', parent_id: findParentId('ceremonia-ninos') },
            { name: 'Traje de Estola', slug: 'traje-estola', parent_id: findParentId('ceremonia-ninos') },
            { name: 'Túnicas', slug: 'tunicas', parent_id: findParentId('ceremonia-ninos') }
        ];

        const { data: fullCategories, error: subError } = await supabase
            .from('categories')
            .upsert(subList, { onConflict: 'slug' })
            .select();

        if (subError) throw subError;

        // Combinar todos para los helpers de productos
        const allCategories = [...parents, ...fullCategories];
        const findCat = (slug: string) => allCategories.find(c => c.slug === slug)?.id;

        console.log('Jerarquía de categorías lista.');

        // Helper para imágenes aleatorias de la carpeta local
        const localImages = [
            '/catalog/medium-shot-girls-holding-candles.jpg',
            '/catalog/medium-shot-kid-praying-with-crucifix.jpg',
            '/catalog/portrait-child-getting-ready-their-first-communion (1).jpg',
            '/catalog/portrait-child-getting-ready-their-first-communion.jpg',
            '/catalog/top-view-cute-baby-laying-bed.jpg',
            '/catalog/top-view-hands-holding-baby-s-foot.jpg',
            '/catalog/young-boy-church-experiencing-his-first-communion-ceremony (1).jpg',
            '/catalog/young-boy-church-experiencing-his-first-communion-ceremony.jpg',
            '/catalog/young-boy-experiencing-his-first-communion-ceremony-church.jpg'
        ];

        const getRandomImage = () => localImages[Math.floor(Math.random() * localImages.length)];
        const getRandomGallery = (count = 3) => {
            const shuffled = [...localImages].sort(() => 0.5 - Math.random());
            return shuffled.slice(0, count);
        };

        // 3. Crear Listado Robusto de Productos (20 total)
        const productsToInsert = [
            // BAUTIZO
            {
                name: 'Ropón Gema Premium',
                slug: 'ropon-gema-premium',
                description: 'Ropón artesanal con detalles en perla.',
                price: 3500,
                show_price: true,
                model_code: 'GEMA-01',
                color: 'Marfil',
                material: 'Shantung de Seda',
                category_id: findCat('bautizo'),
                subcategory: 'ropon-nina',
                size_variants: [{ size: '0', price: 3500 }, { size: '1', price: 3700 }, { size: '2', price: 3900 }],
                main_image: localImages[4],
                gallery: getRandomGallery(4),
                featured: true,
                stock_status: 'available'
            },
            {
                name: 'Ropón Imperial Niño',
                slug: 'ropon-imperial-nino',
                description: 'Clásico ropón desmontable.',
                price: 2800,
                show_price: true,
                model_code: 'IMP-02',
                color: 'Blanco Nieve',
                material: 'Lino Italiano',
                category_id: findCat('bautizo'),
                subcategory: 'ropon-nino',
                size_variants: [{ size: '0', price: 2800 }, { size: '1', price: 3000 }],
                main_image: localImages[5],
                gallery: getRandomGallery(4),
                featured: false,
                stock_status: 'available'
            },
            {
                name: 'Ropón Niña Ángela',
                slug: 'ropon-nina-angela',
                description: 'Vestido de bautizo con encaje francés.',
                price: 3100,
                show_price: true,
                model_code: 'ANG-03',
                color: 'Hueso',
                material: 'Organza',
                category_id: findCat('bautizo'),
                subcategory: 'ropon-nina',
                main_image: localImages[0],
                gallery: getRandomGallery(3),
                featured: true
            },
            // TRAJE CHARRO
            {
                name: 'Traje Charro Gala Virgen',
                slug: 'charro-gala-virgen',
                description: 'Bordado artesanal de la Virgen en espalda.',
                price: 5800,
                show_price: true,
                model_code: 'CH-VG-01',
                color: 'Negro/Plata',
                material: 'Terciopelo Premium',
                category_id: findCat('traje-charro'),
                subcategory: 'gala-individual',
                size_variants: [{ size: '4', price: 5800 }, { size: '6', price: 6200 }, { size: '8', price: 6600 }],
                main_image: localImages[1],
                gallery: getRandomGallery(4),
                featured: true
            },
            {
                name: 'Traje Charro Infantil Clásico',
                slug: 'charro-infantil-clasico',
                description: 'Traje de 3 piezas para ceremonia.',
                price: 4500,
                show_price: true,
                model_code: 'CH-CL-05',
                color: 'Azul Rey',
                category_id: findCat('traje-charro'),
                subcategory: 'gala-individual',
                main_image: localImages[8],
                gallery: getRandomGallery(3)
            },
            {
                name: 'Traje Charro Blanco Oro',
                slug: 'charro-blanco-oro',
                description: 'Edición especial con bordados dorados.',
                price: 6200,
                show_price: true,
                model_code: 'CH-GO-09',
                color: 'Blanco/Oro',
                category_id: findCat('traje-charro'),
                subcategory: 'gala-individual',
                main_image: localImages[7],
                gallery: getRandomGallery(3)
            },
            // GUAYABERA
            {
                name: 'Guayabera Presidencial Lino',
                slug: 'guayabera-presidencial-lino',
                description: '100% Lino con alforzado fino.',
                price: 1950,
                show_price: true,
                model_code: 'GUY-PR-01',
                color: 'Blanco',
                category_id: findCat('guayabera'),
                size_variants: [{ size: 'CH', price: 1950 }, { size: 'M', price: 1950 }, { size: 'G', price: 2100 }],
                main_image: localImages[2],
                gallery: getRandomGallery(4),
                featured: true
            },
            {
                name: 'Guayabera Infantil Yucatán',
                slug: 'guayabera-infantil-yucatan',
                description: 'Frescura para pequeños caballero.',
                price: 1200,
                show_price: true,
                model_code: 'GUY-INF-02',
                color: 'Azul Cielo',
                category_id: findCat('guayabera'),
                main_image: localImages[4],
                gallery: getRandomGallery(2)
            },
            {
                name: 'Guayabera Bordada a Mano',
                slug: 'guayabera-bordada-mano',
                description: 'Detalles únicos en cada pieza.',
                price: 2600,
                show_price: true,
                model_code: 'GUY-HM-08',
                color: 'Beige',
                category_id: findCat('guayabera'),
                main_image: localImages[6],
                gallery: getRandomGallery(3)
            },
            // CEREMONIA NIÑOS (TÚNICA)
            {
                name: 'Túnica Ceremonial Minimal',
                slug: 'tunica-ceremonial-minimal',
                description: 'Corte limpio y elegante.',
                price: 2400,
                show_price: true,
                model_code: 'TUN-01',
                color: 'Crema',
                category_id: findCat('ceremonia-ninos'),
                subcategory: 'tunicas',
                main_image: localImages[3],
                gallery: getRandomGallery(3),
                featured: true
            },
            {
                name: 'Túnica Bordado Cruz',
                slug: 'tunica-bordado-cruz',
                description: 'Túnica tradicional de primera comunión.',
                price: 2200,
                show_price: true,
                model_code: 'TUN-05',
                color: 'Blanco',
                category_id: findCat('ceremonia-ninos'),
                subcategory: 'tunicas',
                main_image: localImages[2],
                gallery: getRandomGallery(2)
            },
            // ESMOQUIN
            {
                name: 'Esmoquin San Gabriel Black',
                slug: 'esmoquin-san-gabriel-black',
                description: 'Alta etiqueta infantil.',
                price: 6800,
                show_price: true,
                model_code: 'SM-SG-01',
                color: 'Negro',
                category_id: findCat('ceremonia-ninos'),
                subcategory: 'esmoquin',
                size_variants: [{ size: '6', price: 6800 }, { size: '10', price: 7200 }, { size: '14', price: 7800 }],
                main_image: localImages[6],
                gallery: getRandomGallery(5),
                featured: true
            },
            {
                name: 'Esmoquin Azul Midnight',
                slug: 'esmoquin-azul-midnight',
                description: 'Color tendencia para eventos nocturnos.',
                price: 6500,
                show_price: true,
                model_code: 'SM-MN-04',
                color: 'Azul Medianoche',
                category_id: findCat('ceremonia-ninos'),
                subcategory: 'esmoquin',
                main_image: localImages[1],
                gallery: getRandomGallery(3)
            },
            // TRAJE 
            {
                name: 'Traje Ejecutivo Arcángel',
                slug: 'traje-ejecutivo-arcangel',
                description: 'Corte slim fit muy moderno.',
                price: 5200,
                show_price: true,
                model_code: 'TR-EX-01',
                color: 'Gris Oxford',
                category_id: findCat('ceremonia-ninos'),
                subcategory: 'esmoquin', // Reutilizando para el ejemplo
                main_image: localImages[7],
                gallery: getRandomGallery(3),
                featured: true
            },
            {
                name: 'Traje Lino Confort',
                slug: 'traje-lino-confort',
                description: 'Ideal para eventos en playa o jardín.',
                price: 4900,
                show_price: true,
                model_code: 'TR-LN-02',
                color: 'Arena',
                category_id: findCat('ceremonia-ninos'),
                main_image: localImages[8],
                gallery: getRandomGallery(2)
            },
            // TRAJE DE ESTOLA
            {
                name: 'Traje Estola Tradición',
                slug: 'traje-estola-tradicion',
                description: 'Bordado clásico con motivos religiosos.',
                price: 3800,
                show_price: true,
                model_code: 'ST-TR-01',
                color: 'Blanco',
                category_id: findCat('ceremonia-ninos'),
                subcategory: 'traje-estola',
                main_image: localImages[0],
                gallery: getRandomGallery(4),
                featured: true
            },
            {
                name: 'Traje Estola Uvas y Vides',
                slug: 'traje-estola-uvas-vides',
                description: 'Elegancia y simbolismo.',
                price: 4100,
                show_price: true,
                model_code: 'ST-UV-05',
                color: 'Marfil',
                category_id: findCat('ceremonia-ninos'),
                subcategory: 'traje-estola',
                main_image: localImages[3],
                gallery: getRandomGallery(3)
            },
            {
                name: 'Traje Estola Cáliz',
                slug: 'traje-estola-caliz',
                description: 'Edición especial bordada.',
                price: 4200,
                show_price: true,
                model_code: 'ST-CX-08',
                color: 'Blanco',
                category_id: findCat('ceremonia-ninos'),
                subcategory: 'traje-estola',
                main_image: localImages[4],
                gallery: getRandomGallery(2)
            },
            {
                name: 'Vestido Ceremonia Girasol',
                slug: 'vestido-ceremonia-girasol',
                description: 'Diseño floral exclusivo.',
                price: 2900,
                show_price: true,
                model_code: 'VES-GS-10',
                color: 'Crema/Amarillo',
                category_id: findCat('bautizo'),
                subcategory: 'ropon-nina',
                main_image: localImages[0],
                gallery: getRandomGallery(3)
            }
        ];

        const { error: prodError } = await supabase
            .from('products')
            .upsert(productsToInsert, { onConflict: 'slug' });

        if (prodError) throw prodError;
        console.log('¡Catálogo auditado de 20 productos cargado con éxito!');
        return true;

    } catch (err: any) {
        console.error('Error al cargar datos auditados:', err.message || err);
        if (err.details) console.error('Detalles:', err.details);
        if (err.hint) console.error('Pista:', err.hint);
        return false;
    }
};
