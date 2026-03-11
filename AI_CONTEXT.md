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
| B-06 | Preloader ("Próximamente") reaparece al perder foco | Refactor de `ConfigContext` y `AppRoutes` para ignorar `loading` si ya hay config cargada. |
| B-07 | NavigatorLockAcquireTimeoutError (Supabase) | Implementación de `lock` bypass funcional en `supabase.ts` para evitar esperas de 10s. |
| B-08 | TypeError: this.lock is not a function | Actualizada firma de la función `lock` para compatibilidad con Supabase v2.97.0. |
| B-09 | Favicon no se actualizaba | Agregado `favicon_url` a `SiteConfig` y lógica de inyección en `<head>` vía `ConfigProvider`. |

---

## 🛠️ Próximos Pasos (Ordenados por Prioridad)

1. **🟡 MEDIO:** Revisar optimización de imágenes en el catálogo (tamaño de archivo vs calidad).
2. **🟢 BAJO:** Mejorar diseño de los mensajes de error en formularios de contacto.
3. **🟢 BAJO:** Implementar sistema de búsqueda de productos en el catálogo principal.
4. **⏳ LANZAMIENTO:** Solicitar aprobación final para eliminar el modo mantenimiento por defecto.

---

## 🛠️ Notas Técnicas Importantes

-   **Supabase Sessions (v2.97.0):** Para evitar bloqueos del `Navigator LockManager` en navegadores modernos, se usa una función `lock` personalizada en `createClient` que ejecuta directamente los callbacks.
-   **Failsafe Auth:** El inicio de sesión en `AuthContext.tsx` tiene un timeout de 2.5s para no congelar la UI si Supabase tarda en responder.
-   **Favicon Dinámico:** Se inyecta directamente al DOM en `ConfigProvider.tsx` buscando `link[rel~='icon']`.
-   **Instalación:** Si se cambia de máquina, asegurar que las variables `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` estén configuradas correctamente en el entorno.

---

## 🛠️ Archivos Recientemente Modificados:
- `src/lib/supabase.ts` (Lock bypass, compatibilidad v2.97.0)
- `src/context/AuthContext.tsx` (Failsafe timeout initialization)
- `src/context/ConfigContext.tsx` (Silent refresh, Favicon update)
- `src/App.tsx` (Resilient routing for maintenance vs content)
- `src/pages/Admin.tsx` (Favicon state management)

---

*Actualizado por Antigravity — Agente IA de desarrollo. Última actualización: 11/03/2026 15:25 hrs*
