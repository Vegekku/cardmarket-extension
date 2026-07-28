/**
 * @module popup
 * @description Lógica del popup: carga los términos guardados y dispara el resaltado.
 */

/**
 * Carga los términos guardados en el textarea al abrir el popup.
 */
function loadTerms() {
    chrome.storage.sync.get('terms', function(data) {
        if (data.terms) {
            document.getElementById('terms').value = data.terms.join(', ');
        }
    });
}

/**
 * Guarda los términos introducidos y ejecuta el resaltado en la pestaña activa.
 */
function saveAndHighlight() {
    const terms = document.getElementById('terms').value.split(',').map(t => t.trim());
    chrome.storage.sync.set({ terms });
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            files: ['content.js']
        });
    });
}

document.addEventListener('DOMContentLoaded', function() {
    loadTerms();
    document.getElementById('highlightBtn').addEventListener('click', saveAndHighlight);
});
