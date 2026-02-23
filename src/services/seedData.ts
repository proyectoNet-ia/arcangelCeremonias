import { supabase } from '../lib/supabase';

export const seedCatalog = async () => {
    try {
        console.log('Iniciando carga de datos de prueba...');

        // 1. Limpiar datos existentes (Opcional, ten cuidado en producción)
        // await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        // await supabase.from('categories').delete().neq('id', '00000000-0000-0000-0000-000000000000');

        // 2. Crear Categorías
        const { data: categories, error: catError } = await supabase
            .from('categories')
            .insert([
                { name: 'Bautizo', slug: 'bautizo' },
                { name: 'Traje Charro', slug: 'traje-charro' },
                { name: 'Guayabera', slug: 'guayabera' },
                { name: 'Túnica', slug: 'tunica' },
                { name: 'Esmoquin', slug: 'esmoquin' },
                { name: 'Traje', slug: 'traje' },
                { name: 'Traje de Estola', slug: 'traje-estola' }
            ])
            .select();

        if (catError) throw catError;
        console.log('Categorías creadas:', categories);

        const findCat = (slug: string) => categories.find(c => c.slug === slug)?.id;

        // 3. Crear Productos de Prueba
        const { error: prodError } = await supabase
            .from('products')
            .insert([
                {
                    name: 'Ropón Niña Gema',
                    slug: 'ropon-nina-gema',
                    description: 'Hermoso ropón para niña con detalles en perla.',
                    price: 2800,
                    show_price: true,
                    material: 'Shantung de Seda',
                    category_id: findCat('bautizo'),
                    subcategory: 'ropon-nina',
                    main_image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&q=80&w=800',
                    featured: true,
                    stock_status: 'available'
                },
                {
                    name: 'Traje Charro Virgen Blanco',
                    slug: 'traje-charro-virgen-blanco',
                    description: 'Traje charro de gala con bordado de la Virgen de Guadalupe.',
                    price: 4500,
                    show_price: true,
                    material: 'Terciopelo Premium',
                    category_id: findCat('traje-charro'),
                    subcategory: 'con-virgen-blanco',
                    main_image: 'https://images.unsplash.com/photo-1541250848049-b4f71413cc30?auto=format&fit=crop&q=80&w=800',
                    featured: true,
                    stock_status: 'available'
                },
                {
                    name: 'Guayabera Tropical Lino',
                    slug: 'guayabera-tropical-lino',
                    description: 'Guayabera fresca de lino ideal para climas cálidos.',
                    price: 1200,
                    show_price: true,
                    material: 'Lino 100%',
                    category_id: findCat('guayabera'),
                    subcategory: 'tropical',
                    main_image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=800',
                    featured: false,
                    stock_status: 'available'
                }
            ]);

        if (prodError) throw prodError;
        console.log('¡Catálogo de prueba cargado con éxito!');
        return true;

    } catch (err) {
        console.error('Error al cargar datos:', err);
        return false;
    }
};
