# Cardmarket Extension

Extensión de Chrome que resalta usuarios en [Cardmarket](https://www.cardmarket.com), el marketplace europeo de cartas coleccionables (Magic, Pokémon, Yu-Gi-Oh!, etc.).

## Funcionalidades

### Resaltado de usuarios
- Introduce uno o varios nombres de usuario en el popup separados por espacio, salto de línea o coma.
- Los usuarios se guardan automáticamente y se resalta en azul-cian la fila completa de cada usuario coincidente en el listado de artículos.
- Los usuarios persisten entre sesiones y se aplican automáticamente al navegar por las páginas de producto de Cardmarket.
- El botón **Vaciar** elimina todos los usuarios guardados.
- El toggle **Activar resaltado** permite activar o desactivar el resaltado sin borrar los usuarios.
- Al guardar o vaciar la lista se muestra un mensaje de confirmación temporal en el popup.

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
│   ├── background.js    # Service worker
│   ├── content.js       # Script inyectado: resalta usuarios en la página
│   ├── popup.html       # Popup del icono de la extensión
│   ├── popup.css        # Estilos del popup
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
