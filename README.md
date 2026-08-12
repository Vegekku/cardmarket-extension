# Cardmarket Extension

Extensión de Chrome que resalta usuarios en [Cardmarket](https://www.cardmarket.com), el marketplace europeo de cartas coleccionables (Magic, Pokémon, Yu-Gi-Oh!, etc.).

## Funcionalidades

### Resaltado de usuarios
- Introduce uno o varios nombres de usuario en el popup separados por espacio, salto de línea o coma.
- Los usuarios se guardan automáticamente y se resalta la fila completa de cada usuario coincidente en el listado de artículos.
- Los usuarios persisten entre sesiones y se aplican automáticamente al navegar por Cardmarket.
- El botón **Vaciar** elimina todos los usuarios guardados.
- El toggle **Activar resaltado** permite activar o desactivar el resaltado sin borrar los usuarios.
- Al guardar o vaciar la lista se muestra un mensaje de confirmación temporal en el popup.
- El color de resaltado se actualiza en tiempo real al cambiar el tema claro/oscuro de Cardmarket.
- La interfaz del popup y la página de opciones se muestran en el idioma de Cardmarket (español, inglés, francés, alemán e italiano).

### Página de opciones
- Accesible desde `chrome://extensions` → botón **Detalles** → **Opciones de la extensión**.
- Permite configurar el color de resaltado por separado para modo claro y modo oscuro.
- Incluye previsualización en vivo del color seleccionado antes de guardar.
- Los cambios de color se aplican en todas las pestañas abiertas de Cardmarket sin recargar.
- Permite ajustar el tamaño de los checkboxes en el listado de pedido (rango de 1em a 3em, con previsualización en vivo del checkbox).
- Permite activar el atenuado de filas al marcar su checkbox en el listado de pedido, con opacidad configurable.
- Permite activar la visualización de imágenes de cartas inline en el listado de pedido, con altura configurable.
- Incluye previsualización en vivo de la sección Pedido (checkboxes, opacidad e imágenes inline) con toggle de modo claro/oscuro.

## Instalación

1. Clona o descarga este repositorio.
2. Instala las dependencias: `npm install`
3. Genera el build: `npm run build`
4. Abre Chrome y ve a `chrome://extensions/`.
5. Activa el **Modo desarrollador** (esquina superior derecha).
6. Haz click en **Cargar descomprimida** y selecciona la carpeta `dist/`.

## Desarrollo

- `npm run build` — build de producción en `dist/`
- `npm run dev` — build en modo watch (reconstruye al guardar)
- `npm run dev:build` — build de desarrollo sin minificar
- `npm run zip` — genera un zip distribuible en `packages/`

## Almacenamiento de datos

Los usuarios introducidos se guardan en `chrome.storage.sync`, vinculados al perfil de Chrome y sincronizados entre dispositivos.

- **Desactivar la extensión**: los datos se conservan.
- **Desinstalar la extensión**: los datos se eliminan permanentemente.

## Estructura del proyecto

```
cardmarket-extension/
├── src/
│   ├── content/
│   │   ├── content-common.js      # Inicialización compartida entre content scripts (idioma)
│   │   ├── content-highlight.js   # Resaltado de usuarios en páginas de Products
│   │   └── content-order.js       # Features de pedido (imágenes inline, opacidad, checkbox)
│   ├── options/
│   │   ├── options-preview.js     # Lógica de previsualizaciones (colores y pedido)
│   │   ├── options.js             # Lógica de la página de opciones
│   │   ├── options.html           # Página de opciones de la extensión
│   │   ├── popup.js               # Lógica del popup
│   │   ├── popup.html             # Popup del icono de la extensión
│   │   ├── preview.html           # Fragmento HTML para la previsualización de colores
│   │   ├── order-preview.html     # Fragmento HTML para la previsualización de pedido
│   │   └── styles/
│   │       ├── common.css         # Estilos compartidos (popup y opciones)
│   │       ├── popup.css          # Estilos específicos del popup
│   │       ├── options.css        # Estilos específicos de opciones
│   │       ├── preview.css        # Estilos de la previsualización de colores
│   │       └── order-preview.css  # Estilos de la previsualización de pedido
│   └── shared/
│       ├── color-utils.js         # Conversión entre formatos rgba y hex
│       ├── defaults.js            # Constantes de valores por defecto compartidas
│       ├── i18n.js                # Traducciones de la UI (es, en, fr, de, it)
│       └── order-features.js      # Lógica compartida de features de pedido
├── docs/
│   ├── STORE.md           # Descripción y capturas para la Chrome Web Store
│   └── privacy.html       # Política de privacidad
├── dist/                  # Build generado (no commitear)
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── build.js               # Script de build (esbuild)
├── zip.js                 # Genera el zip para la Chrome Web Store
├── package.json
├── manifest.json          # Configuración de la extensión
├── CHANGELOG.md           # Historial de versiones
└── IMPROVEMENTS.md        # Ideas y mejoras pendientes
```

## Compatibilidad

- Chrome con Manifest V3.
- Funciona en `*://*.cardmarket.com/*`.
