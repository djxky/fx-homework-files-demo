(() => {
  const params = new URLSearchParams(location.search);
  if (params.get('review') !== '1') return;
  const data = window.FX_HOMEWORK_REVIEW;
  if (!data) return;
  const versions = data.reviewVersions || [];
  let version = versions.find(item => item.id === params.get('reviewVersion')) || versions.find(item => item.default) || versions[0];
  let activeId = null;
  let panel;
  const setUrl = () => { const next = new URL(location.href); next.searchParams.set('review', '1'); next.searchParams.set('reviewVersion', version.id); history.replaceState({}, '', next); };
  const close = () => { const next = new URL(location.href); next.searchParams.delete('review'); next.searchParams.delete('reviewVersion'); location.href = next; };
  const ensureAnchors = () => {
    const set = (id, node) => { if (node && !node.dataset.reviewAnchor) node.dataset.reviewAnchor = id; };
    const filesHeader = [...document.querySelectorAll('#fx-files .fx-files-head')].find(node => !node.textContent.includes('发布记录') && !node.textContent.includes('文件预览'));
    set('file-list', filesHeader);
    set('upload-dialog', document.querySelector('.fx-upload-modal'));
    set('publish-dialog', document.querySelector('.fx-publish-modal'));
    set('student-picker', document.querySelector('.fx-student-panel'));
    set('publish-records', document.querySelector('.fx-records-intro'));
    set('file-preview', document.querySelector('.fx-homework-preview'));
  };
  const anchor = id => { ensureAnchors(); return document.querySelector(`[data-review-anchor="${id}"]`); };
  const focus = id => { const node = anchor(id); if (!node) return; activeId = id; renderPanel(); node.scrollIntoView({ behavior:'smooth', block:'center' }); document.querySelectorAll('.fx-review-highlight').forEach(item => item.classList.remove('fx-review-highlight')); node.classList.add('fx-review-highlight'); setTimeout(() => node.classList.remove('fx-review-highlight'), 1800); };
  const renderMarkers = () => {
    document.querySelectorAll('.fx-review-marker').forEach(item => item.remove());
    version.items.forEach((item, index) => { const node = anchor(item.anchorId); if (!node) return; const rect = node.getBoundingClientRect(); if (rect.bottom < 0 || rect.top > innerHeight) return; const marker = document.createElement('button'); marker.className = 'fx-review-marker'; marker.textContent = String(index + 1); marker.style.left = `${Math.min(Math.max(6, rect.left + 8), innerWidth - 34)}px`; marker.style.top = `${Math.min(Math.max(6, rect.top + 8), innerHeight - 34)}px`; marker.title = item.title; marker.onclick = () => { activeId = item.anchorId; renderPanel(); focus(item.anchorId); }; document.body.append(marker); });
  };
  const renderPanel = () => {
    if (!panel) return;
    panel.innerHTML = `<div class="fx-review-head" data-drag><div class="fx-review-title"><strong>${data.title}</strong><span>过稿模式 · ${version.label}</span></div><button class="fx-review-close" data-close aria-label="关闭过稿模式">×</button></div><div class="fx-review-body"><div class="fx-review-select"><span>版本</span><select data-version>${versions.map(item => `<option value="${item.id}" ${item.id === version.id ? 'selected' : ''}>${item.label}</option>`).join('')}</select></div>${version.source.url ? `<a class="fx-review-source" href="${version.source.url}" target="_blank" rel="noopener">${version.source.label} ↗</a>` : `<span class="fx-review-source is-disabled">${version.source.label}</span>`}<div>${version.items.map((item, index) => { const available = !!anchor(item.anchorId); return `<article class="fx-review-item ${activeId === item.anchorId ? 'is-active' : ''}"><span class="fx-review-number">${index + 1}</span><div><strong>${item.title}</strong><p>${item.purpose}</p><div class="fx-review-actions"><button data-locate="${item.anchorId}" ${available ? '' : 'disabled'}>${available ? '定位页面' : '当前页面未打开'}</button>${item.sourceUrl ? `<a href="${item.sourceUrl}" target="_blank" rel="noopener">查看石墨 ↗</a>` : `<span class="is-disabled">石墨待补充</span>`}</div></div></article>`; }).join('')}</div></div>`;
    panel.querySelector('[data-close]').onclick = close;
    panel.querySelector('[data-version]').onchange = event => { version = versions.find(item => item.id === event.target.value) || version; activeId = null; setUrl(); renderPanel(); renderMarkers(); };
    panel.querySelectorAll('[data-locate]').forEach(button => button.onclick = () => focus(button.dataset.locate));
    enableDrag(panel.querySelector('[data-drag]'));
  };
  const enableDrag = handle => { let start; handle.onpointerdown = event => { if (event.target.closest('button,select')) return; start = { x:event.clientX, y:event.clientY, left:panel.offsetLeft, top:panel.offsetTop }; handle.setPointerCapture(event.pointerId); }; handle.onpointermove = event => { if (!start) return; const left = Math.min(Math.max(0, start.left + event.clientX - start.x), innerWidth - panel.offsetWidth); const top = Math.min(Math.max(0, start.top + event.clientY - start.y), innerHeight - panel.offsetHeight); panel.style.left = `${left}px`; panel.style.top = `${top}px`; panel.style.right = 'auto'; }; handle.onpointerup = () => { start = null; }; };
  const refresh = () => { ensureAnchors(); renderPanel(); renderMarkers(); };
  panel = document.createElement('aside'); panel.id = 'fx-review-panel'; document.body.append(panel); setUrl(); refresh();
  addEventListener('scroll', renderMarkers, true); addEventListener('resize', renderMarkers);
  let refreshQueued = false;
  new MutationObserver(mutations => {
    const reviewOnly = node => node?.nodeType === 1 && (node === panel || panel.contains(node) || node.classList.contains('fx-review-marker'));
    if (mutations.every(mutation => reviewOnly(mutation.target) || [...mutation.addedNodes, ...mutation.removedNodes].every(reviewOnly))) return;
    if (!refreshQueued) { refreshQueued = true; requestAnimationFrame(() => { refreshQueued = false; refresh(); }); }
  }).observe(document.body, { childList:true, subtree:true });
})();
