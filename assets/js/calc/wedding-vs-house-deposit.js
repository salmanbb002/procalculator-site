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

/* ---------------- Wedding cost vs house deposit ---------------- */
CALCULATORS['wedding-vs-house-deposit'] = {
  render(formEl, resultEl) {
    formEl.innerHTML = `
      <h3>Compare your numbers</h3>
      <div class="field-row">
        <div class="field"><label>Wedding budget (£)</label><input type="number" id="wh-wedding" value="18000"></div>
        <div class="field"><label>Target house deposit (£)</label><input type="number" id="wh-deposit" value="30000"></div>
      </div>`;
    function calc() {
      const wedding = +qs(formEl, '#wh-wedding').value || 0;
      const deposit = +qs(formEl, '#wh-deposit').value || 0;
      if (!wedding || !deposit) { resultEl.innerHTML = emptyResult('Enter both figures'); return; }
      const pctOfDeposit = (wedding / deposit) * 100;
      resultEl.innerHTML = heroBlock('Your wedding budget is', `${fmtNum(pctOfDeposit, 0)}%`, 'of your target house deposit') +
        `<div class="result-rows">${resultRow('Wedding budget', fmtGBP(wedding))}${resultRow('Target house deposit', fmtGBP(deposit))}${resultRow('Difference', fmtGBP(Math.abs(deposit - wedding)))}</div>` +
        infoNote('Enter your own actual or planned figures — a fun perspective check, not based on a fabricated "average" wedding or house price, since both vary hugely by location and choices.');
    }
    wireLiveCalc(formEl, calc);
  }
};
