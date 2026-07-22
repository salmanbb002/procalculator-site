(function () {
  const popularGrid = document.querySelector('[data-popular-grid]');
  if (popularGrid) {
    popularGrid.innerHTML = POPULAR_TOOLS.map(t => {
      const badge = t.badge ? `<span class="badge badge-${t.badge}">${t.badge === 'hot' ? 'Hot' : t.badge === 'trending' ? 'Trending' : 'New'}</span>` : '';
      return `
        <a class="card card-link tool-card" href="calculator.html?tool=${t.id}">
          <div class="top-row"><div class="tool-icon">${t.icon}</div>${badge}</div>
          <div><span class="cat-tag">${getCategoryById(t.category).label}</span><h3>${t.title}</h3><p>${t.desc}</p></div>
        </a>`;
    }).join('');
  }

  const funRow = document.querySelector('[data-fun-row]');
  if (funRow) {
    funRow.innerHTML = FUN_TOOLS.map(t => `
      <a class="card card-link tool-card fun-card" href="calculator.html?tool=${t.id}">
        <div class="top-row"><div class="tool-icon">${t.icon}</div>${!t.functional ? '<span class="badge badge-soon">Soon</span>' : ''}</div>
        <div><span class="cat-tag">Fun &amp; Quirky</span><h3>${t.title}</h3><p>${t.desc}</p></div>
      </a>`).join('');
  }

  const categoryGrid = document.querySelector('[data-category-grid]');
  if (categoryGrid) {
    categoryGrid.innerHTML = CATEGORIES.filter(c => c.id !== 'fun').map(c => {
      const tools = toolsInCategory(c.id);
      const examples = tools.slice(0, 3).map(t => `<span>${t.title.replace(/ Calculator.*| Estimator.*/,'')}</span>`).join('');
      return `
        <a class="card card-link category-card" href="calculators.html?category=${c.id}">
          <div class="head"><div class="emoji" style="background:var(--primary-light)">${c.emoji}</div>
            <div><h3>${c.label}</h3><span class="count">${tools.length} calculators</span></div>
          </div>
          <p>${c.blurb}</p>
          <div class="examples">${examples}</div>
        </a>`;
    }).join('');
  }

  const newList = document.querySelector('[data-new-list]');
  if (newList) {
    newList.innerHTML = NEW_TOOLS.map(t => `
      <a class="new-item card-link" href="calculator.html?tool=${t.id}">
        <div class="emoji">${t.icon}</div>
        <div class="info"><strong>${t.title}</strong><span>${getCategoryById(t.category).label} · Added this month</span></div>
        <span class="badge badge-new">New</span>
      </a>`).join('');
  }

  const heroSearch = document.querySelector('[data-hero-search]');
  if (heroSearch) {
    heroSearch.addEventListener('keydown', e => {
      if (e.key === 'Enter' && heroSearch.value.trim()) {
        location.href = `calculators.html?q=${encodeURIComponent(heroSearch.value.trim())}`;
      }
    });
    document.querySelectorAll('[data-hero-suggest]').forEach(btn => {
      btn.addEventListener('click', () => location.href = `calculators.html?q=${encodeURIComponent(btn.textContent.trim())}`);
    });
  }
})();
