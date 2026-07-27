# Mejoras pendientes

## Priorización

| Bloque | Puntos |
|--------|--------|
| 1 — Bugs críticos | [1.1](#11-resaltado-rompe-el-dom), [1.2](#12-inyección-en-todas-las-pestañas), [1.3](#13-content_scripts-con-all_urls), [1.4](#14-términos-no-se-cargan-al-abrir-el-popup) |
| 2 — Calidad de código | [2.1](#21-refactor-a-módulos-es-con-jsdoc), [2.2](#22-eliminar-console-log-de-producción), [2.3](#23-migrar-a-chromestoragelocal) |
| 3 — UX / Popup | [3.1](#31-estilos-css-en-el-popup), [3.2](#32-botón-limpiar-términos), [3.3](#33-feedback-visual-al-guardar), [3.4](#34-contador-de-coincidencias) |
| 4 — Funcionalidad nueva | [4.1](#41-colores-personalizables-por-término), [4.2](#42-toggle-activardesactivar-resaltado), [4.3](#43-resaltado-en-todo-el-texto-no-solo-enlaces), [4.4](#44-navegación-entre-coincidencias) |

---

## Índice

- [1. Bugs críticos](#1-bugs-críticos)
- [2. Calidad de código](#2-calidad-de-código)
- [3. UX / Popup](#3-ux--popup)
- [4. Funcionalidad nueva](#4-funcionalidad-nueva)

---

## 1. Bugs críticos

### 1.1 Resaltado rompe el DOM

`content.js` usa `innerHTML.replace` para inyectar `<span>` de resaltado, lo que destruye todos los event listeners del DOM y puede romper la interactividad de la página. Reemplazar por un `TreeWalker` que itere sobre nodos de texto y envuelva las coincidencias sin tocar el resto del árbol.

### 1.2 Inyección en todas las pestañas

`background.js` inyecta `content.js` en cualquier pestaña al activarla o cargarla, sin filtrar por URL. Añadir comprobación de que la URL pertenece a `cardmarket.com` antes de ejecutar `scripting.executeScript`.

### 1.3 `content_scripts` con `<all_urls>`

`manifest.json` declara `<all_urls>` en `content_scripts`, lo que inyecta el script en cualquier página que visite el usuario. Restringir a `*://*.cardmarket.com/*`.

### 1.4 Términos no se cargan al abrir el popup

`popup.js` no tiene listener `DOMContentLoaded`, por lo que el textarea puede estar vacío aunque haya términos guardados. Envolver la lectura de storage en `DOMContentLoaded`.

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

El popup es HTML puro sin estilos. Añadir un `popup.css` con estilos básicos (tipografía, espaciado, botón).

### 3.2 Botón limpiar términos

Añadir un botón que vacíe el textarea y elimine los términos guardados en storage.

### 3.3 Feedback visual al guardar

Mostrar un mensaje temporal (ej. "Guardado ✓") durante ~1 segundo tras pulsar el botón de resaltar.

### 3.4 Contador de coincidencias

Mostrar en el popup cuántas coincidencias se han encontrado en la página activa tras aplicar el resaltado.

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
