(function () {
  const pathMatch = location.pathname.match(/^\/calculator\/([^/]+)\/?$/);
  const toolId = pathMatch ? decodeURIComponent(pathMatch[1]) : new URLSearchParams(location.search).get('tool');
  const tool = getToolById(toolId);
  const wrap = document.querySelector('[data-tool-root]');
  if (!wrap) return;

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

  if (!tool) {
    wrap.innerHTML = `
      <div class="section"><div class="container">
        <div class="coming-soon">
          <div class="emoji">🔍</div>
          <h2>Calculator not found</h2>
          <p>We couldn't find that calculator. Try browsing our full library instead.</p>
          <a class="btn btn-primary" href="/calculators">Browse all calculators</a>
        </div>
      </div></div>`;
    document.title = 'Calculator not found · Pro Calculator UK';
    setMeta('robots', 'noindex,follow');
    return;
  }

  const cat = getCategoryById(tool.category);
  document.title = `${tool.title} · Pro Calculator UK`;
  setMeta('description', tool.desc);
  setMeta('keywords', [tool.title, ...tool.tags, cat.label, 'UK calculator', 'free online calculator'].join(', '));
  setCanonical(`https://procalculator.site/calculator/${tool.id}`);
  setMeta('robots', tool.functional ? 'index,follow' : 'noindex,follow');
  setMeta('og:title', tool.title, 'property');
  setMeta('og:description', tool.desc, 'property');
  setMeta('og:url', `https://procalculator.site/calculator/${tool.id}`, 'property');
  setMeta('og:type', 'website', 'property');

  setJsonLd('ld-breadcrumb', {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://procalculator.site/' },
      { '@type': 'ListItem', position: 2, name: `${cat.label} Calculators`, item: `https://procalculator.site/calculators/${cat.id}` },
      { '@type': 'ListItem', position: 3, name: tool.title, item: `https://procalculator.site/calculator/${tool.id}` }
    ]
  });

  const badgeHtml = tool.badge ? `<span class="badge badge-${tool.badge}">${tool.badge === 'hot' ? 'Hot' : tool.badge === 'trending' ? 'Trending' : 'New'}</span>` : '';

  wrap.innerHTML = `
    <section class="tool-hero">
      <div class="container">
        <nav class="breadcrumb">
          <a href="/">Home</a><span>/</span>
          <a href="/calculators/${cat.id}">${cat.label}</a><span>/</span>
          <span>${tool.title}</span>
        </nav>
        <div class="head-row">
          <div class="tool-icon tool-icon-lg">${tool.icon}</div>
          <div>
            <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
              <h1>${tool.title}</h1>${badgeHtml}
            </div>
          </div>
        </div>
        <p class="desc">${tool.desc}</p>
      </div>
    </section>
    <section class="container">
      <div class="calc-layout">
        <div class="panel" data-form-panel></div>
        <div class="result-panel">
          <div class="panel" data-result-panel></div>
        </div>
      </div>
      <div data-related></div>
    </section>`;

  const formPanel = wrap.querySelector('[data-form-panel]');
  const resultPanel = wrap.querySelector('[data-result-panel]');
  const relatedBox = wrap.querySelector('[data-related]');

  if (tool.functional && CALCULATORS[tool.id]) {
    CALCULATORS[tool.id].render(formPanel, resultPanel);
  } else {
    formPanel.innerHTML = `
      <div class="coming-soon">
        <div class="emoji">🚧</div>
        <h2>Coming soon</h2>
        <p>We're still building the <strong>${tool.title}</strong>. Check back soon, or explore a similar calculator below.</p>
        <a class="btn btn-primary" href="/calculators/${cat.id}">Browse ${cat.label} calculators</a>
      </div>`;
    resultPanel.parentElement.style.display = 'none';
  }

  const related = relatedTools(tool);
  if (related.length) {
    relatedBox.innerHTML = `
      <h2 class="related-heading">Related calculators</h2>
      <div class="grid grid-4">
        ${related.map(t => `
          <a class="card card-link tool-card" href="/calculator/${t.id}">
            <div class="top-row"><div class="tool-icon">${t.icon}</div></div>
            <div><span class="cat-tag">${getCategoryById(t.category).label}</span><h3>${t.title}</h3><p>${t.desc}</p></div>
          </a>`).join('')}
      </div>`;
  }
})();
