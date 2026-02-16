# Estado del Proyecto: Arcángel Ceremonias

Este archivo es un resumen para que la IA en tu otra computadora continúe exactamente donde nos quedamos.

## 📝 Resumen Ejecutivo

**Última actualización:** 16 de febrero de 2026.
**Objetivo:** Crear una landing page de "Próximamente" (Under Construction) con animaciones elegantes y prepararse para escalar a un catálogo.

## 🚀 Lo que se ha hecho

### 1. Desarrollo Frontend
*   **Landing Page**: Diseño limpio y elegante con Tailwind CSS.
    *   Logo centrado con animación sutil.
    *   Fondo con zoom lento ("Ken Burns effect").
    *   Textos animados ("reveal-up").
    *   Tipografías elegantes (Playfair Display para títulos).
*   **Correcciones**:
    *   Se arreglaron errores de compilación en `index.css` (animaciones con valores arbitrarios no soportados).
    *   Se arreglaron configuraciones de `vite.config.ts` y `tailwind.config.js`.

### 2. Despliegue (Vercel)
*   **URL de Producción**: `https://arcangelceremonias.vercel.app`
*   **Usuario**: `proyectonetia-8500` (anteriormente `vascodequirogatareas`).
*   **Configuración DNS**: Se dejaron instrucciones para configurar el dominio personalizado (`A` record `76.76.21.21`).

### 3. Escalabilidad (E-commerce)
*   Se creó el archivo `ARCHITECTURE.md` con la estrategia para convertir la landing en una tienda.
    *   Estrategia "Catálogo Primero".
    *   Switch de configuración (`SHOP_CONFIG`) para activar/desactivar carrito.

### 4. Control de Versiones (Git)
*   Repositorio inicializado localmente.
*   Conectado a GitHub: `https://github.com/proyectoNet-ia/arcangelCeremonias`.
*   Usuario configurado: "Proyecto Net IA" (`proyectonet.ia@gmail.com`).

---

## 🛠️ Cómo continuar en la nueva PC

1.  **Clonar el proyecto**:
    ```bash
    git clone https://github.com/proyectoNet-ia/arcangelCeremonias.git
    cd arcangelCeremonias
    npm install
    npm run dev
    ```

2.  **Instrucciones para la IA**:
    Cuando abras el chat en la nueva PC, dile:
    > "Lee el archivo AI_CONTEXT.md para ponerte al día con el estado del proyecto".

3.  **Siguientes pasos pendientes**:
    *   Configurar el dominio personalizado en el proveedor de dominios del cliente.
    *   (Futuro) Implementar la Fase 1 del Catálogo según `ARCHITECTURE.md`.
