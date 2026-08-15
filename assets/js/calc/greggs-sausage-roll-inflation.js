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

/* ---------------- Greggs sausage roll inflation tracker ---------------- */
CALCULATORS['greggs-sausage-roll-inflation'] = {
  render(formEl, resultEl) {
    formEl.innerHTML = `
      <h3>Price then vs now</h3>
      <div class="field-row">
        <div class="field"><label>Old price (£)</label><input type="number" step="0.01" id="gs-old" value="0.65"></div>
        <div class="field"><label>Year</label><input type="number" id="gs-old-year" value="2010"></div>
      </div>
      <div class="field-row">
        <div class="field"><label>Current price (£)</label><input type="number" step="0.01" id="gs-new" value="1.30"></div>
        <div class="field"><label>Year</label><input type="number" id="gs-new-year" value="2026"></div>
      </div>`;
    function calc() {
      const oldP = +qs(formEl, '#gs-old').value || 0;
      const newP = +qs(formEl, '#gs-new').value || 0;
      const oldY = +qs(formEl, '#gs-old-year').value || 0;
      const newY = +qs(formEl, '#gs-new-year').value || 0;
      const years = newY - oldY;
      if (!oldP || !newP || years <= 0) { resultEl.innerHTML = emptyResult('Enter both prices and years'); return; }
      const pctChange = ((newP - oldP) / oldP) * 100;
      const annualRate = (Math.pow(newP / oldP, 1 / years) - 1) * 100;
      resultEl.innerHTML = heroBlock('Price increase', `+${fmtNum(pctChange, 0)}%`, `Over ${years} years`) +
        `<div class="result-rows">${resultRow('Old price', fmtGBP(oldP))}${resultRow('New price', fmtGBP(newP))}${resultRow('Average annual increase', `${fmtNum(annualRate, 1)}%/year`)}</div>` +
        infoNote('Enter your own remembered or researched prices — this tracks whatever two prices you provide, played for fun rather than using a verified official Greggs price history.');
    }
    wireLiveCalc(formEl, calc);
  }
};
