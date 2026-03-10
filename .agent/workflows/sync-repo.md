---
description: Sincronizar repositorio entre computadoras (pull / push)
---

## Descargar cambios en la OTRA computadora (pull)

Antes de empezar a trabajar en una PC diferente, corre esto:

// turbo
1. Obtén los últimos cambios del repositorio remoto:
```
git pull origin catalog-development
```

---

## Subir cambios al repositorio (push) al terminar la sesión

Al terminar de trabajar, corre estos 3 comandos en orden:

// turbo
2. Agrega todos los cambios:
```
git add -A
```

// turbo
3. Crea el commit con descripción de lo que hiciste:
```
git commit -m "descripción breve de los cambios"
```

// turbo
4. Sube los cambios al repositorio:
```
git push origin catalog-development
```

---

## ⚠️ Reglas importantes

- Siempre trabajar en la rama `catalog-development`, NUNCA en `main`.
- El merge a `main` dispara el deploy a producción en Vercel.
- Si hay conflictos al hacer pull, avisar al agente IA para resolverlos.
