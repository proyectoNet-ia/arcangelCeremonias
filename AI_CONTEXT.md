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
 
**Última actualización:** 11 de marzo de 2026 — 15:25 hrs
**Rama activa:** `main` (local, sincronizada vía OneDrive)
**Entorno activo:** `http://localhost:3000` (desarrollo local)
**Producción:** `https://www.ceremoniasarcangel.com` — ⛔ En fase de correcciones de estabilidad y favicon.

---

## 🏗️ Arquitectura del Proyecto

- **Stack:** React 19 + Vite + TypeScript + Tailwind CSS + Framer Motion + FontAwesome
- **Backend:** Supabase (PostgreSQL) — mismo proyecto Supabase para dev y prod (usar con cuidado)
- **Gestión de Estado:** React Context API (`ConfigContext`) — inyecta colores y config al DOM
- **Autenticación:** Supabase Auth (admin panel en `/admin`)
- **Repositorio:** `https://github.com/proyectoNet-ia/arcangelCeremonias`
- **Servidor local:** `npm run dev` → `http://localhost:3000`

---

## 🧩 Estado del CMS Admin — Completado al 11/03/2026

### ✅ Secciones implementadas y funcionales:

| Sección Admin | Ruta | Descripción |
|---------------|------|-------------|
| Dashboard | `/admin` | Estadísticas reales de visitas y clics de WhatsApp |
| Productos | `/admin/productos` | CRUD completo + upload de imágenes a Supabase Storage |
| Categorías | `/admin/productos` | Gestión de categorías incluida en Productos |
| Hero Slider | `/admin/hero` | CRUD de diapositivas con imagen, textos, alineación y botones |
| Configuración | `/admin/configuracion` | Favicon, Colores, Logos, Nosotros, CTA Banner |
| Usuarios | `/admin/usuarios` | Gestión de roles (Admin/Editor) con RLS fix. |

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

## 🐛 Issues Corregidos (Marzo 2026)

| ID | Descripción | Solución |
|----|-------------|----------|
| B-10 | Login 500 (Confirmation tokens NULL) | Reparados tokens nulos en `auth.users` que bloqueaban el motor GoTrue de Supabase. |
| B-11 | Recursión RLS en Profiles | Implementada política basada en JWT metadata para evitar consultas cíclicas a la propia tabla. |
| B-12 | Bundle size excesivo | Implementado **Lazy Loading** en `App.tsx` para separar el CMS de la parte pública. |

---

## 🛠️ Próximos Pasos (Ordenados por Prioridad)

1. **🟡 ALTA:** Implementar barra de búsqueda de productos en el catálogo principal.
2. **🟡 ALTA:** Revisar optimización de imágenes en el catálogo (formato WebP y límites de resolución).
3. **🟢 BAJO:** Mejorar diseño de los mensajes de error en formularios de contacto.
4. **⏳ LANZAMIENTO:** Solicitar aprobación final para eliminar el modo mantenimiento por defecto.

---

## 🛠️ Notas Técnicas Importantes

-   **Code Splitting:** Se utiliza `React.lazy` para todas las rutas. El bundle inicial se redujo un ~25%.
-   **RBAC (Role Based Access Control):** Los editores solo ven inventario y galería. Los admins ven todo.
-   **Supabase Sessions:** Bypass de locks activo para estabilidad en Chrome/Edge.

---

## 🛠️ Archivos Recientemente Modificados:
- `src/App.tsx` (Lazy loading implementation)
- `src/pages/Admin.tsx` (Role access restriction for editors)
- `src/components/admin/AdminLayout.tsx` (Sidebar dynamic visibility per role)
- `sql_migration_fix_schema.sql` (Final RLS and token fixes)

---

*Actualizado por Antigravity — Agente IA de desarrollo. Última actualización: 11/03/2026 21:00 hrs*
