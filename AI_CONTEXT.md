# Estado del Proyecto: Arcángel Ceremonias

Este archivo es un resumen actualizado para mantener la continuidad del desarrollo entre diferentes sesiones o dispositivos.
**Instrucción para el agente IA:** Lee este archivo COMPLETO antes de comenzar a trabajar. Usa la sección "Próximos Pasos" como punto de partida.

---

## 🏆 REGLA DE ORO — PROHIBIDO TOCAR MAIN

> **NO TOCAR LA RAMA `main` NI REALIZAR DESPLIEGUES A PRODUCCIÓN (`--prod`) SIN INDICACIÓN EXPLÍCITA DEL USUARIO.**
> Cualquier cambio debe desarrollarse y probarse en ramas de previsualización o localmente. La estabilidad del sitio público es la prioridad número uno.

---

## ⚠️ REGLA CRÍTICA — Leer Antes de Cualquier Acción

> **ESTAMOS EN FASE DE DESARROLLO LOCAL.**
> El sitio de producción `https://www.ceremoniasarcangel.com` está mostrando una **página de "Próximamente"** al público.
> **NO realizar `git push` a main, `vercel --prod`, ni despliegues oficiales** hasta que el cliente apruebe explícitamente hacerlo.
> Todo el trabajo se desarrolla y prueba en `http://localhost:3000` o URLs de previsualización únicamente.

---

## 📝 Resumen Ejecutivo
 
**Última actualización:** 26 de febrero de 2026 — 15:35 hrs
**Rama activa:** `main` (local, sincronizada vía OneDrive)
**Entorno activo:** `http://localhost:3000` (desarrollo local)
**Producción:** `https://www.ceremoniasarcangel.com` — ⛔ Mostrando página "Próximamente", NO tocar.

---

## 🏗️ Arquitectura del Proyecto

- **Stack:** React 19 + Vite + TypeScript + Tailwind CSS + Framer Motion + FontAwesome
- **Backend:** Supabase (PostgreSQL) — mismo proyecto Supabase para dev y prod (usar con cuidado)
- **Gestión de Estado:** React Context API (`ConfigContext`) — inyecta colores y config al DOM
- **Autenticación:** Supabase Auth (admin panel en `/admin`)
- **Repositorio:** `https://github.com/proyectoNet-ia/arcangelCeremonias`
- **Servidor local:** `npm run dev` → `http://localhost:3000`

---

## 🧩 Estado del CMS Admin — Completado al 25/02/2026

### ✅ Secciones implementadas y funcionales:

| Sección Admin | Ruta | Descripción |
|---------------|------|-------------|
| Dashboard | `/admin` | Estadísticas generales (algunas son placeholder) |
| Productos | `/admin/productos` | CRUD completo + upload de imágenes a Supabase Storage |
| Categorías | `/admin/productos` | Gestión de categorías incluida en Productos |
| Hero Slider | `/admin/hero` | CRUD de diapositivas con imagen, textos, alineación y botones |
| Configuración | `/admin/configuracion` | Todo lo de abajo ↓ |

### Dentro de `/admin/configuracion` (5 secciones):

1. **Identidad Visual y Colores** — Color Primario (chocolate/oscuro), Secundario (gold/detalles), Acento (cream/fondos). Se aplican en todo el sitio vía CSS variables `var(--color-*)`.
2. **Logos** — Logo para fondos claros y Logo para fondos oscuros. Upload a Supabase Storage, fallback automático al SVG original si no hay imagen.
3. **Información de Identidad** — Nombre empresa, WhatsApp, teléfono, email, redes sociales.
4. **Página "Nosotros"** — Subtítulo, título, cita destacada, 3 párrafos, URL de imagen, 4 estadísticas (valor + etiqueta).
5. **Banner CTA Mayoreo (Home)** — Etiqueta, título, subtítulo dorado, cuerpo del texto, texto de botón 1 (WhatsApp) y botón 2 (teléfono).

---

## 📄 Páginas Públicas — Estado

| Página | Ruta | Estado | Dinámica desde CMS |
|--------|------|--------|--------------------|
| Home | `/` | ✅ Funcional | Hero, CTA Mayoreo, Productos Destacados |
| Catálogo | `/catalogo` | ✅ Funcional | Productos y categorías desde Supabase |
| Detalle Producto | `/catalogo/:slug` | ✅ Funcional | Galería, variantes, WhatsApp |
| Nosotros | `/nosotros` | ✅ Funcional | Todos los textos e imagen desde CMS |
| Contacto | `/contacto` | ✅ Funcional | Datos desde ConfigContext |

---

## 🐛 Issues Conocidos (por resolver)

| ID | Descripción | Severidad | Estado |
|----|-------------|-----------|--------|
| B-01 | Stats del Dashboard (visitas, consultas) son valores ficticios | Medio | Pendiente |
| B-04 | Verificar protección de ruta `/admin` (auth guard) | Alto | Pendiente revisión |
| B-05 | Catálogo PDF integrado en Panel Admin | Bajo | ✅ Completado |

---

## 🛠️ Próximos Pasos (Ordenados por Prioridad)

1. **🟡 MEDIO:** Galería Media Centralizada — explorador de archivos Supabase Storage en Admin para reutilizar imágenes ya subidas
2. **🟡 MEDIO:** Revisar y reforzar protección de ruta `/admin` con auth guard
3. **🟢 BAJO:** Integrar link/descarga del Catálogo PDF en el sitio público (ya se puede subir desde Admin)
4. **🟢 BAJO:** Mejorar Dashboard con estadísticas reales (visitas de Supabase Analytics o similar)
5. **⏳ CUANDO EL CLIENTE APRUEBE:** Realizar `git push` y deployment en Vercel para lanzar el sitio completo

---

## 🛠️ Notas Técnicas Importantes

-   **CSS Variables:** `--color-primary` = color oscuro/chocolate, `--color-secondary` = gold/detalles, `--color-accent` = fondo claro/cream. Tailwind usa `var(--color-*)` con fallbacks hardcodeados.
-   **Logo Fallback:** Si `logo_light_url` o `logo_dark_url` están vacíos en Supabase, el componente `Logo.tsx` muestra el SVG original. El SVG respeta la variante (`dark` = color gold, `light` = color chocolate).
-   **Supabase Compartido:** Dev y Prod usan el mismo proyecto Supabase. Los cambios en `site_config` afectan la "Próximamente" en producción también. Esto es normal y esperado.
-   **Migraciones ejecutadas:** `sql_migration_branding.sql` y `sql_migration_content.sql` ya aplicadas en Supabase.
-   **TypeScript limpio:** `npx tsc --noEmit` → exit 0, sin errores.
-   **Servicio de Carga:** Se implementó `uploadFile` en `productService` que soporta validación de tamaño (15MB para PDF) y tipos de archivo genéricos.

---

*Actualizado por Antigravity — Agente IA de desarrollo. Última actualización: 26/02/2026 15:35 hrs*
