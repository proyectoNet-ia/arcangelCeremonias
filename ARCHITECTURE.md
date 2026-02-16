# Arquitectura Escalable: Catálogo a E-commerce

Este documento describe la estructura recomendada para evolucionar el sitio actual de una "Landing Page" a un "Sitio de Catálogo" robusto, preparado para convertirse en una tienda en línea completa en el futuro sin reescribir todo el código.

## 1. Estructura de Carpetas Propuesta

Recomendamos reorganizar `src/` de la siguiente manera para separar responsabilidades:

```
src/
├── assets/             # Imágenes, fuentes, iconos globales
├── components/         # Componentes reutilizables
│   ├── common/         # Botones, Inputs, Modal, Header, Footer
│   ├── layout/         # Layout principal (Navbar + Contenido + Footer)
│   ├── catalog/        # Componentes específicos del catálogo
│   │   ├── ProductCard.tsx
│   │   ├── ProductGrid.tsx
│   │   ├── CategoryFilter.tsx
│   │   └── ProductGallery.tsx
│   └── shop/           # Componentes de tienda (inactivos inicialmente)
│       ├── CartDrawer.tsx
│       ├── CartItem.tsx
│       └── CheckoutForm.tsx
├── context/            # Estado global
│   ├── ShopContext.tsx # Manejo del carrito y configuración de la tienda
│   └── ThemeContext.tsx
├── data/               # Datos estáticos (JSON) para la fase de catálogo
│   └── products.ts     # Lista de productos (fácil de reemplazar por API)
├── hooks/              # Lógica reutilizable
│   ├── useProduct.ts
│   └── useCart.ts
├── pages/              # Vistas principales
│   ├── Home.tsx
│   ├── Catalog.tsx
│   ├── ProductDetail.tsx
│   └── About.tsx
└── types/              # Definiciones de TypeScript (Interfaces de Producto)
```

## 2. Estrategia "Catálogo Primero" (Catalog First)

La clave para que el sitio sea escalable es construir los componentes de venta (Carrito, Checkout) pero mantenerlos **desactivados** o en **modo solo lectura**.

### El Concepto de `ShopConfig`

Crea un archivo de configuración o una variable de entorno que controle el modo del sitio:

```typescript
// src/config/shop.ts
export const SHOP_CONFIG = {
  enableCart: false,           // true: muestra carrito de compras
  enableCheckout: false,       // true: habilita pasarela de pagos
  showPrices: false,           // false: "Consultar precio", true: "$1,200.00"
  contactMode: 'whatsapp',     // 'whatsapp' | 'checkout'
  whatsappNumber: '5255000000' // Tu número para consultas
};
```

### Componente Flexible: `ProductActions`

En lugar de tener un botón fijo de "Agregar al Carrito", crea un componente inteligente que decida qué mostrar:

```tsx
// Ejemplo conceptual
import { SHOP_CONFIG } from '@/config/shop';

export const ProductActions = ({ product }) => {
  if (SHOP_CONFIG.enableCart) {
    return <Button onClick={() => addToCart(product)}>Agregar al Carrito</Button>;
  }
  
  return (
    <Button 
      variant="whatsapp"
      href={`https://wa.me/${SHOP_CONFIG.whatsappNumber}?text=Me interesa el modelo ${product.name}`}
    >
      Consultar por WhatsApp
    </Button>
  );
};
```

## 3. Tecnologías Recomendadas para la Siguiente Étapa

Para implementar esta arquitectura, necesitarás instalar las siguientes librerías:

1.  **Enrutamiento**: `react-router-dom`
    *   Para navegar entre `Inicio`, `Catálogo`, y `Detalle de Producto`.
2.  **Gestión de Estado**: `zustand` (Recomendado) o `Context API`
    *   Para manejar el carrito de compras (incluso si está oculto) y filtros de búsqueda.
3.  **Iconos**: `lucide-react` o `heroicons`
    *   Para iconos de carrito, usuario, filtros, etc.
4.  **CMS (Opcional)**:
    *   Si el cliente quiere editar productos él mismo, considera conectar el `data/products.ts` con un **Headless CMS** como *Strapi*, *Sanity*, o incluso una base de datos simple en *Supabase*.

## 4. Pasos de Implementación

1.  **Fase 1 (Catálogo)**:
    *   Implementar `react-router-dom`.
    *   Crear la vista de `Catalog.tsx` con una grilla de productos desde un JSON.
    *   Crear `ProductDetail.tsx` para ver fotos y descripción.
    *   El botón de acción envía un mensaje predefinido a WhatsApp con el nombre del modelo.

2.  **Fase 2 (Preparación E-commerce)**:
    *   Implementar el `CartContext` o Tienda de Zustand.
    *   Habilitar el botón "Agregar a Favoritos/Carrito" (puede servir como lista de deseos inicialmente).

3.  **Fase 3 (Venta)**:
    *   Cambiar `SHOP_CONFIG.enableCart = true`.
    *   Integrar pasarela de pagos (Stripe/PayPal/MercadoPago).
    *   Conectar la orden final con un backend o servicio de notificaciones.
