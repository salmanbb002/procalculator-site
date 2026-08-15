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

/* ---------------- KG to Stone ---------------- */
CALCULATORS['kg-to-stone'] = {
  render(formEl, resultEl) {
    formEl.innerHTML = `
      <h3>Convert weight</h3>
      <div class="field"><label>Weight (kg)</label><input type="number" id="kts-kg" value="70" step="0.1"></div>`;
    function calc() {
      const kg = +qs(formEl, '#kts-kg').value || 0;
      if (!kg) { resultEl.innerHTML = emptyResult('Enter a weight in kilograms'); return; }
      const lbs = kg / 0.45359237;
      const stone = Math.floor(lbs / 14);
      const remLb = lbs - stone * 14;
      resultEl.innerHTML = heroBlock(`${fmtNum(kg, 1)} kg =`, `${stone}st ${fmtNum(remLb, 1)}lb`, `${fmtNum(lbs / 14, 3)} stone (decimal)`) +
        `<div class="result-rows">${resultRow('In pounds', `${fmtNum(lbs, 1)} lb`)}${resultRow('Decimal stone', fmtNum(lbs / 14, 3))}</div>` +
        infoNote('1 kilogram = 2.20462 pounds; 1 stone = 14 pounds.');
    }
    wireLiveCalc(formEl, calc);
  }
};
