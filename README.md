# Medieval UI

Interfaz temática medieval con menú de pergamino, paneles de contenido y efectos de antorcha interactiva sobre el fondo.

## Qué es
- Landing/SPA estilo medieval con menú lateral u horizontal.
- Paneles de contenido con estilos distintos (periódico y galería).
- Efecto de luz/antorcha con halo y partículas.

## Cómo funciona
- Click derecho: crea una antorcha fija en la posición del click.
- Click izquierdo sobre una antorcha fija: la apaga.
- Doble click izquierdo: activa/desactiva la antorcha que sigue al mouse.
- Al abrir un panel (Botón 1 o Botón 2), las antorchas fijas se ocultan; la antorcha del mouse puede seguir visible.

## Dónde cambiar el texto del menú
El texto y comportamiento del menú se configura en:
- `src/data/menuConfig.js` (labels, detalles y tipo de panel a abrir).

Otros textos de paneles:
- `src/data/dailyProphetContent.js` (contenido del panel tipo periódico).
- `src/data/galleryContent.js` (título/etiquetas de la galería).

## Ejecutar en local
Requisitos: Node.js 18+ (recomendado).

Instalar dependencias:
```
npm install
```

Servidor de desarrollo:
```
npm run dev
```

Build de producción:
```
npm run build
```

Vista previa del build:
```
npm run preview
```

## Despliegue web
1) Ejecuta `npm run build`.
2) Publica el contenido de la carpeta `dist/` en tu hosting (Netlify, Vercel, Cloudflare Pages, etc.).

Si usas un servidor propio, sirve `dist/` como sitio estático.
