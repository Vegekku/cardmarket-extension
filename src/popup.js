/**
 * @module popup
 * @description Lógica del popup: carga términos y estado del toggle, dispara el resaltado.
 */

/**
 * Inyecta content.js en la pestaña activa.
 * @param {Function} [callback]
 */
function injectContent(callback) {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        chrome.scripting.executeScript(
            { target: { tabId: tabs[0].id }, files: ['content.js'] },
            callback
        );
    });
}

/**
 * Aplica el fallback JS para textarea auto-resize cuando field-sizing no está soportado.
 * @param {HTMLTextAreaElement} textarea
 */
function applyAutoResize(textarea) {
    if (CSS.supports('field-sizing', 'content')) return;
    const resize = () => {
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
    };
    textarea.addEventListener('input', resize);
    resize();
}

document.addEventListener('DOMContentLoaded', function() {
    const termsEl = document.getElementById('terms');
    const highlightBtn = document.getElementById('highlightBtn');
    const clearBtn = document.getElementById('clearBtn');
    const toggle = document.getElementById('enabledToggle');

    applyAutoResize(termsEl);

    chrome.storage.sync.get(['terms', 'enabled'], function(data) {
        if (data.terms) termsEl.value = data.terms.join(', ');
        const enabled = data.enabled !== false;
        toggle.checked = enabled;
        highlightBtn.disabled = !enabled;
    });

    toggle.addEventListener('change', function() {
        const enabled = toggle.checked;
        highlightBtn.disabled = !enabled;
        chrome.storage.sync.set({ enabled }, () => injectContent());
    });

    highlightBtn.addEventListener('click', function() {
        const terms = termsEl.value.split(',').map(t => t.trim()).filter(Boolean);
        chrome.storage.sync.set({ terms }, () => injectContent());
    });

    clearBtn.addEventListener('click', function() {
        termsEl.value = '';
        chrome.storage.sync.remove('terms', () => injectContent());
    });
});
