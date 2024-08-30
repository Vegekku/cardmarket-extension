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
