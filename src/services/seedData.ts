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
                { name: 'Primera Comunión', slug: 'primera-comunion' },
                { name: 'Boda', slug: 'boda' },
                { name: 'Accesorios', slug: 'accesorios' }
            ])
            .select();

        if (catError) throw catError;
        console.log('Categorías creadas:', categories);

        const findCat = (slug: string) => categories.find(c => c.slug === slug)?.id;

        // 3. Crear Productos de Prueba (Basados en la esencia del catálogo PDF)
        const { error: prodError } = await supabase
            .from('products')
            .insert([
                {
                    name: 'Ropón Angelical Seda',
                    slug: 'ropon-angelical-seda',
                    description: 'Elegante ropón de bautizo elaborado en seda natural con detalles en encaje fino.',
                    detailed_description: 'Este ropón representa la pureza y tradición de Arcángel. Cada detalle ha sido bordado a mano por artesanos expertos, utilizando seda de la más alta calidad para asegurar la comodidad del bebé.',
                    price: 2450,
                    show_price: true,
                    material: 'Seda Natural & Encaje',
                    includes: 'Ropón, Capa, Gorro y Estuche Premium',
                    sizes: ['0-6 meses', '6-12 meses', '12-24 meses'],
                    main_image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&q=80&w=800',
                    category_id: findCat('bautizo'),
                    featured: true,
                    stock_status: 'available'
                },
                {
                    name: 'Vestido Pureza Editorial',
                    slug: 'vestido-pureza-editorial',
                    description: 'Vestido de primera comunión con corte princesa y aplicaciones de flores hechas a mano.',
                    detailed_description: 'Inspirado en diseños editoriales de alta costura, el modelo Pureza destaca por su falda de tul multicapa y un corpiño delicadamente adornado.',
                    price: 3800,
                    show_price: false,
                    material: 'Tul de Seda & Organza',
                    includes: 'Vestido y Tocado a juego',
                    sizes: ['8', '10', '12', '14'],
                    main_image: 'https://images.unsplash.com/photo-1541250848049-b4f71413cc30?auto=format&fit=crop&q=80&w=800',
                    category_id: findCat('primera-comunion'),
                    featured: true,
                    stock_status: 'available'
                },
                {
                    name: 'Lazo nupcial de Cristal',
                    slug: 'lazo-nupcial-cristal',
                    description: 'Lazo artesanal de cristal cortado con acabados en plata.',
                    detailed_description: 'Una pieza de reliquia para el día más importante. Este lazo combina la claridad del cristal con la elegancia de la plata ley 925.',
                    price: 1200,
                    show_price: true,
                    material: 'Cristal Cortado & Plata 925',
                    includes: 'Lazo y Cofre de madera grabada',
                    main_image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=800',
                    category_id: findCat('boda'),
                    featured: false,
                    stock_status: 'on_request'
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
