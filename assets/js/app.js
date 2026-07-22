(function () {
  const root = document.documentElement;
  const saved = localStorage.getItem('qc-theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  root.setAttribute('data-theme', saved || (prefersDark ? 'dark' : 'light'));

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
    navToggle.addEventListener('click', () => drawer.classList.add('open'));
    drawer.querySelector('.backdrop').addEventListener('click', () => drawer.classList.remove('open'));
    drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', () => drawer.classList.remove('open')));
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
    const openSearch = () => {
      overlay.classList.add('open');
      input.value = '';
      renderResults('');
      setTimeout(() => input.focus(), 30);
    };
    const closeSearch = () => overlay.classList.remove('open');

    document.querySelectorAll('[data-search-trigger]').forEach(btn => btn.addEventListener('click', openSearch));
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
        <a class="search-result-item" href="calculator.html?tool=${t.id}">
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
      const subject = `Message from ${name || 'QuickCalc UK visitor'}`;
      const body = `${message}\n\n— ${name} (${email})`;
      window.location.href = `mailto:hello@quickcalc.example.uk?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    });
  }

  document.querySelectorAll('[data-year]').forEach(el => el.textContent = new Date().getFullYear());

  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.main-nav a, .mobile-drawer a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === path) a.classList.add('active');
  });
})();
