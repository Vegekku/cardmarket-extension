# Changelog

Todos los cambios notables de este proyecto se documentan aquí.
Formato basado en [Keep a Changelog](https://keepachangelog.com/es/1.0.0/).
Versionado según [Semantic Versioning](https://semver.org/lang/es/).

## [v1.3.0] - 2026-08-16

### Added

- Tamaño de checkbox configurable en el listado de pedido (rango 1em–3em) con previsualización en vivo
- Atenuado de filas al marcar su checkbox en el listado de pedido, con opacidad configurable
- Imágenes de cartas inline en el listado de pedido, con altura configurable
- Previsualización en vivo de la sección Pedido en la página de opciones (checkboxes, opacidad e imágenes inline) con toggle de modo claro/oscuro
- Bloques colapsables por categoría en el pedido y desglose del valor por categoría
- Reescritura de los enlaces del selector de juego en páginas de usuario para mantener el contexto del vendedor al cambiar de juego
- Preservación de la categoría actual y filtros genéricos al cambiar de juego (sub-opción configurable)
- Formulario de feedback accesible desde la sección Acerca de de la página de opciones, con idioma, versión y tema pre-rellenados
- Página web pública de la extensión alojada en GitHub Pages, desplegada automáticamente vía GitHub Actions
- Modal de confirmación antes de restablecer los ajustes de la página de opciones

### Changed

- Extensión renombrada de Cardmarket Highlighter a **Cardmarket Enhancer**, con nuevo diseño de icono
- `src/` reorganizado en subcarpetas `content/`, `options/` y `shared/` para mejor separación de responsabilidades

## [v1.2.1] - 2026-08-10

### Fixed

- Actions de CI corregidos tras el cambio de flujo de releases: uso de `RELEASE_PAT` para el fast-forward de `develop` y corrección del borrado automático de ramas `release/*`

## [v1.2.0] - 2026-08-10

### Added

- Página de opciones accesible desde `chrome://extensions` con selector de color de resaltado para modo claro y oscuro, previsualización en vivo y aplicación en tiempo real en todas las pestañas abiertas de Cardmarket
- Internacionalización de la UI (popup y opciones) en los 5 idiomas de Cardmarket: español, inglés, francés, alemán e italiano

### Changed

- El content script persiste el idioma de Cardmarket en `chrome.storage.local` para que popup y opciones lo lean sin acceder al DOM
- Eliminado `background.js` (estaba vacío); el match de `content_scripts` se amplía a `*://*.cardmarket.com/*`

## [v1.1.0] - 2026-08-06

### Added

- Popup rediseñado: estilos CSS, botón Vaciar, toggle de activación y autoguardado con debounce
- Feedback visual temporal en el popup al guardar y al vaciar la lista de usuarios
- Toggle CSS puro en sustitución del checkbox nativo

### Changed

- Migración a estructura `src/` con bundling mediante esbuild
- Documentación JSDoc en todos los módulos
- Resaltado basado en selector de URL de vendedor (`href$=/Users/<term>`) en lugar de nodos de texto
- Mensajería popup → content script en lugar de inyección directa
- Permisos reducidos a `storage` + `tabs`

### Fixed

- Bugs críticos en content script, background y popup (1.1, 1.2, 1.4)
- Listener del botón de resaltado movido dentro de `DOMContentLoaded`
- Observer restringido a `#table` para evitar observers zombi

## [v1.0.0] - 2026-07-27

### Added

- Versión inicial: resaltado de términos de búsqueda en páginas de Cardmarket

[v1.3.0]: https://github.com/vegekku/cardmarket-extension/compare/v1.2.1...v1.3.0
[v1.2.1]: https://github.com/vegekku/cardmarket-extension/compare/v1.2.0...v1.2.1
[v1.2.0]: https://github.com/vegekku/cardmarket-extension/compare/v1.1.0...v1.2.0
[v1.1.0]: https://github.com/vegekku/cardmarket-extension/compare/v1.0.0...v1.1.0
[v1.0.0]: https://github.com/vegekku/cardmarket-extension/releases/tag/v1.0.0
