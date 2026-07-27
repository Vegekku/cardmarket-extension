# Cardmarket Extension

Extensión de Chrome que resalta términos de búsqueda en [Cardmarket](https://www.cardmarket.com), el marketplace europeo de cartas coleccionables (Magic, Pokémon, Yu-Gi-Oh!, etc.).

## Funcionalidades

### Resaltado de términos
- Introduce uno o varios términos en el popup separados por coma.
- Al pulsar **Resaltar**, los términos se guardan y se resaltan en amarillo en la página activa.
- Los términos persisten entre sesiones y se aplican automáticamente al navegar por Cardmarket.

## Instalación

1. Clona o descarga este repositorio.
2. Abre Chrome y ve a `chrome://extensions/`.
3. Activa el **Modo desarrollador** (esquina superior derecha).
4. Haz click en **Cargar descomprimida** y selecciona la carpeta del proyecto.

## Almacenamiento de datos

Los términos introducidos se guardan en `chrome.storage.sync`, vinculados al perfil de Chrome y sincronizados entre dispositivos.

- **Desactivar la extensión**: los datos se conservan.
- **Desinstalar la extensión**: los datos se eliminan permanentemente.

## Estructura del proyecto

```
cardmarket-extension/
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── background.js    # Service worker: aplica el resaltado al cargar/cambiar de pestaña
├── content.js       # Script inyectado: resalta términos en la página
├── popup.html       # Popup del icono de la extensión
├── popup.js         # Lógica del popup
├── manifest.json    # Configuración de la extensión
├── CHANGELOG.md     # Historial de versiones
└── IMPROVEMENTS.md  # Ideas y mejoras pendientes
```

## Compatibilidad

- Chrome con Manifest V3.
- Funciona en `*://*.cardmarket.com/*`.
