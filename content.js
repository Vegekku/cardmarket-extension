chrome.storage.sync.get('terms', function(data) {
    clearHighlights();
    if (data.terms && data.terms.length > 0) {
        const table = document.getElementById('table');
        if (table) highlightRows(data.terms, table);
        observeNewContent(data.terms);
    }
});

/**
 * Elimina el resaltado de todas las filas previamente marcadas.
 */
function clearHighlights() {
    const table = document.getElementById('table');
    if (table) table.querySelectorAll('div.article-row').forEach(row => {
        row.style.removeProperty('--bs-table-bg');
    });
}

/**
 * Resalta las filas `div.article-row` que contienen un enlace a un vendedor
 * cuyo nombre coincide con alguno de los términos dados.
 * @param {string[]} terms - Términos a buscar
 * @param {Node} root - Nodo raíz desde el que buscar
 */
function highlightRows(terms, root) {
    terms.filter(Boolean).forEach(term => {
        root.querySelectorAll(`a[href*="/Users/${term}"]`).forEach(a => {
            a.closest('div.article-row')?.style.setProperty('--bs-table-bg', 'rgba(255, 200, 0, 0.25)');
        });
    });
}

/**
 * Observa cambios en el DOM y resalta filas en los nuevos nodos añadidos.
 * @param {string[]} terms - Términos a buscar
 */
function observeNewContent(terms) {
    new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    highlightRows(terms, node);
                }
            });
        });
    }).observe(document.getElementById('table') || document.body, { childList: true, subtree: true });
}
