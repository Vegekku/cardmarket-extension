/**
 * @module content-order
 * @description Inyectado en páginas de Orders de Cardmarket.
 * Gestiona imágenes inline, opacidad de filas marcadas, tamaño de checkbox
 * y mejoras de vista multi-juego (colapsar/expandir bloques y subtotal por juego).
 */
import './content-common.js';
import { DEFAULT_CHECKBOX_SIZE, DEFAULT_CHECKED_OPACITY, DEFAULT_INLINE_IMAGES_ENABLED, DEFAULT_INLINE_IMAGE_HEIGHT, DEFAULT_GAME_BLOCKS_ENABLED, DEFAULT_GAME_BLOCKS_COLLAPSED, DEFAULT_GAME_BLOCKS_SUBTOTAL_ENABLED } from '../shared/defaults.js';
import { injectThumbnail, applyInlineImages, applyCheckedRowOpacity, applyCheckboxSize } from '../shared/order-features.js';

// Inyecta el estilo estático de la custom property para el tamaño de checkbox
const style = document.createElement('style');
style.textContent = 'table.product-table .form-check-input { width: var(--op-cb-size, 1em) !important; height: var(--op-cb-size, 1em) !important; }';
document.head.appendChild(style);

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

/**
 * Parsea un string de precio con formato "0,14 €" y devuelve el valor numérico.
 * @param {string} text
 * @returns {number}
 */
function parsePrice(text) {
    return parseFloat(text.replace(/[^0-9,]/g, '').replace(',', '.')) || 0;
}

/**
 * Calcula el subtotal de una tabla de artículos sumando las celdas .price.
 * @param {Element} table
 * @returns {string} Subtotal formateado con 2 decimales y símbolo €
 */
function calcSubtotal(table) {
    let total = 0;
    table.querySelectorAll('td.price').forEach(td => { total += parsePrice(td.textContent); });
    return total.toFixed(2).replace('.', ',') + ' €';
}

/**
 * Inyecta toggles y la fila de desglose una única vez al cargar la página.
 * La visibilidad y el estado se controlan mediante applyGameBlocksState.
 */
function initGameBlocks() {
    const sections = document.querySelectorAll('.category-subsection');
    if (!sections.length) return;

    sections.forEach(section => {
        const header = section.querySelector(':scope > div');
        const table = section.querySelector('table[id^="ArticleTable"]');
        if (!header || !table) return;

        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'mkm-game-toggle';
        toggleBtn.style.cssText = 'background:none; border:none; cursor:pointer; font-size:1em; padding:0; line-height:1;';
        toggleBtn.textContent = '▼';
        toggleBtn.setAttribute('aria-expanded', 'true');
        toggleBtn.addEventListener('click', () => {
            const collapsed = table.style.display === 'none';
            table.style.display = collapsed ? '' : 'none';
            toggleBtn.textContent = collapsed ? '▼' : '▶';
            toggleBtn.setAttribute('aria-expanded', String(collapsed));
        });

        const h3 = header.querySelector('h3');
        const leftGroup = document.createElement('div');
        leftGroup.className = 'mkm-game-left-group';
        leftGroup.style.cssText = 'display:flex; align-items:center; gap:6px;';
        h3.replaceWith(leftGroup);
        leftGroup.append(toggleBtn, h3);
    });

    if (sections.length < 2) return;

    const itemValueRow = document.querySelector('.summary .item-value')?.closest('.d-flex');
    if (!itemValueRow) return;

    const detailRow = document.createElement('div');
    detailRow.className = 'mkm-game-subtotal-row';
    detailRow.style.cssText = 'padding-left:1em;';
    sections.forEach(section => {
        const header = section.querySelector(':scope > div');
        const table = section.querySelector('table[id^="ArticleTable"]');
        if (!header || !table) return;
        const name = header.querySelector('h3')?.textContent.trim() ?? '';
        const row = document.createElement('div');
        row.className = 'd-flex';
        row.style.cssText = 'font-size:.9em; opacity:.8;';
        row.innerHTML = `<span class="flex-grow-1">${name}</span><span>${calcSubtotal(table)}</span>`;
        detailRow.appendChild(row);
    });
    itemValueRow.after(detailRow);
}

