# Guía de Sincronización - Arcángel Ceremonias

Esta guía te ayudará a mantener tu código actualizado cuando trabajes entre diferentes computadoras (Casa y Oficina).

## 🚀 Al LLEGAR a trabajar (Sincronizar hacia abajo)
Antes de empezar a programar, asegúrate de tener los últimos cambios realizados en la otra PC:

```powershell
# 1. Traer los cambios de la nube
git pull origin main

# 2. Asegurarse de que las librerías estén instaladas (especialmente si hubo cambios estructurales)
npm install
```

---

## 💾 Al TERMINAR de trabajar (Sincronizar hacia arriba)
Sube tus cambios para que estén listos cuando abras el proyecto en la otra computadora:

```powershell
# 1. Preparar los archivos
git add .

# 2. Guardar con un mensaje de lo que hiciste
git commit -m "Ajustes realizados en el catálogo"

# 3. Subir a GitHub
git push origin main
```

---

## 🌐 Ver cambios en Vercel
Recuerda que cada vez que haces un `git push`, Vercel detecta el cambio y actualiza el sitio web automáticamente. 

Si por alguna razón necesitas forzar el despliegue manualmente:
```powershell
.\node_modules\.bin\vercel --prod
```

---

## ⚠️ Notas Importantes
- **Cierre de Procesos**: Si tienes problemas para borrar archivos o instalar, asegúrate de cerrar el servidor de desarrollo (`Ctrl + C`) y VS Code.
- **Espacio en Disco**: Si tienes problemas de espacio en el disco `C:`, recuerda que configuramos el caché en `D:\npm-cache`.
