# Mejoras pendientes

## Priorización

| Prioridad | Puntos |
|-----------|--------|
| 1 — Bugs críticos | |
| 2 — Infraestructura y calidad | |
| 3 — UX | [3.6](#36-ocultar-secciones-de-la-ui-de-cardmarket), [3.8](#38-accesibilidad-wcag), [3.9](#39-simplificación-de-selectores-y-filtros-de-cardmarket) |
| 4 — Funcionalidad nueva | [4.3](#43-modo-filtro-mostrar-solo-vendedores-resaltados), [4.5](#45-añadir-vendedor-al-resaltado-al-comprar-sus-cartas), [4.6](#46-reescritura-de-enlaces-del-selector-de-juego-en-contexto-de-usuario), [4.7](#47-filtro-de-precio-en-el-listado-de-vendedores-de-una-carta), [4.9](#49-pago-selectivo-de-pedidos-en-el-carrito), [4.10](#410-añadir--quitar-vendedor-con-doble-click), [4.11](#411-compatibilidad-con-firefox), [4.13](#413-página-web-pública-de-la-extensión), [4.14](#414-selector-de-vista-listacuadrícula-en-artículos-de-vendedor), [4.15](#415-imágenes-inline-en-más-páginas-de-cardmarket), [4.16](#416-formulario-de-feedback-abierto), [4.17](#417-features-de-pedido-en-el-carrito-de-compra) |
| 5 — Brainstorming | [4.1](#41-colores-personalizables-por-término), [4.4](#44-navegación-entre-coincidencias) |

---

## Índice

- [1. Bugs críticos](#1-bugs-críticos)
- [2. Infraestructura y calidad](#2-infraestructura-y-calidad)
- [3. UX / Popup](#3-ux--popup)
- [4. Funcionalidad nueva](#4-funcionalidad-nueva)
- [5. Brainstorming](#5-brainstorming)

---

## 1. Bugs críticos

---

## 2. Infraestructura y calidad

---

## 3. UX / Popup

### 3.6 Ocultar secciones de la UI de Cardmarket

Permitir al usuario ocultar secciones de la interfaz de Cardmarket que no le resulten útiles (banners, sidebars, secciones de navegación, etc.) mediante CSS inyectado.

Pendiente de analizar:
- Qué secciones son candidatas a ocultar (requiere inspección del DOM de las páginas principales).
- Si el ocultado debe ser por página/contexto o global.

Se expone en la página de opciones ([3.5](#35-página-de-opciones)).

Ficheros afectados: `src/content/content-highlight.js`, `src/options/options.html`, `src/options/options.js`.

### 3.8 Accesibilidad WCAG

Auditoría completa de accesibilidad de la extensión. Problemas identificados:

- **Contraste insuficiente (WCAG 1.4.3 AA / 1.4.6 AAA)**:
  - Botón "Vaciar": `#666` sobre `#e0e0e0` (~3.1:1, falla AA).
  - Toast `#saveStatus`: `#2a9d5c` sobre `#d4f5e2` (~3.8:1, falla AA).
  - Placeholder del textarea: `#767676` sobre `#fff` (~4.5:1, pasa AA justo, falla AAA).
- **Semántica HTML (WCAG 1.3.1)**:
  - `<h3>` sin `<h1>`/`<h2>` previo — jerarquía de headings rota.
  - `<textarea>` sin `<label>` asociado; el `placeholder` no es suficiente.
- **Regiones dinámicas (WCAG 4.1.3)**: `#saveStatus` cambia de contenido dinámicamente pero carece de `role="status"` y `aria-live="polite"` — los lectores de pantalla no lo anuncian.
- **CSS muerto**: `.toggle-row { display: none }` — residuo de refactorización, eliminar.

Pendiente de decidir la estrategia de verificación, teniendo en cuenta el crecimiento previsto del proyecto (página de opciones en 3.5, UI inyectada en content.js en múltiples mejoras del bloque 4):

- **Fase 1 (ahora)**: añadir regla en `.amazonq/rules/accessibility.md` con checklist WCAG AA/AAA aplicable a cada fichero HTML/CSS tocado. Sin dependencias extra, coste cero.
- **Fase 2 (cuando exista `options.html` u otro HTML propio)**: integrar `@axe-core/cli` + Playwright como script `npm run a11y` que audite todos los HTML propios de la extensión en un browser headless. Añadir al flujo de cierre de feature como paso previo al commit.

Ficheros afectados: `src/options/popup.html`, `src/options/styles/popup.css`, `src/options/options.html`, `.amazonq/rules/accessibility.md` (nuevo), `package.json` (fase 2).

### 3.9 Simplificación de selectores y filtros de Cardmarket

Reducir las opciones visibles en los dropdowns de Cardmarket para agilizar la navegación, ocultando valores poco usados.

Pendiente de analizar:
- La implementación debe ser dinámica: la extensión accede a la URL correspondiente, extrae los elementos y sus opciones del DOM, y genera los controles de configuración en la página de opciones. Esto cubre posibles cambios futuros en la UI de Cardmarket sin necesidad de actualizar la extensión.
- Qué selectores/filtros son candidatos (requiere inspección del DOM).

Se expone en la página de opciones ([3.5](#35-página-de-opciones)).

Ficheros afectados: `src/content/content-highlight.js`, `src/options/options.html`, `src/options/options.js`.

---

## 4. Funcionalidad nueva

### 4.3 Modo filtro: mostrar solo vendedores resaltados

Añadir una opción para que, además de resaltar las filas de los vendedores guardados, se oculten el resto de filas del listado, mostrando únicamente las coincidencias.

El filtro se aplica sobre los artículos presentes en el DOM en cada momento. Cuando Cardmarket carga nuevos artículos mediante "ver más" (llamada Ajax a `https://www.cardmarket.com/{lang}/{game}/AjaxAction/Product_LoadMoreArticles`, respuesta Base64 que se inyecta en el DOM), el MutationObserver existente los detecta y aplica el filtro automáticamente.

Pendiente de decidir:
- Si la extensión debe auto-pulsar "ver más" cuando el filtro está activo, para cargar todos los lotes sin intervención del usuario. Opciones barajadas:
  - **Sin auto-carga**: el filtro aplica solo sobre lo cargado; el usuario pulsa manualmente.
  - **Auto-carga completa**: la extensión pulsa "ver más" en bucle hasta agotar resultados y luego filtra.
  - **Auto-carga bajo demanda**: carga el siguiente lote, filtra, y continúa si no hay coincidencias.

El estado activo/inactivo del modo filtro por defecto podría ser configurable desde la página de opciones ([3.5](#35-página-de-opciones)).

Ficheros afectados: `src/content/content-highlight.js`, `src/options/popup.html`, `src/options/popup.js`.

### 4.5 Añadir vendedor al resaltado al comprar sus cartas

Cuando el usuario añade cartas de un vendedor concreto al carrito, añadir automáticamente el nombre de ese vendedor a la lista de términos resaltados. El objetivo es facilitar la localización visual de ese vendedor en listados de cartas para construir pedidos.

Pendiente de decidir:
- El vendedor añadido automáticamente se resaltará en `rgba(100, 200, 100, 0.25)` — verde suave, reservado para distinguirlo visualmente de los términos manuales. Color descartado para el resaltado general (1.5) por reservarse para este uso.
- Cómo detectar el evento de "añadir al carrito" en la página de Cardmarket (MutationObserver sobre el DOM o intercepción de la petición de red).

Ficheros afectados: `src/content/content-highlight.js`, `src/options/popup.js`, `src/background.js`.

### 4.6 Reescritura de enlaces del selector de juego en contexto de usuario

Cuando la URL activa es de un usuario (`/{lang}/{game}/Users/{username}[/...]`), los enlaces del selector de juego nativo de Cardmarket apuntan a la home del juego (`/{lang}/{newGame}`), sacando al usuario del perfil. La extensión reescribe esos `href` para que apunten a `/{lang}/{newGame}/Users/{username}`, manteniendo el contexto del vendedor.

Decisiones de diseño:
- **Subpath** (`/Offers/Singles`, etc.): se descarta. Los subpaths pueden ser específicos del juego actual y no tienen equivalente garantizado en el destino. Se navega siempre a `/Users/{username}`.
- **Query params**: se descartan todos. `idExpansion` es específico del juego actual; `sortBy` y similares son genéricos pero su presencia en la URL destino puede causar comportamientos inesperados si la página no los espera. Coste de descartarlos: mínimo.
- **Detección de URL de usuario**: patrón `/{lang}/{game}/Users/{username}` — se activa solo en estas páginas, no en el resto de Cardmarket.
- **Momento de reescritura**: al cargar la página. No es necesario MutationObserver salvo que el selector de juego se renderice de forma diferida (pendiente de verificar).
- **Selector DOM del menú de juegos**: pendiente de inspeccionar en Cardmarket para identificar los `<a>` del dropdown de juego.

Ficheros afectados: `src/content/content-game-switcher.js` (nuevo), `manifest.json`.

### 4.7 Filtro de precio en el listado de vendedores de una carta

En el listado de vendedores de una carta concreta no existe filtro por precio, a diferencia del perfil de un vendedor donde sí está disponible. Inyectar un filtro de precio mínimo y máximo en esa página para ocultar las filas que queden fuera del rango sin necesidad de salir de la vista.

Pendiente de analizar:
- Estructura del DOM del listado de vendedores para identificar las filas y las celdas de precio.
- Si el filtrado se aplica solo sobre los resultados ya cargados en el DOM o también sobre los que se cargan con paginación/scroll infinito.
- URL pattern de la página de vendedores de una carta para restringir la inyección.
- Los valores por defecto de precio mínimo y máximo podrían ser configurables desde la página de opciones ([3.5](#35-página-de-opciones)).

Ficheros afectados: `src/content/content-highlight.js`.

### 4.9 Pago selectivo de pedidos en el carrito

El carrito organiza las cartas en pedidos por vendedor. Actualmente no es posible pagar solo algunos pedidos: al comprar se procesan todos a la vez. La única forma de pagar un subconjunto es eliminar manualmente los pedidos no deseados, procesar el pago y volver a añadir las cartas eliminadas.

Pendiente de analizar:
- Estructura del DOM del carrito para identificar los bloques de pedido por vendedor y sus artículos.
- Cómo guardar temporalmente los artículos de los pedidos excluidos (storage local) para poder restaurarlos tras el pago.
- Si Cardmarket expone algún mecanismo nativo para eliminar/restaurar pedidos completos o es necesario operar artículo a artículo.
- URL pattern de la página del carrito para restringir la inyección.

Ficheros afectados: `src/content/content-order.js`.

### 4.10 Añadir / quitar vendedor con doble click

Permitir añadir o quitar un vendedor de la lista de resaltados haciendo doble click directamente en la página, sin necesidad de abrir el popup. Si el vendedor ya está en la lista, el doble click lo elimina; si no está, lo añade y resalta la fila inmediatamente.

Pendiente de decidir:
- Zona de doble click: fila completa (`div.article-row`) o celda del vendedor (el enlace `a[href*="/Users/"]`).
- Feedback visual al añadir/quitar (ej. animación breve o cambio de color transitorio).

Ficheros afectados: `src/content/content-highlight.js`.

### 4.11 Compatibilidad con Firefox

Adaptar la extensión para que funcione también en Firefox, además de los navegadores basados en Chromium (Chrome, Edge, Brave, Opera).

Firefox usa la API `browser.*` basada en promesas, frente a la API `chrome.*` con callbacks de Chrome. La solución recomendada es integrar [`webextension-polyfill`](https://github.com/mozilla/webextension-polyfill) de Mozilla, que normaliza ambas APIs y permite mantener un único codebase.

Pendiente de analizar:
- Ajustes necesarios en `manifest.json` para Firefox (campo `browser_specific_settings`, revisión de permisos y `content_scripts`).
- Compatibilidad de las APIs usadas actualmente (`chrome.storage.sync`, `chrome.scripting`, mensajería) con el polyfill.
- Proceso de publicación en [Firefox Add-ons (AMO)](https://addons.mozilla.org/) y diferencias con la Chrome Web Store.
- Si el script de build (`build.js`) necesita cambios para generar un artefacto separado para Firefox.

Ficheros afectados: `manifest.json`, `build.js`, `package.json`, `src/background.js`, `src/content/content-highlight.js`, `src/content/content-order.js`, `src/options/popup.js`.

### 4.13 Página web pública de la extensión

Crear un directorio `/pages` con `index.html` y mover `privacy.html` desde `docs/`. Configurar GitHub Pages apuntando a `/pages` como raíz. La página puede incluir descripción de la extensión, capturas y enlace a la Chrome Web Store.

Ficheros afectados: `pages/index.html`, `pages/privacy.html` (movido desde `docs/`), `manifest.json` (actualizar URL de política de privacidad si aplica).

### 4.14 Selector de vista lista/cuadrícula en artículos de vendedor

En la página de artículos de un vendedor (`/Users/{seller}/Offers/Singles`) Cardmarket solo ofrece vista en lista, sin los botones de cambio de vista lista/cuadrícula que sí aparecen en otras páginas. Inyectar esos mismos botones para permitir cambiar entre ambas vistas.

Pendiente de analizar:
- Estructura del DOM de los botones de vista en las páginas donde sí existen, para replicarlos fielmente.
- Cómo Cardmarket gestiona el cambio de vista (CSS, clases, JS nativo) para reproducir el comportamiento.
- URL pattern exacto de la página de artículos de vendedor para restringir la inyección.

Ficheros afectados: `src/content/content-highlight.js`.

### 4.15 Imágenes inline en más páginas de Cardmarket

Extender la visualización de thumbnails inline (implementada en `/Orders/`) a otras páginas de Cardmarket que también muestran el icono de cámara:

- Artículos de un vendedor (`/Users/{seller}/Offers/Singles`)
- Listado de vendedores de una carta (`/Products/Singles/{expansion}/{card}`)
- Posiblemente otras — requiere inspección del DOM en cada URL.
- Cualquier icono de cámara que se encuentre en el DOM, sin importar la URL.

Pendiente de decidir:
- Si la activación es global o configurable por tipo de página.

Ficheros afectados: `src/content/content-order.js`, `src/options/options.html`, `src/options/options.js`, `src/shared/i18n.js`.

### 4.17 Features de pedido en el carrito de compra

Extender al carrito de compra (`/ShoppingCart/`) funcionalidades ya implementadas en la vista de pedido, adaptadas a las particularidades del carrito.

El carrito organiza los artículos en bloques por vendedor (no por juego). Dentro de cada bloque puede haber artículos de distintas categorías. Las filas no tienen checkbox, por lo que la opacidad al marcar y el ajuste de tamaño de checkbox no aplican.

Features a implementar:
- **Imágenes inline**: mostrar el thumbnail de la carta, igual que en pedidos. El carrito también muestra el icono de cámara en los artículos (pendiente de verificar selector exacto).
- **Colapsar/expandir bloque por vendedor**: toggle en la cabecera de cada bloque de vendedor para colapsar o expandir su listado de artículos.
- **Valor por vendedor y juego**: mostrar el subtotal por juego dentro de cada bloque de vendedor (solo cuando el vendedor tiene artículos de más de un juego), y el total del bloque del vendedor. Actualmente solo se muestra el total del carrito.

Particularidades del carrito a tener en cuenta:
- Las unidades de un artículo pueden decrementarse o el artículo puede eliminarse; nunca incrementarse. Cualquier cambio de cantidad debe recalcular los subtotales por juego y el total del vendedor afectado en tiempo real.
- El desglose de valor es por juego dentro de cada vendedor (igual que en pedidos, pero agrupado por vendedor en lugar de ser una vista global).

Pendiente de analizar:
- Estructura del DOM del carrito: selectores de bloques por vendedor, filas de artículos, celdas de precio y cantidad, e icono de cámara.
- Si los selectores de `content-order.js` / `order-features.js` son reutilizables o requieren adaptación.
- URL pattern del carrito para añadirlo a los `content_scripts` del manifest o al content script existente.
- Si tiene sentido activar/desactivar imágenes inline por separado para pedidos y carrito, o compartir la misma configuración.

Ficheros afectados: `src/content/content-order.js`, `src/shared/order-features.js`, `src/options/options.html`, `src/options/options.js`, `manifest.json`.

### 4.16 Formulario de feedback abierto

Sustituir el canal de feedback basado en issues de GitHub (solo accesible para usuarios con cuenta) por un Google Form público y abierto, accesible a cualquier usuario de la extensión.

El enlace al formulario se expone en:
- Página de opciones (`options.html`) — sección o pie de página con enlace al formulario.
- `README.md` — sección de contribución o feedback.
- `docs/STORE.md` — descripción de la Chrome Web Store.

Pendiente de analizar:
- Campos del formulario (tipo de feedback, descripción, versión de la extensión, idioma, etc.).
- Si se quiere pre-rellenar algún campo con la versión actual de la extensión vía parámetros de URL del formulario.

Ficheros afectados: `src/options/options.html`, `src/options/styles/options.css`, `README.md`, `docs/STORE.md`.

---

## 5. Brainstorming

Ideas sin compromiso de implementación. Se promueven al bloque correspondiente si se decide abordarlas.

### 4.1 Colores personalizables por término

Permitir al usuario asignar un color diferente a cada término en lugar de usar siempre el color por defecto. Se expone en la página de opciones ([3.5](#35-página-de-opciones)).

### 4.4 Navegación entre coincidencias

Añadir botones anterior/siguiente en el popup para desplazarse entre las coincidencias resaltadas en la página.
