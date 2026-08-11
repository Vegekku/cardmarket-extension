/**
 * @module options
 * @description Lógica de la página de opciones: carga y guarda la configuración
 * de color de resaltado por modo claro/oscuro.
 */
import previewHtml from './preview.html';
import orderPreviewHtml from './order-preview.html';
import { loadMessages, applyMessages } from './i18n.js';
import { DEFAULT_COLORS, DEFAULT_CHECKBOX_SIZE, DEFAULT_CHECKED_OPACITY, DEFAULT_CHECKED_OPACITY_ENABLED, DEFAULT_INLINE_IMAGES_ENABLED, DEFAULT_INLINE_IMAGE_HEIGHT } from './defaults.js';
import { applyInlineImages, applyCheckedRowOpacity, applyCheckboxSize } from './order-features.js';

/**
 * Convierte un color rgba a hex aproximado para el input[type=color].
 * Ignora el canal alpha (no soportado por input[type=color]).
 * @param {string} rgba - Ej: "rgba(0, 150, 200, 0.3)"
 * @returns {string} - Ej: "#0096c8"
 */
function rgbaToHex(rgba) {
    const m = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (!m) return '#0096c8';
    return '#' + [m[1], m[2], m[3]].map(n => parseInt(n).toString(16).padStart(2, '0')).join('');
}

/**
 * Convierte un color hex a rgba con alpha fijo 0.3.
 * @param {string} hex - Ej: "#0096c8"
 * @returns {string} - Ej: "rgba(0, 150, 200, 0.3)"
 */
