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

/* ---------------- Meal prep savings ---------------- */
CALCULATORS['meal-prep-savings'] = {
  render(formEl, resultEl) {
    formEl.innerHTML = `
      <h3>Your habits</h3>
      <div class="field-row">
        <div class="field"><label>Cost per meal eating out</label><input type="number" step="0.5" id="mp-out" value="12"></div>
        <div class="field"><label>Cost per meal-prepped meal</label><input type="number" step="0.5" id="mp-in" value="3.5"></div>
      </div>
      <div class="field"><label>Meals per week</label><input type="number" id="mp-count" value="5"></div>`;
    function calc() {
      const out = +qs(formEl, '#mp-out').value || 0, inn = +qs(formEl, '#mp-in').value || 0, count = +qs(formEl, '#mp-count').value || 0;
      const weekly = (out - inn) * count;
      resultEl.innerHTML = heroBlock('Yearly savings', fmtGBP(weekly * 52), `${fmtGBP(weekly)} per week`) +
        `<div class="result-rows">${resultRow('Monthly savings', fmtGBP(weekly * 4.33))}${resultRow('Weekly savings', fmtGBP(weekly))}</div>`;
    }
    wireLiveCalc(formEl, calc);
  }
};
