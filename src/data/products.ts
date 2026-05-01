import { Product } from '../types/product';

export const products: Product[] = [
    {
        id: 'bautizo-01',
        slug: 'modelo-angelical',
        name: 'Modelo Angelical',
        description: 'Ropón de bautizo elaborado en seda natural con finos bordados a mano.',
        category_id: 'bautizo',
        main_image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&q=80&w=800',
        show_price: false,
        featured: true
    },
    {
        id: 'comunion-01',
        slug: 'vestido-pureza',
        name: 'Vestido Pureza',
        description: 'Vestido de primera comunión con encaje español y tul de seda.',
        category_id: 'comunion',
        main_image: 'https://images.unsplash.com/photo-1541250848049-b4f71413cc30?auto=format&fit=crop&q=80&w=800',
        show_price: false,
        featured: true
    },
    {
        id: 'boda-01',
        slug: 'lazo-de-amor',
        name: 'Lazo de Amor',
        description: 'Lazo nupcial de cristal con plata ley 925.',
        category_id: 'boda',
        main_image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=800',
        show_price: false,
        featured: false
    },
    {
        id: 'accesorios-01',
        slug: 'vela-de-ceremonia',
        name: 'Vela de Ceremonia',
        description: 'Vela decorada con pasión para bautizo o primera comunión.',
        category_id: 'accesorios',
        main_image: 'https://images.unsplash.com/photo-1579546673203-d24eb0423e46?auto=format&fit=crop&q=80&w=800',
        show_price: false,
        featured: false
    }
];
