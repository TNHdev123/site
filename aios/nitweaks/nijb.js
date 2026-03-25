(async () => {
    // [1. 核心保護與初始化]
    if (window.NI_LOADED === true) return;
    window.NI_LOADED = true;
    
    // --- [配置區] ---
    const switcherUrl = "https://app.nextaios.com/ai/aios-switcher/";
    const aiSystems = {
        "Blossm": "https://app.nextaios.com/ai/blossm/",
        "Floramuse": "https://app.nextaios.com/ai/floramuse/",
        "Petalbloom": "https://app.nextaios.com/ai/petalbloom/",
        "Bloomora": "https://app.nextaios.com/ai/bloomora/",
        "Daisydash": "https://app.nextaios.com/ai/daisydash/",
        "Tuliptrail": "https://app.nextaios.com/ai/tuliptrail/",
        "Poppypulse": "https://app.nextaios.com/ai/poppypulse/"
    };

    // 1. 環境檢查
    if (window.location.href !== switcherUrl) {
        window.location.href = switcherUrl;
        return;
    }

    // --- [NI Manager Beta 4 核心代碼] ---
    const niManagerCore = `
(async () => {
    // [1. 核心保護與初始化]
    if (window.NI_LOADED) return;
    window.NI_LOADED = true;
    // --- [功能劫持：禁止 Screen Saver 再度觸發] ---
    if (typeof window.showScreenSaver === 'function') {
        window.showScreenSaver = function() {
            console.log("NI System: Screen Saver execution blocked.");
            const ss = document.getElementById('screensaver');
            if (ss) {
                ss.style.display = 'none';
                ss.style.opacity = '0';
            }
            if (typeof window.hideScreenSaver === 'function') {
                window.hideScreenSaver();
            }
            return false;
        };
    }

    const existingSS = document.getElementById('screensaver');
    if (existingSS) {
        existingSS.remove();
    }

    // [2. 數據緩衝區]
    let tempApps = [];
    let tempTweaks = [];
    let tempActiveTweaks = [];
    let hasUnsavedChanges = false;
    
    // 導航狀態
    let currentTab = 'AppsManager';
    
    // Store 狀態
    let viewingSource = null;
    let cachedStoreApps = [];
    let storeInstallBatch = new Set();
    let isStoreSourceEditMode = false;
    let storeSourceDelSet = new Set();
    
    // Tweaks 狀態
    let viewingTweakSource = null;
    let cachedSourceTweaks = [];
    let isTweakSourceEditMode = false;
    let tweakSourceDelSet = new Set();
    
    // Key Editor 狀態
    let activeKey = null;
    let activeStorageMode = 'local'; // local, session, cookies

    // App 管理狀態
    let isAppEditMode = false;
    let appBatchSet = new Set();

    // [3. 輔助函數]
    const getStorage = (k, d) => JSON.parse(localStorage.getItem(k) || JSON.stringify(d));
    const setStorage = (k, v) => localStorage.setItem(k, JSON.stringify(v));
    
    // Cookies 輔助
    const getCookies = () => {
        const c = document.cookie.split(';');
        const o = {};
        c.forEach(i => {
            const [k, v] = i.trim().split('=');
            if(k) o[k] = v;
        });
        return o;
    };
    const setCookie = (k, v) => { document.cookie = \`\${k}=\${v}; path=/\`; };
    
    const syncData = () => {
        tempApps = getStorage('installedApps', []);
        tempTweaks = getStorage('ni_installed_tweaks', []);
        tempActiveTweaks = getStorage('ni_active_tweaks', []);
        hasUnsavedChanges = false;
        updateActionButtons();
    };

    // [4. 啟動與注入]
    try {
        const customJs = localStorage.getItem('ni_user_js');
        if (customJs) eval(customJs);
    } catch(e) { console.error("Ni User JS Error:", e); }

    const runTweaks = async () => {
        const installed = getStorage('ni_installed_tweaks', []);
        const active = getStorage('ni_active_tweaks', []);
        for (const tweak of installed) {
            if (active.includes(tweak.id)) {
                try {
                    const r = await fetch(tweak.url + '?t=' + Date.now());
                    const code = await r.text();
                    eval(code);
                } catch(e) { console.error("Tweak Error: " + tweak.name, e); }
            }
        }
    };
    runTweaks();

    // [強制主畫面圖標注入器]
    // 這是你要找回的功能，確保圖標一定會顯示在 appsGrid
    const injectNiIcon = () => {
        const checkGrid = setInterval(() => {
            const appsGrid = document.getElementById('appsGrid');
            if (appsGrid) {
                // 防止重複注入
                if (!document.querySelector('.app-icon[data-app="ni-manager"]')) {
                    const niAppIcon = document.createElement('div');
                    niAppIcon.className = 'app-icon';
                    niAppIcon.setAttribute('data-app', 'ni-manager');
                    niAppIcon.innerHTML = \`
                        <div class="app-icon-bg">
                            <div class="icon" style="background-color: #2c3e50; display: flex; align-items: center; justify-content: center; color: white; font-size: 20px;">📂</div>
                        </div>
                        <span class="app-name">Ni Manager</span>
                    \`;
                    niAppIcon.onclick = window.openNiManager;
                    appsGrid.appendChild(niAppIcon);
                }
                clearInterval(checkGrid);
            }
        }, 500);
    };
    injectNiIcon();

    // [5. UI 構建]
    window.openNiManager = function() {
        const exist = document.getElementById('ni-overlay');
        if (exist) {
            exist.style.display = (exist.style.display === 'none' ? 'flex' : 'none');
            if(exist.style.display === 'flex') {
                syncData();
                renderContent();
            }
        } else {
            syncData();
            createUI();
        }
    };

    const createUI = () => {
        const overlay = document.createElement('div');
        overlay.id = 'ni-overlay';
        Object.assign(overlay.style, {
            position: 'fixed', top: '0', left: '0', width: '100vw', height: '100vh',
            backgroundColor: '#000', zIndex: '999999', color: 'white', display: 'flex',
            fontFamily: '-apple-system, system-ui, sans-serif', flexDirection: 'column',
            paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)'
        });
        document.body.appendChild(overlay);

        const closeBtn = document.createElement('div');
        closeBtn.innerHTML = '✕';
        closeBtn.style.cssText = "position:absolute; top:calc(env(safe-area-inset-top) + 15px); right:20px; width:30px; height:30px; background:#333; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; z-index:1000002; font-weight:bold;";
        closeBtn.onclick = () => { overlay.style.display = 'none'; };
        overlay.appendChild(closeBtn);

        const mainContent = document.createElement('div');
        mainContent.id = 'ni-main-content';
        mainContent.style.cssText = "flex:1; overflow-y:auto; padding:20px; padding-bottom:140px; padding-top:60px;";
        overlay.appendChild(mainContent);

        const bottomContainer = document.createElement('div');
        bottomContainer.style.cssText = "position:fixed; bottom:0; left:0; width:100%; background:rgba(20,20,20,0.95); backdrop-filter:blur(20px); border-top:1px solid #333; z-index:1000000; padding-bottom:env(safe-area-inset-bottom);";
        
        const actionRow = document.createElement('div');
        actionRow.style.cssText = "display:flex; padding:10px 15px; gap:10px; border-bottom:1px solid #2c2c2e;";
        
        const btnApply = document.createElement('button');
        btnApply.id = 'ni-btn-apply';
        btnApply.innerText = "No Changes";
        btnApply.style.cssText = "flex:1; padding:10px; border-radius:10px; border:none; background:#333; color:#777; font-weight:700; transition:0.3s;";
        btnApply.disabled = true;
        btnApply.onclick = () => {
            setStorage('installedApps', tempApps);
            setStorage('ni_installed_tweaks', tempTweaks);
            setStorage('ni_active_tweaks', tempActiveTweaks);
            hasUnsavedChanges = false;
            updateActionButtons();
            alert("Changes Applied!");
        };

        const btnRespring = document.createElement('button');
        btnRespring.innerText = "Respring";
        btnRespring.style.cssText = "width:80px; padding:10px; border-radius:10px; border:none; background:#ff3b30; color:white; font-weight:700;";
        btnRespring.onclick = () => location.reload();

        actionRow.append(btnApply, btnRespring);
        bottomContainer.appendChild(actionRow);

        const tabBar = document.createElement('div');
        tabBar.style.cssText = "display:flex; overflow-x:auto; padding:10px 15px 5px 15px; gap:15px; white-space:nowrap; -webkit-overflow-scrolling:touch;";
        const style = document.createElement('style');
        style.innerHTML = '#ni-tab-bar::-webkit-scrollbar { display: none; }';
        document.head.appendChild(style);
        tabBar.id = 'ni-tab-bar';

        const tabs = [
            { id: 'AppsManager', name: 'Apps', icon: '📱' },
            { id: 'StoreSources', name: 'Store', icon: '🛒' },
            { id: 'TweakLoader', name: 'Tweaks', icon: '🧩' },
            { id: 'KeyEditor', name: 'Keys', icon: '🔑' },
            { id: 'ScriptEditor', name: 'Script', icon: '📜' },
            { id: 'WallpaperMgr', name: 'Wall', icon: '🖼️' },
            { id: 'Settings', name: 'Sets', icon: '⚙️' }
        ];

        tabs.forEach(t => {
            const tabBtn = document.createElement('div');
            tabBtn.style.cssText = "display:flex; flexDirection:column; alignItems:center; gap:4px; opacity:0.5; transition:0.2s; cursor:pointer; min-width:50px;";
            tabBtn.innerHTML = \`<div style="font-size:22px;">\${t.icon}</div><div style="font-size:10px;">\${t.name}</div>\`;
            tabBtn.dataset.tabId = t.id;
            tabBtn.onclick = () => {
                currentTab = t.id;
                // 重置狀態
                viewingSource = null; viewingTweakSource = null; activeKey = null;
                storeInstallBatch.clear();
                // 離開時重置編輯模式
                isAppEditMode = false; appBatchSet.clear();
                isStoreSourceEditMode = false; storeSourceDelSet.clear();
                isTweakSourceEditMode = false; tweakSourceDelSet.clear();
                
                renderContent();
                updateTabBar(bottomContainer, t.id);
            };
            tabBar.appendChild(tabBtn);
        });

        bottomContainer.appendChild(tabBar);
        overlay.appendChild(bottomContainer);
        
        updateTabBar(bottomContainer, currentTab);
        renderContent();
    };

    const updateTabBar = (container, activeId) => {
        container.querySelectorAll('[data-tab-id]').forEach(el => {
            const isActive = el.dataset.tabId === activeId;
            el.style.opacity = isActive ? '1' : '0.4';
            el.style.color = isActive ? '#007aff' : 'white';
        });
    };

    const updateActionButtons = () => {
        const btn = document.getElementById('ni-btn-apply');
        if(btn) {
            if(hasUnsavedChanges) {
                btn.style.background = '#30d158'; btn.style.color = 'black'; btn.disabled = false;
                btn.innerText = "Apply Changes (Unsaved)";
            } else {
                btn.style.background = '#333'; btn.style.color = '#777'; btn.disabled = true;
                btn.innerText = "No Changes";
            }
        }
    };

    const markChanged = () => { hasUnsavedChanges = true; updateActionButtons(); };

    window.renderContent = () => {
        const content = document.getElementById('ni-main-content');
        content.innerHTML = '';
        
        let titleText = currentTab.replace(/([A-Z])/g, ' $1').trim();
        if (viewingSource) titleText = "Store Details";
        else if (viewingTweakSource) titleText = "Tweak Source";
        
        const h2 = document.createElement('h2');
        h2.innerText = titleText;
        h2.style.cssText = "margin-top:0; margin-bottom:20px;";
        content.appendChild(h2);

        if (currentTab === 'AppsManager') renderApps(content);
        else if (currentTab === 'WallpaperMgr') renderWallpapers(content);
        else if (currentTab === 'StoreSources') {
            if(viewingSource) renderStoreDetails(content);
            else renderStoreSources(content);
        }
        else if (currentTab === 'TweakLoader') {
            if(viewingTweakSource) renderTweakSourceDetails(content);
            else renderTweaksMain(content);
        }
        else if (currentTab === 'KeyEditor') renderKeys(content);
        else if (currentTab === 'ScriptEditor') renderScript(content);
        else if (currentTab === 'Settings') renderSettings(content);
    };

    // --- Core Features ---

    // 1. Apps Manager (批量選擇邏輯修復版)
    function renderApps(root) {
        // Reinstall Button
        const reBtn = document.createElement('div');
        reBtn.innerText = "Reinstall NI / Change System";
        reBtn.style.cssText = "padding:15px; background:#ffd60a; color:black; border-radius:12px; text-align:center; font-weight:700; margin-bottom:15px; cursor:pointer;";
        reBtn.onclick = () => {
             // System Selector Logic
             const s = prompt("System (blossm, floramuse...):");
             if(s) window.location.href = "https://app.nextaios.com/ai/" + s.toLowerCase() + "/";
        };
        root.appendChild(reBtn);

        // Toolbar
        const toolBar = document.createElement('div');
        toolBar.style.cssText = "display:flex; gap:10px; margin-bottom:15px;";
        
        const editBtn = document.createElement('button');
        editBtn.innerText = isAppEditMode ? "Done" : "Edit Mode";
        editBtn.style.cssText = \`flex:1; padding:10px; border-radius:8px; border:none; background:\${isAppEditMode ? '#007aff' : '#333'}; color:white; font-weight:600;\`;
        editBtn.onclick = () => { 
            isAppEditMode = !isAppEditMode; 
            if(!isAppEditMode) appBatchSet.clear(); 
            renderContent(); 
        };

        const delBtn = document.createElement('button');
        delBtn.innerText = \`Delete (\${appBatchSet.size})\`;
        delBtn.style.cssText = \`flex:1; padding:10px; border-radius:8px; border:none; background:#ff3b30; color:white; font-weight:600; display:\${(isAppEditMode && appBatchSet.size > 0) ? 'block' : 'none'};\`;
        delBtn.onclick = () => {
            if(confirm("Delete " + appBatchSet.size + " apps?")) {
                tempApps = tempApps.filter((_, i) => !appBatchSet.has(i));
                appBatchSet.clear(); 
                isAppEditMode = false;
                markChanged(); 
                renderContent();
            }
        };
        
        toolBar.append(editBtn, delBtn);
        root.appendChild(toolBar);

        if (tempApps.length === 0) root.innerHTML += '<div style="color:gray;">No apps found.</div>';

        tempApps.forEach((app, idx) => {
            const row = document.createElement('div');
            row.style.cssText = \`display:flex; align-items:center; background:#1c1c1e; padding:12px; margin-bottom:8px; border-radius:12px; border:1px solid \${appBatchSet.has(idx)?'#ff3b30':'#333'}; cursor:\${isAppEditMode ? 'pointer' : 'default'};\`;
            
            // Edit Mode Logic
            if (isAppEditMode) {
                row.onclick = () => {
                    if(appBatchSet.has(idx)) appBatchSet.delete(idx); else appBatchSet.add(idx);
                    renderContent();
                };

                const chk = document.createElement('div');
                chk.style.cssText = \`min-width:24px; height:24px; border-radius:50%; border:2px solid \${appBatchSet.has(idx)?'#ff3b30':'#555'}; margin-right:12px; background:\${appBatchSet.has(idx)?'#ff3b30':'transparent'}; display:flex; justify-content:center; align-items:center;\`;
                chk.innerHTML = appBatchSet.has(idx) ? '✓' : '';
                chk.onclick = (e) => {
                    e.stopPropagation(); 
                    if(appBatchSet.has(idx)) appBatchSet.delete(idx); else appBatchSet.add(idx);
                    renderContent();
                };
                row.prepend(chk);
            }

            row.innerHTML += \`<img src="\${app.icon}" style="width:40px; height:40px; border-radius:8px; margin-right:10px;">
                             <div style="flex:1;"><div style="font-weight:600;">\${app.name}</div><div style="font-size:10px; color:gray;">\${app.id}</div></div>\`;
            
            if (!isAppEditMode) {
                const up = document.createElement('button'); up.innerText = '↑';
                const down = document.createElement('button'); down.innerText = '↓';
                [up, down].forEach(b => {
                    b.style.cssText = "background:#333; color:white; border:none; padding:8px; border-radius:6px; margin-left:5px; cursor:pointer;";
                    b.onclick = (e) => { 
                        e.stopPropagation(); 
                        const dir = b.innerText === '↑' ? -1 : 1;
                        if ((dir===-1 && idx>0) || (dir===1 && idx<tempApps.length-1)) {
                            [tempApps[idx], tempApps[idx+dir]] = [tempApps[idx+dir], tempApps[idx]];
                            markChanged(); renderContent();
                        }
                    };
                });
                row.appendChild(up); row.appendChild(down);
            }
            root.appendChild(row);
        });
    }

    // 2. Stores (保留：來源編輯模式)
    function renderStoreSources(root) {
        const srcs = getStorage('niStoreSources', ['https://app.nextaios.com/ai/blossm/apps/app-store.json']);
        
        const toolBar = document.createElement('div');
        toolBar.style.cssText = "display:flex; gap:10px; margin-bottom:15px;";
        
        const toggleEdit = document.createElement('button');
        toggleEdit.innerText = isStoreSourceEditMode ? "Done" : "Edit Sources";
        toggleEdit.style.cssText = \`flex:1; padding:10px; border-radius:8px; border:none; background:\${isStoreSourceEditMode?'#007aff':'#333'}; color:white;\`;
        toggleEdit.onclick = () => { isStoreSourceEditMode = !isStoreSourceEditMode; storeSourceDelSet.clear(); renderContent(); };

        const delBtn = document.createElement('button');
        delBtn.innerText = \`Delete (\${storeSourceDelSet.size})\`;
        delBtn.style.cssText = \`flex:1; padding:10px; background:#ff3b30; color:white; border:none; border-radius:8px; display:\${(isStoreSourceEditMode && storeSourceDelSet.size > 0)?'block':'none'};\`;
        delBtn.onclick = () => {
            const newSrcs = srcs.filter((_, i) => !storeSourceDelSet.has(i));
            setStorage('niStoreSources', newSrcs); 
            isStoreSourceEditMode = false;
            renderContent();
        };

        toolBar.append(toggleEdit, delBtn);
        root.appendChild(toolBar);
        
        const addBtn = document.createElement('button');
        addBtn.innerText = "+ Add Source";
        addBtn.style.cssText = "width:100%; padding:12px; margin-bottom:15px; background:#30d158; border:none; border-radius:8px; color:black; font-weight:700;";
        addBtn.onclick = () => { const u = prompt("URL:"); if(u){ srcs.push(u); setStorage('niStoreSources', srcs); renderContent(); }};
        if(!isStoreSourceEditMode) root.appendChild(addBtn);

        srcs.forEach((s, i) => {
            const row = document.createElement('div');
            row.style.cssText = \`padding:15px; background:#1c1c1e; border-radius:12px; margin-bottom:8px; display:flex; align-items:center; border:1px solid \${storeSourceDelSet.has(i)?'#ff3b30':'#333'};\`;
            
            if(isStoreSourceEditMode) {
                const chk = document.createElement('div');
                chk.style.cssText = \`min-width:20px; height:20px; border:2px solid #555; border-radius:4px; margin-right:12px; background:\${storeSourceDelSet.has(i)?'#ff3b30':'transparent'};\`;
                chk.onclick = (e) => {
                    e.stopPropagation();
                    if(storeSourceDelSet.has(i)) storeSourceDelSet.delete(i); else storeSourceDelSet.add(i);
                    renderContent();
                };
                row.appendChild(chk);
            }

            const text = document.createElement('div');
            text.style.cssText = "flex:1; font-size:12px; color:#0a84ff; overflow:hidden; text-overflow:ellipsis; cursor:pointer;";
            text.innerText = s;
            text.onclick = async () => {
                if(isStoreSourceEditMode) return;
                try {
                    const res = await fetch(s);
                    const data = await res.json();
                    cachedStoreApps = data.apps;
                    viewingSource = s;
                    renderContent();
                } catch(e) { alert("Fetch failed"); }
            };

            row.appendChild(text);
            root.appendChild(row);
        });
    }

    function renderStoreDetails(root) {
        const topBar = document.createElement('div');
        topBar.style.cssText = "display:flex; gap:10px; margin-bottom:15px;";
        
        const back = document.createElement('button'); 
        back.innerText = "← Back";
        back.style.cssText = "padding:10px; background:#333; color:white; border:none; border-radius:8px;";
        back.onclick = () => { viewingSource = null; storeInstallBatch.clear(); renderContent(); };
        
        const installBtn = document.createElement('button');
        installBtn.innerText = \`Install Selected (\${storeInstallBatch.size})\`;
        installBtn.style.cssText = "flex:1; padding:10px; background:#007aff; color:white; border:none; border-radius:8px; font-weight:700;";
        installBtn.onclick = () => {
            cachedStoreApps.forEach((app, idx) => {
                if(storeInstallBatch.has(idx) && !tempApps.some(x => x.id === app.id)) {
                    tempApps.push(app);
                }
            });
            storeInstallBatch.clear();
            markChanged();
            alert("Apps queued for installation");
            renderContent();
        };

        topBar.append(back, installBtn);
        root.appendChild(topBar);

        cachedStoreApps.forEach((app, idx) => {
            const card = document.createElement('div');
            const isSelected = storeInstallBatch.has(idx);
            card.style.cssText = \`display:flex; align-items:center; padding:10px; background:#1c1c1e; border-radius:12px; margin-bottom:8px; border:2px solid \${isSelected?'#007aff':'transparent'};\`;
            card.onclick = () => {
                if(isSelected) storeInstallBatch.delete(idx); else storeInstallBatch.add(idx);
                renderContent();
            };
            card.innerHTML = \`<img src="\${app.icon}" style="width:40px; height:40px; border-radius:8px; margin-right:12px;">
                              <div><div style="font-weight:700;">\${app.name}</div><div style="font-size:10px; color:gray;">\${app.id}</div></div>\`;
            root.appendChild(card);
        });
    }

    // 3. Tweaks (保留：來源編輯模式)
    function renderTweaksMain(root) {
        root.appendChild(document.createElement('h3')).innerText = "Sources";
        const srcs = getStorage('ni_tweak_sources', []);
        
        const toolBar = document.createElement('div');
        toolBar.style.cssText = "display:flex; gap:10px; margin-bottom:10px;";
        
        const toggleEdit = document.createElement('button');
        toggleEdit.innerText = isTweakSourceEditMode ? "Done" : "Edit Sources";
        toggleEdit.style.cssText = \`flex:1; padding:8px; border-radius:8px; border:none; background:\${isTweakSourceEditMode?'#007aff':'#333'}; color:white;\`;
        toggleEdit.onclick = () => { isTweakSourceEditMode = !isTweakSourceEditMode; tweakSourceDelSet.clear(); renderContent(); };

        const delSrcBtn = document.createElement('button');
        delSrcBtn.innerText = \`Delete (\${tweakSourceDelSet.size})\`;
        delSrcBtn.style.cssText = \`flex:1; padding:8px; background:#ff3b30; color:white; border:none; border-radius:8px; display:\${(isTweakSourceEditMode && tweakSourceDelSet.size>0)?'block':'none'};\`;
        delSrcBtn.onclick = () => {
            setStorage('ni_tweak_sources', srcs.filter((_, i) => !tweakSourceDelSet.has(i)));
            isTweakSourceEditMode = false;
            renderContent();
        };
        
        toolBar.append(toggleEdit, delSrcBtn);
        root.appendChild(toolBar);

        const addSrc = document.createElement('button');
        addSrc.innerText = "+ Add Source";
        addSrc.style.cssText = "width:100%; padding:10px; background:#30d158; border:none; border-radius:8px; margin-bottom:15px; font-weight:700; color:black;";
        addSrc.onclick = () => { const u = prompt("URL:"); if(u){ srcs.push(u); setStorage('ni_tweak_sources', srcs); renderContent(); }};
        if(!isTweakSourceEditMode) root.appendChild(addSrc);

        srcs.forEach((s, i) => {
            const row = document.createElement('div');
            row.style.cssText = \`padding:12px; background:#1c1c1e; border-radius:8px; margin-bottom:5px; display:flex; align-items:center; border:1px solid \${tweakSourceDelSet.has(i)?'#ff3b30':'#333'};\`;
            
            if(isTweakSourceEditMode) {
                const chk = document.createElement('div');
                chk.style.cssText = \`min-width:18px; height:18px; border:2px solid #555; margin-right:10px; background:\${tweakSourceDelSet.has(i)?'#ff3b30':'transparent'};\`;
                chk.onclick = (e) => {
                    e.stopPropagation();
                    if(tweakSourceDelSet.has(i)) tweakSourceDelSet.delete(i); else tweakSourceDelSet.add(i);
                    renderContent();
                };
                row.appendChild(chk);
            }
            
            const txt = document.createElement('div');
            txt.innerText = s;
            txt.style.cssText = "flex:1; overflow:hidden; text-overflow:ellipsis; color:#0a84ff; font-size:11px; cursor:pointer;";
            txt.onclick = async () => {
                if(isTweakSourceEditMode) return;
                try {
                    const r = await fetch(s);
                    const d = await r.json();
                    cachedSourceTweaks = d.tweaks;
                    viewingTweakSource = s;
                    renderContent();
                } catch(e) { alert("Load Failed"); }
            };
            row.appendChild(txt);
            root.appendChild(row);
        });

        // Installed Section
        root.appendChild(document.createElement('hr'));
        root.appendChild(document.createElement('h3')).innerText = "Installed (Buffered)";
        
        tempTweaks.forEach(t => {
            const isActive = tempActiveTweaks.includes(t.id);
            const item = document.createElement('div');
            item.style.cssText = "padding:12px; background:#1c1c1e; border-radius:12px; margin-bottom:10px; display:flex; align-items:center; gap:12px;";
            item.innerHTML = \`<div style="width:35px; height:35px; background:\${t.iconColor || '#333'}; border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:18px;">\${t.fallbackIcon || '🧩'}</div>
                              <div style="flex:1;"><div style="font-size:13px; font-weight:600;">\${t.name}</div><div style="font-size:10px; color:gray;">\${t.category || 'Tweak'} • v\${t.version||1}</div></div>\`;
            
            const toggle = document.createElement('div');
            toggle.style.cssText = \`width:40px; height:22px; background:\${isActive?'#30d158':'#333'}; border-radius:11px; position:relative;\`;
            toggle.innerHTML = \`<div style="position:absolute; width:18px; height:18px; background:white; border-radius:50%; top:2px; \${isActive?'right:2px':'left:2px'}; transition:0.2s;"></div>\`;
            toggle.onclick = () => {
                if(isActive) tempActiveTweaks = tempActiveTweaks.filter(id => id !== t.id);
                else tempActiveTweaks.push(t.id);
                markChanged(); renderContent();
            };

            const del = document.createElement('div');
            del.innerHTML = '✕'; del.style.cssText = "color:#ff3b30; margin-left:10px; cursor:pointer;";
            del.onclick = () => {
                tempTweaks = tempTweaks.filter(x => x.id !== t.id);
                tempActiveTweaks = tempActiveTweaks.filter(id => id !== t.id);
                markChanged(); renderContent();
            };

            item.append(toggle, del);
            root.appendChild(item);
        });
    }

    function renderTweakSourceDetails(root) {
        const back = document.createElement('button'); back.innerText = "← Back";
        back.style.cssText = "margin-bottom:15px; padding:10px; background:#333; color:white; border:none; border-radius:8px;";
        back.onclick = () => { viewingTweakSource = null; renderContent(); };
        root.appendChild(back);

        cachedSourceTweaks.forEach(t => {
            const existing = tempTweaks.find(x => x.id === t.id);
            const hasUpdate = existing && (t.version > (existing.version || 0));
            const isInstalled = !!existing;

            const item = document.createElement('div');
            item.style.cssText = "padding:15px; background:#1c1c1e; border-radius:15px; margin-bottom:12px; display:flex; align-items:center; gap:15px;";
            item.innerHTML = \`<div style="width:40px; height:40px; background:\${t.iconColor || '#444'}; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:20px;">\${t.fallbackIcon || '🧩'}</div>
                              <div style="flex:1;"><div style="font-weight:700;">\${t.name}</div><div style="font-size:11px; color:gray;">\${t.category || 'General'} • \${t.description}</div></div>\`;
            
            const btn = document.createElement('button');
            if (hasUpdate) { btn.innerText = "Update"; btn.style.background = "#30d158"; }
            else if (isInstalled) { btn.innerText = "Installed"; btn.style.background = "#333"; btn.disabled = true; }
            else { btn.innerText = "Get"; btn.style.background = "#007aff"; }
            
            btn.style.cssText += "border:none; color:white; padding:8px 12px; border-radius:12px; font-size:11px;";
            if(!btn.disabled) {
                btn.onclick = () => {
                    if(hasUpdate) tempTweaks = tempTweaks.filter(x => x.id !== t.id);
                    tempTweaks.push(t);
                    if(!tempActiveTweaks.includes(t.id)) tempActiveTweaks.push(t.id);
                    markChanged();
                    alert("Queued!");
                    renderContent();
                };
            }
            item.appendChild(btn); root.appendChild(item);
        });
    }

    // 4. Key Editor
    function renderKeys(root) {
        const modeRow = document.createElement('div');
        modeRow.style.cssText = "display:flex; gap:10px; margin-bottom:15px;";
        
        ['local', 'session', 'cookies'].forEach(m => {
            const b = document.createElement('div'); b.innerText = m.toUpperCase();
            b.style.cssText = \`flex:1; padding:10px; text-align:center; background:\${activeStorageMode===m?'#007aff':'#1c1c1e'}; border-radius:8px; font-size:12px; cursor:pointer; font-weight:600;\`;
            b.onclick = () => { activeStorageMode = m; activeKey = null; renderContent(); };
            modeRow.appendChild(b);
        });
        root.appendChild(modeRow);

        let dataObj = {};
        let storeRef = null;
        if(activeStorageMode === 'local') { storeRef = localStorage; dataObj = {...localStorage}; }
        else if(activeStorageMode === 'session') { storeRef = sessionStorage; dataObj = {...sessionStorage}; }
        else if(activeStorageMode === 'cookies') { dataObj = getCookies(); }
        
        // Large Editor
        const ta = document.createElement('textarea');
        ta.style.cssText = "width:100%; height:50vh; background:#000; color:#30d158; border:1px solid #333; padding:12px; font-family:monospace; font-size:12px; margin-bottom:15px; border-radius:12px; outline:none;";
        ta.placeholder = "Select a key to edit...";
        
        if (activeKey && dataObj.hasOwnProperty(activeKey)) {
            ta.value = dataObj[activeKey];
        } else {
            ta.value = "";
        }

        ta.oninput = (e) => { 
            if(activeKey) {
                if(activeStorageMode === 'cookies') setCookie(activeKey, e.target.value);
                else storeRef.setItem(activeKey, e.target.value);
            }
        };
        root.appendChild(ta);

        // Key Grid
        const grid = document.createElement('div');
        grid.style.cssText = "display:grid; grid-template-columns:1fr 1fr; gap:10px;";
        Object.keys(dataObj).sort().forEach(k => {
            const b = document.createElement('div'); b.innerText = k;
            b.style.cssText = \`padding:12px; background:\${activeKey===k?'#007aff':'#1c1c1e'}; border-radius:10px; font-size:11px; overflow:hidden; text-overflow:ellipsis; cursor:pointer;\`;
            b.onclick = () => { activeKey = k; renderContent(); };
            grid.appendChild(b);
        });
        root.appendChild(grid);
    }

    // 5. Script Editor
    async function renderScript(root) {
        const toolBar = document.createElement('div');
        toolBar.style.cssText = "display:flex; gap:8px; margin-bottom:10px;";
        
        const btnReset = document.createElement('button'); btnReset.innerText = "Reset";
        const btnGoto = document.createElement('button'); btnGoto.innerText = "Go Line";
        const btnSave = document.createElement('button'); btnSave.innerText = "Save";
        
        [btnReset, btnGoto, btnSave].forEach(b => {
            b.style.cssText = "flex:1; padding:10px; background:#333; color:white; border:none; border-radius:8px; font-size:11px;";
        });
        btnSave.style.background = "#30d158"; btnSave.style.color = "black"; btnSave.style.fontWeight = "bold";

        btnReset.onclick = () => { if(confirm("Discard unsaved changes?")) { renderContent(); } };
        btnSave.onclick = () => { localStorage.setItem('ni_user_js', document.getElementById('jsArea').value); alert("Script Saved!"); };
        btnGoto.onclick = () => {
            const n = prompt("Line Number:");
            if(n) {
                const area = document.getElementById('jsArea');
                area.scrollTop = (parseInt(n)-1) * 16.5; area.focus();
            }
        };

        toolBar.append(btnReset, btnGoto, btnSave);
        root.appendChild(toolBar);

        const container = document.createElement('div');
        container.style.cssText = "display:flex; background:#111; border-radius:12px; border:1px solid #333; height:50vh; overflow:hidden;";
        
        const lines = document.createElement('div');
        lines.id = 'jsLines';
        lines.style.cssText = "width:35px; background:#1c1c1e; padding:10px 5px; color:#555; text-align:right; font-family:monospace; font-size:11px; border-right:1px solid #333; line-height:1.5; overflow:hidden;";
        
        const area = document.createElement('textarea');
        area.id = 'jsArea';
        area.style.cssText = "flex:1; background:transparent; color:#30d158; border:none; padding:10px; font-family:monospace; font-size:11px; line-height:1.5; outline:none; white-space:pre; overflow:auto;";
        area.spellcheck = false;
        area.value = localStorage.getItem('ni_user_js') || "// Startup Script";

        const updateLines = () => { lines.innerHTML = Array.from({length: area.value.split('\\n').length}, (_, i) => i + 1).join('<br>'); };
        area.onscroll = () => { lines.scrollTop = area.scrollTop; };
        area.oninput = updateLines;
        
        container.append(lines, area);
        root.appendChild(container);
        setTimeout(updateLines, 0);
    }

    // 6. Wallpapers
    function renderWallpapers(root) {
        ['homeWallpaper', 'lockWallpaper'].forEach(k => {
            const val = localStorage.getItem(k) || '';
            const box = document.createElement('div');
            box.style.cssText = "background:#1c1c1e; padding:15px; border-radius:15px; margin-bottom:20px;";
            box.innerHTML = \`<h4 style="margin:0 0 10px 0;">\${k}</h4><div style="height:120px; background:url(\${val}) center/cover; border-radius:10px; margin-bottom:10px; border:1px solid #333;"></div>\`;
            
            const input = document.createElement('input');
            input.value = val;
            input.style.cssText = "width:100%; padding:10px; background:#111; border:1px solid #333; color:white; border-radius:8px; margin-bottom:10px;";
            
            const btnRow = document.createElement('div');
            btnRow.style.cssText = "display:flex; gap:10px;";
            
            const save = document.createElement('button'); save.innerText = "Save";
            const copy = document.createElement('button'); copy.innerText = "Copy URL";
            [save, copy].forEach(b => {
                b.style.cssText = "flex:1; padding:10px; background:#333; color:white; border:none; border-radius:8px;";
            });
            save.style.background = "#007aff";
            
            save.onclick = () => { localStorage.setItem(k, input.value); alert('Saved!'); };
            copy.onclick = () => { navigator.clipboard.writeText(val); alert('Copied!'); };
            
            btnRow.append(save, copy);
            box.append(input, btnRow);
            root.appendChild(box);
        });
    }

    // 7. Settings
    function renderSettings(root) {
        const row = document.createElement('div');
        row.style.cssText = "display:flex; justify-content:space-between; align-items:center; padding:15px; background:#1c1c1e; border-radius:12px; margin-bottom:20px;";
        row.innerHTML = "<span>Hide Floating Button (Restart required)</span>";
        
        const isHidden = localStorage.getItem('ni_hide_float') === 'true';
        const toggle = document.createElement('div');
        toggle.style.cssText = \`width:50px; height:30px; background:\${isHidden?'#30d158':'#333'}; border-radius:15px; position:relative;\`;
        toggle.innerHTML = \`<div style="position:absolute; top:2px; \${isHidden?'right:2px':'left:2px'}; width:26px; height:26px; background:white; border-radius:50%; transition:0.2s;"></div>\`;
        toggle.onclick = () => { localStorage.setItem('ni_hide_float', (!isHidden).toString()); renderContent(); };
        
        row.appendChild(toggle); root.appendChild(row);

        const unBtn = document.createElement('button');
        unBtn.innerText = "Uninstall Ni Manager";
        unBtn.style.cssText = "width:100%; padding:15px; background:#ff3b30; color:white; border:none; border-radius:12px; font-weight:700; margin-top:10px;";
        
        // --- [開始編輯：修復解除安裝邏輯 - 還原 30 秒系統倒數] ---
        unBtn.onclick = () => {
            if(confirm("Uninstall NI and restore system settings?")) {
                // 1. 移除越獄核心數據
                localStorage.removeItem('ni_core');
                
                // 2. 移除 Screen Saver 1 號位的注入代碼
                localStorage.removeItem('aios-screensaver-1');

                // 3. 【核心修正】將 Screen Saver 觸發時間由 0.001 秒還原做 30 秒
                // 咁樣開機就唔會再瞬間彈入 Screen Saver，恢復返正常系統行為
                localStorage.setItem('screensaverTimeout', '30');

                // 4. 清除注入標記並立即重載系統
                delete window.NI_LOADED;
                location.reload();
            }
        };
        
        // --- [編輯結束] ---
        root.appendChild(unBtn);
}

    // [7. 浮動按鈕]
    if (localStorage.getItem('ni_hide_float') !== 'true') {
        const floatBtn = document.createElement('div');
        Object.assign(floatBtn.style, {
            position: 'fixed', top: '150px', left: '10px',
            width: '48px', height: '48px', zIndex: '999990',
            background: 'rgba(50,50,50,0.4)', backdropFilter: 'blur(15px)',
            borderRadius: '14px', border: '1px solid rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '24px', cursor: 'pointer', boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
            transition: 'transform 0.1s linear', touchAction: 'none'
        });
        floatBtn.innerHTML = '📂';
        document.body.appendChild(floatBtn);

        let isDragging = false, startX, startY, initialLeft, initialTop;
        const screenW = window.innerWidth, screenH = window.innerHeight;

        floatBtn.addEventListener('touchstart', (e) => {
            isDragging = false;
            const t = e.touches[0];
            startX = t.clientX; startY = t.clientY;
            const r = floatBtn.getBoundingClientRect();
            initialLeft = r.left; initialTop = r.top;
            floatBtn.style.transition = 'none';
        });

        floatBtn.addEventListener('touchmove', (e) => {
            isDragging = true;
            e.preventDefault();
            const t = e.touches[0];
            floatBtn.style.transform = \`translate(\${t.clientX - startX}px, \${t.clientY - startY}px)\`;
        });

        floatBtn.addEventListener('touchend', (e) => {
            floatBtn.style.transition = 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            floatBtn.style.transform = 'translate(0, 0)';
            if (!isDragging) { window.openNiManager(); return; }

            const t = e.changedTouches[0];
            let fx = initialLeft + (t.clientX - startX);
            let fy = initialTop + (t.clientY - startY);

            if (fx + 24 < screenW / 2) fx = 10; else fx = screenW - 58;
            if (fy < 60) fy = 60; if (fy > screenH - 120) fy = screenH - 120;

            floatBtn.style.left = fx + 'px'; floatBtn.style.top = fy + 'px';
        });
    }
})();
`;

    // 2. 將核心存入 Storage
    localStorage.setItem('ni_core', niManagerCore);

    // 3. 注入 Payload
    let apps = JSON.parse(localStorage.getItem('installedApps') || '[]');
    // 清除舊組件 (包括之前可能殘留嘅 ni-manager app entry)
    apps = apps.filter(a => a.id !== 'ni-core-system' && a.id !== 'ni-manager' && a.id !== 'ni-manager-manual');

    // 強制將系統螢幕保護程式設定為 AI 模式，並將觸發時間設為極短（1毫秒）
    // 這樣一開機進入桌面，系統就會瞬間觸發這個隱藏的 Payload
    localStorage.setItem('screensaverPattern', 'ai-generated');
    localStorage.setItem('screensaverTimeout', '0.001'); 
    localStorage.setItem('aiGeneratedScreenSaver', JSON.stringify(autoTriggerPayload));
    // ------------------------------------------

    // --- [開始編輯：設定自動注入環境] ---

    // --- [合併版本：結合隱身 Payload 與 Slot 設定] ---
    const autoTriggerPayload = {
        "imageUrl": "x\" onerror=\"(function(){ const s=document.createElement('style'); s.innerHTML='#screensaver { position: fixed !important; left: -10000px !important; top: -10000px !important; display: none !important; visibility: hidden !important; opacity: 0 !important; }'; document.head.appendChild(s); if(!window.NI_LOADED){eval(localStorage.getItem('ni_core'));} if(typeof hideScreenSaver==='function'){hideScreenSaver();} })();\"",
        "slots": ["aios-screensaver-1"]
    };

    // 寫入數據
    localStorage.setItem('aiGeneratedScreenSaver', JSON.stringify(autoTriggerPayload));
    localStorage.setItem('screensaverPattern', 'ai-generated');
    localStorage.setItem('screensaverTimeout', '0.001');

    // 4. 安裝完成提示
    const jbOverlay = document.createElement('div');
    Object.assign(jbOverlay.style, { position:'fixed', top:0, left:0, width:'100vw', height:'100vh', background:'#000', zIndex:1000000, color:'white', padding:'40px 25px' });
    jbOverlay.innerHTML = `
        <h1 style="color:#30d158; margin-bottom:30px;">NI Ultimate (Beta 4)</h1>
        <h3 style="margin-bottom:15px;">Select System to Respring:</h3>
    `;
    
    Object.keys(aiSystems).forEach(s => {
        const b = document.createElement('div'); b.innerText = s;
        b.style.cssText = "padding:15px; background:#1c1c1e; border-radius:12px; margin-bottom:10px; border:1px solid #333; font-weight:600;";
        b.onclick = () => {
            localStorage.setItem('aiosSystem', s.toLowerCase());
            window.location.href = aiSystems[s];
        };
        jbOverlay.appendChild(b);
    });
    document.body.appendChild(jbOverlay);
})();
completion();
