(function() {
    if (document.getElementById('deepseek-float-ball')) return;

    // 配置
    const CONFIG = {
        API_URL: "https://api.deepseek.com/chat/completions",
        STORAGE_KEY: "deepseek_history",
        MAX_HISTORY: 50
    };

    // 创建样式
    const style = document.createElement('style');
    style.textContent = `
        .deepseek-container * {
            box-sizing: border-box;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        #deepseek-float-ball {
            position: fixed;
            right: 40px;
            bottom: 80px;
            width: 56px;
            height: 56px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-radius: 50%;
            display: flex;
            justify-content: center;
            align-items: center;
            cursor: pointer;
            z-index: 999999;
            box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
            transition: all 0.3s ease;
            user-select: none;
            font-size: 24px;
        }
        
        #deepseek-float-ball:hover {
            transform: scale(1.1);
            box-shadow: 0 6px 25px rgba(102, 126, 234, 0.6);
        }
        
        #deepseek-float-ball.dragging {
            transform: scale(0.95);
            opacity: 0.8;
        }
        
        #deepseek-popup {
            position: fixed;
            right: 120px;
            bottom: 80px;
            width: 420px;
            max-height: 500px;
            background: white;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
            z-index: 1000000;
            overflow: hidden;
            transform: scale(0.8) translateY(20px);
            opacity: 0;
            transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
            border: 1px solid rgba(0, 0, 0, 0.1);
        }
        
        #deepseek-popup.show {
            transform: scale(1) translateY(0);
            opacity: 1;
        }
        
        .deepseek-popup-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 16px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            cursor: move;
        }
        
        .deepseek-popup-title {
            font-weight: 600;
            font-size: 16px;
        }
        
        .deepseek-popup-controls {
            display: flex;
            gap: 8px;
        }
        
        .deepseek-control-btn {
            width: 28px;
            height: 28px;
            border-radius: 6px;
            background: rgba(255, 255, 255, 0.2);
            border: none;
            color: white;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
            font-size: 14px;
        }
        
        .deepseek-control-btn:hover {
            background: rgba(255, 255, 255, 0.3);
        }
        
        .deepseek-popup-content {
            padding: 20px;
            max-height: 350px;
            overflow-y: auto;
            line-height: 1.6;
            color: #333;
        }
        
        .deepseek-loading {
            display: flex;
            align-items: center;
            gap: 12px;
            color: #666;
        }
        
        .deepseek-spinner {
            width: 20px;
            height: 20px;
            border: 2px solid #e3e3e3;
            border-top: 2px solid #667eea;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .deepseek-mode-selector {
            display: flex;
            gap: 8px;
            margin-bottom: 16px;
            padding: 0 20px;
            background: #f8f9fa;
            padding: 12px 20px;
        }
        
        .deepseek-mode-btn {
            padding: 6px 12px;
            border: 1px solid #ddd;
            background: white;
            border-radius: 20px;
            cursor: pointer;
            font-size: 12px;
            transition: all 0.2s;
        }
        
        .deepseek-mode-btn.active {
            background: #667eea;
            color: white;
            border-color: #667eea;
        }
        
        .deepseek-result {
            font-size: 14px;
            word-break: break-word;
        }
        
        .deepseek-result h4 {
            margin: 0 0 8px 0;
            color: #667eea;
            font-size: 14px;
        }
        
        .deepseek-result p {
            margin: 8px 0;
        }
        
        .deepseek-actions {
            display: flex;
            gap: 8px;
            margin-top: 16px;
            padding-top: 16px;
            border-top: 1px solid #eee;
        }
        
        .deepseek-action-btn {
            padding: 8px 16px;
            border: 1px solid #ddd;
            background: white;
            border-radius: 6px;
            cursor: pointer;
            font-size: 12px;
            transition: all 0.2s;
        }
        
        .deepseek-action-btn:hover {
            background: #f5f5f5;
        }
        
        .deepseek-action-btn.primary {
            background: #667eea;
            color: white;
            border-color: #667eea;
        }
        
        .deepseek-action-btn.primary:hover {
            background: #5a6fd8;
        }
        
        .deepseek-history-panel {
            position: fixed;
            right: 20px;
            top: 20px;
            width: 300px;
            max-height: 400px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
            z-index: 1000001;
            display: none;
            overflow: hidden;
        }
        
        .deepseek-history-header {
            background: #f8f9fa;
            padding: 12px 16px;
            border-bottom: 1px solid #eee;
            font-weight: 600;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .deepseek-history-list {
            max-height: 300px;
            overflow-y: auto;
        }
        
        .deepseek-history-item {
            padding: 12px 16px;
            border-bottom: 1px solid #f0f0f0;
            cursor: pointer;
            transition: background 0.2s;
        }
        
        .deepseek-history-item:hover {
            background: #f8f9fa;
        }
        
        .deepseek-history-text {
            font-size: 12px;
            color: #666;
            margin-bottom: 4px;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }
        
        .deepseek-history-time {
            font-size: 10px;
            color: #999;
        }
        
        .deepseek-dark-theme {
            background: #2d3748 !important;
            color: #e2e8f0 !important;
        }
        
        .deepseek-dark-theme .deepseek-popup-content {
            background: #2d3748;
            color: #e2e8f0;
        }
        
        .deepseek-dark-theme .deepseek-mode-selector {
            background: #4a5568;
        }
        
        .deepseek-dark-theme .deepseek-mode-btn {
            background: #4a5568;
            color: #e2e8f0;
            border-color: #718096;
        }
    `;
    document.head.appendChild(style);

    // 创建悬浮球
    const ball = document.createElement('div');
    ball.id = 'deepseek-float-ball';
    ball.innerHTML = '🌐';
    ball.className = 'deepseek-container';
    document.body.appendChild(ball);

    // 创建弹窗
    const popup = document.createElement('div');
    popup.id = 'deepseek-popup';
    popup.className = 'deepseek-container';
    popup.innerHTML = `
        <div class="deepseek-popup-header">
            <div class="deepseek-popup-title">DeepSeek 翻译助手</div>
            <div class="deepseek-popup-controls">
                <button class="deepseek-control-btn" id="deepseek-theme-btn" title="切换主题">🌙</button>
                <button class="deepseek-control-btn" id="deepseek-history-btn" title="历史记录">📚</button>
                <button class="deepseek-control-btn" id="deepseek-close-btn" title="关闭">✕</button>
            </div>
        </div>
        <div class="deepseek-mode-selector">
            <div class="deepseek-mode-btn active" data-mode="quick">快速翻译</div>
            <div class="deepseek-mode-btn" data-mode="detailed">详细解释</div>
            <div class="deepseek-mode-btn" data-mode="academic">学术解读</div>
        </div>
        <div class="deepseek-popup-content" id="deepseek-content"></div>
    `;
    document.body.appendChild(popup);

    // 创建历史记录面板
    const historyPanel = document.createElement('div');
    historyPanel.className = 'deepseek-history-panel deepseek-container';
    historyPanel.innerHTML = `
        <div class="deepseek-history-header">
            <span>翻译历史</span>
            <button class="deepseek-control-btn" id="deepseek-clear-history">🗑️</button>
        </div>
        <div class="deepseek-history-list" id="deepseek-history-list"></div>
    `;
    document.body.appendChild(historyPanel);

    // 状态管理
    let currentMode = 'quick';
    let isDarkTheme = false;
    let isPopupVisible = false;
    let dragData = { isDragging: false, startX: 0, startY: 0, startLeft: 0, startTop: 0 };

    // 获取选中文本
    async function getSelectedText() {
        let text = window.getSelection().toString().trim();
        if (text) return text;
        
        for (let i = 0; i < window.frames.length; i++) {
            try {
                let frameText = window.frames[i].getSelection().toString().trim();
                if (frameText) return frameText;
            } catch (e) {}
        }
        
        try {
            if (navigator.clipboard) {
                let clipText = await navigator.clipboard.readText();
                if (clipText && clipText.trim()) return clipText.trim();
            }
        } catch (e) {}
        
        return '';
    }

    // 显示内容
    function showContent(content, isLoading = false) {
        const contentEl = document.getElementById('deepseek-content');
        if (isLoading) {
            contentEl.innerHTML = `
                <div class="deepseek-loading">
                    <div class="deepseek-spinner"></div>
                    <span>${content}</span>
                </div>
            `;
        } else {
            contentEl.innerHTML = `
                <div class="deepseek-result">
                    ${content}
                </div>
                <div class="deepseek-actions">
                    <button class="deepseek-action-btn primary" id="deepseek-copy-btn">复制结果</button>
                    <button class="deepseek-action-btn" id="deepseek-speak-btn">🔊 朗读</button>
                    <button class="deepseek-action-btn" id="deepseek-save-btn">⭐ 收藏</button>
                </div>
            `;
            
            // 绑定操作按钮事件
            document.getElementById('deepseek-copy-btn')?.addEventListener('click', () => {
                navigator.clipboard.writeText(content.replace(/<[^>]*>/g, ''));
                showToast('已复制到剪贴板');
            });
            
            document.getElementById('deepseek-speak-btn')?.addEventListener('click', () => {
                const utterance = new SpeechSynthesisUtterance(content.replace(/<[^>]*>/g, ''));
                utterance.lang = 'zh-CN';
                speechSynthesis.speak(utterance);
            });
            
            document.getElementById('deepseek-save-btn')?.addEventListener('click', () => {
                saveToHistory(window.lastTranslatedText, content);
                showToast('已保存到历史记录');
            });
        }
    }

    // 显示/隐藏弹窗
    function showPopup() {
        popup.style.display = 'block';
        setTimeout(() => popup.classList.add('show'), 10);
        isPopupVisible = true;
    }

    function hidePopup() {
        popup.classList.remove('show');
        setTimeout(() => {
            popup.style.display = 'none';
            isPopupVisible = false;
        }, 300);
    }

    // 获取翻译模式的系统提示词
    function getSystemPrompt(mode) {
        const prompts = {
            quick: "你是一个快速翻译助手。对于英文内容，直接翻译成中文；对于中文专业术语，给出简洁解释。回答要简明扼要。",
            detailed: "你是一个详细解释助手。对于英文内容，先翻译成中文，再解释句子结构和重点词汇；对于中文专业术语，给出详细的定义、应用场景和相关概念。",
            academic: "你是一个学术解读专家。对于英文内容，提供准确翻译、语法分析、学术背景；对于中文专业术语，提供学术定义、理论背景、研究现状和应用领域。"
        };
        return prompts[mode] || prompts.quick;
    }

    // 调用 DeepSeek API
    async function callDeepseek(text, mode = 'quick') {
        const { apiKey } = await new Promise(resolve => {
            chrome.storage.local.get(['apiKey'], resolve);
        });
        
        if (!apiKey) {
            throw new Error('请先在扩展设置中配置API Key');
        }

        const response = await fetch(CONFIG.API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [
                    { role: 'system', content: getSystemPrompt(mode) },
                    { role: 'user', content: text }
                ],
                stream: false
            })
        });

        if (!response.ok) {
            throw new Error(`API请求失败: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    }

    // 保存到历史记录
    function saveToHistory(originalText, translatedText) {
        chrome.storage.local.get([CONFIG.STORAGE_KEY], (result) => {
            const history = result[CONFIG.STORAGE_KEY] || [];
            const newItem = {
                id: Date.now(),
                original: originalText,
                translated: translatedText,
                timestamp: new Date().toLocaleString(),
                mode: currentMode
            };
            
            history.unshift(newItem);
            if (history.length > CONFIG.MAX_HISTORY) {
                history.splice(CONFIG.MAX_HISTORY);
            }
            
            chrome.storage.local.set({ [CONFIG.STORAGE_KEY]: history });
        });
    }

    // 加载历史记录
    function loadHistory() {
        chrome.storage.local.get([CONFIG.STORAGE_KEY], (result) => {
            const history = result[CONFIG.STORAGE_KEY] || [];
            const listEl = document.getElementById('deepseek-history-list');
            
            if (history.length === 0) {
                listEl.innerHTML = '<div style="padding: 20px; text-align: center; color: #999;">暂无历史记录</div>';
                return;
            }
            
            listEl.innerHTML = history.map(item => `
                <div class="deepseek-history-item" data-id="${item.id}">
                    <div class="deepseek-history-text">${item.original}</div>
                    <div class="deepseek-history-time">${item.timestamp}</div>
                </div>
            `).join('');
            
            // 绑定历史记录点击事件
            listEl.querySelectorAll('.deepseek-history-item').forEach(item => {
                item.addEventListener('click', () => {
                    const id = parseInt(item.dataset.id);
                    const historyItem = history.find(h => h.id === id);
                    if (historyItem) {
                        showContent(historyItem.translated);
                        showPopup();
                        historyPanel.style.display = 'none';
                    }
                });
            });
        });
    }

    // 显示提示消息
    function showToast(message) {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #333;
            color: white;
            padding: 12px 20px;
            border-radius: 6px;
            z-index: 10000000;
            font-size: 14px;
            opacity: 0;
            transition: opacity 0.3s;
        `;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => toast.style.opacity = '1', 10);
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => document.body.removeChild(toast), 300);
        }, 2000);
    }

    // 悬浮球拖拽
    ball.addEventListener('mousedown', (e) => {
        dragData.isDragging = true;
        dragData.startX = e.clientX;
        dragData.startY = e.clientY;
        dragData.startLeft = ball.offsetLeft;
        dragData.startTop = ball.offsetTop;
        ball.classList.add('dragging');
        e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
        if (!dragData.isDragging) return;
        
        const deltaX = e.clientX - dragData.startX;
        const deltaY = e.clientY - dragData.startY;
        
        ball.style.left = (dragData.startLeft + deltaX) + 'px';
        ball.style.top = (dragData.startTop + deltaY) + 'px';
        ball.style.right = 'auto';
        ball.style.bottom = 'auto';
    });

    document.addEventListener('mouseup', () => {
        if (dragData.isDragging) {
            dragData.isDragging = false;
            ball.classList.remove('dragging');
        }
    });

    // 悬浮球点击事件
    ball.addEventListener('click', async (e) => {
        if (dragData.isDragging) return;
        
        const text = await getSelectedText();
        if (!text) {
            showContent('请先选中需要翻译或解释的内容（PDF中可先复制再点击）');
            showPopup();
            return;
        }
        
        window.lastTranslatedText = text;
        showContent('正在翻译，请稍候...', true);
        showPopup();
        
        try {
            const result = await callDeepseek(text, currentMode);
            showContent(result);
            saveToHistory(text, result);
        } catch (error) {
            showContent(`翻译失败: ${error.message}`);
        }
    });

    // 弹窗控制按钮事件
    document.getElementById('deepseek-close-btn').addEventListener('click', hidePopup);
    
    document.getElementById('deepseek-theme-btn').addEventListener('click', () => {
        isDarkTheme = !isDarkTheme;
        if (isDarkTheme) {
            popup.classList.add('deepseek-dark-theme');
            document.getElementById('deepseek-theme-btn').innerHTML = '☀️';
        } else {
            popup.classList.remove('deepseek-dark-theme');
            document.getElementById('deepseek-theme-btn').innerHTML = '🌙';
        }
    });
    
    document.getElementById('deepseek-history-btn').addEventListener('click', () => {
        const isVisible = historyPanel.style.display === 'block';
        historyPanel.style.display = isVisible ? 'none' : 'block';
        if (!isVisible) loadHistory();
    });
    
    document.getElementById('deepseek-clear-history').addEventListener('click', () => {
        chrome.storage.local.set({ [CONFIG.STORAGE_KEY]: [] });
        loadHistory();
        showToast('历史记录已清空');
    });

    // 模式切换
    document.querySelectorAll('.deepseek-mode-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.deepseek-mode-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentMode = btn.dataset.mode;
        });
    });

    // 快捷键支持
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === 'T') {
            e.preventDefault();
            ball.click();
        }
        if (e.key === 'Escape' && isPopupVisible) {
            hidePopup();
        }
    });

    // 点击外部关闭弹窗
    document.addEventListener('click', (e) => {
        if (isPopupVisible && !popup.contains(e.target) && e.target !== ball) {
            hidePopup();
        }
        if (historyPanel.style.display === 'block' && !historyPanel.contains(e.target) && 
            e.target.id !== 'deepseek-history-btn') {
            historyPanel.style.display = 'none';
        }
    });

})();
