(function() {
    if (document.getElementById('deepseek-float-ball')) return;

    // 配置
    const CONFIG = {
        API_URL: "https://api.deepseek.com/chat/completions",
        STORAGE_KEY: "deepseek_history",
        MAX_HISTORY: 50
    };

    // ====== 修复：全局变量声明，防止未定义导致内容不显示 ======
    const LANGUAGES = [
        { code: 'zh', name: '中文' },
        { code: 'en', name: '英文' },
        { code: 'ja', name: '日文' },
        { code: 'de', name: '德文' },
        { code: 'fr', name: '法文' },
        { code: 'es', name: '西班牙文' },
        { code: 'ru', name: '俄文' },
        { code: 'ko', name: '韩文' }
    ];
    let popupMode = 'text';
    let popupTargetLang = 'zh';
    let popupTranslateMode = 'quick';

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

    // 创建悬浮球菜单
    const ballMenu = document.createElement('div');
    ballMenu.id = 'deepseek-float-ball-menu';
    ballMenu.style.cssText = `
        position: fixed;
        right: 40px;
        bottom: 140px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(102, 126, 234, 0.15);
        z-index: 1000001;
        display: none;
        min-width: 120px;
        overflow: hidden;
        border: 1px solid #eee;
    `;
    ballMenu.innerHTML = `
        <button id="deepseek-menu-translate" style="width:100%;padding:12px 0;border:none;background:none;cursor:pointer;font-size:14px;">翻译选中文本</button>
        <button id="deepseek-menu-history" style="width:100%;padding:12px 0;border:none;background:none;cursor:pointer;font-size:14px;">查看历史</button>
    `;
    document.body.appendChild(ballMenu);

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
        <div class="deepseek-popup-content" id="deepseek-content"></div>
    `;
    document.body.appendChild(popup);

    // 创建历史记录面板
    const historyPanel = document.createElement('div');
    historyPanel.className = 'deepseek-history-panel deepseek-container';
    historyPanel.style.zIndex = '1000002';
    historyPanel.innerHTML = `
        <div class="deepseek-history-header">
            <span>翻译历史</span>
            <button class="deepseek-control-btn" id="deepseek-close-history" title="关闭">✕</button>
            <button class="deepseek-control-btn" id="deepseek-clear-history">🗑️</button>
        </div>
        <div class="deepseek-history-list" id="deepseek-history-list"></div>
    `;
    document.body.appendChild(historyPanel);

    // 历史面板增加搜索框
    const searchBar = document.createElement('div');
    searchBar.style.cssText = 'padding:8px 12px;background:#f8f9fa;border-bottom:1px solid #eee;display:flex;align-items:center;gap:8px;';
    searchBar.innerHTML = `<input id='deepseek-history-search' type='text' placeholder='搜索原文或译文...' style='flex:1;padding:6px 10px;border:1px solid #ddd;border-radius:6px;font-size:13px;'>`;
    historyPanel.insertBefore(searchBar, historyPanel.firstChild);

    // 创建历史详情弹窗
    const historyDetail = document.createElement('div');
    historyDetail.id = 'deepseek-history-detail';
    historyDetail.style.cssText = `
        position: fixed;
        right: 340px;
        top: 120px;
        width: 420px;
        background: white;
        border-radius: 16px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.15);
        z-index: 1000003;
        display: none;
        overflow: hidden;
        border: 1px solid rgba(0,0,0,0.1);
    `;
    historyDetail.innerHTML = `
        <div id="deepseek-history-detail-header" style="cursor:move;padding:16px 20px;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:white;display:flex;justify-content:space-between;align-items:center;">
            <span style="font-weight:600;font-size:16px;">历史详情</span>
            <button class="deepseek-control-btn" id="deepseek-close-history-detail" title="关闭">✕</button>
        </div>
        <div id="deepseek-history-detail-content" style="padding:20px;min-height:120px;"></div>
    `;
    document.body.appendChild(historyDetail);

    // 拖动逻辑
    (function() {
        const header = historyDetail.querySelector('#deepseek-history-detail-header');
        let dragging = false, offsetX = 0, offsetY = 0;
        header.addEventListener('mousedown', (e) => {
            dragging = true;
            offsetX = e.clientX - historyDetail.offsetLeft;
            offsetY = e.clientY - historyDetail.offsetTop;
            document.body.style.userSelect = 'none';
        });
        document.addEventListener('mousemove', (e) => {
            if (!dragging) return;
            historyDetail.style.left = (e.clientX - offsetX) + 'px';
            historyDetail.style.top = (e.clientY - offsetY) + 'px';
            historyDetail.style.right = 'auto';
        });
        document.addEventListener('mouseup', () => {
            dragging = false;
            document.body.style.userSelect = '';
        });
    })();

    // 优化历史详情关闭按钮样式
    const closeBtn = historyDetail.querySelector('#deepseek-close-history-detail');
    closeBtn.style.fontSize = '22px';
    closeBtn.style.fontWeight = 'bold';
    closeBtn.style.background = 'rgba(255,255,255,0.25)';
    closeBtn.style.color = '#fff';
    closeBtn.style.border = 'none';
    closeBtn.style.width = '32px';
    closeBtn.style.height = '32px';
    closeBtn.style.display = 'flex';
    closeBtn.style.alignItems = 'center';
    closeBtn.style.justifyContent = 'center';
    closeBtn.style.borderRadius = '50%';
    closeBtn.style.cursor = 'pointer';
    closeBtn.onmouseenter = () => { closeBtn.style.background = '#e74c3c'; };
    closeBtn.onmouseleave = () => { closeBtn.style.background = 'rgba(255,255,255,0.25)'; };
    // 每次弹窗显示时都重新绑定关闭事件
    function bindHistoryDetailClose() {
        closeBtn.onclick = () => { historyDetail.style.display = 'none'; };
    }

    // 状态管理
    let currentMode = 'quick';
    let isDarkTheme = false;
    let isPopupVisible = false;
    let dragData = { isDragging: false, startX: 0, startY: 0, startLeft: 0, startTop: 0 };

    // 动态引入 marked.js（本地文件，绕过CSP）
    (function() {
        if (!window.marked) {
            const script = document.createElement('script');
            script.src = chrome.runtime.getURL('marked.min.js');
            script.onload = () => { window.markedReady = true; };
            document.head.appendChild(script);
        }
    })();
    // 增加markdown样式
    const mdStyle = document.createElement('style');
    mdStyle.textContent = `
    .deepseek-md-content h1, .deepseek-md-content h2, .deepseek-md-content h3 { color: #667eea; margin: 12px 0 8px; }
    .deepseek-md-content pre { background: #f5f5f5; padding: 12px; border-radius: 4px; overflow-x: auto; }
    .deepseek-md-content code { background: #f0f0f0; padding: 2px 4px; border-radius: 3px; font-family: 'Courier New', monospace; }
    .deepseek-md-content ul, .deepseek-md-content ol { margin: 8px 0 8px 20px; }
    .deepseek-md-content blockquote { border-left: 4px solid #667eea; background: #f8f9fa; color: #555; margin: 8px 0; padding: 8px 16px; border-radius: 4px; }
    `;
    document.head.appendChild(mdStyle);

    // markdown渲染工具函数，确保marked加载后再渲染
    function renderMarkdown(md) {
        if (window.marked) return window.marked.parse(md);
        return md;
    }

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

    // 主弹窗重构为对话框输入模式
    function renderPopupContent() {
        const contentEl = document.getElementById('deepseek-content');
        // 顶部tab：文本翻译/OCR图片翻译 + 三种模式
        let modeTabs = '';
        if (popupMode === 'ocr') {
            modeTabs = `<div style='display:flex;gap:8px;margin-bottom:10px;'>
                <button id='deepseek-popup-tab-text' class='deepseek-action-btn'>文本翻译</button>
                <button id='deepseek-popup-tab-ocr' class='deepseek-action-btn primary'>图片识别翻译</button>
            </div>`;
        } else {
            modeTabs = `<div style='display:flex;gap:8px;margin-bottom:10px;'>
                <button class='deepseek-mode-btn${popupTranslateMode==='quick'?' active':''}' data-mode='quick'>快速翻译</button>
                <button class='deepseek-mode-btn${popupTranslateMode==='detailed'?' active':''}' data-mode='detailed'>详细解释</button>
                <button class='deepseek-mode-btn${popupTranslateMode==='academic'?' active':''}' data-mode='academic'>学术解读</button>
                <button id='deepseek-popup-tab-ocr' class='deepseek-action-btn${popupMode==='ocr'?' primary':''}' style='margin-left:auto;'>图片识别翻译</button>
            </div>`;
        }
        if (popupMode === 'ocr') {
            // OCR图片识别界面
            contentEl.innerHTML = modeTabs + `
                <div style='margin-bottom:10px;'>
                    <input type='file' id='deepseek-ocr-file' accept='image/*' style='margin-bottom:8px;'>
                </div>
                <div id='deepseek-ocr-status' style='color:#888;margin-bottom:8px;'></div>
                <textarea id='deepseek-ocr-result' style='width:100%;min-height:60px;padding:8px;border:1px solid #ddd;border-radius:6px;font-size:14px;margin-bottom:8px;' placeholder='图片识别结果...'></textarea>
                <div style='margin-bottom:10px;'>
                    <select id='deepseek-ocr-lang' style='padding:4px 8px;border-radius:6px;border:1px solid #ddd;font-size:13px;'>${LANGUAGES.map(l => `<option value='${l.code}' ${l.code==='zh'?'selected':''}>${l.name}</option>`).join('')}</select>
                    <button id='deepseek-ocr-translate-btn' class='deepseek-action-btn primary' style='margin-left:8px;'>翻译</button>
                </div>
                <div id='deepseek-ocr-translate-result'></div>
            `;
            // 绑定tab切换
            document.getElementById('deepseek-popup-tab-text').onclick = () => { popupMode = 'text'; renderPopupContent(); };
            document.getElementById('deepseek-popup-tab-ocr').onclick = () => { popupMode = 'ocr'; renderPopupContent(); };
            // 绑定图片上传
            document.getElementById('deepseek-ocr-file').onchange = async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                const status = document.getElementById('deepseek-ocr-status');
                status.textContent = '正在识别图片...';
                let { Tesseract } = window;
                if (!Tesseract) {
                    status.textContent = '正在加载OCR库，请稍后重试';
                    // 动态加载Tesseract.js（本地文件，绕过CSP）
                    const script = document.createElement('script');
                    script.src = chrome.runtime.getURL('tesseract.min.js');
                    script.onload = () => {
                        status.textContent = 'OCR库加载完成，请重新选择图片';
                        renderPopupContent();
                    };
                    document.head.appendChild(script);
                    return;
                }
                try {
                    const res = await Tesseract.recognize(file, 'eng+chi_sim');
                    document.getElementById('deepseek-ocr-result').value = res.data.text.trim();
                    status.textContent = '识别完成，可编辑后翻译';
                } catch (err) {
                    status.textContent = '图片识别失败';
                }
            };
            // 绑定翻译按钮
            document.getElementById('deepseek-ocr-translate-btn').onclick = async () => {
                const text = document.getElementById('deepseek-ocr-result').value.trim();
                const lang = document.getElementById('deepseek-ocr-lang').value;
                const resultDiv = document.getElementById('deepseek-ocr-translate-result');
                if (!text) { resultDiv.innerHTML = '<span style="color:#e74c3c;">请先识别图片或输入内容</span>'; return; }
                resultDiv.innerHTML = '正在翻译...';
                try {
                    const result = await callDeepseek(text, 'quick', lang);
                    let mdHtml = renderMarkdown(result);
                    resultDiv.innerHTML = `<div style='margin-top:10px;'><strong>译文：</strong><div class='deepseek-md-content' style='background:#eef2ff;padding:8px 12px;border-radius:6px;color:#222;'>${mdHtml}</div></div>`;
                } catch (e) {
                    resultDiv.innerHTML = `<span style='color:#e74c3c;'>翻译失败：${e.message}</span>`;
                }
            };
            return;
        }
        // 文本翻译界面
        contentEl.innerHTML = modeTabs + `
            <textarea id='deepseek-text-input' style='width:100%;min-height:60px;padding:8px;border:1px solid #ddd;border-radius:6px;font-size:14px;margin-bottom:8px;' placeholder='请输入需要翻译的内容...'></textarea>
            <div style='margin-bottom:10px;'>
                <select id='deepseek-text-lang' style='padding:4px 8px;border-radius:6px;border:1px solid #ddd;font-size:13px;'>${LANGUAGES.map(l => `<option value='${l.code}' ${l.code===popupTargetLang?'selected':''}>${l.name}</option>`).join('')}</select>
                <button id='deepseek-text-translate-btn' class='deepseek-action-btn primary' style='margin-left:8px;'>翻译</button>
            </div>
            <div id='deepseek-text-translate-result'></div>
        `;
        // 绑定三种模式Tab点击事件
        contentEl.querySelectorAll('.deepseek-mode-btn').forEach(btn => {
            btn.onclick = () => {
                popupTranslateMode = btn.dataset.mode;
                renderPopupContent();
            };
        });
        // 绑定图片识别Tab
        document.getElementById('deepseek-popup-tab-ocr').onclick = () => { popupMode = 'ocr'; renderPopupContent(); };
        // 绑定翻译按钮
        document.getElementById('deepseek-text-translate-btn').onclick = async () => {
            const text = document.getElementById('deepseek-text-input').value.trim();
            const lang = document.getElementById('deepseek-text-lang').value;
            const resultDiv = document.getElementById('deepseek-text-translate-result');
            if (!text) { resultDiv.innerHTML = '<span style="color:#e74c3c;">请输入内容</span>'; return; }
            resultDiv.innerHTML = '正在翻译...';
            try {
                const result = await callDeepseek(text, popupTranslateMode, lang);
                let mdHtml = renderMarkdown(result);
                resultDiv.innerHTML = `<div style='margin-top:10px;'><strong>译文：</strong><div class='deepseek-md-content' style='background:#eef2ff;padding:8px 12px;border-radius:6px;color:#222;'>${mdHtml}</div></div>`;
            } catch (e) {
                resultDiv.innerHTML = `<span style='color:#e74c3c;'>翻译失败：${e.message}</span>`;
            }
        };
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
    function getSystemPrompt(mode, targetLang = 'zh') {
        const langMap = {
            zh: '中文', en: '英文', ja: '日文', de: '德文', fr: '法文', es: '西班牙文', ru: '俄文', ko: '韩文'
        };
        const prompts = {
            quick: `你是一个快速翻译助手。请将用户输入内容翻译成${langMap[targetLang]||'中文'}，如为专业术语请给出简洁解释。回答要简明扼要。`,
            detailed: `你是一个详细解释助手。请将用户输入内容翻译成${langMap[targetLang]||'中文'}，并详细解释句子结构和重点词汇。`,
            academic: `你是一个学术解读专家。请将用户输入内容翻译成${langMap[targetLang]||'中文'}，并提供学术背景、语法分析等。`
        };
        return prompts[mode] || prompts.quick;
    }

    // 调用 DeepSeek API
    async function callDeepseek(text, mode = 'quick', targetLang = 'zh') {
        const { apiKey } = await new Promise(resolve => {
            chrome.storage.local.get(['apiKey'], resolve);
        });
        if (!apiKey) {
            throw new Error('请先在扩展设置中配置API Key');
        }
        const systemPrompt = getSystemPrompt(mode, targetLang);
        const response = await fetch(CONFIG.API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [
                    { role: 'system', content: systemPrompt },
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

    // 保存到历史记录（支持三模式内容和目标语言）
    function saveToHistory(originalText, translatedText, mode = 'quick', lang = 'zh') {
        if (!translatedText || !originalText) return; // 阻止空内容写入
        chrome.storage.local.get([CONFIG.STORAGE_KEY], (result) => {
            const history = result[CONFIG.STORAGE_KEY] || [];
            let item = history.find(h => h.original === originalText);
            if (!item) {
                item = {
                id: Date.now(),
                original: originalText,
                    translated_quick: '',
                    translated_detailed: '',
                    translated_academic: '',
                    lang_quick: 'zh',
                    lang_detailed: 'zh',
                    lang_academic: 'zh',
                    timestamp: new Date().toLocaleString()
                };
                history.unshift(item);
                if (history.length > CONFIG.MAX_HISTORY) history.splice(CONFIG.MAX_HISTORY);
                chrome.storage.local.set({ [CONFIG.STORAGE_KEY]: history });
            }
            if (mode === 'quick') { item.translated_quick = translatedText; item.lang_quick = lang; }
            if (mode === 'detailed') { item.translated_detailed = translatedText; item.lang_detailed = lang; }
            if (mode === 'academic') { item.translated_academic = translatedText; item.lang_academic = lang; }
            chrome.storage.local.set({ [CONFIG.STORAGE_KEY]: history });
        });
    }

    // 历史记录加载支持搜索
    function loadHistory() {
        chrome.storage.local.get([CONFIG.STORAGE_KEY], (result) => {
            const history = result[CONFIG.STORAGE_KEY] || [];
            const listEl = document.getElementById('deepseek-history-list');
            const searchInput = document.getElementById('deepseek-history-search');
            let keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
            let filtered = history;
            if (keyword) {
                filtered = history.filter(item =>
                    (item.original && item.original.toLowerCase().includes(keyword)) ||
                    (item.translated_quick && item.translated_quick.toLowerCase().includes(keyword)) ||
                    (item.translated_detailed && item.translated_detailed.toLowerCase().includes(keyword)) ||
                    (item.translated_academic && item.translated_academic.toLowerCase().includes(keyword))
                );
            }
            if (filtered.length === 0) {
                listEl.innerHTML = '<div style="padding: 20px; text-align: center; color: #999;">暂无历史记录</div>';
                return;
            }
            listEl.innerHTML = filtered.map(item => `
                <div class="deepseek-history-item" data-id="${item.id}">
                    <div class="deepseek-history-text">${item.original}</div>
                    <div class="deepseek-history-time">${item.timestamp}</div>
                </div>
            `).join('');
            // 绑定历史记录点击事件
            listEl.querySelectorAll('.deepseek-history-item').forEach(itemEl => {
                itemEl.addEventListener('click', (event) => {
                    event.stopPropagation();
                    const id = parseInt(itemEl.dataset.id);
                    const historyItem = filtered.find(h => h.id === id);
                    if (historyItem) {
                        if (!('translated_quick' in historyItem)) historyItem.translated_quick = historyItem.translated || '';
                        if (!('translated_detailed' in historyItem)) historyItem.translated_detailed = '';
                        if (!('translated_academic' in historyItem)) historyItem.translated_academic = '';
                        currentHistoryItem = historyItem;
                        currentHistoryMode = 'quick';
                        hidePopup();
                        historyPanel.style.display = 'none';
                        historyDetail.style.display = 'block';
                        historyDetail.style.left = '';
                        historyDetail.style.top = '';
                        const tabs = historyDetail.querySelectorAll('.deepseek-mode-btn');
                        if (tabs && tabs.length > 0) {
                            tabs.forEach(tab => tab.classList.remove('active'));
                            tabs[0].classList.add('active');
                        }
                        renderHistoryDetailContent();
                        bindHistoryDetailClose();
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

    // 悬浮球点击事件（弹出菜单）
    ball.addEventListener('click', (e) => {
        if (dragData.isDragging) return;
        // 切换菜单显示
        if (ballMenu.style.display === 'block') {
            ballMenu.style.display = 'none';
        } else {
            ballMenu.style.display = 'block';
        }
        e.stopPropagation();
    });

    // 悬浮球菜单"翻译选中文本"
    document.getElementById('deepseek-menu-translate').addEventListener('click', async (e) => {
        ballMenu.style.display = 'none';
        popupMode = 'text'; // 每次打开默认文本翻译
        showPopup();
        renderPopupContent();
    });

    // 点击菜单"查看历史"
    document.getElementById('deepseek-menu-history').addEventListener('click', (e) => {
        ballMenu.style.display = 'none';
        hidePopup();
        setTimeout(() => {
            historyPanel.style.display = 'block';
            loadHistory();
        }, 350);
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

    // 历史详情tab切换与翻译逻辑
    let currentHistoryItem = null;
    let currentHistoryMode = 'quick';
    function renderHistoryDetailContent() {
        if (!currentHistoryItem) return;
        // 补全历史项字段，防止tab切换后按钮失效
        if (!('translated_quick' in currentHistoryItem)) currentHistoryItem.translated_quick = '';
        if (!('translated_detailed' in currentHistoryItem)) currentHistoryItem.translated_detailed = '';
        if (!('translated_academic' in currentHistoryItem)) currentHistoryItem.translated_academic = '';
        if (!('lang_quick' in currentHistoryItem)) currentHistoryItem.lang_quick = 'zh';
        if (!('lang_detailed' in currentHistoryItem)) currentHistoryItem.lang_detailed = 'zh';
        if (!('lang_academic' in currentHistoryItem)) currentHistoryItem.lang_academic = 'zh';
        // 渲染tab按钮
        let mode = currentHistoryMode;
        let tabBtns = `
          <div style="display:flex;gap:8px;margin-bottom:10px;">
            <button class="deepseek-mode-btn${mode==='quick'?' active':''}" data-mode="quick">快速翻译</button>
            <button class="deepseek-mode-btn${mode==='detailed'?' active':''}" data-mode="detailed">详细解释</button>
            <button class="deepseek-mode-btn${mode==='academic'?' active':''}" data-mode="academic">学术解读</button>
          </div>
        `;
        let translated = '';
        let langField = '';
        if (mode === 'quick') { translated = currentHistoryItem.translated_quick; langField = 'lang_quick'; }
        if (mode === 'detailed') { translated = currentHistoryItem.translated_detailed; langField = 'lang_detailed'; }
        if (mode === 'academic') { translated = currentHistoryItem.translated_academic; langField = 'lang_academic'; }
        // 目标语言选择下拉框
        let langSelect = `<select id='deepseek-history-lang' style='margin-bottom:10px;padding:4px 8px;border-radius:6px;border:1px solid #ddd;font-size:13px;'>${LANGUAGES.map(l => `<option value='${l.code}' ${l.code===currentHistoryItem[langField]?'selected':''}>${l.name}</option>`).join('')}</select>`;
        let content = tabBtns + langSelect;
        // 原文始终渲染
        content += `<div style='margin-bottom:12px;'><strong>原文：</strong><div style='background:#f8f9fa;padding:8px 12px;border-radius:6px;color:#555;'>${currentHistoryItem.original}</div></div>`;
        if (translated) {
            let mdHtml = renderMarkdown(translated);
            content += `<div style='margin-bottom:12px;'><strong>译文（${LANGUAGES.find(l=>l.code===currentHistoryItem[langField])?.name||'未知'}）：</strong><div class='deepseek-md-content' style='background:#eef2ff;padding:8px 12px;border-radius:6px;color:#222;max-height:220px;overflow-y:auto;'>${mdHtml}</div></div>`;
            content += `<div style='margin-top:12px;'><button id='deepseek-history-export-txt' class='deepseek-action-btn'>导出TXT</button> <button id='deepseek-history-export-md' class='deepseek-action-btn'>导出Markdown</button></div>`;
        } else {
            content += `<div style='color:#999;margin-bottom:16px;'>暂无内容</div><button id='deepseek-history-detail-translate-btn' class='deepseek-action-btn primary'>翻译</button>`;
        }
        historyDetail.querySelector('#deepseek-history-detail-content').innerHTML = content;
        // 绑定tab切换事件
        historyDetail.querySelectorAll('.deepseek-mode-btn').forEach(tab => {
            tab.onclick = () => {
                currentHistoryMode = tab.dataset.mode;
                renderHistoryDetailContent();
            };
        });
        // 绑定目标语言选择
        const langSel = historyDetail.querySelector('#deepseek-history-lang');
        if (langSel) {
            langSel.onchange = () => {
                historyTargetLang = langSel.value;
                renderHistoryDetailContent();
            };
        }
        // 绑定导出按钮
        const btnTxt = historyDetail.querySelector('#deepseek-history-export-txt');
        if (btnTxt) btnTxt.onclick = () => exportText('翻译历史.txt', `原文：\n${currentHistoryItem.original}\n\n译文：\n${translated}`);
        const btnMd = historyDetail.querySelector('#deepseek-history-export-md');
        if (btnMd) btnMd.onclick = () => exportMarkdown('翻译历史.md', `# 原文\n${currentHistoryItem.original}\n\n# 译文\n${translated}`);
        // 重新设置关闭按钮样式和事件
        const closeBtn = historyDetail.querySelector('#deepseek-close-history-detail');
        if (closeBtn) {
            closeBtn.style.fontSize = '22px';
            closeBtn.style.fontWeight = 'bold';
            closeBtn.style.background = '#333';
            closeBtn.style.color = '#fff';
            closeBtn.style.border = 'none';
            closeBtn.style.width = '32px';
            closeBtn.style.height = '32px';
            closeBtn.style.display = 'flex';
            closeBtn.style.alignItems = 'center';
            closeBtn.style.justifyContent = 'center';
            closeBtn.style.borderRadius = '50%';
            closeBtn.style.cursor = 'pointer';
            closeBtn.style.position = 'absolute';
            closeBtn.style.top = '12px';
            closeBtn.style.right = '12px';
            closeBtn.style.zIndex = '10001';
            closeBtn.onmouseenter = () => { closeBtn.style.background = '#e74c3c'; };
            closeBtn.onmouseleave = () => { closeBtn.style.background = '#333'; };
            closeBtn.onclick = () => { historyDetail.style.display = 'none'; };
        }
        // 绑定翻译按钮
        const btn = historyDetail.querySelector('#deepseek-history-detail-translate-btn');
        if (btn) {
            btn.onclick = async () => {
                btn.disabled = true;
                btn.textContent = '正在翻译...';
                try {
                    const result = await callDeepseek(currentHistoryItem.original, mode, historyTargetLang);
                    saveToHistory(currentHistoryItem.original, result, mode, historyTargetLang);
                    if (mode === 'quick') { currentHistoryItem.translated_quick = result; currentHistoryItem.lang_quick = historyTargetLang; }
                    if (mode === 'detailed') { currentHistoryItem.translated_detailed = result; currentHistoryItem.lang_detailed = historyTargetLang; }
                    if (mode === 'academic') { currentHistoryItem.translated_academic = result; currentHistoryItem.lang_academic = historyTargetLang; }
                    renderHistoryDetailContent();
                } catch (e) {
                    btn.textContent = '翻译失败，请重试';
                    btn.disabled = false;
                }
            };
        }
    }

    // 历史面板内容区可滚动
    historyPanel.querySelector('#deepseek-history-list').style.maxHeight = '320px';
    historyPanel.querySelector('#deepseek-history-list').style.overflowY = 'auto';

    // 历史详情弹窗支持右下角拖拽拉伸
    (function() {
        const resizer = document.createElement('div');
        resizer.style.cssText = 'position:absolute;width:18px;height:18px;right:0;bottom:0;cursor:nwse-resize;z-index:10;';
        resizer.innerHTML = '<svg width="18" height="18"><polyline points="4,18 18,4" style="stroke:#aaa;stroke-width:2;fill:none;"/></svg>';
        historyDetail.appendChild(resizer);
        let resizing = false, startX = 0, startY = 0, startW = 0, startH = 0;
        resizer.addEventListener('mousedown', (e) => {
            resizing = true;
            startX = e.clientX;
            startY = e.clientY;
            startW = historyDetail.offsetWidth;
            startH = historyDetail.offsetHeight;
            e.preventDefault();
            e.stopPropagation();
        });
        document.addEventListener('mousemove', (e) => {
            if (!resizing) return;
            let newW = Math.max(320, startW + (e.clientX - startX));
            let newH = Math.max(200, startH + (e.clientY - startY));
            historyDetail.style.width = newW + 'px';
            historyDetail.style.height = newH + 'px';
        });
        document.addEventListener('mouseup', () => { resizing = false; });
    })();

    // 工具函数：导出文本/markdown
    function exportText(filename, content) {
        const blob = new Blob([content], {type: 'text/plain'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
    }
    function exportMarkdown(filename, content) {
        const blob = new Blob([content], {type: 'text/markdown'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
    }

    // 搜索框事件绑定
    document.getElementById('deepseek-history-search').addEventListener('input', loadHistory);

    // 动态引入Tesseract.js
    (function() {
        if (!window.Tesseract) {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5.0.1/dist/tesseract.min.js';
            document.head.appendChild(script);
        }
    })();

})();
