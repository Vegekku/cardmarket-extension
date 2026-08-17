/**
 * @module options-preview
 * @description Lógica de las previsualizaciones de la página de opciones:
 * preview de colores de resaltado y preview de la sección Pedido.
 */
import colorPreviewHtml from './color-preview.html';
import orderPreviewHtml from './order-preview.html';
import { hexToRgba } from '../shared/color-utils.js';
import { applyInlineImages, applyCheckedRowOpacity, applyCheckboxSize } from '../shared/order-features.js';

/**
 * Inyecta el HTML de las previews de color y devuelve las filas resaltadas.
 * @returns {{ lightRows: NodeList, darkRows: NodeList }}
 */
export function initPreview() {
    const lightWrap = document.getElementById('previewLight');
    const darkWrap = document.getElementById('previewDark');
    lightWrap.innerHTML = colorPreviewHtml;
    darkWrap.innerHTML = colorPreviewHtml;
    return {
        lightRows: lightWrap.querySelectorAll('[data-highlighted]'),
        darkRows: darkWrap.querySelectorAll('[data-highlighted]'),
    };
}

/**
 * Actualiza el color de fondo de las filas resaltadas en las previews de color.
 * @param {NodeList} lightRows
 * @param {NodeList} darkRows
 * @param {string} lightHex
 * @param {string} darkHex
 */
export function updateColorPreview(lightRows, darkRows, lightHex, darkHex) {
    lightRows.forEach(r => r.style.setProperty('--bs-table-bg', hexToRgba(lightHex)));
    darkRows.forEach(r => r.style.setProperty('--bs-table-bg', hexToRgba(darkHex)));
}

/**
 * Inyecta el HTML de la preview de pedido, aplica el toggle de tema y conecta
 * los controles de la sección Pedido para actualizar la preview en tiempo real.
 * @param {{ checkboxSizeInput: HTMLInputElement, checkedOpacityEnabled: HTMLInputElement, checkedOpacityInput: HTMLInputElement, inlineImagesEnabled: HTMLInputElement, inlineImageHeightInput: HTMLInputElement }} controls
 * @returns {{ applyCheckboxSize: Function, applyOpacity: Function, applyInlineImages: Function }}
 */
export function initOrderPreview(controls) {
    const wrap = document.getElementById('orderPreviewWrap');

    wrap.innerHTML = `
        <div class="order-preview-header">
            <span id="orderPreviewThemeLabel"></span>
            <label class="toggle-label">
                <input type="checkbox" id="orderPreviewTheme">
                <span class="toggle-track"><span class="toggle-thumb"></span></span>
            </label>
        </div>
        <div>${orderPreviewHtml}</div>`;

    const toggleInput = wrap.querySelector('#orderPreviewTheme');
    const content = wrap.querySelector('div:last-child');

    function applyCheckboxSizePreview() {
        applyCheckboxSize(parseFloat(controls.checkboxSizeInput.value), wrap);
    }
    function applyOpacity() {
        applyCheckedRowOpacity(controls.checkedOpacityEnabled.checked, controls.checkedOpacityInput.value, wrap);
    }
    function applyInlineImagesPreview() {
        applyInlineImages(controls.inlineImagesEnabled.checked, parseInt(controls.inlineImageHeightInput.value), content);
    }

    toggleInput.addEventListener('change', () => {
        if (toggleInput.checked) wrap.dataset.bsTheme = 'dark';
        else delete wrap.dataset.bsTheme;
    });

    wrap.addEventListener('change', e => {
        if (e.target.classList.contains('form-check-input') && e.target !== toggleInput) applyOpacity();
    });

    controls.checkboxSizeInput.addEventListener('input', applyCheckboxSizePreview);
    controls.checkedOpacityEnabled.addEventListener('change', applyOpacity);
    controls.checkedOpacityInput.addEventListener('input', applyOpacity);
    controls.inlineImagesEnabled.addEventListener('change', applyInlineImagesPreview);
    controls.inlineImageHeightInput.addEventListener('input', applyInlineImagesPreview);

    applyCheckboxSizePreview();
    applyOpacity();
    applyInlineImagesPreview();

    return { applyCheckboxSize: applyCheckboxSizePreview, applyOpacity, applyInlineImages: applyInlineImagesPreview };
}
