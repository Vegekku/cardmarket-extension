/**
 * @module content
 * @description Script inyectado en cardmarket.com. Lee los usuarios guardados
 * y resalta las filas de artículos cuyos usuarios coincidan.
 * Escucha mensajes del popup para actualizar el resaltado sin reinyectarse.
 */

import { DEFAULT_COLOR, DEFAULT_CHECKBOX_SIZE, DEFAULT_CHECKED_OPACITY, DEFAULT_INLINE_IMAGES_ENABLED, DEFAULT_INLINE_IMAGE_HEIGHT } from './defaults.js';
import { injectThumbnail, applyInlineImages } from './inline-images.js';

if (typeof __BUILD_TIME__ !== 'undefined') console.log(`[Cardmarket] build: ${__BUILD_TIME__}`);

/** @type {HTMLStyleElement|null} */
let checkboxStyleEl = null;

/**
 * Inyecta o actualiza el CSS que controla el tamaño de los checkboxes del listado de pedido.
 * Si el tamaño es el por defecto, elimina el estilo inyectado.
 * @param {number} size - Tamaño en em
 */
function applyCheckboxSize(size) {
    if (size === DEFAULT_CHECKBOX_SIZE) {
        if (checkboxStyleEl) { checkboxStyleEl.remove(); checkboxStyleEl = null; }
        return;
    }
    if (!checkboxStyleEl) {
        checkboxStyleEl = document.createElement('style');
        checkboxStyleEl.id = 'mkm-checkbox-size';
        document.head.appendChild(checkboxStyleEl);
    }
    checkboxStyleEl.textContent =
        `table.product-table .form-check-input { width: ${size}em !important; height: ${size}em !important; }`;
}

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
/** @type {{ enabled: boolean, height: number } | null} */
let pendingInlineImages = null;

// Observer global instalado inmediatamente en páginas de pedido, antes del callback del storage
const _earlyObserver = new MutationObserver(() => {
    if (pendingInlineImages?.enabled) {
        document.querySelectorAll('span.thumbnail-icon').forEach(span => injectThumbnail(span, pendingInlineImages.height));
    }
});
if (location.pathname.includes('/Orders/')) {
    _earlyObserver.observe(document.documentElement, { childList: true, subtree: true });
}

/**
 * Aplica o elimina los thumbnails inline en la página de pedido.
 * @param {boolean} enabled
 * @param {number} height
 */
function applyInlineImagesPage(enabled, height) {
    pendingInlineImages = { enabled, height };
    if (!location.pathname.includes('/Orders/')) return;
    if (!enabled) {
        pendingInlineImages = null;
        _earlyObserver.disconnect();
    }
    applyInlineImages(enabled, height);
}


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

/**
 * Aplica la opacidad configurada a las filas cuyo checkbox esté marcado.
 * @param {boolean} enabled
 * @param {number} opacity
 */
function applyCheckedRowOpacity(enabled, opacity) {
    document.querySelectorAll('table.product-table tr').forEach(tr => {
        const cb = tr.querySelector('input.form-check-input[type="checkbox"]');
        if (cb) tr.style.opacity = (enabled && cb.checked) ? opacity : '';
    });
}

/**
 * Instala (o reinstala) el listener delegado para cambios de checkbox en tablas de pedido.
 * @param {boolean} enabled
 * @param {number} opacity
 */
function initCheckedRowOpacityListener(enabled, opacity) {
    document.removeEventListener('change', document._mkmCheckboxHandler || null);
    document._mkmCheckboxHandler = e => {
        const cb = e.target;
        if (cb.type !== 'checkbox' || !cb.classList.contains('form-check-input')) return;
        const tr = cb.closest('tr');
        if (tr) tr.style.opacity = (enabled && cb.checked) ? opacity : '';
    };
    document.addEventListener('change', document._mkmCheckboxHandler);
}
chrome.storage.local.set({ lang: document.documentElement.lang || 'es' });

// Carga inicial desde storage
chrome.storage.sync.get(['terms', 'enabled', 'highlightColors', 'checkboxSize', 'checkedOpacity', 'checkedOpacityEnabled', 'inlineImagesEnabled', 'inlineImageHeight'], data => {
    applyHighlight(data);
    applyCheckboxSize(data.checkboxSize ?? DEFAULT_CHECKBOX_SIZE);
    const opacityEnabled = data.checkedOpacityEnabled ?? false;
    const opacity = data.checkedOpacity ?? DEFAULT_CHECKED_OPACITY;
    applyCheckedRowOpacity(opacityEnabled, opacity);
    initCheckedRowOpacityListener(opacityEnabled, opacity);
    applyInlineImagesPage(data.inlineImagesEnabled ?? DEFAULT_INLINE_IMAGES_ENABLED, data.inlineImageHeight ?? DEFAULT_INLINE_IMAGE_HEIGHT);
});

// Escucha mensajes del popup
chrome.runtime.onMessage.addListener(function(message) {
    if (message.type === 'UPDATE_HIGHLIGHT') applyHighlight(message.data);
});

// Reaplica cuando cambia highlightColors, terms, enabled, checkboxSize o checkedOpacity desde otra pestaña/opciones
chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'sync') return;
    if ('inlineImagesEnabled' in changes || 'inlineImageHeight' in changes) {
        chrome.storage.sync.get(['inlineImagesEnabled', 'inlineImageHeight'], d => {
            applyInlineImagesPage(d.inlineImagesEnabled ?? DEFAULT_INLINE_IMAGES_ENABLED, d.inlineImageHeight ?? DEFAULT_INLINE_IMAGE_HEIGHT);
        });
    }
    if ('checkboxSize' in changes) applyCheckboxSize(changes.checkboxSize.newValue ?? DEFAULT_CHECKBOX_SIZE);
    if ('checkedOpacity' in changes || 'checkedOpacityEnabled' in changes) {
        chrome.storage.sync.get(['checkedOpacity', 'checkedOpacityEnabled'], d => {
            const opacityEnabled = d.checkedOpacityEnabled ?? false;
            const opacity = d.checkedOpacity ?? DEFAULT_CHECKED_OPACITY;
            applyCheckedRowOpacity(opacityEnabled, opacity);
            initCheckedRowOpacityListener(opacityEnabled, opacity);
        });
    }
    if (!('highlightColors' in changes || 'terms' in changes || 'enabled' in changes)) return;
    chrome.storage.sync.get(['terms', 'enabled', 'highlightColors'], applyHighlight);
});

// Reaplica cuando cambia el tema claro/oscuro en Cardmarket
new MutationObserver(() => {
    chrome.storage.sync.get(['terms', 'enabled', 'highlightColors'], applyHighlight);
}).observe(document.documentElement, { attributeFilter: ['data-bs-theme'] });
