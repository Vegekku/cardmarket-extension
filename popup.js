// Cargar los términos guardados cuando se abre el popup
document.addEventListener('DOMContentLoaded', function() {
    chrome.storage.sync.get('terms', function(data) {
        if (data.terms) {
            document.getElementById('terms').value = data.terms.join(', ');
        }
    });
});

// Guardar y resaltar los términos cuando se hace clic en el botón
document.getElementById('highlightBtn').addEventListener('click', function() {
    let terms = document.getElementById('terms').value.split(',').map(term => term.trim());
    
    chrome.storage.sync.set({ 'terms': terms }, function() {
        console.log('Términos guardados:', terms);
    });

    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            files: ['content.js']
        });
    });
});
