console.log('popup.js loaded');

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded');
    
    const apiKeyInput = document.getElementById('apiKey');
    const saveBtn = document.getElementById('saveApiKey');
    const statusEl = document.getElementById('apiKeyStatus');
    
    if (!apiKeyInput || !saveBtn || !statusEl) {
        console.error('Required elements not found');
        return;
    }

    console.log('Elements found, setting up event listeners');
    
    // 加载保存的API密钥
    chrome.storage.local.get(['apiKey'], function(result) {
        console.log('Loaded API key from storage:', result.apiKey ? 'exists' : 'not found');
        if (result.apiKey) {
            apiKeyInput.value = result.apiKey;
        }
    });

    // 保存设置
    saveBtn.addEventListener('click', function() {
        console.log('Save button clicked');
        
        const apiKey = apiKeyInput.value.trim();
        console.log('API Key input:', apiKey);
        
        if (!apiKey) {
            console.log('Empty API key');
            statusEl.textContent = '请输入有效的API Key';
            statusEl.style.color = '#e53e3e';
            return;
        }

        console.log('Attempting to save API key');
        chrome.storage.local.set({ apiKey: apiKey }, function() {
            console.log('API key saved successfully');
            statusEl.textContent = 'API Key已保存';
            statusEl.style.color = '#38a169';
            
            // 通知内容脚本更新配置
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                console.log('Found tabs:', tabs.length);
                if (tabs.length > 0) {
                    chrome.tabs.sendMessage(tabs[0].id, {type: 'configUpdate'}, function(response) {
                        console.log('Message response:', response);
                    });
                }
            });
            
            // 3秒后清除状态
            setTimeout(() => {
                statusEl.textContent = '';
            }, 3000);
        });
    });
});
