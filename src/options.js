/**
 * @module options
 * @description Lógica de la página de opciones: carga y guarda la configuración
 * de color de resaltado por modo claro/oscuro.
 */
import previewHtml from './preview.html';
import { loadMessages, applyMessages } from './i18n.js';

/** @type {{ light: string, dark: string }} */
const DEFAULT_COLORS = {
    light: 'rgba(0, 150, 200, 0.3)',
    dark: 'rgba(0, 150, 200, 0.3)',
};

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

function init() {
    initTabs();

    const { lightRows, darkRows } = initPreview();
    const lightInput = document.getElementById('colorLight');
    const darkInput = document.getElementById('colorDark');
    const saveBtn = document.getElementById('save');
    const resetBtn = document.getElementById('reset');

    /** @type {{ light: string, dark: string }} */
    let savedColors = { ...DEFAULT_COLORS };

    const defaultHexLight = rgbaToHex(DEFAULT_COLORS.light);
    const defaultHexDark = rgbaToHex(DEFAULT_COLORS.dark);

    /**
     * Actualiza el estado habilitado/deshabilitado de los botones según cambios pendientes.
     */
    function updateButtons() {
        const changed = lightInput.value !== rgbaToHex(savedColors.light)
            || darkInput.value !== rgbaToHex(savedColors.dark);
        const isDefault = lightInput.value === defaultHexLight
            && darkInput.value === defaultHexDark;
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

    chrome.storage.sync.get('highlightColors', data => {
        const colors = { ...DEFAULT_COLORS, ...(data.highlightColors || {}) };
        savedColors = { ...colors };
        lightInput.value = rgbaToHex(colors.light);
        darkInput.value = rgbaToHex(colors.dark);
        updatePreview();
        updateButtons();
    });

    lightInput.addEventListener('input', () => { updatePreview(); updateButtons(); });
    darkInput.addEventListener('input', () => { updatePreview(); updateButtons(); });

    loadMessages().then(m => {
        document.title = m.optionsTitle;
        applyMessages(m);
        document.getElementById('about-version').textContent =
            `${m.versionPrefix} ${chrome.runtime.getManifest().version}`;

        saveBtn.addEventListener('click', () => {
            const colors = {
                light: hexToRgba(lightInput.value),
                dark: hexToRgba(darkInput.value),
            };
            chrome.storage.sync.set({ highlightColors: colors }, () => {
                savedColors = { ...colors };
                updateButtons();
                showStatus(m.savedStatus);
            });
        });

        resetBtn.addEventListener('click', () => {
            chrome.storage.sync.set({ highlightColors: DEFAULT_COLORS }, () => {
                savedColors = { ...DEFAULT_COLORS };
                lightInput.value = defaultHexLight;
                darkInput.value = defaultHexDark;
                updatePreview();
                updateButtons();
                showStatus(m.resetStatus);
            });
        });
    });
}

init();
