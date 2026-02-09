// Referer Extension - Background Service Worker

chrome.runtime.onInstalled.addListener(() => {
    console.log('Referer extension installed');
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'SOURCES_FOUND') {
        chrome.action.setBadgeText({
            text: message.count > 0 ? String(message.count) : ''
        });
        chrome.action.setBadgeBackgroundColor({ color: '#818CF8' });
    }
    sendResponse({ received: true });
    return true;
});
