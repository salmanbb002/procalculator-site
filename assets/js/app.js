(function () {
  const root = document.documentElement;
  const body = document.body;
  const main = document.querySelector('main');
  const siteHeader = document.querySelector('.site-header');
  const saved = localStorage.getItem('qc-theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  root.setAttribute('data-theme', saved || (prefersDark ? 'dark' : 'light'));

  if (main && siteHeader) {
    main.id = main.id || 'main-content';
    const skipLink = document.createElement('a');
    skipLink.className = 'skip-link';
    skipLink.href = `#${main.id}`;
    skipLink.textContent = 'Skip to main content';
    siteHeader.before(skipLink);
  }

  document.querySelectorAll('.main-nav').forEach(nav => nav.setAttribute('aria-label', 'Primary navigation'));
  document.querySelectorAll('button svg').forEach(icon => icon.setAttribute('aria-hidden', 'true'));
  document.querySelectorAll('[data-hero-search], [data-browse-search]').forEach(input => {
    input.setAttribute('aria-label', input.hasAttribute('data-hero-search') ? 'Search calculators' : 'Filter calculators');
    input.setAttribute('autocomplete', 'off');
    input.name = input.hasAttribute('data-hero-search') ? 'calculator-search' : 'calculator-filter';
  });
  body.dataset.page = document.querySelector('.hero') ? 'home'
    : document.querySelector('.tool-hero') ? 'calculator'
      : document.querySelector('.article-cover') ? 'article'
        : document.querySelector('.page-hero') ? 'directory'
          : 'content';

  document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
    updateThemeIcon(btn);
    btn.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      localStorage.setItem('qc-theme', next);
      document.querySelectorAll('[data-theme-toggle]').forEach(updateThemeIcon);
    });
  });
  function updateThemeIcon(btn) {
    btn.textContent = root.getAttribute('data-theme') === 'dark' ? '☀️' : '🌙';
  }

  const navToggle = document.querySelector('[data-nav-toggle]');
  const drawer = document.querySelector('[data-mobile-drawer]');
  if (navToggle && drawer) {
    const panel = drawer.querySelector('.panel');
    const closeDrawer = (restoreFocus = true) => {
      drawer.classList.remove('open');
      drawer.setAttribute('aria-hidden', 'true');
      navToggle.setAttribute('aria-expanded', 'false');
      body.classList.remove('drawer-open');
      if (restoreFocus) navToggle.focus();
    };
    const openDrawer = () => {
      drawer.classList.add('open');
      drawer.setAttribute('aria-hidden', 'false');
      navToggle.setAttribute('aria-expanded', 'true');
      body.classList.add('drawer-open');
      panel.querySelector('a')?.focus();
    };

    drawer.id = drawer.id || 'mobile-navigation';
    drawer.setAttribute('aria-hidden', 'true');
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'true');
    panel.setAttribute('aria-label', 'Site menu');
    navToggle.setAttribute('aria-controls', drawer.id);
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.addEventListener('click', openDrawer);
    drawer.querySelector('.backdrop').addEventListener('click', () => closeDrawer());
    drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', () => closeDrawer(false)));
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && drawer.classList.contains('open')) closeDrawer();
    });
  }

  const backToTop = document.querySelector('[data-back-to-top]');
  if (backToTop) {
    window.addEventListener('scroll', () => {
      backToTop.classList.toggle('show', window.scrollY > 500);
    });
    backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  const overlay = document.querySelector('[data-search-overlay]');
  if (overlay) {
    const input = overlay.querySelector('input');
    const resultsBox = overlay.querySelector('[data-search-results]');
    const panel = overlay.querySelector('.search-panel');
    let searchTrigger = null;
    const openSearch = () => {
      searchTrigger = document.activeElement;
      overlay.classList.add('open');
      overlay.setAttribute('aria-hidden', 'false');
      input.value = '';
      renderResults('');
      setTimeout(() => input.focus(), 30);
    };
    const closeSearch = () => {
      overlay.classList.remove('open');
      overlay.setAttribute('aria-hidden', 'true');
      if (searchTrigger instanceof HTMLElement) searchTrigger.focus();
    };

    overlay.setAttribute('aria-hidden', 'true');
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'true');
    panel.setAttribute('aria-label', 'Search calculators');
    input.setAttribute('aria-label', 'Search calculators');
    input.setAttribute('autocomplete', 'off');
    input.name = 'site-search';
    resultsBox.setAttribute('aria-live', 'polite');
    document.querySelectorAll('[data-search-trigger]').forEach(btn => {
      btn.setAttribute('aria-label', 'Search calculators');
      btn.setAttribute('aria-haspopup', 'dialog');
      btn.addEventListener('click', openSearch);
    });
    overlay.querySelector('.backdrop').addEventListener('click', closeSearch);
    document.addEventListener('keydown', e => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); openSearch(); }
      if (e.key === 'Escape') closeSearch();
    });
    input.addEventListener('input', () => renderResults(input.value));

    function renderResults(query) {
      const list = query.trim() ? searchTools(query) : TOOLS.filter(t => POPULAR_IDS.includes(t.id));
      if (!list.length) {
        resultsBox.innerHTML = `<div class="search-empty">No calculators found for "${escapeHtml(query)}"</div>`;
        return;
      }
      resultsBox.innerHTML = list.slice(0, 12).map(t => `
        <a class="search-result-item" href="/calculator/${t.id}">
          <span class="emoji">${t.icon}</span>
          <span class="meta"><strong>${t.title}</strong><span>${getCategoryById(t.category).label}${t.functional ? '' : ' · Coming soon'}</span></span>
        </a>`).join('');
    }
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
  window.qcEscapeHtml = escapeHtml;

  const contactForm = document.querySelector('[data-contact-form]');
  if (contactForm) {
    contactForm.addEventListener('submit', e => {
      e.preventDefault();
      const name = contactForm.querySelector('#c-name').value.trim();
      const email = contactForm.querySelector('#c-email').value.trim();
      const message = contactForm.querySelector('#c-message').value.trim();
      const subject = `Message from ${name || 'Pro Calculator UK visitor'}`;
      const body = `${message}\n\n— ${name} (${email})`;
      window.location.href = `mailto:hello@procalculator.site?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    });
  }

  document.querySelectorAll('[data-year]').forEach(el => el.textContent = new Date().getFullYear());

  const path = location.pathname.replace(/\/$/, '') || '/';
  document.querySelectorAll('.main-nav a, .mobile-drawer a').forEach(a => {
    const href = a.getAttribute('href').replace(/\/$/, '') || '/';
    if (href === path) a.classList.add('active');
  });
})();
