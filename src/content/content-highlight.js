/**
 * @module content-highlight
 * @description Inyectado en páginas de Products de Cardmarket.
 * Lee los usuarios guardados y resalta las filas de artículos coincidentes.
 * Escucha mensajes del popup y cambios de storage para actualizar el resaltado.
 */
import './content-common.js';
import { DEFAULT_COLOR } from '../shared/defaults.js';

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

/** @type {MutationObserver|null} */
let activeObserver = null;

/**
 * Resalta las filas `div.article-row` que contienen un enlace a un usuario
 * cuyo nombre coincide con alguno de los términos dados.
 * @param {string[]} terms
 * @param {Node} root
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
 * @param {string[]} terms
 * @param {{ light: string, dark: string } | undefined} highlightColors
 * @returns {MutationObserver}
 */
function observeNewContent(terms, highlightColors) {
    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === Node.ELEMENT_NODE) highlightRows(terms, node, highlightColors);
            });
        });
    });
    observer.observe(document.getElementById('table') || document.body, { childList: true, subtree: true });
    return observer;
}

/**
 * Aplica o limpia el resaltado según los datos de storage proporcionados.
 * @param {{ terms?: string[], enabled?: boolean, highlightColors?: object }} data
 */
function applyHighlight(data) {
    if (activeObserver) { activeObserver.disconnect(); activeObserver = null; }
    const table = document.getElementById('table');
    if (table) table.querySelectorAll('div.article-row').forEach(row => row.style.removeProperty('--bs-table-bg'));
    if (data.enabled === false || !data.terms?.length) return;
    if (table) highlightRows(data.terms, table, data.highlightColors);
    activeObserver = observeNewContent(data.terms, data.highlightColors);
}

// Carga inicial
chrome.storage.sync.get(['terms', 'enabled', 'highlightColors'], applyHighlight);

// Mensajes del popup
chrome.runtime.onMessage.addListener(message => {
    if (message.type === 'UPDATE_HIGHLIGHT') applyHighlight(message.data);
});

// Cambios desde opciones u otras pestañas
chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'sync') return;
    if (!['highlightColors', 'terms', 'enabled'].some(k => k in changes)) return;
    chrome.storage.sync.get(['terms', 'enabled', 'highlightColors'], applyHighlight);
});

// Reaplica al cambiar el tema claro/oscuro
new MutationObserver(() => {
    chrome.storage.sync.get(['terms', 'enabled', 'highlightColors'], applyHighlight);
}).observe(document.documentElement, { attributeFilter: ['data-bs-theme'] });
