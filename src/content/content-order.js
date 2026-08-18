/**
 * @module content-order
 * @description Inyectado en páginas de Orders y ShoppingCart de Cardmarket.
 * Gestiona imágenes inline, opacidad de filas marcadas, tamaño de checkbox
 * y mejoras de vista (colapsar/expandir bloques y subtotal por juego).
 * Opera sobre cada section.shipment-block de forma genérica, cubriendo tanto pedidos (uno) como carrito (varios).
 */
import './content-common.js';
import { DEFAULT_CHECKBOX_SIZE, DEFAULT_CHECKED_OPACITY, DEFAULT_INLINE_IMAGES_ENABLED, DEFAULT_INLINE_IMAGE_HEIGHT, DEFAULT_GAME_BLOCKS_ENABLED, DEFAULT_GAME_BLOCKS_COLLAPSED, DEFAULT_GAME_BLOCKS_SUBTOTAL_ENABLED, DEFAULT_GAME_BLOCKS_SUBTOTAL_COLLAPSED } from '../shared/defaults.js';
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
 * Calcula el subtotal de una tabla de artículos usando data-amount y data-price de cada fila.
 * @param {Element} table
 * @returns {string} Subtotal formateado con 2 decimales y símbolo €
 */
function calcSubtotal(table) {
    let total = 0;
    table.querySelectorAll('tr[data-amount][data-price]').forEach(tr => {
        total += parseFloat(tr.dataset.amount) * parseFloat(tr.dataset.price);
    });
    return total.toFixed(2).replace('.', ',') + ' €';
}

/**
 * Inyecta toggles en las secciones de un contenedor (desktop o mobile).
 * @param {Element[]} sections
 */
function _injectToggles(sections) {
    sections.forEach(section => {
        const header = section.querySelector(':scope > div');
        const table = section.querySelector('table[id^="ArticleTable"]');
        if (!header || !table || header.querySelector('.mkm-game-toggle')) return;

        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'mkm-game-toggle';
        toggleBtn.textContent = '▼';
        toggleBtn.setAttribute('aria-expanded', 'true');
        toggleBtn.addEventListener('click', () => {
            const isExpanded = toggleBtn.getAttribute('aria-expanded') === 'true';
            table.style.display = isExpanded ? 'none' : '';
            toggleBtn.textContent = isExpanded ? '▶' : '▼';
            toggleBtn.setAttribute('aria-expanded', String(!isExpanded));
        });
        const h3 = header.querySelector('h3');
        const leftGroup = document.createElement('div');
        leftGroup.className = 'mkm-game-left-group';
        h3.replaceWith(leftGroup);
        leftGroup.append(toggleBtn, h3);
        leftGroup.addEventListener('click', e => {
            if (!e.target.closest('.mkm-game-toggle')) toggleBtn.click();
        });
    });
}

/**
 * Extrae el nombre limpio de una .category-subsection (sin el " (N)" final).
 * @param {Element} section
 * @returns {string}
 */
function _sectionName(section) {
    return (section.querySelector(':scope > div h3')?.textContent.trim() ?? '').replace(/\s*\(\d+\)$/, '');
}

/**
 * Inyecta el botón toggle del desglose antes del valor en la fila .item-value.
 * @param {Element} itemValueRow
 * @param {Element} detailRow
 */
function _injectSubtotalToggle(itemValueRow, detailRow) {
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'mkm-subtotal-toggle';
    toggleBtn.textContent = '▼';
    toggleBtn.setAttribute('aria-expanded', 'true');
    toggleBtn.addEventListener('click', () => {
        const isExpanded = toggleBtn.getAttribute('aria-expanded') === 'true';
        detailRow.style.display = isExpanded ? 'none' : '';
        toggleBtn.textContent = isExpanded ? '▶' : '▼';
        toggleBtn.setAttribute('aria-expanded', String(!isExpanded));
    });
    const labelSpan = itemValueRow.querySelector('span:not(.item-value)');
    if (labelSpan) labelSpan.append(toggleBtn);
    else itemValueRow.querySelector('.item-value').before(toggleBtn);
}

/**
 * Inyecta fila de desglose por juego en el .summary de un contenedor.
 * @param {Element[]} sections
 * @param {Element} summaryEl
 * @param {Map<string, number>} [globalMap] - Si se pasa, acumula subtotales por nombre limpio
 */
