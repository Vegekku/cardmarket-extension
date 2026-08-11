/**
 * @module content-order
 * @description Inyectado en páginas de Orders de Cardmarket.
 * Gestiona imágenes inline, opacidad de filas marcadas y tamaño de checkbox.
 */
import './content-common.js';
import { DEFAULT_CHECKBOX_SIZE, DEFAULT_CHECKED_OPACITY, DEFAULT_INLINE_IMAGES_ENABLED, DEFAULT_INLINE_IMAGE_HEIGHT } from './defaults.js';
import { injectThumbnail, applyInlineImages, applyCheckedRowOpacity, applyCheckboxSize } from './order-features.js';

// Inyecta el estilo estático de la custom property para el tamaño de checkbox
const style = document.createElement('style');
style.textContent = 'table.product-table .form-check-input { width: var(--op-cb-size, 1em) !important; height: var(--op-cb-size, 1em) !important; }';
document.head.appendChild(style);

// Aplica el tamaño de checkbox inicial
chrome.storage.sync.get('checkboxSize', data => {
    applyCheckboxSize(data.checkboxSize ?? DEFAULT_CHECKBOX_SIZE);
});

/**
 * Estado de imágenes inline. Lo usa _earlyObserver para procesar nodos
 * inyectados por Ajax antes de que el callback de storage.sync.get haya resuelto.
 * @type {{ enabled: boolean, height: number } | null}
 */
let _inlineImagesState = null;

// Instalado inmediatamente para capturar nodos inyectados por Ajax
// antes de que el callback de storage.sync.get haya resuelto.
const _earlyObserver = new MutationObserver(() => {
    if (_inlineImagesState?.enabled) {
        document.querySelectorAll('span.thumbnail-icon').forEach(span => injectThumbnail(span, _inlineImagesState.height));
    }
});
_earlyObserver.observe(document.documentElement, { childList: true, subtree: true });

/**
 * Aplica o elimina los thumbnails inline en la página de pedido.
 * @param {boolean} enabled
 * @param {number} height
 */
function applyInlineImagesPage(enabled, height) {
    _inlineImagesState = enabled ? { enabled, height } : null;
    if (!enabled) _earlyObserver.disconnect();
    applyInlineImages(enabled, height);
}

/** @type {((e: Event) => void) | null} */
let _checkboxHandler = null;

/**
 * Instala (o reinstala) el listener delegado para cambios de checkbox.
 * @param {boolean} enabled
 * @param {number} opacity
 */
function initCheckedRowOpacityListener(enabled, opacity) {
    if (_checkboxHandler) document.removeEventListener('change', _checkboxHandler);
    _checkboxHandler = e => {
        const cb = e.target;
        if (cb.type !== 'checkbox' || !cb.classList.contains('form-check-input')) return;
        const tr = cb.closest('tr');
        if (tr) tr.style.opacity = (enabled && cb.checked) ? opacity : '';
    };
    document.addEventListener('change', _checkboxHandler);
}

// Carga inicial
chrome.storage.sync.get(['checkedOpacity', 'checkedOpacityEnabled', 'inlineImagesEnabled', 'inlineImageHeight'], data => {
    const opacityEnabled = data.checkedOpacityEnabled ?? false;
    const opacity = data.checkedOpacity ?? DEFAULT_CHECKED_OPACITY;
    applyCheckedRowOpacity(opacityEnabled, opacity);
    initCheckedRowOpacityListener(opacityEnabled, opacity);
    applyInlineImagesPage(data.inlineImagesEnabled ?? DEFAULT_INLINE_IMAGES_ENABLED, data.inlineImageHeight ?? DEFAULT_INLINE_IMAGE_HEIGHT);
});

// Cambios desde opciones u otras pestañas
chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'sync') return;
    const needsOpacity = ['checkedOpacity', 'checkedOpacityEnabled'].some(k => k in changes);
    const needsInline = ['inlineImagesEnabled', 'inlineImageHeight'].some(k => k in changes);
    const needsCheckbox = 'checkboxSize' in changes;
    if (!needsOpacity && !needsInline && !needsCheckbox) return;
    chrome.storage.sync.get(['checkedOpacity', 'checkedOpacityEnabled', 'inlineImagesEnabled', 'inlineImageHeight', 'checkboxSize'], d => {
        if (needsCheckbox) applyCheckboxSize(d.checkboxSize ?? DEFAULT_CHECKBOX_SIZE);
        if (needsOpacity) {
            const opacityEnabled = d.checkedOpacityEnabled ?? false;
            const opacity = d.checkedOpacity ?? DEFAULT_CHECKED_OPACITY;
            applyCheckedRowOpacity(opacityEnabled, opacity);
            initCheckedRowOpacityListener(opacityEnabled, opacity);
        }
        if (needsInline) applyInlineImagesPage(d.inlineImagesEnabled ?? DEFAULT_INLINE_IMAGES_ENABLED, d.inlineImageHeight ?? DEFAULT_INLINE_IMAGE_HEIGHT);
    });
});
