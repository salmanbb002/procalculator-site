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

/* ---------------- Unit converter ---------------- */
CALCULATORS['unit-converter'] = {
  render(formEl, resultEl) {
    const units = {
      length: { mm: 0.001, cm: 0.01, m: 1, km: 1000, in: 0.0254, ft: 0.3048, yd: 0.9144, mi: 1609.34 },
      weight: { mg: 0.000001, g: 0.001, kg: 1, tonne: 1000, oz: 0.0283495, lb: 0.453592, stone: 6.35029 },
      temperature: null,
    };
    formEl.innerHTML = `
      <h3>Convert units</h3>
      <div class="field"><label>Category</label>
        <select id="uc-cat"><option value="length">Length</option><option value="weight">Weight</option><option value="temperature">Temperature</option></select>
      </div>
      <div class="field-row">
        <div class="field"><label>Value</label><input type="number" id="uc-value" value="100"></div>
        <div class="field"><label>From</label><select id="uc-from"></select></div>
      </div>
      <div class="field"><label>To</label><select id="uc-to"></select></div>`;
    const fromSel = qs(formEl, '#uc-from'), toSel = qs(formEl, '#uc-to'), catSel = qs(formEl, '#uc-cat');
    function populate() {
      const cat = catSel.value;
      const keys = cat === 'temperature' ? ['C', 'F', 'K'] : Object.keys(units[cat]);
      fromSel.innerHTML = keys.map(k => `<option value="${k}">${k}</option>`).join('');
      toSel.innerHTML = keys.map((k, i) => `<option value="${k}" ${i === 1 ? 'selected' : ''}>${k}</option>`).join('');
    }
    function toCelsius(v, unit) { return unit === 'C' ? v : unit === 'F' ? (v - 32) * 5 / 9 : v - 273.15; }
    function fromCelsius(v, unit) { return unit === 'C' ? v : unit === 'F' ? v * 9 / 5 + 32 : v + 273.15; }
    function calc() {
      const cat = catSel.value, value = +qs(formEl, '#uc-value').value || 0;
      const from = fromSel.value, to = toSel.value;
      let result;
      if (cat === 'temperature') { result = fromCelsius(toCelsius(value, from), to); }
      else { result = (value * units[cat][from]) / units[cat][to]; }
      resultEl.innerHTML = heroBlock(`${fmtNum(value)} ${from} =`, `${fmtNum(result, 4)} ${to}`) +
        infoNote(`1 ${from} = ${fmtNum(cat === 'temperature' ? fromCelsius(toCelsius(1, from), to) : units[cat][from] / units[cat][to], 6)} ${to}`);
    }
    catSel.addEventListener('change', () => { populate(); calc(); });
    populate();
    wireLiveCalc(formEl, calc);
  }
};
