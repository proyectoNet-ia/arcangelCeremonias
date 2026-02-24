import { supabase } from '../lib/supabase';

export const seedCatalog = async () => {
    try {
        console.log('Iniciando carga de datos robusta...');

        // 1. Limpiar datos existentes de forma más agresiva
        console.log('Limpiando tablas...');
        await supabase.from('products').delete().filter('id', 'neq', '00000000-0000-0000-0000-000000000000');
        await supabase.from('categories').delete().filter('id', 'neq', '00000000-0000-0000-0000-000000000000');

        // 2. Crear o Actualizar Categorías (usando onConflict para evitar el error 409)
        const categoryList = [
            { name: 'Bautizo', slug: 'bautizo' },
            { name: 'Traje Charro', slug: 'traje-charro' },
            { name: 'Guayabera', slug: 'guayabera' },
            { name: 'Túnica', slug: 'tunica' },
            { name: 'Esmoquin', slug: 'esmoquin' },
            { name: 'Traje', slug: 'traje' },
            { name: 'Traje de Estola', slug: 'traje-estola' }
        ];

        const { data: categories, error: catError } = await supabase
            .from('categories')
            .upsert(categoryList, { onConflict: 'slug' })
            .select();

        if (catError) {
            console.error('Error en categorías:', catError);
            throw catError;
        }
        console.log('Categorías listas:', categories);

        const findCat = (slug: string) => categories.find(c => c.slug === slug)?.id;

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

        // 3. Crear Listado Robusto de Productos
        const productsToInsert = [
            // BAUTIZO
            {
                name: 'Ropón Niña Gema',
                slug: 'ropon-nina-gema',
                description: 'Ropón de bautizo para niña con delicados detalles en perla y encaje.',
                detailed_description: 'Nuestra colección Gema destaca por la sutileza de sus materiales. Elaborado en shantung de seda, este ropón incluye capa desmontable y gorro a juego.',
                price: 3200,
                show_price: true,
                material: 'Shantung de Seda & Perlas',
                category_id: findCat('bautizo'),
                subcategory: 'ropon-nina',
                model_code: 'GEMA-01',
                color: 'Blanco Marfil',
                size_variants: [
                    { size: '0', price: 3200 },
                    { size: '1', price: 3400 },
                    { size: '2', price: 3600 }
                ],
                main_image: localImages[4], // Baby laying bed
                gallery: getRandomGallery(4),
                featured: true,
                stock_status: 'available'
            },
            {
                name: 'Ropón Niño Imperial',
                slug: 'ropon-nino-imperial',
                description: 'Ropón clásico para niño con bordados artesanales.',
                price: 2900,
                show_price: true,
                model_code: 'IMP-02',
                color: 'Blanco Nieve',
                material: 'Lino Italiano',
                category_id: findCat('bautizo'),
                subcategory: 'ropon-nino',
                main_image: localImages[5], // Hands holding foot
                gallery: getRandomGallery(4),
                featured: false,
                stock_status: 'available'
            },

            // TRAJE CHARRO
            {
                name: 'Traje Charro Virgen Blanco',
                slug: 'charro-virgen-blanco',
                description: 'Traje charro de gala con bordado de la Virgen en hilos de plata.',
                price: 5500,
                show_price: true,
                material: 'Terciopelo Premium',
                category_id: findCat('traje-charro'),
                subcategory: 'con-virgen-blanco',
                main_image: localImages[1], // Kid praying
                gallery: getRandomGallery(4),
                featured: true,
                stock_status: 'available'
            },
            {
                name: 'Traje Charro Clásico Azul Rey',
                slug: 'charro-clasico-azul',
                description: 'Elegante traje charro en tono azul rey con botonadura de lujo.',
                price: 4800,
                show_price: true,
                material: 'Lana Fina',
                category_id: findCat('traje-charro'),
                subcategory: 'clasico-azul-rey',
                main_image: localImages[8], // Young boy church
                gallery: getRandomGallery(4),
                featured: false,
                stock_status: 'available'
            },

            // GUAYABERA
            {
                name: 'Guayabera Tropical Lino',
                slug: 'guayabera-tropical-lino',
                description: 'Guayabera presidencial de lino 100%.',
                price: 1850,
                show_price: true,
                material: 'Lino de Alta Calidad',
                category_id: findCat('guayabera'),
                subcategory: 'tropical',
                main_image: localImages[2], // Portrait communion
                gallery: getRandomGallery(4),
                featured: true,
                stock_status: 'available'
            },
            {
                name: 'Guayabera Bebé Verano',
                slug: 'guayabera-bebe-verano',
                description: 'Frescura y comodidad para los más pequeños.',
                price: 950,
                show_price: true,
                material: 'Algodón Egipcio',
                category_id: findCat('guayabera'),
                subcategory: 'bebe',
                main_image: localImages[4],
                gallery: getRandomGallery(4),
                featured: false,
                stock_status: 'available'
            },

            // TÚNICA
            {
                name: 'Túnica Modelo 1',
                slug: 'tunica-modelo-1',
                description: 'Túnica ceremonial de corte minimalista.',
                price: 2100,
                show_price: true,
                material: 'Seda Habotai',
                category_id: findCat('tunica'),
                subcategory: 'modelo-1',
                main_image: localImages[3], // Portrait communion
                gallery: getRandomGallery(4),
                featured: false,
                stock_status: 'on_request'
            },

            // ESMOQUIN
            {
                name: 'Esmoquin San Gabriel',
                slug: 'esmoquin-san-gabriel',
                description: 'Esmoquin de alta etiqueta con solapa de seda.',
                price: 6400,
                show_price: true,
                material: 'Super 120s Lana',
                category_id: findCat('esmoquin'),
                subcategory: 'san-gabriel',
                main_image: localImages[6], // Boy church
                gallery: getRandomGallery(4),
                featured: true,
                stock_status: 'available'
            },

            // TRAJE
            {
                name: 'Traje Arcángel Elite',
                slug: 'traje-arcangel-elite',
                description: 'El traje insignia de nuestra colección, diseñado para momentos memorables.',
                price: 7200,
                show_price: true,
                material: 'Mezcla Cashemere & Lana',
                category_id: findCat('traje'),
                subcategory: 'arcangel',
                main_image: localImages[7], // Boy church
                gallery: getRandomGallery(4),
                featured: true,
                stock_status: 'available'
            },

            // TRAJE DE ESTOLA
            {
                name: 'Traje Estola Uvas',
                slug: 'traje-estola-uvas',
                description: 'Traje tradicional con estola bordada en motivos de uvas y vides.',
                price: 3500,
                show_price: true,
                material: 'Tergal Frances',
                category_id: findCat('traje-estola'),
                subcategory: 'uvas',
                main_image: localImages[0], // Girls candles
                gallery: getRandomGallery(4),
                featured: false,
                stock_status: 'available'
            }
        ];

        const { error: prodError } = await supabase
            .from('products')
            .upsert(productsToInsert, { onConflict: 'slug' });

        if (prodError) throw prodError;
        console.log('¡Catálogo robusto cargado con éxito!');
        return true;

    } catch (err) {
        console.error('Error al cargar datos robustos:', err);
        return false;
    }
};
