chrome.tabs.onUpdated.addListener(function (tabId, changeInfo) {
    if (changeInfo.status == 'complete') {
        chrome.tabs.sendMessage(tabId, { message: 'pageChanged' });
    }
})