function _injectSubtotalRow(sections, summaryEl, globalMap) {
    const itemValueRow = summaryEl.querySelector('.item-value')?.closest('.d-flex');
    if (!itemValueRow) return;

    if (!summaryEl.querySelector('.mkm-game-subtotal-row') && sections.length >= 2) {
        const detailRow = document.createElement('div');
        detailRow.className = 'mkm-game-subtotal-row';
        sections.forEach(section => {
            const table = section.querySelector('table[id^="ArticleTable"]');
            if (!table) return;
            const row = document.createElement('div');
            row.className = 'd-flex mkm-game-subtotal-item';
            row.dataset.mkmTable = table.id;
            const nameSpan = document.createElement('span');
            nameSpan.className = 'flex-grow-1';
            nameSpan.textContent = _sectionName(section);
            const valueSpan = document.createElement('span');
            valueSpan.textContent = calcSubtotal(table);
            row.append(nameSpan, valueSpan);
            detailRow.appendChild(row);
        });
        itemValueRow.after(detailRow);
        _injectSubtotalToggle(itemValueRow, detailRow);
    }

    if (globalMap) {
        sections.forEach(section => {
            const table = section.querySelector('table[id^="ArticleTable"]');
            if (!table) return;
            const name = _sectionName(section);
            let total = 0;
            table.querySelectorAll('tr[data-amount][data-price]').forEach(tr => {
                total += parseFloat(tr.dataset.amount) * parseFloat(tr.dataset.price);
            });
            globalMap.set(name, (globalMap.get(name) ?? 0) + total);
        });
    }
}

/**
 * Inyecta fila de desglose global por categoría en la vista general del carrito.
 * @param {Map<string, number>} globalMap
 */
function _injectGlobalSubtotalRow(globalMap) {
    if (globalMap.size < 2) return;
    const overview = document.querySelector('.order-first .cart-overview');
    if (!overview || overview.querySelector('.mkm-game-subtotal-row')) return;
    const itemValueRow = overview.querySelector('.item-value')?.closest('.d-flex');
    if (!itemValueRow) return;

    const detailRow = document.createElement('div');
    detailRow.className = 'mkm-game-subtotal-row';
    [...globalMap.entries()].sort(([a], [b]) => a.localeCompare(b)).forEach(([name, total]) => {
        const row = document.createElement('div');
        row.className = 'd-flex mkm-game-subtotal-item';
        const nameSpan = document.createElement('span');
        nameSpan.className = 'flex-grow-1';
        nameSpan.textContent = name;
        const valueSpan = document.createElement('span');
        valueSpan.textContent = total.toFixed(2).replace('.', ',') + ' €';
        row.append(nameSpan, valueSpan);
        detailRow.appendChild(row);
    });
    itemValueRow.after(detailRow);
    _injectSubtotalToggle(itemValueRow, detailRow);
}

/**
 * Inyecta toggles y filas de desglose por juego en cada shipment-block.
 * Opera sobre todos los .shipment-block del documento (uno en pedido, varios en carrito).
 * Procesa por separado las secciones desktop y mobile (responsive duplicate).
 * La visibilidad y estado se controlan mediante applyGameBlocksState.
 */
function initGameBlocks() {
    // Toggles: agnóstico a la estructura, aplica a cualquier .category-subsection
    _injectToggles([...document.querySelectorAll('.category-subsection')]);

    // Desglose: necesita asociar secciones con su .summary por contenedor
    // globalMap acumula subtotales por categoría para la vista general del carrito
    const globalMap = new Map();
    document.querySelectorAll('.shipment-block').forEach(block => {
        const mobileWrapper = block.querySelector('.custom-collapse-wrapper:has(.category-subsection)');

        const desktopSections = [...block.querySelectorAll('.category-subsection')].filter(s => !s.closest('.custom-collapse-wrapper'));
        const desktopSummary = (mobileWrapper ? block.querySelector(':scope > .card-body > .content.d-none') : block)?.querySelector('.summary');
        if (desktopSummary) _injectSubtotalRow(desktopSections, desktopSummary, globalMap);

        if (mobileWrapper) {
            const mobileSummary = mobileWrapper.querySelector('.summary');
            if (mobileSummary) _injectSubtotalRow([...mobileWrapper.querySelectorAll('.category-subsection')], mobileSummary);
        }
    });

    _injectGlobalSubtotalRow(globalMap);
}

