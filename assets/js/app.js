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
      window.location.href = `mailto:salmanb0022@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    });
  }

  document.querySelectorAll('[data-year]').forEach(el => el.textContent = new Date().getFullYear());

  const path = location.pathname.replace(/\/$/, '') || '/';
  document.querySelectorAll('.main-nav a, .mobile-drawer a').forEach(a => {
    const href = a.getAttribute('href').replace(/\/$/, '') || '/';
    if (href === path) a.classList.add('active');
  });

  if (!document.querySelector('[data-whatsapp-float]')) {
    const wa = document.createElement('a');
    wa.href = 'https://wa.me/923377043287?text=' + encodeURIComponent("Hi, I'm contacting you from Pro Calculator UK");
    wa.target = '_blank';
    wa.rel = 'noopener';
    wa.className = 'whatsapp-float';
    wa.setAttribute('data-whatsapp-float', '');
    wa.setAttribute('aria-label', 'Chat with us on WhatsApp');
    wa.innerHTML = `
      <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.47 14.38c-.3-.15-1.77-.87-2.04-.97-.27-.1-.48-.15-.68.15-.2.3-.78.97-.96 1.17-.18.2-.35.22-.65.08-.3-.15-1.28-.47-2.44-1.5-.9-.8-1.51-1.79-1.69-2.09-.18-.3-.02-.46.13-.61.14-.14.3-.35.45-.53.15-.18.2-.3.3-.5.1-.2.05-.38-.02-.53-.08-.15-.68-1.63-.93-2.24-.24-.58-.49-.5-.68-.51h-.58c-.2 0-.53.08-.8.38-.28.3-1.05 1.02-1.05 2.5s1.08 2.9 1.23 3.1c.15.2 2.12 3.24 5.14 4.54.72.31 1.28.5 1.72.63.72.23 1.38.2 1.9.12.58-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.13-.27-.2-.57-.35z"/><path d="M12.02 2C6.5 2 2.03 6.48 2.03 12c0 1.87.5 3.62 1.44 5.13L2 22l4.98-1.44A9.94 9.94 0 0 0 12.02 22C17.53 22 22 17.52 22 12S17.53 2 12.02 2zm0 18.1c-1.7 0-3.28-.5-4.6-1.35l-.33-.2-3.05.88.9-2.97-.22-.34a8.07 8.07 0 0 1-1.28-4.4c0-4.48 3.65-8.12 8.13-8.12 4.48 0 8.13 3.64 8.13 8.12 0 4.48-3.65 8.13-8.13 8.13z"/></svg>
      <span class="whatsapp-float-label">Chat on WhatsApp</span>`;
    document.body.appendChild(wa);
  }
})();
