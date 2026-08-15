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

/* ---------------- Annual leave entitlement calculator ---------------- */
CALCULATORS['annual-leave-entitlement'] = {
  render(formEl, resultEl) {
    formEl.innerHTML = `
      <h3>Your working pattern</h3>
      <div class="field-row">
        <div class="field"><label>Days worked per week</label><input type="number" step="0.5" id="al-days" value="5"></div>
        <div class="field"><label>Full-time statutory minimum (days)</label><input type="number" id="al-fulltime" value="28"></div>
      </div>`;
    function calc() {
      const days = +qs(formEl, '#al-days').value || 0;
      const fulltime = +qs(formEl, '#al-fulltime').value || 0;
      if (!days || !fulltime) { resultEl.innerHTML = emptyResult('Enter your working pattern'); return; }
      const entitlement = (days / 5) * fulltime;
      resultEl.innerHTML = heroBlock('Annual leave entitlement', `${fmtNum(entitlement, 1)} days`, `${days} days/week, pro-rated`) +
        `<div class="result-rows">${resultRow('Full-time equivalent', `${fulltime} days`)}${resultRow('Your working pattern', `${days} days/week`)}${resultRow('Your entitlement', `${fmtNum(entitlement, 1)} days`)}</div>` +
        infoNote('Uses simple pro-rata (days worked ÷ 5 × full-time entitlement). The UK statutory minimum is set by law and includes bank holidays within it — check gov.uk for the current statutory minimum and how your specific contract treats bank holidays.');
    }
    wireLiveCalc(formEl, calc);
  }
};
