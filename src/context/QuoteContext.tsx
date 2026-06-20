import React, { createContext, useContext, useState, useEffect } from 'react';

export interface QuoteItem {
    id: string;
    cartItemId: string;
    name: string;
    price: number;
    quantity: number;
    image_url?: string;
    size?: string;
    color?: string;
    code?: string;
}

interface QuoteContextType {
    items: QuoteItem[];
    addItem: (product: { id: string; name: string; price: number; image_url?: string; size?: string; color?: string; code?: string; }, quantity?: number) => void;
    removeItem: (cartItemId: string) => void;
    updateQuantity: (cartItemId: string, quantity: number) => void;
    clearQuote: () => void;
    totalAmount: number;
    totalItems: number;
    isDrawerOpen: boolean;
    setDrawerOpen: (isOpen: boolean) => void;
}

const QuoteContext = createContext<QuoteContextType>({
    items: [],
    addItem: () => {},
    removeItem: () => {},
    updateQuantity: () => {},
    clearQuote: () => {},
    totalAmount: 0,
    totalItems: 0,
    isDrawerOpen: false,
    setDrawerOpen: () => {}
});

export const QuoteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [items, setItems] = useState<QuoteItem[]>(() => {
        try {
            const saved = localStorage.getItem('quoteItems');
            if (saved) {
                const parsed = JSON.parse(saved);
                return parsed.map((item: any) => ({
                    ...item,
                    cartItemId: item.cartItemId || `${item.id}-${item.size || ''}-${item.color || ''}`
                }));
            }
            return [];
        } catch {
            return [];
        }
    });

    const [isDrawerOpen, setDrawerOpen] = useState(false);

    useEffect(() => {
        try {
            localStorage.setItem('quoteItems', JSON.stringify(items));
        } catch (e) {
            console.error('Error saving quote items', e);
        }
    }, [items]);

    const addItem = (product: { id: string; name: string; price: number; image_url?: string; size?: string; color?: string; code?: string; }, quantity: number = 1) => {
        setItems(prev => {
            const cartItemId = `${product.id}-${product.size || ''}-${product.color || ''}`;
            const existing = prev.find(item => item.cartItemId === cartItemId);
            if (existing) {
                const newQuantity = Math.min(11, existing.quantity + quantity);
                return prev.map(item => item.cartItemId === cartItemId ? { ...item, quantity: newQuantity } : item);
            }
            return [...prev, { ...product, cartItemId, quantity: Math.min(11, quantity) }];
        });
        setDrawerOpen(true);
    };

    const removeItem = (cartItemId: string) => {
        setItems(prev => prev.filter(item => item.cartItemId !== cartItemId));
    };

    const updateQuantity = (cartItemId: string, quantity: number) => {
        if (quantity < 1) {
            removeItem(cartItemId);
            return;
        }
        setItems(prev => prev.map(item => 
            item.cartItemId === cartItemId ? { ...item, quantity: Math.min(11, quantity) } : item
        ));
    };

    const clearQuote = () => setItems([]);

    const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <QuoteContext.Provider value={{
            items,
            addItem,
            removeItem,
            updateQuantity,
            clearQuote,
            totalAmount,
            totalItems,
            isDrawerOpen,
            setDrawerOpen
        }}>
            {children}
        </QuoteContext.Provider>
    );
};

export const useQuote = () => useContext(QuoteContext);
