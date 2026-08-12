/**
 * @module popup
 * @description Lógica del popup: carga usuarios y estado del toggle, autoguarda al escribir.
 */
import { loadMessages, applyMessages } from './i18n.js';

/**
 * Envía un mensaje UPDATE_HIGHLIGHT a todas las pestañas abiertas de Cardmarket.
 * @param {{ terms?: string[], enabled?: boolean }} data
 */
function broadcastToCardmarket(data) {
    chrome.tabs.query({ url: '*://*.cardmarket.com/*' }, function(tabs) {
        tabs.forEach(tab => {
            chrome.tabs.sendMessage(tab.id, { type: 'UPDATE_HIGHLIGHT', data })
                .catch(() => {});
        });
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

/**
 * Devuelve una versión con debounce de la función dada.
 * @param {Function} fn
 * @param {number} delay
 * @returns {Function}
 */
function debounce(fn, delay) {
    let timer;
    return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay); };
}

document.addEventListener('DOMContentLoaded', function() {
    const termsEl = document.getElementById('terms');
    const clearBtn = document.getElementById('clearBtn');
    const toggle = document.getElementById('enabledToggle');
    const saveStatus = document.getElementById('saveStatus');

    applyAutoResize(termsEl);

    let enabled = true;
    let fadeTimer;
    let msg = {};

    /**
     * Muestra un mensaje de feedback temporal en el popup.
     * @param {string} text
     */
    function showFeedback(text) {
        clearTimeout(fadeTimer);
        saveStatus.textContent = text;
        saveStatus.classList.add('visible');
        fadeTimer = setTimeout(() => saveStatus.classList.remove('visible'), 1000);
    }

    loadMessages().then(m => {
        msg = m;
        document.title = m.popupTitle;
        applyMessages(m);
    });

    chrome.storage.sync.get(['terms', 'enabled'], function(data) {
        if (data.terms && data.terms.length > 0) {
            termsEl.value = data.terms.join('\n');
        }
        enabled = data.enabled !== false;
        toggle.checked = enabled;
        clearBtn.disabled = !termsEl.value.trim();
    });

    const saveAndBroadcast = debounce(function() {
        const terms = termsEl.value.split(/[\s,]+/).filter(Boolean).sort((a, b) => a.localeCompare(b));
        clearBtn.disabled = terms.length === 0;
        chrome.storage.sync.set({ terms }, () => { broadcastToCardmarket({ terms, enabled }); showFeedback(`${msg.saved} ✓`); });
    }, 500);

    termsEl.addEventListener('input', saveAndBroadcast);

    toggle.addEventListener('change', function() {
        enabled = toggle.checked;
        chrome.storage.sync.set({ enabled }, () => {
            chrome.storage.sync.get('terms', data => broadcastToCardmarket({ ...data, enabled }));
        });
    });

    clearBtn.addEventListener('click', function() {
        termsEl.value = '';
        clearBtn.disabled = true;
        chrome.storage.sync.remove('terms', () => { broadcastToCardmarket({ terms: [], enabled }); showFeedback(`${msg.cleared} ✓`); });
    });
});
