document.addEventListener('DOMContentLoaded', function() {
    chrome.storage.sync.get('terms', function(data) {
        if (data.terms) {
            document.getElementById('terms').value = data.terms.join(', ');
        }
    });

    document.getElementById('highlightBtn').addEventListener('click', function() {
        const terms = document.getElementById('terms').value.split(',').map(term => term.trim());

        chrome.storage.sync.set({ 'terms': terms });

        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                files: ['content.js']
            });
        });
    });
});
