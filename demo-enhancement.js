(() => {
  const resource = [...document.querySelectorAll('div,button,a')].find(el => el.textContent.trim() === '我的资源' && !el.querySelector('div'));
  if (!resource) return;
  let menu;
  const hideMenu = () => { if (menu) menu.remove(); menu = null; };
  const showMenu = () => {
    hideMenu(); const rect = resource.getBoundingClientRect(); menu = document.createElement('div');
    menu.id = 'fx-resource-menu'; menu.style.left = `${rect.left}px`; menu.style.top = `${rect.bottom + 8}px`;
    menu.innerHTML = '<button data-target="my">我的资源</button><button data-target="files">我的文件</button>';
    menu.querySelector('[data-target="my"]').onclick = hideMenu;
    menu.querySelector('[data-target="files"]').onclick = () => { hideMenu(); openFiles(); };
    document.body.append(menu);
  };
  resource.addEventListener('click', e => { e.preventDefault(); e.stopImmediatePropagation(); menu ? hideMenu() : showMenu(); }, true);
  document.addEventListener('click', e => { if (menu && !menu.contains(e.target) && !resource.contains(e.target)) hideMenu(); });

  function openFiles() {
    // 与 my-wiki 文件夹视图一致：文件夹以 parentId 表示层级，文件归属当前 folderId。
    const state = {
      currentId: null, manage: false, selected: new Set(),
      folders: [
        { id:'grade-7', parentId:null, name:'七年级' }, { id:'grade-8', parentId:null, name:'八年级' },
        { id:'grade-9', parentId:null, name:'九年级' }, { id:'exam', parentId:null, name:'中考专题' }, { id:'shared', parentId:null, name:'全校共建' }
      ], files: [
        { id:'file-1', parentId:'grade-7', name:'11九年级数学上教师用书.pdf', size:'35.2MB', time:'2026.07.07' },
        { id:'file-2', parentId:'grade-7', name:'07七年级数学上教师用书.pdf', size:'43.6MB', time:'2026.07.07' },
        { id:'file-3', parentId:'grade-7', name:'09八年级数学上教师用书.pdf', size:'56.3MB', time:'2026.07.07' },
        { id:'file-4', parentId:'grade-7', name:'人教版数学七年级上册教师用书.pdf', size:'17.8MB', time:'2026.07.07' },
        { id:'file-5', parentId:'grade-7', name:'人教版数学七年级下册教师用书.pdf', size:'23.1MB', time:'2026.07.07' },
        { id:'file-6', parentId:'exam', name:'中考英语听力复习音频.mp3', size:'18.6MB', time:'刚刚', auditStatus:'reviewing' },
        { id:'file-7', parentId:'exam', name:'中考备考讲座录播.mp4', size:'426.8MB', time:'刚刚', auditStatus:'reviewing' },
        { id:'file-8', parentId:'exam', name:'中考冲刺课程录音.mp3', size:'22.1MB', time:'刚刚', auditStatus:'failed' }
      ]
    };
    const shell = document.createElement('section'); shell.id = 'fx-files';
    const children = parentId => state.folders.filter(folder => folder.parentId === parentId);
    const files = parentId => state.files.filter(file => file.parentId === parentId);
    const folder = id => state.folders.find(item => item.id === id);
    const fileIcon = item => {
      if (/\.(mp3|wav|m4a|aac)$/i.test(item.name)) return '<span class="fx-file-icon audio">音频</span>';
      if (/\.(mp4|mov|avi|mkv)$/i.test(item.name)) return '<span class="fx-file-icon video">视频</span>';
      return '<span class="fx-file-icon">PDF</span>';
    };
    const hasBlockedReview = folderId => {
      const childIds = new Set([folderId]); let changed = true;
      while (changed) { changed = false; state.folders.forEach(item => { if (childIds.has(item.parentId) && !childIds.has(item.id)) { childIds.add(item.id); changed = true; } }); }
      return state.files.some(item => childIds.has(item.parentId) && ['reviewing', 'failed'].includes(item.auditStatus));
    };
    const trail = () => { const result=[]; let item=folder(state.currentId); while(item){ result.unshift(item); item=folder(item.parentId); } return result; };
    function render(query = '') {
      const currentFolders = children(state.currentId).filter(item => item.name.includes(query));
      const currentFiles = files(state.currentId).filter(item => item.name.includes(query));
      const breadcrumb = `<div class="fx-header-crumb"><button class="fx-header-home" data-home>首页</button><span class="fx-header-sep">›</span><button class="fx-header-root" data-root>我的文件</button>${trail().map((item,index) => `<span class="fx-header-sep">›</span>${index === trail().length - 1 ? `<strong class="fx-header-current">${item.name}</strong>` : `<button class="fx-header-jump" data-jump="${item.id}">${item.name}</button>`}`).join('')}</div>`;
      const folderRows = currentFolders.map(item => `<tr class="fx-folder-row" data-enter="${item.id}">${state.manage ? `<td class="select"><input class="fx-check" type="checkbox" data-select="folder:${item.id}" ${state.selected.has(`folder:${item.id}`) ? 'checked' : ''}></td>` : ''}<td class="name"><span class="fx-folder-icon">▰</span>${item.name}</td><td class="uploader fx-dash">—</td><td class="time fx-dash">—</td><td class="size fx-dash">—</td><td class="op"><button class="fx-row-more" data-more-type="folder" data-more-id="${item.id}" aria-label="更多操作">…</button></td></tr>`).join('');
      const fileRows = currentFiles.map(item => `<tr>${state.manage ? `<td class="select"><input class="fx-check" type="checkbox" data-select="file:${item.id}" ${state.selected.has(`file:${item.id}`) ? 'checked' : ''}></td>` : ''}<td class="name">${fileIcon(item)}${item.name}${item.auditStatus === 'reviewing' ? '<span class="fx-audit-tag reviewing">审核中</span>' : item.auditStatus === 'failed' ? '<span class="fx-audit-tag failed">审核失败</span>' : ''}</td><td class="uploader">—</td><td class="time">${item.time || '刚刚'}</td><td class="size">${item.size}</td><td class="op"><button class="fx-row-more" data-more-type="file" data-more-id="${item.id}" aria-label="更多操作">…</button></td></tr>`).join('');
      const columns = state.manage ? '<th class="select"></th>' : '';
      const empty = !folderRows && !fileRows ? `<tr><td colspan="${state.manage ? 6 : 5}" class="fx-empty">当前文件夹暂无文件</td></tr>` : '';
      shell.innerHTML = `<header class="fx-files-head"><button class="fx-files-close">← 返回</button>${breadcrumb}<div class="fx-files-actions"><input class="fx-files-search" placeholder="搜索" value="${query}"><button class="fx-file-btn" data-manage>${state.manage ? '完成' : '☷ 管理'}</button><button class="fx-file-btn" data-new>▣ 新建文件夹</button><button class="fx-file-btn primary" data-upload>↥ 上传文件</button></div></header>${state.manage ? `<div class="fx-manage-bar">已选择 ${state.selected.size} 项</div>` : ''}<table class="fx-files-table"><thead><tr>${columns}<th class="name">文件名</th><th class="uploader">上传者</th><th class="time">更新时间</th><th class="size">大小</th><th class="op">操作</th></tr></thead><tbody>${folderRows}${fileRows}${empty}</tbody></table>`;
      shell.querySelector('.fx-files-close').onclick = () => { if (state.currentId) { state.currentId = folder(state.currentId)?.parentId ?? null; state.manage = false; render(''); } else { shell.remove(); } };
      shell.querySelector('.fx-files-search').oninput = e => render(e.target.value);
      shell.querySelector('[data-manage]').onclick = () => { state.manage = !state.manage; state.selected.clear(); render(query); };
      shell.querySelector('[data-new]').onclick = () => createFolder(shell, state, render, query);
      shell.querySelector('[data-upload]').onclick = () => uploadFile(shell, state, render, query);
      shell.querySelector('[data-root]')?.addEventListener('click', () => { state.currentId = null; state.manage=false; render(''); });
      shell.querySelector('[data-home]')?.addEventListener('click', () => shell.remove());
      shell.querySelectorAll('[data-jump]').forEach(button => button.addEventListener('click', () => { state.currentId = button.dataset.jump; state.manage=false; render(''); }));
      shell.querySelectorAll('[data-enter]').forEach(row => row.addEventListener('click', event => { if (!event.target.closest('button,input')) { state.currentId = row.dataset.enter; state.manage=false; render(''); } }));
      shell.querySelectorAll('[data-select]').forEach(box => box.addEventListener('change', () => { box.checked ? state.selected.add(box.dataset.select) : state.selected.delete(box.dataset.select); render(query); }));
      shell.querySelectorAll('[data-more-id]').forEach(button => button.onclick = event => openRowMenu(shell, state, render, query, hasBlockedReview, event, button.dataset.moreType, button.dataset.moreId));
    }
    render(''); document.body.append(shell);
  }
  function createFolder(shell, state, render, query) {
    const name = prompt('新建文件夹名称'); if (!name?.trim()) return;
    state.folders.push({ id:`folder-${Date.now()}`, parentId:state.currentId, name:name.trim() }); render(query); showToast(shell, `已新建「${name.trim()}」`);
  }
  function uploadFile(shell, state, render, query) {
    const dialog = document.createElement('div'); dialog.className = 'fx-dialog-mask';
    dialog.innerHTML = `<div class="fx-dialog fx-upload-modal"><button class="fx-upload-close" data-close aria-label="关闭">×</button><div class="fx-upload-content" data-content></div><input class="fx-upload-input" data-file-input type="file" multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png"><input class="fx-upload-input" data-folder-input type="file" multiple webkitdirectory directory></div>`;
    const content = dialog.querySelector('[data-content]');
    let picked = [], uploading = false, timer;
    const formatSize = bytes => bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)}MB` : `${Math.max(1, Math.round(bytes / 1024))}KB`;
    const isSupported = file => /\.(pdf|doc|docx|xls|xlsx|ppt|pptx|jpg|jpeg|png)$/i.test(file.name);
    const groups = () => {
      const map = new Map();
      picked.forEach(file => { const path = file.webkitRelativePath || ''; const group = path.includes('/') ? path.split('/')[0] : ''; if (!map.has(group)) map.set(group, []); map.get(group).push(file); });
      return [...map.entries()];
    };
    const renderSelect = () => {
      if (!picked.length) {
        content.innerHTML = `<h3>上传文件</h3><p>上传后，资料将保存在当前文件夹。</p><div class="fx-upload-drop" data-drop><div class="fx-upload-illustration" aria-hidden="true">▰</div><div class="fx-upload-title">拖入文件，或点击下方按钮选择</div><div class="fx-upload-copy">仅支持 PDF、DOC、DOCX、XLS、XLSX、PPT、PPTX、JPG、PNG 格式文件，<br>单个文件不超过 100MB；一次可选择多个文件，也可以选择整个文件夹</div><div class="fx-upload-actions"><button data-pick-file>↥ 选择文件</button><button data-pick-folder>⊞ 选择文件夹</button></div></div>`;
      } else {
        const supported = picked.filter(isSupported), unsupported = picked.length - supported.length;
        const total = picked.reduce((sum, item) => sum + item.size, 0);
        content.innerHTML = `<h3>上传文件</h3><p>上传后，资料将保存在当前文件夹。</p><div class="fx-upload-list"><div class="fx-upload-summary"><span>文件 <b>${picked.length}</b></span><i></i><span>文件夹 <b>${groups().filter(([name]) => name).length}</b></span><i></i><span>大小 <b>${formatSize(total)}</b></span>${unsupported ? `<i></i><span class="warning">${unsupported} 个不支持的文件</span>` : ''}<div class="fx-upload-actions"><button data-pick-file>↥ 选择文件</button><button data-pick-folder>⊞ 选择文件夹</button></div></div><div class="fx-upload-tree">${groups().map(([name, items]) => name ? `<div class="fx-tree-folder">⌄ <span>▰</span><b>${name}</b><em>${items.length} 个</em></div>${items.map(file => `<div class="fx-tree-file"><span>${isSupported(file) ? '▤' : '!'}</span>${file.name}<em>${formatSize(file.size)}</em></div>`).join('')}` : items.map(file => `<div class="fx-tree-file"><span>${isSupported(file) ? '▤' : '!'}</span>${file.name}<em>${formatSize(file.size)}</em></div>`).join('')).join('')}</div></div><button class="fx-upload-start" data-start ${supported.length ? '' : 'disabled'}>开始上传</button>`;
      }
      bindSelection();
    };
    const demoFiles = folder => folder ? [
      { name:'编辑题目/二年级数学练习.docx', size:27341, webkitRelativePath:'编辑题目/二年级数学练习.docx' },
      { name:'编辑题目/二年级数学课件.pptx', size:13312, webkitRelativePath:'编辑题目/二年级数学课件.pptx' },
      { name:'编辑题目/二年级单元检测.pdf', size:13312, webkitRelativePath:'编辑题目/二年级单元检测.pdf' },
      { name:'编辑题目/二年级课堂练习.jpg', size:13312, webkitRelativePath:'编辑题目/二年级课堂练习.jpg' }
    ] : [
      { name:'二年级数学单元练习.docx', size:27341 },
      { name:'二年级数学课堂课件.pptx', size:13312 },
      { name:'二年级单元检测卷.pdf', size:13312 }
    ];
    const bindSelection = () => {
      // 此页面是交互演示：按钮直接进入参考稿中的待上传清单；仍保留拖入和原生文件输入以支持真实文件选择。
      content.querySelector('[data-pick-file]')?.addEventListener('click', () => addFiles(demoFiles(false)));
      content.querySelector('[data-pick-folder]')?.addEventListener('click', () => addFiles(demoFiles(true)));
      content.querySelector('[data-start]')?.addEventListener('click', startUpload);
      const drop = content.querySelector('[data-drop]');
      if (drop) { drop.ondragover = event => { event.preventDefault(); drop.classList.add('is-dragging'); }; drop.ondragleave = () => drop.classList.remove('is-dragging'); drop.ondrop = event => { event.preventDefault(); drop.classList.remove('is-dragging'); addFiles(event.dataTransfer.files); }; }
    };
    const addFiles = list => { const files = Array.from(list || []); if (!files.length) return; picked = [...picked, ...files]; renderSelect(); };
    const finishUpload = () => {
      const uploaded = picked.filter(isSupported);
      uploaded.forEach(file => state.files.push({ id:`file-${Date.now()}-${Math.random().toString(36).slice(2,7)}`, parentId:state.currentId, name:file.name, size:formatSize(file.size), time:'刚刚', auditStatus:'approved' }));
      uploading = false;
      content.innerHTML = `<div class="fx-upload-success"><div class="fx-success-icon">✓</div><h2>导入完成，文件已入库</h2><p>资料已保存到当前文件夹，可继续整理和使用。</p><button class="fx-upload-done" data-done>完成</button></div>`;
      content.querySelector('[data-done]').onclick = () => { dialog.remove(); render(query); showToast(shell, `已上传 ${uploaded.length} 个文件`); };
    };
    const startUpload = () => {
      const uploaded = picked.filter(isSupported); if (!uploaded.length) return;
      uploading = true; let percent = 8;
      const stages = ['读取文件并保留原结构', 'AI 自动打标签', '抽取知识点与生成摘要', '建立关联与图谱'];
      const drawProgress = () => { const active = percent < 42 ? 0 : percent < 68 ? 1 : percent < 88 ? 2 : 3; content.innerHTML = `<h3>上传文件</h3><p>正在导入 ${uploaded.length} 个文件，请勿关闭页面。</p><div class="fx-upload-progress"><strong>${percent}%</strong><div class="fx-progress-line"><span style="width:${percent}%"></span></div><div class="fx-progress-steps">${stages.map((stage, index) => `<div class="${index === active ? 'active' : index < active ? 'done' : ''}"><b>0${index + 1}</b><section><h4>${stage}</h4><p>${index === 0 ? `已读取 ${Math.max(1, Math.round(uploaded.length * percent / 100))}/${uploaded.length} 个文件…` : index === 1 ? '基于文件名、内容关键词识别分类' : index === 2 ? 'PDF/PPT 抽目录，图片做 OCR' : '同主题文件互相关联，准备好关联推荐'}</p></section><em>${index < active ? '已完成' : index === active ? '进行中' : '等待中'}</em></div>`).join('')}</div></div>`; };
      drawProgress(); timer = setInterval(() => { percent = Math.min(100, percent + 12); if (percent >= 100) { clearInterval(timer); finishUpload(); } else drawProgress(); }, 520);
    };
    const inputFile = dialog.querySelector('[data-file-input]'), inputFolder = dialog.querySelector('[data-folder-input]');
    const closeDialog = () => { if (!uploading) { dialog.remove(); return; } const confirm = document.createElement('div'); confirm.className='fx-upload-exit'; confirm.innerHTML=`<div><button class="fx-upload-exit-x" data-cancel>×</button><h3>确认退出吗？</h3><p>退出将中断上传操作，已上传文件会保留，剩余文件将停止上传。</p><footer><button data-cancel>取消</button><button class="primary" data-confirm>确定</button></footer></div>`; confirm.querySelectorAll('[data-cancel]').forEach(button => button.onclick=()=>confirm.remove()); confirm.querySelector('[data-confirm]').onclick=()=>{ clearInterval(timer); dialog.remove(); render(query); showToast(shell, '已停止上传'); }; dialog.append(confirm); };
    dialog.querySelector('[data-close]').onclick = closeDialog;
    inputFile.onchange = () => addFiles(inputFile.files); inputFolder.onchange = () => addFiles(inputFolder.files);
    renderSelect(); shell.append(dialog);
  }
  function distribute(shell, name) {
    const dialog = document.createElement('div'); dialog.className = 'fx-dialog-mask'; dialog.innerHTML = `<div class="fx-dialog"><h3>布置到墨水屏</h3><p>选择接收资料的班级，学生将通过墨水屏设备查看。</p><div class="fx-picked">${name}</div><label class="fx-class"><input type="checkbox" checked> 初二（3）班　42 人 · 已绑定墨水屏 39 台</label><div class="fx-foot"><button data-close>取消</button><button class="primary" data-confirm>确认布置</button></div></div>`;
    dialog.querySelector('[data-close]').onclick = () => dialog.remove(); dialog.querySelector('[data-confirm]').onclick = () => { dialog.remove(); showToast(shell,'已布置到初二（3）班的墨水屏'); }; shell.append(dialog);
  }
  function openRowMenu(shell, state, render, query, hasBlockedReview, event, type, id) {
    document.querySelector('.fx-row-menu')?.remove();
    const rect = event.currentTarget.getBoundingClientRect(); const menu = document.createElement('div');
    const item = type === 'folder' ? state.folders.find(folder => folder.id === id) : state.files.find(file => file.id === id);
    if (!item) return;
    const reviewBlocked = type === 'folder' ? hasBlockedReview(id) : ['reviewing', 'failed'].includes(item.auditStatus);
    menu.className = 'fx-row-menu'; menu.style.top = `${rect.bottom + 4}px`; menu.style.left = `${rect.right - 172}px`;
    menu.innerHTML = `${reviewBlocked ? '<div class="fx-row-menu-hint">审核未通过，暂不可布置</div>' : '<button data-distribute>布置到墨水屏</button>'}<div class="fx-row-menu-divider"></div><button data-move>移动到…</button><button data-rename>重命名</button><div class="fx-row-menu-divider"></div><button class="danger" data-delete>${type === 'folder' ? '删除文件夹' : '删除'}</button>`;
    menu.querySelector('[data-distribute]')?.addEventListener('click', () => { menu.remove(); distribute(shell, item.name); });
    menu.querySelector('[data-move]').onclick = () => { menu.remove(); moveItem(shell, state, render, query, type, id); };
    menu.querySelector('[data-rename]').onclick = () => {
      menu.remove(); const name = prompt(`重命名${type === 'folder' ? '文件夹' : '文件'}`, item.name);
      if (name?.trim()) { item.name = name.trim(); render(query); showToast(shell, '已重命名'); }
    };
    menu.querySelector('[data-delete]').onclick = () => {
      menu.remove(); if (!confirm(`确认删除「${item.name}」？`)) return;
      if (type === 'folder') {
        const removeIds = new Set([id]); let changed = true;
        while (changed) { changed = false; state.folders.forEach(folder => { if (removeIds.has(folder.parentId) && !removeIds.has(folder.id)) { removeIds.add(folder.id); changed = true; } }); }
        state.folders = state.folders.filter(folder => !removeIds.has(folder.id)); state.files = state.files.filter(file => !removeIds.has(file.parentId));
      } else state.files = state.files.filter(file => file.id !== id);
      render(query); showToast(shell, '已删除');
    };
    document.body.append(menu); setTimeout(() => document.addEventListener('click', () => menu.remove(), { once:true }), 0);
  }
  function moveItem(shell, state, render, query, type, id) {
    const item = type === 'folder' ? state.folders.find(folder => folder.id === id) : state.files.find(file => file.id === id);
    if (!item) return;
    const invalid = new Set([id]);
    if (type === 'folder') { let changed = true; while (changed) { changed = false; state.folders.forEach(folder => { if (invalid.has(folder.parentId) && !invalid.has(folder.id)) { invalid.add(folder.id); changed = true; } }); } }
    const targets = [{ id:'', name:'我的文件' }, ...state.folders.filter(folder => !invalid.has(folder.id))];
    const dialog = document.createElement('div'); dialog.className = 'fx-dialog-mask';
    dialog.innerHTML = `<div class="fx-dialog fx-move-modal"><h3>移动到…</h3><p>${item.name}</p><select data-target>${targets.map(target => `<option value="${target.id}">${target.name}</option>`).join('')}</select><div class="fx-foot"><button data-close>取消</button><button class="primary" data-confirm>移动</button></div></div>`;
    dialog.querySelector('[data-close]').onclick = () => dialog.remove();
    dialog.querySelector('[data-confirm]').onclick = () => { item.parentId = dialog.querySelector('[data-target]').value || null; dialog.remove(); render(query); showToast(shell, '已移动'); };
    shell.append(dialog);
  }
  function showToast(shell, text) { const toast=document.createElement('div'); toast.className='fx-toast'; toast.textContent=text; shell.append(toast); setTimeout(()=>toast.remove(),2200); }
})();
