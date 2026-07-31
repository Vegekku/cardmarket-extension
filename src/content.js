/**
 * @module content
 * @description Script inyectado en cardmarket.com. Lee los usuarios guardados
 * y resalta las filas de artículos cuyos usuarios coincidan.
 * Escucha mensajes del popup para actualizar el resaltado sin reinyectarse.
 */

if (typeof __BUILD_TIME__ !== 'undefined') console.log(`[Cardmarket] build: ${__BUILD_TIME__}`);

/** Color por defecto si no hay configuración guardada. */
const DEFAULT_COLOR = 'rgba(0, 150, 200, 0.3)';

/**
 * Devuelve el color de resaltado según el modo claro/oscuro activo en Cardmarket.
 * @param {{ light: string, dark: string } | undefined} colors
 * @returns {string}
 */
function resolveColor(colors) {
    if (!colors) return DEFAULT_COLOR;
    const theme = document.documentElement.getAttribute('data-bs-theme');
    return theme === 'dark' ? (colors.dark || DEFAULT_COLOR) : (colors.light || DEFAULT_COLOR);
}

let activeObserver = null;

/**
 * Elimina el resaltado de todas las filas previamente marcadas.
 */
function clearHighlights() {
    const table = document.getElementById('table');
    if (table) table.querySelectorAll('div.article-row').forEach(row => {
        row.style.removeProperty('--bs-table-bg');
    });
}

/**
 * Resalta las filas `div.article-row` que contienen un enlace a un usuario
 * cuyo nombre coincide con alguno de los usuarios dados.
 * @param {string[]} terms - Usuarios a buscar
 * @param {Node} root - Nodo raíz desde el que buscar
 * @param {{ light: string, dark: string } | undefined} highlightColors
 */
function highlightRows(terms, root, highlightColors) {
    terms.filter(Boolean).forEach(term => {
        root.querySelectorAll(`a[href$="/Users/${term}"]`).forEach(a => {
            a.closest('div.article-row')?.style.setProperty('--bs-table-bg', resolveColor(highlightColors));
        });
    });
}

/**
 * Observa cambios en el DOM y resalta filas en los nuevos nodos añadidos.
 * @param {string[]} terms - Usuarios a buscar
 * @param {{ light: string, dark: string } | undefined} highlightColors
 * @returns {MutationObserver}
 */
function observeNewContent(terms, highlightColors) {
    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    highlightRows(terms, node, highlightColors);
                }
            });
        });
    });
    observer.observe(document.getElementById('table') || document.body, { childList: true, subtree: true });
    return observer;
}

/**
 * Aplica o limpia el resaltado según los datos de storage proporcionados.
 * @param {{ terms?: string[], enabled?: boolean }} data
 */
function applyHighlight(data) {
    if (activeObserver) { activeObserver.disconnect(); activeObserver = null; }
    clearHighlights();
    if (data.enabled === false) return;
    if (data.terms && data.terms.length > 0) {
        const table = document.getElementById('table');
        if (table) highlightRows(data.terms, table, data.highlightColors);
        activeObserver = observeNewContent(data.terms, data.highlightColors);
    }
}

// Carga inicial desde storage
chrome.storage.sync.get(['terms', 'enabled', 'highlightColors'], applyHighlight);

// Escucha mensajes del popup
chrome.runtime.onMessage.addListener(function(message) {
    if (message.type === 'UPDATE_HIGHLIGHT') applyHighlight(message.data);
});
