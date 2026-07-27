chrome.storage.sync.get('terms', function(data) {
    if (data.terms && data.terms.length > 0) {
        highlightTerms(data.terms);
        observeNewContent(data.terms);
    }
});

/**
 * Resalta los términos dados en todos los nodos de texto del elemento raíz,
 * sin modificar la estructura del DOM ni destruir event listeners.
 * @param {string[]} terms - Términos a resaltar
 * @param {Node} root - Nodo raíz desde el que buscar (por defecto document.body)
 */
function highlightTerms(terms, root = document.body) {
    const regex = new RegExp(terms.filter(Boolean).map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'gi');
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
        acceptNode: node => {
            if (!node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
            if (['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(node.parentElement?.tagName)) return NodeFilter.FILTER_REJECT;
            if (node.parentElement?.classList.contains('mkm-highlight')) return NodeFilter.FILTER_REJECT;
            return NodeFilter.FILTER_ACCEPT;
        }
    });

    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);

    nodes.forEach(node => {
        if (!regex.test(node.nodeValue)) return;
        regex.lastIndex = 0;
        const fragment = document.createDocumentFragment();
        let last = 0, match;
        while ((match = regex.exec(node.nodeValue)) !== null) {
            fragment.appendChild(document.createTextNode(node.nodeValue.slice(last, match.index)));
            const span = document.createElement('span');
            span.className = 'mkm-highlight';
            span.style.backgroundColor = 'yellow';
            span.textContent = match[0];
            fragment.appendChild(span);
            last = match.index + match[0].length;
        }
        fragment.appendChild(document.createTextNode(node.nodeValue.slice(last)));
        node.parentNode.replaceChild(fragment, node);
    });
}

/**
 * Observa cambios en el DOM y resalta términos en los nuevos nodos añadidos.
 * @param {string[]} terms - Términos a resaltar
 */
function observeNewContent(terms) {
    new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === Node.ELEMENT_NODE && !node.classList.contains('mkm-highlight')) {
                    highlightTerms(terms, node);
                }
            });
        });
    }).observe(document.body, { childList: true, subtree: true });
}