/**
 * Aplica visibilidad y estado de colapso según la configuración guardada.
 * @param {boolean} togglesEnabled
 * @param {boolean} defaultCollapsed
 * @param {boolean} subtotalEnabled
 */
function applyGameBlocksState(togglesEnabled, defaultCollapsed, subtotalEnabled) {
    document.querySelectorAll('.category-subsection').forEach(section => {
        const table = section.querySelector('table[id^="ArticleTable"]');
        const btn = section.querySelector('.mkm-game-toggle');
        if (!btn) return;
        btn.style.display = togglesEnabled ? '' : 'none';
        if (!table) return;
        if (!togglesEnabled) {
            table.style.display = '';
        } else {
            table.style.display = defaultCollapsed ? 'none' : '';
            btn.textContent = defaultCollapsed ? '▶' : '▼';
            btn.setAttribute('aria-expanded', String(!defaultCollapsed));
        }
    });
    const detailRow = document.querySelector('.mkm-game-subtotal-row');
    if (detailRow) detailRow.style.display = subtotalEnabled ? '' : 'none';
}

// Carga inicial
chrome.storage.sync.get(['checkboxSize', 'checkedOpacity', 'checkedOpacityEnabled', 'inlineImagesEnabled', 'inlineImageHeight', 'gameBlocksEnabled', 'gameBlocksCollapsed', 'gameBlocksSubtotalEnabled'], data => {
    initGameBlocks();
    applyGameBlocksState(
        data.gameBlocksEnabled ?? DEFAULT_GAME_BLOCKS_ENABLED,
        data.gameBlocksCollapsed ?? DEFAULT_GAME_BLOCKS_COLLAPSED,
        data.gameBlocksSubtotalEnabled ?? DEFAULT_GAME_BLOCKS_SUBTOTAL_ENABLED
    );
    applyCheckboxSize(data.checkboxSize ?? DEFAULT_CHECKBOX_SIZE);
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
    const needsGameBlocks = ['gameBlocksEnabled', 'gameBlocksCollapsed', 'gameBlocksSubtotalEnabled'].some(k => k in changes);
    if (!needsOpacity && !needsInline && !needsCheckbox && !needsGameBlocks) return;
    chrome.storage.sync.get(['checkedOpacity', 'checkedOpacityEnabled', 'inlineImagesEnabled', 'inlineImageHeight', 'checkboxSize', 'gameBlocksEnabled', 'gameBlocksCollapsed', 'gameBlocksSubtotalEnabled'], d => {
        if (needsCheckbox) applyCheckboxSize(d.checkboxSize ?? DEFAULT_CHECKBOX_SIZE);
        if (needsOpacity) {
            const opacityEnabled = d.checkedOpacityEnabled ?? false;
            const opacity = d.checkedOpacity ?? DEFAULT_CHECKED_OPACITY;
            applyCheckedRowOpacity(opacityEnabled, opacity);
            initCheckedRowOpacityListener(opacityEnabled, opacity);
        }
        if (needsInline) applyInlineImagesPage(d.inlineImagesEnabled ?? DEFAULT_INLINE_IMAGES_ENABLED, d.inlineImageHeight ?? DEFAULT_INLINE_IMAGE_HEIGHT);
        if (needsGameBlocks) applyGameBlocksState(
            d.gameBlocksEnabled ?? DEFAULT_GAME_BLOCKS_ENABLED,
            d.gameBlocksCollapsed ?? DEFAULT_GAME_BLOCKS_COLLAPSED,
            d.gameBlocksSubtotalEnabled ?? DEFAULT_GAME_BLOCKS_SUBTOTAL_ENABLED
        );
    });
});
