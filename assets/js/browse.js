(function () {
  const grid = document.querySelector('[data-tool-grid]');
  const chipRow = document.querySelector('[data-chip-row]');
  const searchInput = document.querySelector('[data-browse-search]');
  const meta = document.querySelector('[data-results-meta]');
  if (!grid) return;

  const params = new URLSearchParams(location.search);
  let activeCategory = params.get('category') || 'all';
  let query = params.get('q') || '';
  searchInput.value = query;

  chipRow.innerHTML = ['all', ...CATEGORIES.map(c => c.id)].map(id => {
    const cat = id === 'all' ? { label: 'All calculators', emoji: '✨' } : getCategoryById(id);
    return `<button class="chip ${id === activeCategory ? 'active' : ''}" data-cat="${id}">${cat.emoji} ${cat.label}</button>`;
  }).join('');

  function cardHtml(t) {
    const cat = getCategoryById(t.category);
    const badge = t.badge ? `<span class="badge badge-${t.badge}">${t.badge === 'hot' ? 'Hot' : t.badge === 'trending' ? 'Trending' : 'New'}</span>` : (!t.functional ? `<span class="badge badge-soon">Coming soon</span>` : '');
    return `
      <a class="card card-link tool-card" href="calculator.html?tool=${t.id}">
        <div class="top-row"><div class="tool-icon">${t.icon}</div>${badge}</div>
        <div><span class="cat-tag">${cat.label}</span><h3>${t.title}</h3><p>${t.desc}</p></div>
      </a>`;
  }

  function render() {
    let list = TOOLS.slice();
    if (activeCategory !== 'all') list = list.filter(t => t.category === activeCategory);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(t => t.title.toLowerCase().includes(q) || t.desc.toLowerCase().includes(q) || t.tags.some(tag => tag.includes(q)));
    }
    meta.textContent = `Showing ${list.length} of ${TOOLS.length} calculators`;
    grid.innerHTML = list.length ? list.map(cardHtml).join('') : '';
    grid.style.display = list.length ? '' : 'none';
    document.querySelector('[data-empty-state]').style.display = list.length ? 'none' : 'block';
    chipRow.querySelectorAll('.chip').forEach(c => c.classList.toggle('active', c.dataset.cat === activeCategory));
  }

  chipRow.addEventListener('click', e => {
    const btn = e.target.closest('.chip');
    if (!btn) return;
    activeCategory = btn.dataset.cat;
    updateUrl();
    render();
  });
  searchInput.addEventListener('input', () => { query = searchInput.value; updateUrl(); render(); });

  function updateUrl() {
    const p = new URLSearchParams();
    if (activeCategory !== 'all') p.set('category', activeCategory);
    if (query.trim()) p.set('q', query.trim());
    history.replaceState(null, '', p.toString() ? `?${p}` : location.pathname);
  }

  render();
})();
