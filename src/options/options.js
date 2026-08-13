/**
 * @module options
 * @description Lógica de la página de opciones: carga y guarda la configuración
 * de color de resaltado por modo claro/oscuro.
 */
import { loadMessages, applyMessages } from '../shared/i18n.js';
import { DEFAULT_COLORS, DEFAULT_CHECKBOX_SIZE, DEFAULT_CHECKED_OPACITY, DEFAULT_CHECKED_OPACITY_ENABLED, DEFAULT_INLINE_IMAGES_ENABLED, DEFAULT_INLINE_IMAGE_HEIGHT, DEFAULT_GAME_BLOCKS_ENABLED, DEFAULT_GAME_BLOCKS_COLLAPSED, DEFAULT_GAME_BLOCKS_SUBTOTAL_ENABLED } from '../shared/defaults.js';
import { rgbaToHex, hexToRgba } from '../shared/color-utils.js';
import { initPreview, updateColorPreview, initOrderPreview } from './options-preview.js';

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

function init() {
    initTabs();

    const { lightRows, darkRows } = initPreview();
    const lightInput = document.getElementById('colorLight');
    const darkInput = document.getElementById('colorDark');
    const saveBtn = document.getElementById('save');
    const resetBtn = document.getElementById('reset');
    const checkboxSizeInput = document.getElementById('checkboxSize');
    const checkedOpacityInput = document.getElementById('checkedOpacity');
    const checkedOpacityValue = document.getElementById('checkedOpacityValue');
    const checkedOpacityEnabled = document.getElementById('checkedOpacityEnabled');
    const checkedOpacityRow = document.getElementById('checkedOpacityRow');
    const inlineImagesEnabled = document.getElementById('inlineImagesEnabled');
    const inlineImageHeightInput = document.getElementById('inlineImageHeight');
    const inlineImageHeightValue = document.getElementById('inlineImageHeightValue');
    const inlineImageHeightRow = document.getElementById('inlineImageHeightRow');
    const gameBlocksEnabled = document.getElementById('gameBlocksEnabled');
    const gameBlocksCollapsed = document.getElementById('gameBlocksCollapsed');
    const gameBlocksCollapsedRow = document.getElementById('gameBlocksCollapsedRow');
    const gameBlocksSubtotalEnabled = document.getElementById('gameBlocksSubtotalEnabled');

    const defaultHexLight = rgbaToHex(DEFAULT_COLORS.light);
    const defaultHexDark = rgbaToHex(DEFAULT_COLORS.dark);

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
        gameBlocksEnabled: DEFAULT_GAME_BLOCKS_ENABLED,
        gameBlocksCollapsed: DEFAULT_GAME_BLOCKS_COLLAPSED,
        gameBlocksSubtotalEnabled: DEFAULT_GAME_BLOCKS_SUBTOTAL_ENABLED,
    };

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
            || (inlineImagesEnabled.checked && parseInt(inlineImageHeightInput.value) !== saved.inlineImageHeight)
            || gameBlocksEnabled.checked !== saved.gameBlocksEnabled
            || (gameBlocksEnabled.checked && gameBlocksCollapsed.checked !== saved.gameBlocksCollapsed)
            || gameBlocksSubtotalEnabled.checked !== saved.gameBlocksSubtotalEnabled;
        const isDefault = lightInput.value === defaultHexLight
            && darkInput.value === defaultHexDark
            && parseFloat(checkboxSizeInput.value) === DEFAULT_CHECKBOX_SIZE
            && checkedOpacityEnabled.checked === DEFAULT_CHECKED_OPACITY_ENABLED
            && parseFloat(checkedOpacityInput.value) === DEFAULT_CHECKED_OPACITY
            && inlineImagesEnabled.checked === DEFAULT_INLINE_IMAGES_ENABLED
            && parseInt(inlineImageHeightInput.value) === DEFAULT_INLINE_IMAGE_HEIGHT
            && gameBlocksEnabled.checked === DEFAULT_GAME_BLOCKS_ENABLED
            && gameBlocksCollapsed.checked === DEFAULT_GAME_BLOCKS_COLLAPSED
            && gameBlocksSubtotalEnabled.checked === DEFAULT_GAME_BLOCKS_SUBTOTAL_ENABLED;
        saveBtn.disabled = !changed;
        resetBtn.disabled = isDefault;
    }

    /**
     * Vuelca el objeto `saved` en los controles del DOM y refresca previews y botones.
     */
    function applyStateToUI() {
        lightInput.value = rgbaToHex(saved.colors.light);
        darkInput.value = rgbaToHex(saved.colors.dark);
        checkboxSizeInput.value = saved.checkboxSize;
        checkedOpacityInput.value = saved.checkedOpacity;
        checkedOpacityValue.textContent = saved.checkedOpacity;
        checkedOpacityEnabled.checked = saved.checkedOpacityEnabled;
        checkedOpacityRow.hidden = !saved.checkedOpacityEnabled;
        inlineImagesEnabled.checked = saved.inlineImagesEnabled;
        inlineImageHeightInput.value = saved.inlineImageHeight;
        inlineImageHeightValue.textContent = `${saved.inlineImageHeight}px`;
        inlineImageHeightRow.hidden = !saved.inlineImagesEnabled;
        gameBlocksEnabled.checked = saved.gameBlocksEnabled;
        gameBlocksCollapsedRow.hidden = !saved.gameBlocksEnabled;
        gameBlocksCollapsed.checked = saved.gameBlocksCollapsed;
        gameBlocksSubtotalEnabled.checked = saved.gameBlocksSubtotalEnabled;
        updateColorPreview(lightRows, darkRows, lightInput.value, darkInput.value);
        updateButtons();
        orderPreview.applyCheckboxSize();
        orderPreview.applyOpacity();
        orderPreview.applyInlineImages();
    }

    const orderPreview = initOrderPreview({ checkboxSizeInput, checkedOpacityEnabled, checkedOpacityInput, inlineImagesEnabled, inlineImageHeightInput });

    chrome.storage.sync.get(['highlightColors', 'checkboxSize', 'checkedOpacity', 'checkedOpacityEnabled', 'inlineImagesEnabled', 'inlineImageHeight', 'gameBlocksEnabled', 'gameBlocksCollapsed', 'gameBlocksSubtotalEnabled'], data => {
        saved.colors = { ...DEFAULT_COLORS, ...(data.highlightColors || {}) };
        saved.checkboxSize = data.checkboxSize ?? DEFAULT_CHECKBOX_SIZE;
        saved.checkedOpacity = data.checkedOpacity ?? DEFAULT_CHECKED_OPACITY;
        saved.checkedOpacityEnabled = data.checkedOpacityEnabled ?? DEFAULT_CHECKED_OPACITY_ENABLED;
        saved.inlineImagesEnabled = data.inlineImagesEnabled ?? DEFAULT_INLINE_IMAGES_ENABLED;
        saved.inlineImageHeight = data.inlineImageHeight ?? DEFAULT_INLINE_IMAGE_HEIGHT;
        saved.gameBlocksEnabled = data.gameBlocksEnabled ?? DEFAULT_GAME_BLOCKS_ENABLED;
        saved.gameBlocksCollapsed = data.gameBlocksCollapsed ?? DEFAULT_GAME_BLOCKS_COLLAPSED;
        saved.gameBlocksSubtotalEnabled = data.gameBlocksSubtotalEnabled ?? DEFAULT_GAME_BLOCKS_SUBTOTAL_ENABLED;
        applyStateToUI();
    });

    [lightInput, darkInput].forEach(input => input.addEventListener('input', () => {
        updateColorPreview(lightRows, darkRows, lightInput.value, darkInput.value);
        updateButtons();
    }));
    checkboxSizeInput.addEventListener('input', () => {
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
    gameBlocksEnabled.addEventListener('change', () => {
        gameBlocksCollapsedRow.hidden = !gameBlocksEnabled.checked;
        updateButtons();
    });
    gameBlocksCollapsed.addEventListener('change', updateButtons);
    gameBlocksSubtotalEnabled.addEventListener('change', updateButtons);

    loadMessages().then(m => {
        document.title = m.optionsTitle;
        applyMessages(m);
        document.getElementById('about-version').textContent =
            `${m.versionPrefix} ${chrome.runtime.getManifest().version}`;
        const themeLabel = document.getElementById('orderPreviewThemeLabel');
        if (themeLabel) themeLabel.textContent = m.orderPreviewTheme ?? 'Modo oscuro';

        const feedbackLink = document.getElementById('about-feedback');
        if (feedbackLink) {
            chrome.storage.local.get('lang', data => {
                const lang = data.lang || 'es';
                const theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                const version = chrome.runtime.getManifest().version;
                const browser = navigator.userAgent;
                const params = new URLSearchParams({ version, browser, lang, theme });
                feedbackLink.href = `https://vegekku.github.io/cardmarket-extension/feedback.html?${params}`;
            });
        }

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
            const gameBlocksEnabledVal = gameBlocksEnabled.checked;
            const gameBlocksCollapsedVal = gameBlocksCollapsed.checked;
            const gameBlocksSubtotalEnabledVal = gameBlocksSubtotalEnabled.checked;
            chrome.storage.sync.set({ highlightColors: colors, checkboxSize, checkedOpacity, checkedOpacityEnabled: checkedOpacityEnabledVal, inlineImagesEnabled: inlineImagesEnabledVal, inlineImageHeight, gameBlocksEnabled: gameBlocksEnabledVal, gameBlocksCollapsed: gameBlocksCollapsedVal, gameBlocksSubtotalEnabled: gameBlocksSubtotalEnabledVal }, () => {
                saved.colors = { ...colors };
                saved.checkboxSize = checkboxSize;
                saved.checkedOpacity = checkedOpacity;
                saved.checkedOpacityEnabled = checkedOpacityEnabledVal;
                saved.inlineImagesEnabled = inlineImagesEnabledVal;
                saved.inlineImageHeight = inlineImageHeight;
                saved.gameBlocksEnabled = gameBlocksEnabledVal;
                saved.gameBlocksCollapsed = gameBlocksCollapsedVal;
                saved.gameBlocksSubtotalEnabled = gameBlocksSubtotalEnabledVal;
                updateButtons();
                showStatus(`${m.saved} ✓`);
            });
        });

        resetBtn.addEventListener('click', () => {
            chrome.storage.sync.set({ highlightColors: DEFAULT_COLORS, checkboxSize: DEFAULT_CHECKBOX_SIZE, checkedOpacity: DEFAULT_CHECKED_OPACITY, checkedOpacityEnabled: DEFAULT_CHECKED_OPACITY_ENABLED, inlineImagesEnabled: DEFAULT_INLINE_IMAGES_ENABLED, inlineImageHeight: DEFAULT_INLINE_IMAGE_HEIGHT, gameBlocksEnabled: DEFAULT_GAME_BLOCKS_ENABLED, gameBlocksCollapsed: DEFAULT_GAME_BLOCKS_COLLAPSED, gameBlocksSubtotalEnabled: DEFAULT_GAME_BLOCKS_SUBTOTAL_ENABLED }, () => {
                saved.colors = { ...DEFAULT_COLORS };
                saved.checkboxSize = DEFAULT_CHECKBOX_SIZE;
                saved.checkedOpacity = DEFAULT_CHECKED_OPACITY;
                saved.checkedOpacityEnabled = DEFAULT_CHECKED_OPACITY_ENABLED;
                saved.inlineImagesEnabled = DEFAULT_INLINE_IMAGES_ENABLED;
                saved.inlineImageHeight = DEFAULT_INLINE_IMAGE_HEIGHT;
                saved.gameBlocksEnabled = DEFAULT_GAME_BLOCKS_ENABLED;
                saved.gameBlocksCollapsed = DEFAULT_GAME_BLOCKS_COLLAPSED;
                saved.gameBlocksSubtotalEnabled = DEFAULT_GAME_BLOCKS_SUBTOTAL_ENABLED;
                applyStateToUI();
                showStatus(`${m.resetStatus} ✓`);
            });
        });
    });
}

init();
