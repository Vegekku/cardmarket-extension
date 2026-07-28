# Cardmarket Extension

Extensión de Chrome que resalta términos de búsqueda en [Cardmarket](https://www.cardmarket.com), el marketplace europeo de cartas coleccionables (Magic, Pokémon, Yu-Gi-Oh!, etc.).

## Funcionalidades

### Resaltado de vendedores
- Introduce uno o varios nombres de vendedor en el popup separados por coma.
- Al pulsar **Resaltar**, los vendedores se guardan y se resalta en azul-cian la fila completa de cada vendedor coincidente en el listado de artículos.
- Los vendedores persisten entre sesiones y se aplican automáticamente al navegar por las páginas de producto de Cardmarket.

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

Los términos introducidos se guardan en `chrome.storage.sync`, vinculados al perfil de Chrome y sincronizados entre dispositivos.

- **Desactivar la extensión**: los datos se conservan.
- **Desinstalar la extensión**: los datos se eliminan permanentemente.

## Estructura del proyecto

```
cardmarket-extension/
├── src/
│   ├── background.js    # Service worker
│   ├── content.js       # Script inyectado: resalta términos en la página
│   ├── popup.html       # Popup del icono de la extensión
│   └── popup.js         # Lógica del popup
├── dist/            # Build generado (no commitear)
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── build.js         # Script de build (esbuild)
├── zip.js           # Genera el zip para la Chrome Web Store
├── package.json
├── manifest.json    # Configuración de la extensión
├── CHANGELOG.md     # Historial de versiones
└── IMPROVEMENTS.md  # Ideas y mejoras pendientes
```

## Compatibilidad

- Chrome con Manifest V3.
- Funciona en `*://*.cardmarket.com/*/Products/*`.
