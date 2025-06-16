// 扩展安装/更新时的初始化
chrome.runtime.onInstalled.addListener(() => {
    console.log('DeepSeek翻译助手已安装/更新');
});

// 监听来自content script的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'configUpdate') {
        // 通知所有标签页的内容脚本重新加载配置
        chrome.tabs.query({}, tabs => {
            tabs.forEach(tab => {
                chrome.tabs.sendMessage(tab.id, {type: 'reloadConfig'});
            });
        });
        sendResponse({status: 'success'});
    }
    return true; // 保持消息通道开放
});

// 管理全局状态
const globalState = {
    activeTranslations: {},
    apiStatus: 'ready'
};

// 导出API状态检查函数
function checkAPIStatus() {
    return new Promise((resolve) => {
        chrome.storage.local.get(['apiKey'], result => {
            if (result.apiKey) {
                resolve({status: 'ready', hasKey: true});
            } else {
                resolve({status: 'no_key', hasKey: false});
            }
        });
    });
}

// 提供API状态给popup
chrome.runtime.onConnect.addListener(port => {
    if (port.name === 'popup') {
        port.onMessage.addListener(msg => {
            if (msg.type === 'getAPIStatus') {
                checkAPIStatus().then(status => {
                    port.postMessage({type: 'apiStatus', data: status});
                });
            }
        });
    }
});
