/**
 * @module order-features
 * @description Lógica compartida para las features de la tabla de pedido
 * (imágenes inline, opacidad de filas, tamaño de checkbox).
 * Usada tanto por content.js (página real) como por options.js (preview).
 */

/**
 * Extrae el src del img contenido en el atributo data-bs-title de un span.thumbnail-icon.
 * @param {Element} span
 * @returns {string|null}
 */
export function extractThumbnailSrc(span) {
    const title = span.getAttribute('data-bs-title') || '';
    const decoded = title.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
    const m = decoded.match(/<img[^>]+src=["']([^"']+)['"]/);
    return m ? m[1] : null;
}

/**
 * Inyecta el thumbnail inline en un span.thumbnail-icon si aún no se ha procesado.
 * @param {Element} span
 * @param {number} height
 */
export function injectThumbnail(span, height) {
    if (span.dataset.mkmInline) return;
    const src = extractThumbnailSrc(span);
    if (!src) return;
    span.querySelector('.fonticon-camera')?.remove();
    span.classList.remove('icon', 'is-24x24');
    const img = document.createElement('img');
    img.src = src;
    img.loading = 'lazy';
    img.height = height;
    span.appendChild(img);
    span.dataset.mkmInline = '1';
}

/**
 * Aplica o elimina los thumbnails inline en un contexto dado.
 * @param {boolean} enabled
 * @param {number} height
 * @param {ParentNode} [root=document]
 */
export function applyInlineImages(enabled, height, root = document) {
    if (!enabled) {
        root.querySelectorAll('span.thumbnail-icon[data-mkm-inline]').forEach(span => {
            span.querySelector('img[loading="lazy"]')?.remove();
            delete span.dataset.mkmInline;
            span.classList.add('icon', 'is-24x24');
            const icon = document.createElement('span');
            icon.className = 'fonticon-camera';
            span.appendChild(icon);
        });
        return;
    }
    root.querySelectorAll('span.thumbnail-icon[data-mkm-inline]').forEach(span => {
        const img = span.querySelector('img[loading="lazy"]');
        if (img) img.height = height;
    });
    root.querySelectorAll('span.thumbnail-icon:not([data-mkm-inline])').forEach(span => injectThumbnail(span, height));
}

/**
 * Aplica la opacidad configurada a las filas cuyo checkbox esté marcado.
 * @param {boolean} enabled
 * @param {number} opacity
 * @param {ParentNode} [root=document]
 */
export function applyCheckedRowOpacity(enabled, opacity, root = document) {
    root.querySelectorAll('table.product-table tr').forEach(tr => {
        const cb = tr.querySelector('input.form-check-input[type="checkbox"]');
        if (cb) tr.style.opacity = (enabled && cb.checked) ? opacity : '';
    });
}

/**
 * Setea la custom property --op-cb-size en el elemento raíz dado.
 * En content.js se pasa document.documentElement; en options.js el wrap de la preview.
 * @param {number} size - Tamaño en em
 * @param {Element} [root=document.documentElement]
 */
export function applyCheckboxSize(size, root = document.documentElement) {
    root.style.setProperty('--op-cb-size', `${size}em`);
}
