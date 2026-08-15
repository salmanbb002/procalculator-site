const fmtGBP = (n) => isFinite(n) ? new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 2 }).format(n) : '—';
const fmtNum = (n, d = 2) => isFinite(n) ? Number(n).toLocaleString('en-GB', { maximumFractionDigits: d, minimumFractionDigits: 0 }) : '—';
const qs = (root, sel) => root.querySelector(sel);
const heroBlock = (label, value, sub) => `<div class="result-hero"><div class="label">${label}</div><div class="value">${value}</div>${sub ? `<div class="sub">${sub}</div>` : ''}</div>`;
const resultRow = (k, v) => `<div class="result-row"><span class="k">${k}</span><span class="v">${v}</span></div>`;
const infoNote = (text) => `<div class="info-box"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 9v4M12 17h.01M10.29 3.86l-8.18 14.14A2 2 0 0 0 3.82 21h16.36a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg><span>${text}</span></div>`;
const emptyResult = (text) => `<div class="placeholder-result">${text}</div>`;

function wireLiveCalc(formEl, fn) {
  formEl.addEventListener('input', fn);
  formEl.addEventListener('change', fn);
  fn();
}
function segControl(formEl, name, onChange) {
  const buttons = formEl.querySelectorAll(`[data-seg="${name}"] button`);
  buttons.forEach(btn => btn.addEventListener('click', () => {
    buttons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    onChange(btn.dataset.value);
  }));
}
function segValue(formEl, name) {
  const active = formEl.querySelector(`[data-seg="${name}"] button.active`);
  return active ? active.dataset.value : null;
}

const CALCULATORS = {};

/* ---------------- Prime factorisation ---------------- */
CALCULATORS['prime-factorization'] = {
  render(formEl, resultEl) {
    formEl.innerHTML = `
      <h3>Number</h3>
      <div class="field"><label>Whole number (2 or greater)</label><input type="number" id="pf-n" value="360"></div>`;
    function factorize(n) {
      const factors = [];
      let d = 2;
      while (d * d <= n) {
        while (n % d === 0) { factors.push(d); n /= d; }
        d++;
      }
      if (n > 1) factors.push(n);
      return factors;
    }
    function calc() {
      let n = Math.round(+qs(formEl, '#pf-n').value || 0);
      if (n < 2) { resultEl.innerHTML = emptyResult('Enter a whole number 2 or greater'); return; }
      const factors = factorize(n);
      const counts = {};
      factors.forEach(f => counts[f] = (counts[f] || 0) + 1);
      const expression = Object.entries(counts).map(([f, c]) => c > 1 ? `${f}^${c}` : `${f}`).join(' × ');
      resultEl.innerHTML = heroBlock('Prime factorisation', expression, `${factors.length} prime factor(s)`) +
        `<div class="result-rows">${resultRow('Original number', n)}${resultRow('Factor list', factors.join(', '))}${resultRow('Is prime?', factors.length === 1 ? 'Yes' : 'No')}</div>`;
    }
    wireLiveCalc(formEl, calc);
  }
};
