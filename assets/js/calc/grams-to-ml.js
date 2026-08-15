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

/* ---------------- Grams to ML ---------------- */
CALCULATORS['grams-to-ml'] = {
  render(formEl, resultEl) {
    const DENSITIES = {
      water: { label: 'Water', d: 1.00 },
      milk: { label: 'Milk', d: 1.03 },
      flour: { label: 'Plain flour', d: 0.53 },
      sugar: { label: 'Granulated sugar', d: 0.85 },
      oil: { label: 'Vegetable oil', d: 0.92 },
      honey: { label: 'Honey', d: 1.42 },
      butter: { label: 'Melted butter', d: 0.91 },
    };
    formEl.innerHTML = `
      <h3>Convert grams to ml</h3>
      <div class="field"><label>Grams</label><input type="number" id="gtm-val" value="100" step="1"></div>
      <div class="field"><label>Ingredient (density)</label>
        <select id="gtm-density">${Object.entries(DENSITIES).map(([k, v]) => `<option value="${k}" ${k === 'water' ? 'selected' : ''}>${v.label} (${v.d} g/ml)</option>`).join('')}</select>
      </div>`;
    function calc() {
      const g = +qs(formEl, '#gtm-val').value || 0;
      const key = qs(formEl, '#gtm-density').value;
      const density = DENSITIES[key].d;
      if (!g) { resultEl.innerHTML = emptyResult('Enter a weight in grams'); return; }
      const ml = g / density;
      resultEl.innerHTML = heroBlock(`${fmtNum(g, 1)}g ${DENSITIES[key].label.toLowerCase()} =`, `${fmtNum(ml, 1)} ml`) +
        `<div class="result-rows">${resultRow('Density used', `${density} g/ml`)}${resultRow('If pure water instead', `${fmtNum(g, 1)} ml`)}</div>` +
        infoNote('Grams and millilitres are only directly interchangeable for water. For other ingredients, the conversion depends on density — pick the closest match above.');
    }
    wireLiveCalc(formEl, calc);
  }
};