/**
 * Aplica visibilidad y estado de colapso en todos los shipment-block.
 * @param {boolean} togglesEnabled
 * @param {boolean} defaultCollapsed
 * @param {boolean} subtotalEnabled
 * @param {boolean} subtotalCollapsed
 */
function applyGameBlocksState(togglesEnabled, defaultCollapsed, subtotalEnabled, subtotalCollapsed) {
    document.querySelectorAll('.shipment-block').forEach(block => {
        block.querySelectorAll('.category-subsection').forEach(section => {
            const table = section.querySelector('table[id^="ArticleTable"]');
            const btn = section.querySelector('.mkm-game-toggle');
            if (!btn) return;
            btn.style.display = togglesEnabled ? '' : 'none';
            if (!table) return;
            const collapsed = togglesEnabled && defaultCollapsed;
            table.style.display = collapsed ? 'none' : '';
            btn.textContent = collapsed ? '▶' : '▼';
            btn.setAttribute('aria-expanded', String(!collapsed));
        });
        block.querySelectorAll('.mkm-subtotal-toggle').forEach(btn => {
            if (!subtotalEnabled) return;
            const detailRow = btn.closest('.d-flex')?.nextElementSibling;
            if (!detailRow?.classList.contains('mkm-game-subtotal-row')) return;
            detailRow.style.display = subtotalCollapsed ? 'none' : '';
            btn.textContent = subtotalCollapsed ? '▶' : '▼';
            btn.setAttribute('aria-expanded', String(!subtotalCollapsed));
        });
        block.querySelectorAll('.mkm-game-subtotal-row').forEach(row => {
            row.style.display = subtotalEnabled ? '' : 'none';
        });
    });
    const overview = document.querySelector('.order-first .cart-overview');
    if (overview) {
        overview.querySelectorAll('.mkm-subtotal-toggle').forEach(btn => {
            if (!subtotalEnabled) return;
            const detailRow = btn.closest('.d-flex')?.nextElementSibling;
            if (!detailRow?.classList.contains('mkm-game-subtotal-row')) return;
            detailRow.style.display = subtotalCollapsed ? 'none' : '';
            btn.textContent = subtotalCollapsed ? '▶' : '▼';
            btn.setAttribute('aria-expanded', String(!subtotalCollapsed));
        });
        overview.querySelectorAll('.mkm-game-subtotal-row').forEach(row => {
            row.style.display = subtotalEnabled ? '' : 'none';
        });
    }
}

// Carga inicial
chrome.storage.sync.get(['checkboxSize', 'checkedOpacity', 'checkedOpacityEnabled', 'inlineImagesEnabled', 'inlineImageHeight', 'gameBlocksEnabled', 'gameBlocksCollapsed', 'gameBlocksSubtotalEnabled', 'gameBlocksSubtotalCollapsed'], data => {
    initGameBlocks();
    applyGameBlocksState(
        data.gameBlocksEnabled ?? DEFAULT_GAME_BLOCKS_ENABLED,
        data.gameBlocksCollapsed ?? DEFAULT_GAME_BLOCKS_COLLAPSED,
        data.gameBlocksSubtotalEnabled ?? DEFAULT_GAME_BLOCKS_SUBTOTAL_ENABLED,
        data.gameBlocksSubtotalCollapsed ?? DEFAULT_GAME_BLOCKS_SUBTOTAL_COLLAPSED
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
    const needsGameBlocks = ['gameBlocksEnabled', 'gameBlocksCollapsed', 'gameBlocksSubtotalEnabled', 'gameBlocksSubtotalCollapsed'].some(k => k in changes);
    if (!needsOpacity && !needsInline && !needsCheckbox && !needsGameBlocks) return;
    chrome.storage.sync.get(['checkedOpacity', 'checkedOpacityEnabled', 'inlineImagesEnabled', 'inlineImageHeight', 'checkboxSize', 'gameBlocksEnabled', 'gameBlocksCollapsed', 'gameBlocksSubtotalEnabled', 'gameBlocksSubtotalCollapsed'], d => {
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
            d.gameBlocksSubtotalEnabled ?? DEFAULT_GAME_BLOCKS_SUBTOTAL_ENABLED,
            d.gameBlocksSubtotalCollapsed ?? DEFAULT_GAME_BLOCKS_SUBTOTAL_COLLAPSED
        );
    });
});
