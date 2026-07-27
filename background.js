/**
 * @module background
 * @description Service worker: inyecta content.js en pestañas de cardmarket.com
 * al cargar o activar la pestaña.
 */

/**
 * Comprueba si una URL pertenece a cardmarket.com.
 * @param {string} url
 * @returns {boolean}
 */
function isCardmarketTab(url) {
    return !!url && url.includes('cardmarket.com');
}

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.status === 'complete' && isCardmarketTab(tab.url)) {
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ['content.js']
        });
    }
});

chrome.tabs.onActivated.addListener(function(activeInfo) {
    chrome.tabs.get(activeInfo.tabId, function(tab) {
        if (isCardmarketTab(tab.url)) {
            chrome.scripting.executeScript({
                target: { tabId: activeInfo.tabId },
                files: ['content.js']
            });
        }
    });
});
