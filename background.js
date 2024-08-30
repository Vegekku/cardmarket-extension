chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.status === 'complete') {
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ['content.js']
        });
    }
});

chrome.tabs.onActivated.addListener(function(activeInfo) {
    chrome.scripting.executeScript({
        target: { tabId: activeInfo.tabId },
        files: ['content.js']
    });
});
