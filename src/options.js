/**
 * @module options
 * @description Lógica de la página de opciones: carga y guarda la configuración
 * de color de resaltado por modo claro/oscuro.
 */

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
 * Muestra un mensaje de estado temporal.
 * @param {string} msg
 */
function showStatus(msg) {
    const el = document.getElementById('status');
    el.textContent = msg;
    setTimeout(() => { el.textContent = ''; }, 2000);
}

function init() {
    document.getElementById('about-version').textContent =
        `Versión ${chrome.runtime.getManifest().version}`;

    initTabs();

    const lightInput = document.getElementById('colorLight');
    const darkInput = document.getElementById('colorDark');

    chrome.storage.sync.get('highlightColors', data => {
        const colors = { ...DEFAULT_COLORS, ...(data.highlightColors || {}) };
        lightInput.value = rgbaToHex(colors.light);
        darkInput.value = rgbaToHex(colors.dark);
    });

    document.getElementById('save').addEventListener('click', () => {
        const colors = {
            light: hexToRgba(lightInput.value),
            dark: hexToRgba(darkInput.value),
        };
        chrome.storage.sync.set({ highlightColors: colors }, () => showStatus('Guardado ✓'));
    });

    document.getElementById('reset').addEventListener('click', () => {
        chrome.storage.sync.set({ highlightColors: DEFAULT_COLORS }, () => {
            lightInput.value = rgbaToHex(DEFAULT_COLORS.light);
            darkInput.value = rgbaToHex(DEFAULT_COLORS.dark);
            showStatus('Restablecido ✓');
        });
    });
}

init();
