import { Product } from '../types/product';

export const products: Product[] = [
    {
        id: 'bautizo-01',
        name: 'Modelo Angelical',
        description: 'Ropón de bautizo elaborado en seda natural con finos bordados a mano.',
        category: 'bautizo',
        images: ['https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&q=80&w=800'],
        featured: true
    },
    {
        id: 'comunion-01',
        name: 'Vestido Pureza',
        description: 'Vestido de primera comunión con encaje español y tul de seda.',
        category: 'comunion',
        images: ['https://images.unsplash.com/photo-1541250848049-b4f71413cc30?auto=format&fit=crop&q=80&w=800'],
        featured: true
    },
    {
        id: 'boda-01',
        name: 'Lazo de Amor',
        description: 'Lazo nupcial de cristal con plata ley 925.',
        category: 'boda',
        images: ['https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=800'],
        featured: false
    },
    {
        id: 'accesorios-01',
        name: 'Vela de Ceremonia',
        description: 'Vela decorada artesanalmente para bautizo o primera comunión.',
        category: 'accesorios',
        images: ['https://images.unsplash.com/photo-1579546673203-d24eb0423e46?auto=format&fit=crop&q=80&w=800'],
        featured: false
    }
];
