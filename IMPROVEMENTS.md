# Mejoras pendientes

## Priorización

| Bloque | Puntos |
|--------|--------|
| 1 — Bugs críticos | |
| 2 — Calidad de código | |
| 3 — UX / Popup | [3.5](#35-página-de-opciones), [3.7](#37-tamaño-configurable-del-checkbox-en-el-listado-de-pedido), [3.8](#38-accesibilidad-wcag) |
| 4 — Funcionalidad nueva | [4.1](#41-colores-personalizables-por-término), [4.3](#43-modo-filtro-mostrar-solo-vendedores-resaltados), [4.4](#44-navegación-entre-coincidencias), [4.5](#45-añadir-vendedor-al-resaltado-al-comprar-sus-cartas), [4.6](#46-selector-de-juego-en-el-perfil-de-un-vendedor), [4.7](#47-filtro-de-precio-en-el-listado-de-vendedores-de-una-carta), [4.8](#48-mejoras-en-la-vista-de-pedido-con-varios-juegos), [4.9](#49-pago-selectivo-de-pedidos-en-el-carrito), [4.10](#410-añadir--quitar-vendedor-con-doble-click), [4.11](#411-compatibilidad-con-firefox) |

---

## Índice

- [1. Bugs críticos](#1-bugs-críticos)
- [2. Calidad de código](#2-calidad-de-código)
- [3. UX / Popup](#3-ux--popup)
- [4. Funcionalidad nueva](#4-funcionalidad-nueva)

---

## 1. Bugs críticos

---

## 2. Calidad de código

---

## 3. UX / Popup

### 3.5 Página de opciones

Añadir una página de opciones accesible desde `chrome://extensions` para centralizar la configuración de la extensión.

Pendiente de definir qué opciones exponer (candidatos según otras mejoras pendientes):
- Color de resaltado por defecto o por término ([4.1](#41-colores-personalizables-por-término))
- Toggle para activar/desactivar el resaltado ([4.2](#42-toggle-activardesactivar-resaltado))
- Gestión de la lista de términos guardados
- Ocultar/mostrar secciones de la UI de Cardmarket (banners, sidebars, secciones de navegación, etc.)
- Simplificación de selectores y filtros de Cardmarket: reducir opciones visibles en dropdowns para agilizar la navegación

Ficheros afectados: `manifest.json`, `options.html` (nuevo), `options.js` (nuevo), `content.js`.

### 3.7 Tamaño configurable del checkbox en el listado de pedido

Los checkboxes nativos de Cardmarket en el listado de cartas de un pedido son demasiado pequeños. Agrandarlos mediante CSS inyectado y exponer un ajuste de tamaño configurable por el usuario.

Pendiente de decidir:
- Tamaño por defecto a aplicar (ej. `20px`, `24px`).
- Selector CSS exacto de los checkboxes en la página de pedido (pendiente de inspeccionar el DOM).

El ajuste se expone en la página de opciones ([3.5](#35-página-de-opciones)).

Ficheros afectados: `content.js`, `options.html`, `options.js`.

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

Ficheros afectados: `src/popup.html`, `src/popup.css`, `src/options.html` (futuro), `.amazonq/rules/accessibility.md` (nuevo), `package.json` (fase 2).

---

## 4. Funcionalidad nueva

### 4.1 Colores personalizables por término

Permitir al usuario asignar un color diferente a cada término en lugar de usar siempre amarillo.

### 4.3 Modo filtro: mostrar solo vendedores resaltados

Añadir una opción para que, además de resaltar las filas de los vendedores guardados, se oculten el resto de filas del listado, mostrando únicamente las coincidencias.

El filtro se aplica sobre los artículos presentes en el DOM en cada momento. Cuando Cardmarket carga nuevos artículos mediante "ver más" (llamada Ajax a `https://www.cardmarket.com/{lang}/{game}/AjaxAction/Product_LoadMoreArticles`, respuesta Base64 que se inyecta en el DOM), el MutationObserver existente los detecta y aplica el filtro automáticamente.

Pendiente de decidir:
- Si la extensión debe auto-pulsar "ver más" cuando el filtro está activo, para cargar todos los lotes sin intervención del usuario. Opciones barajadas:
  - **Sin auto-carga**: el filtro aplica solo sobre lo cargado; el usuario pulsa manualmente.
  - **Auto-carga completa**: la extensión pulsa "ver más" en bucle hasta agotar resultados y luego filtra.
  - **Auto-carga bajo demanda**: carga el siguiente lote, filtra, y continúa si no hay coincidencias.

Ficheros afectados: `content.js`, `popup.html`, `popup.js`.

### 4.4 Navegación entre coincidencias

Añadir botones anterior/siguiente en el popup para desplazarse entre las coincidencias resaltadas en la página.

### 4.6 Selector de juego en el perfil de un vendedor

Cuando el usuario está en el perfil de un vendedor viendo cartas de un juego concreto (ej. Digimon), no hay forma de cambiar al catálogo de otro juego (ej. Pokémon) sin salir del perfil y navegar manualmente o editar la URL. Inyectar un selector de juego directamente en la página del perfil del vendedor que permita cambiar de juego sin perder el contexto del usuario.

Pendiente de analizar:
- Estructura de la URL del perfil de vendedor por juego en Cardmarket para construir los enlaces del selector.
- Juegos disponibles a incluir en el selector (Magic, Pokémon, Yu-Gi-Oh!, Digimon, etc.).
- Dónde inyectar el selector en el DOM sin romper el layout existente.

Ficheros afectados: `content.js`.

### 4.5 Añadir vendedor al resaltado al comprar sus cartas

Cuando el usuario añade cartas de un vendedor concreto al carrito, añadir automáticamente el nombre de ese vendedor a la lista de términos resaltados. El objetivo es facilitar la localización visual de ese vendedor en listados de cartas para construir pedidos.

Pendiente de decidir:
- El vendedor añadido automáticamente se resaltará en `rgba(100, 200, 100, 0.25)` — verde suave, reservado para distinguirlo visualmente de los términos manuales. Color descartado para el resaltado general (1.5) por reservarse para este uso.
- Cómo detectar el evento de "añadir al carrito" en la página de Cardmarket (MutationObserver sobre el DOM o intercepción de la petición de red).

Ficheros afectados: `content.js`, `popup.js`, `background.js`.

### 4.7 Filtro de precio en el listado de vendedores de una carta

En el listado de vendedores de una carta concreta no existe filtro por precio, a diferencia del perfil de un vendedor donde sí está disponible. Inyectar un filtro de precio mínimo y máximo en esa página para ocultar las filas que queden fuera del rango sin necesidad de salir de la vista.

Pendiente de analizar:
- Estructura del DOM del listado de vendedores para identificar las filas y las celdas de precio.
- Si el filtrado se aplica solo sobre los resultados ya cargados en el DOM o también sobre los que se cargan con paginación/scroll infinito.
- URL pattern de la página de vendedores de una carta para restringir la inyección.

Ficheros afectados: `content.js`.

### 4.8 Mejoras en la vista de pedido con varios juegos

Cuando un pedido combina cartas de varios juegos, Cardmarket divide el listado por juego pero no ofrece herramientas para gestionar esa vista. Dos mejoras independientes sobre esa página:

- **Colapsar/expandir por juego**: añadir un toggle en la cabecera de cada bloque de juego para colapsar o expandir su listado de cartas, facilitando la navegación en pedidos largos.
- **Valor por juego**: mostrar el subtotal económico de cada bloque de juego, ya que actualmente solo se muestra el valor total del pedido completo.

Pendiente de analizar:
- Estructura del DOM de la página de pedido para identificar los bloques por juego, las filas de cartas y las celdas de precio.
- URL pattern de la página de pedido para restringir la inyección.

Ficheros afectados: `content.js`.

### 4.9 Pago selectivo de pedidos en el carrito

El carrito organiza las cartas en pedidos por vendedor. Actualmente no es posible pagar solo algunos pedidos: al comprar se procesan todos a la vez. La única forma de pagar un subconjunto es eliminar manualmente los pedidos no deseados, procesar el pago y volver a añadir las cartas eliminadas.

Pendiente de analizar:
- Estructura del DOM del carrito para identificar los bloques de pedido por vendedor y sus artículos.
- Cómo guardar temporalmente los artículos de los pedidos excluidos (storage local) para poder restaurarlos tras el pago.
- Si Cardmarket expone algún mecanismo nativo para eliminar/restaurar pedidos completos o es necesario operar artículo a artículo.
- URL pattern de la página del carrito para restringir la inyección.

Ficheros afectados: `content.js`.

### 4.10 Añadir / quitar vendedor con doble click

Permitir añadir o quitar un vendedor de la lista de resaltados haciendo doble click directamente en la página, sin necesidad de abrir el popup. Si el vendedor ya está en la lista, el doble click lo elimina; si no está, lo añade y resalta la fila inmediatamente.

Pendiente de decidir:
- Zona de doble click: fila completa (`div.article-row`) o celda del vendedor (el enlace `a[href*="/Users/"]`).
- Feedback visual al añadir/quitar (ej. animación breve o cambio de color transitorio).

Ficheros afectados: `content.js`.

### 4.11 Compatibilidad con Firefox

Adaptar la extensión para que funcione también en Firefox, además de los navegadores basados en Chromium (Chrome, Edge, Brave, Opera).

Firefox usa la API `browser.*` basada en promesas, frente a la API `chrome.*` con callbacks de Chrome. La solución recomendada es integrar [`webextension-polyfill`](https://github.com/mozilla/webextension-polyfill) de Mozilla, que normaliza ambas APIs y permite mantener un único codebase.

Pendiente de analizar:
- Ajustes necesarios en `manifest.json` para Firefox (campo `browser_specific_settings`, revisión de permisos y `content_scripts`).
- Compatibilidad de las APIs usadas actualmente (`chrome.storage.sync`, `chrome.scripting`, mensajería) con el polyfill.
- Proceso de publicación en [Firefox Add-ons (AMO)](https://addons.mozilla.org/) y diferencias con la Chrome Web Store.
- Si el script de build (`build.js`) necesita cambios para generar un artefacto separado para Firefox.

Ficheros afectados: `manifest.json`, `build.js`, `package.json`, `src/background.js`, `src/content.js`, `src/popup.js`.