function hexToRgba(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, 0.3)`;
}

/**
 * Inicializa la navegación por tabs.
 */
function initTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(`panel-${btn.dataset.tab}`).classList.add('active');
        });
    });
}

/**
 * Muestra un mensaje de estado temporal usando el toast compartido.
 * @param {string} msg
 */
function showStatus(msg) {
    const el = document.getElementById('saveStatus');
    el.textContent = msg;
    el.classList.add('visible');
    setTimeout(() => el.classList.remove('visible'), 2000);
}

/**
 * Inyecta el HTML de las previews y aplica el color de resaltado inline en las filas marcadas.
 * @param {string} lightColor
 * @param {string} darkColor
 * @returns {{ lightRows: NodeList, darkRows: NodeList }}
 */
function initPreview() {
    const lightWrap = document.getElementById('previewLight');
    const darkWrap = document.getElementById('previewDark');
    lightWrap.innerHTML = previewHtml;
    darkWrap.innerHTML = previewHtml;
    return {
        lightRows: lightWrap.querySelectorAll('[data-highlighted]'),
        darkRows: darkWrap.querySelectorAll('[data-highlighted]'),
    };
}

/**
 * Inyecta el HTML de la preview de pedido, aplica el toggle de tema y conecta
 * los controles de la sección Pedido para actualizar la preview en tiempo real.
 * @param {{ checkboxSizeInput: HTMLInputElement, checkedOpacityEnabled: HTMLInputElement, checkedOpacityInput: HTMLInputElement, inlineImagesEnabled: HTMLInputElement, inlineImageHeightInput: HTMLInputElement }} controls
 */
function initOrderPreview(controls) {
    const wrap = document.getElementById('orderPreviewWrap');

    // Cabecera con toggle de tema
    const header = document.createElement('div');
    header.className = 'order-preview-header';
    const toggleLabel = document.createElement('label');
    toggleLabel.className = 'toggle-label';
    const toggleInput = document.createElement('input');
    toggleInput.type = 'checkbox';
    toggleInput.id = 'orderPreviewTheme';
    const toggleTrack = document.createElement('span');
    toggleTrack.className = 'toggle-track';
    toggleTrack.innerHTML = '<span class="toggle-thumb"></span>';
    toggleLabel.appendChild(toggleInput);
    toggleLabel.appendChild(toggleTrack);
    const themeSpan = document.createElement('span');
    themeSpan.id = 'orderPreviewThemeLabel';
    header.appendChild(themeSpan);
    header.appendChild(toggleLabel);
    wrap.appendChild(header);

    // Contenido de la tabla
    const content = document.createElement('div');
    content.innerHTML = orderPreviewHtml;
    wrap.appendChild(content);

    /** Aplica el tamaño de checkbox a la preview */
    function applyCheckboxSizePreview() {
        applyCheckboxSize(parseFloat(controls.checkboxSizeInput.value), wrap);
    }

    /** Aplica la opacidad a las filas marcadas en la preview */
    function applyOpacity() {
        applyCheckedRowOpacity(controls.checkedOpacityEnabled.checked, controls.checkedOpacityInput.value, wrap);
    }

    /** Aplica/elimina las imágenes inline en la preview */
    function applyInlineImagesPreview() {
        applyInlineImages(controls.inlineImagesEnabled.checked, parseInt(controls.inlineImageHeightInput.value), content);
    }

    // Toggle de tema claro/oscuro
    toggleInput.addEventListener('change', () => {
        wrap.dataset.bsTheme = toggleInput.checked ? 'dark' : '';
        if (!toggleInput.checked) delete wrap.dataset.bsTheme;
    });

    // Checkboxes interactivos en la preview (sin persistir)
    wrap.addEventListener('change', e => {
        if (e.target.classList.contains('form-check-input') && e.target !== toggleInput) {
            applyOpacity();
        }
    });

    // Conectar controles
    controls.checkboxSizeInput.addEventListener('input', applyCheckboxSizePreview);
    controls.checkedOpacityEnabled.addEventListener('change', applyOpacity);
    controls.checkedOpacityInput.addEventListener('input', applyOpacity);
    controls.inlineImagesEnabled.addEventListener('change', applyInlineImagesPreview);
    controls.inlineImageHeightInput.addEventListener('input', applyInlineImagesPreview);

    // Estado inicial
    applyCheckboxSizePreview();
    applyOpacity();
    applyInlineImagesPreview();

    return { applyCheckboxSize: applyCheckboxSizePreview, applyOpacity, applyInlineImages: applyInlineImagesPreview };
}

/**
 * Estado guardado en storage (referencia para detectar cambios pendientes).
 * @type {{ colors: { light: string, dark: string }, checkboxSize: number, checkedOpacity: number, checkedOpacityEnabled: boolean, inlineImagesEnabled: boolean, inlineImageHeight: number }}
 */
const saved = {
    colors: { ...DEFAULT_COLORS },
    checkboxSize: DEFAULT_CHECKBOX_SIZE,
    checkedOpacity: DEFAULT_CHECKED_OPACITY,
    checkedOpacityEnabled: DEFAULT_CHECKED_OPACITY_ENABLED,
    inlineImagesEnabled: DEFAULT_INLINE_IMAGES_ENABLED,
    inlineImageHeight: DEFAULT_INLINE_IMAGE_HEIGHT,
};

function init() {
    initTabs();

    const { lightRows, darkRows } = initPreview();
    const lightInput = document.getElementById('colorLight');
    const darkInput = document.getElementById('colorDark');
    const saveBtn = document.getElementById('save');
    const resetBtn = document.getElementById('reset');
    const checkboxSizeInput = document.getElementById('checkboxSize');
    const checkboxSizePreview = document.getElementById('checkboxSizePreview');
    const checkedOpacityInput = document.getElementById('checkedOpacity');
    const checkedOpacityValue = document.getElementById('checkedOpacityValue');
    const checkedOpacityEnabled = document.getElementById('checkedOpacityEnabled');
    const checkedOpacityRow = document.getElementById('checkedOpacityRow');
    const inlineImagesEnabled = document.getElementById('inlineImagesEnabled');
    const inlineImageHeightInput = document.getElementById('inlineImageHeight');
    const inlineImageHeightValue = document.getElementById('inlineImageHeightValue');
    const inlineImageHeightRow = document.getElementById('inlineImageHeightRow');

    const defaultHexLight = rgbaToHex(DEFAULT_COLORS.light);
    const defaultHexDark = rgbaToHex(DEFAULT_COLORS.dark);

    /**
     * Actualiza el estado habilitado/deshabilitado de los botones según cambios pendientes.
     */
    function updateButtons() {
        const changed = lightInput.value !== rgbaToHex(saved.colors.light)
            || darkInput.value !== rgbaToHex(saved.colors.dark)
            || parseFloat(checkboxSizeInput.value) !== saved.checkboxSize
            || checkedOpacityEnabled.checked !== saved.checkedOpacityEnabled
            || (checkedOpacityEnabled.checked && parseFloat(checkedOpacityInput.value) !== saved.checkedOpacity)
            || inlineImagesEnabled.checked !== saved.inlineImagesEnabled
            || (inlineImagesEnabled.checked && parseInt(inlineImageHeightInput.value) !== saved.inlineImageHeight);
        const isDefault = lightInput.value === defaultHexLight
            && darkInput.value === defaultHexDark
            && parseFloat(checkboxSizeInput.value) === DEFAULT_CHECKBOX_SIZE
            && checkedOpacityEnabled.checked === DEFAULT_CHECKED_OPACITY_ENABLED
            && parseFloat(checkedOpacityInput.value) === DEFAULT_CHECKED_OPACITY
            && inlineImagesEnabled.checked === DEFAULT_INLINE_IMAGES_ENABLED
            && parseInt(inlineImageHeightInput.value) === DEFAULT_INLINE_IMAGE_HEIGHT;
        saveBtn.disabled = !changed;
        resetBtn.disabled = isDefault;
    }

    /**
     * Actualiza el color de fondo de las previsualizaciones según los pickers.
     */
    function updatePreview() {
        lightRows.forEach(r => r.style.setProperty('--bs-table-bg', hexToRgba(lightInput.value)));
        darkRows.forEach(r => r.style.setProperty('--bs-table-bg', hexToRgba(darkInput.value)));
    }

    /**
     * Vuelca el objeto `saved` en los controles del DOM y refresca previews y botones.
     */
    function applyStateToUI() {
        lightInput.value = rgbaToHex(saved.colors.light);
        darkInput.value = rgbaToHex(saved.colors.dark);
        checkboxSizeInput.value = saved.checkboxSize;
        checkboxSizePreview.style.width = `${saved.checkboxSize}em`;
        checkboxSizePreview.style.height = `${saved.checkboxSize}em`;
        checkedOpacityInput.value = saved.checkedOpacity;
        checkedOpacityValue.textContent = saved.checkedOpacity;
        checkedOpacityEnabled.checked = saved.checkedOpacityEnabled;
        checkedOpacityRow.hidden = !saved.checkedOpacityEnabled;
        inlineImagesEnabled.checked = saved.inlineImagesEnabled;
        inlineImageHeightInput.value = saved.inlineImageHeight;
        inlineImageHeightValue.textContent = `${saved.inlineImageHeight}px`;
        inlineImageHeightRow.hidden = !saved.inlineImagesEnabled;
        updatePreview();
        updateButtons();
        orderPreview.applyCheckboxSize();
        orderPreview.applyOpacity();
        orderPreview.applyInlineImages();
    }

    const orderPreview = initOrderPreview({ checkboxSizeInput, checkedOpacityEnabled, checkedOpacityInput, inlineImagesEnabled, inlineImageHeightInput });

    chrome.storage.sync.get(['highlightColors', 'checkboxSize', 'checkedOpacity', 'checkedOpacityEnabled', 'inlineImagesEnabled', 'inlineImageHeight'], data => {
        const colors = { ...DEFAULT_COLORS, ...(data.highlightColors || {}) };
        saved.colors = { ...colors };
        saved.checkboxSize = data.checkboxSize ?? DEFAULT_CHECKBOX_SIZE;
        saved.checkedOpacity = data.checkedOpacity ?? DEFAULT_CHECKED_OPACITY;
        saved.checkedOpacityEnabled = data.checkedOpacityEnabled ?? DEFAULT_CHECKED_OPACITY_ENABLED;
        saved.inlineImagesEnabled = data.inlineImagesEnabled ?? DEFAULT_INLINE_IMAGES_ENABLED;
        saved.inlineImageHeight = data.inlineImageHeight ?? DEFAULT_INLINE_IMAGE_HEIGHT;
        applyStateToUI();
    });

    lightInput.addEventListener('input', () => { updatePreview(); updateButtons(); });
    darkInput.addEventListener('input', () => { updatePreview(); updateButtons(); });
    checkboxSizeInput.addEventListener('input', () => {
        checkboxSizePreview.style.width = `${checkboxSizeInput.value}em`;
        checkboxSizePreview.style.height = `${checkboxSizeInput.value}em`;
        updateButtons();
    });
    checkedOpacityEnabled.addEventListener('change', () => {
        checkedOpacityRow.hidden = !checkedOpacityEnabled.checked;
        updateButtons();
    });
    checkedOpacityInput.addEventListener('input', () => {
        checkedOpacityValue.textContent = checkedOpacityInput.value;
        updateButtons();
    });
    inlineImagesEnabled.addEventListener('change', () => {
        inlineImageHeightRow.hidden = !inlineImagesEnabled.checked;
        updateButtons();
    });
    inlineImageHeightInput.addEventListener('input', () => {
        inlineImageHeightValue.textContent = `${inlineImageHeightInput.value}px`;
        updateButtons();
    });

    loadMessages().then(m => {
        document.title = m.optionsTitle;
        applyMessages(m);
        document.getElementById('about-version').textContent =
            `${m.versionPrefix} ${chrome.runtime.getManifest().version}`;
        const themeLabel = document.getElementById('orderPreviewThemeLabel');
        if (themeLabel) themeLabel.textContent = m.orderPreviewTheme ?? 'Modo oscuro';

        saveBtn.addEventListener('click', () => {
            const colors = {
                light: hexToRgba(lightInput.value),
                dark: hexToRgba(darkInput.value),
            };
            const checkboxSize = parseFloat(checkboxSizeInput.value);
            const checkedOpacity = parseFloat(checkedOpacityInput.value);
            const checkedOpacityEnabledVal = checkedOpacityEnabled.checked;
            const inlineImagesEnabledVal = inlineImagesEnabled.checked;
            const inlineImageHeight = parseInt(inlineImageHeightInput.value);
            chrome.storage.sync.set({ highlightColors: colors, checkboxSize, checkedOpacity, checkedOpacityEnabled: checkedOpacityEnabledVal, inlineImagesEnabled: inlineImagesEnabledVal, inlineImageHeight }, () => {
                saved.colors = { ...colors };
                saved.checkboxSize = checkboxSize;
                saved.checkedOpacity = checkedOpacity;
                saved.checkedOpacityEnabled = checkedOpacityEnabledVal;
                saved.inlineImagesEnabled = inlineImagesEnabledVal;
                saved.inlineImageHeight = inlineImageHeight;
                updateButtons();
                showStatus(`${m.saved} ✓`);
            });
        });

        resetBtn.addEventListener('click', () => {
            chrome.storage.sync.set({ highlightColors: DEFAULT_COLORS, checkboxSize: DEFAULT_CHECKBOX_SIZE, checkedOpacity: DEFAULT_CHECKED_OPACITY, checkedOpacityEnabled: DEFAULT_CHECKED_OPACITY_ENABLED, inlineImagesEnabled: DEFAULT_INLINE_IMAGES_ENABLED, inlineImageHeight: DEFAULT_INLINE_IMAGE_HEIGHT }, () => {
                saved.colors = { ...DEFAULT_COLORS };
                saved.checkboxSize = DEFAULT_CHECKBOX_SIZE;
                saved.checkedOpacity = DEFAULT_CHECKED_OPACITY;
                saved.checkedOpacityEnabled = DEFAULT_CHECKED_OPACITY_ENABLED;
                saved.inlineImagesEnabled = DEFAULT_INLINE_IMAGES_ENABLED;
                saved.inlineImageHeight = DEFAULT_INLINE_IMAGE_HEIGHT;
                applyStateToUI();
                showStatus(`${m.resetStatus} ✓`);
            });
        });
    });
}

init();
