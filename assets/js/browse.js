(function () {
  const grid = document.querySelector('[data-tool-grid]');
  const chipRow = document.querySelector('[data-chip-row]');
  const searchInput = document.querySelector('[data-browse-search]');
  const meta = document.querySelector('[data-results-meta]');
  if (!grid) return;

  const BLOG_BY_CATEGORY = {
    finance: [
      { title: 'UK mortgage rates explained: fixed vs tracker vs variable', href: '/blog/uk-mortgage-rates-explained' },
      { title: 'VAT for small businesses: a plain-English guide', href: '/blog/vat-guide-small-business' }
    ],
    construction: [
      { title: "How much concrete do I need? A homeowner's guide", href: '/blog/how-much-concrete-do-i-need' }
    ]
  };

  const pathMatch = location.pathname.match(/^\/calculators\/([^/]+)\/?$/);
  const params = new URLSearchParams(location.search);
  let activeCategory = pathMatch ? decodeURIComponent(pathMatch[1]) : (params.get('category') || 'all');
  let query = params.get('q') || '';
  searchInput.value = query;

  chipRow.innerHTML = ['all', ...CATEGORIES.map(c => c.id)].map(id => {
    const cat = id === 'all' ? { label: 'All calculators', emoji: '✨' } : getCategoryById(id);
    return `<button class="chip ${id === activeCategory ? 'active' : ''}" data-cat="${id}">${cat.emoji} ${cat.label}</button>`;
  }).join('');

  function setMeta(name, content, attr = 'name') {
    let el = document.querySelector(`meta[${attr}="${name}"]`);
    if (!el) { el = document.createElement('meta'); el.setAttribute(attr, name); document.head.appendChild(el); }
    el.setAttribute('content', content);
  }
  function setCanonical(href) {
    let el = document.querySelector('link[rel="canonical"]');
    if (!el) { el = document.createElement('link'); el.rel = 'canonical'; document.head.appendChild(el); }
    el.href = href;
  }
  function setJsonLd(id, data) {
    let el = document.getElementById(id);
    if (!el) { el = document.createElement('script'); el.type = 'application/ld+json'; el.id = id; document.head.appendChild(el); }
    el.textContent = JSON.stringify(data);
  }

  function cardHtml(t) {
    const cat = getCategoryById(t.category);
    const badge = t.badge ? `<span class="badge badge-${t.badge}">${t.badge === 'hot' ? 'Hot' : t.badge === 'trending' ? 'Trending' : 'New'}</span>` : (!t.functional ? `<span class="badge badge-soon">Coming soon</span>` : '');
    return `
      <a class="card card-link tool-card" href="/calculator/${t.id}">
        <div class="top-row"><div class="tool-icon">${t.icon}</div>${badge}</div>
        <div><span class="cat-tag">${cat.label}</span><h3>${t.title}</h3><p>${t.desc}</p></div>
      </a>`;
  }

  function updateHead() {
    if (document.body.hasAttribute('data-static-pillar')) return; // static pillar pages already ship correct title/description/canonical/JSON-LD
    const breadcrumbEl = document.querySelector('[data-browse-breadcrumb]');
    const path = activeCategory === 'all' ? '/calculators' : `/calculators/${activeCategory}`;
    setCanonical(`https://procalculator.site${path}`);
    if (activeCategory === 'all') {
      document.title = 'All Calculators · Pro Calculator UK';
      setMeta('description', 'Browse and search every free UK calculator on Pro Calculator UK — finance, health, construction, automotive, maths, science and more.');
      if (breadcrumbEl) breadcrumbEl.innerHTML = `<a href="/">Home</a><span>/</span><span>All Calculators</span>`;
      setJsonLd('ld-breadcrumb', {
        '@context': 'https://schema.org', '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://procalculator.site/' },
          { '@type': 'ListItem', position: 2, name: 'All Calculators', item: 'https://procalculator.site/calculators' }
        ]
      });
    } else {
      const cat = getCategoryById(activeCategory);
      document.title = `${cat.label} Calculators UK · Pro Calculator UK`;
      setMeta('description', `Free UK ${cat.label.toLowerCase()} calculators — ${cat.blurb.toLowerCase()}. Instant, accurate results, no sign-up.`);
      if (breadcrumbEl) breadcrumbEl.innerHTML = `<a href="/">Home</a><span>/</span><a href="/calculators">All Calculators</a><span>/</span><span>${cat.label}</span>`;
      setJsonLd('ld-breadcrumb', {
        '@context': 'https://schema.org', '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://procalculator.site/' },
          { '@type': 'ListItem', position: 2, name: 'All Calculators', item: 'https://procalculator.site/calculators' },
          { '@type': 'ListItem', position: 3, name: `${cat.label} Calculators`, item: `https://procalculator.site/calculators/${cat.id}` }
        ]
      });
    }

    const blogBox = document.querySelector('[data-browse-blog]');
    if (blogBox) {
      const posts = BLOG_BY_CATEGORY[activeCategory];
      blogBox.innerHTML = posts ? `<p style="margin-top:14px">From the blog: ${posts.map(p => `<a href="${p.href}" style="color:var(--primary);font-weight:600">${p.title}</a>`).join(' &middot; ')}</p>` : '';
    }
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
    updateHead();
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
    if (query.trim()) p.set('q', query.trim());
    const base = activeCategory === 'all' ? '/calculators' : `/calculators/${activeCategory}`;
    history.replaceState(null, '', p.toString() ? `${base}?${p}` : base);
  }

  render();
})();
