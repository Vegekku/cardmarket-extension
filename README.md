# Cardmarket Extension

Extensión de Chrome que resalta términos de búsqueda en [Cardmarket](https://www.cardmarket.com), el marketplace europeo de cartas coleccionables (Magic, Pokémon, Yu-Gi-Oh!, etc.).

## Funcionalidad

- Introduce uno o varios términos en el popup separados por coma
- Al pulsar **Resaltar**, los términos se guardan y se resaltan en amarillo en la página activa
- Los términos persisten entre sesiones y se aplican automáticamente al navegar por Cardmarket

## Instalación

1. Clona el repositorio
2. Abre `chrome://extensions` en Chrome
3. Activa el **Modo desarrollador**
4. Pulsa **Cargar descomprimida** y selecciona la carpeta del proyecto

## Estructura

- `manifest.json` — Configuración de la extensión
- `background.js` — Service worker: aplica el resaltado al cargar/cambiar de pestaña
- `content.js` — Script inyectado: resalta términos en los enlaces de la página
- `popup.html` / `popup.js` — Popup del icono: entrada de términos y disparo del resaltado
