# Mejoras pendientes

## Priorización

| Bloque | Puntos |
|--------|--------|
| 1 — Bugs críticos | [1.3](#13-listener-click-fuera-de-domcontentloaded), [1.5](#15-resaltado-aplica-a-cualquier-texto-en-lugar-de-filas-de-vendedor) |
| 2 — Calidad de código | [2.1](#21-refactor-a-módulos-es-con-jsdoc), [2.2](#22-eliminar-console-log-de-producción), [2.3](#23-migrar-a-chromestoragelocal) |
| 3 — UX / Popup | [3.1](#31-estilos-css-en-el-popup), [3.2](#32-botón-limpiar-términos), [3.3](#33-feedback-visual-al-guardar), [3.4](#34-contador-de-coincidencias), [3.5](#35-página-de-opciones), [3.6](#36-renombrar-términos-a-vendedores-o-usuarios-en-la-ui) |
| 4 — Funcionalidad nueva | [4.1](#41-colores-personalizables-por-término), [4.2](#42-toggle-activardesactivar-resaltado), [4.3](#43-resaltado-en-todo-el-texto-no-solo-enlaces), [4.4](#44-navegación-entre-coincidencias), [4.5](#45-añadir-vendedor-al-resaltado-al-comprar-sus-cartas), [4.6](#46-selector-de-juego-en-el-perfil-de-un-vendedor), [4.7](#47-filtro-de-precio-en-el-listado-de-vendedores-de-una-carta), [4.8](#48-mejoras-en-la-vista-de-pedido-con-varios-juegos) |

---

## Índice

- [1. Bugs críticos](#1-bugs-críticos)
- [2. Calidad de código](#2-calidad-de-código)
- [3. UX / Popup](#3-ux--popup)
- [4. Funcionalidad nueva](#4-funcionalidad-nueva)

---

## 1. Bugs críticos

### 1.3 Listener click fuera de DOMContentLoaded

En `popup.js` el listener del botón `#highlightBtn` se registra fuera del bloque `DOMContentLoaded`, lo que puede provocar un error si el script se ejecuta antes de que el DOM esté listo.

Ficheros afectados: `popup.js`.

### 1.5 Resaltado aplica a cualquier texto en lugar de filas de vendedor

El resaltado actual (TreeWalker) marca cualquier coincidencia de texto en la página, independientemente del contexto. El comportamiento correcto es resaltar la fila `div.article-row` completa (modificando `--bs-table-bg`) cuando esa fila contiene un enlace cuyo `href` apunta a `https://www.cardmarket.com/es/Digimon/Users/<término>`. Así el resaltado queda restringido al listado de vendedores de un artículo.

Decisiones tomadas:
- El TreeWalker se elimina completamente; este enfoque lo reemplaza.
- El resaltado aplica únicamente en el listado de vendedores de un artículo (URL pattern a determinar).
- El path del href será genérico: `/es/<Juego>/Users/<término>` para cubrir todos los juegos.

Decisiones adicionales:
- URL pattern: `*://*.cardmarket.com/*/Products/*` (cualquier URL que contenga `/Products/`).
- Color: `rgba(0, 150, 200, 0.3)` — azul-cian semitransparente, visible en dark mode (`#1d1f26`, `#14161b`) y light mode (`#f5f5f5`, transparente), compatible con accesibilidad perceptiva en ambos.

Ficheros afectados: `content.js`.

---

## 2. Calidad de código

### 2.1 Refactor a módulos ES con JSDoc

Los ficheros actuales son scripts planos sin módulos ni documentación. Refactorizar a módulos ES (`type: module`) con JSDoc estándar (`@module`, `@description`, `@param`, `@returns`) en todas las funciones exportadas.

### 2.2 Eliminar `console.log` de producción

`popup.js` tiene un `console.log('Términos guardados:', terms)` que no debe estar en producción. Eliminar.

### 2.3 Migrar a `chrome.storage.local`

Actualmente se usa `chrome.storage.sync`, que tiene un límite de 8KB. Migrar a `chrome.storage.local`, que permite hasta 10MB y es más adecuado para datos que no necesitan sincronizarse entre dispositivos.

---

## 3. UX / Popup

### 3.1 Estilos CSS en el popup

El popup es HTML puro sin estilos. Añadir un `popup.css` con estilos básicos (tipografía, espaciado, botón) y las siguientes mejoras de tamaño:

- Ancho mínimo cómodo para el popup (actualmente Chrome lo renderiza muy pequeño).
- El textarea debe crecer automáticamente con el contenido para que todos los términos sean visibles de un vistazo, sin scroll ni redimensionado manual. Usar `field-sizing: content` (CSS nativo) con fallback en JS (`input` event + `scrollHeight`) para navegadores que no lo soporten.
- El tamaño redimensionado manualmente no persiste entre aperturas del popup (limitación de Chrome); la solución es que el tamaño se derive del contenido, no del usuario.

Ficheros afectados: `popup.html`, `popup.css` (nuevo), `popup.js` (fallback JS si necesario).

### 3.2 Botón limpiar términos

Añadir un botón que vacíe el textarea y elimine los términos guardados en storage.

### 3.3 Feedback visual al guardar

Mostrar un mensaje temporal (ej. "Guardado ✓") durante ~1 segundo tras pulsar el botón de resaltar.

### 3.4 Contador de coincidencias

Mostrar en el popup cuántas coincidencias se han encontrado en la página activa tras aplicar el resaltado.

### 3.5 Página de opciones

Añadir una página de opciones accesible desde `chrome://extensions` para centralizar la configuración de la extensión.

Pendiente de definir qué opciones exponer (candidatos según otras mejoras pendientes):
- Color de resaltado por defecto o por término ([4.1](#41-colores-personalizables-por-término))
- Toggle para activar/desactivar el resaltado ([4.2](#42-toggle-activardesactivar-resaltado))
- Gestión de la lista de términos guardados
- Ocultar/mostrar secciones de la UI de Cardmarket (banners, sidebars, secciones de navegación, etc.)
- Simplificación de selectores y filtros de Cardmarket: reducir opciones visibles en dropdowns para agilizar la navegación

Ficheros afectados: `manifest.json`, `options.html` (nuevo), `options.js` (nuevo), `content.js`.

### 3.6 Renombrar "términos" a "vendedores" o "usuarios" en la UI

El popup y el storage usan la palabra "términos", pero la funcionalidad real es remarcar vendedores/usuarios concretos. Renombrar el concepto en la UI (labels, placeholders, mensajes) una vez decidido si el nombre más adecuado es "vendedores" o "usuarios".

Pendiente de decidir:
- Nombre definitivo: "vendedores" o "usuarios".

Ficheros afectados: `popup.html`, `popup.js`.

---

## 4. Funcionalidad nueva

### 4.1 Colores personalizables por término

Permitir al usuario asignar un color diferente a cada término en lugar de usar siempre amarillo.

### 4.2 Toggle activar/desactivar resaltado

Añadir un toggle en el popup para activar o desactivar el resaltado sin borrar los términos guardados.

### 4.3 Resaltado en todo el texto, no solo enlaces

Actualmente el resaltado solo afecta a elementos `<a>`. Extenderlo a cualquier nodo de texto de la página.

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
