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

/* ---------------- 50/30/20 Budget Planner ---------------- */
CALCULATORS['budget-50-30-20'] = {
  render(formEl, resultEl) {
    formEl.innerHTML = `
      <h3>Your income</h3>
      <div class="field"><label>Monthly take-home pay</label><input type="number" id="b502-income" value="2400"></div>`;
    function calc() {
      const income = +qs(formEl, '#b502-income').value || 0;
      if (!income) { resultEl.innerHTML = emptyResult('Enter your monthly take-home pay'); return; }
      const needs = income * 0.50, wants = income * 0.30, savings = income * 0.20;
      resultEl.innerHTML = heroBlock('Monthly savings target', fmtGBP(savings), '20% of take-home pay') +
        `<div class="result-rows">${resultRow('Needs (50%)', fmtGBP(needs))}${resultRow('Wants (30%)', fmtGBP(wants))}${resultRow('Savings (20%)', fmtGBP(savings))}</div>` +
        infoNote('A popular budgeting guideline, not a fixed rule — adjust the split to fit your circumstances, especially in higher cost-of-living areas.');
    }
    wireLiveCalc(formEl, calc);
  }
};
