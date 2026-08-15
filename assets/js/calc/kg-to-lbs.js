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

/* ---------------- KG to Lbs ---------------- */
CALCULATORS['kg-to-lbs'] = {
  render(formEl, resultEl) {
    formEl.innerHTML = `
      <h3>Convert weight</h3>
      <div class="seg" data-seg="dir"><button data-value="kg" class="active">KG → Pounds</button><button data-value="lb">Pounds → KG</button></div>
      <div class="field" style="margin-top:16px" data-group="kg">
        <label>Weight (kg)</label>
        <input type="number" id="ktl-kg" value="70" step="0.1">
      </div>
      <div class="field" data-group="lb" style="display:none">
        <label>Weight (lb)</label>
        <input type="number" id="ktl-lb" value="154" step="0.1">
      </div>`;
    let dir = 'kg';
    segControl(formEl, 'dir', v => {
      dir = v;
      formEl.querySelector('[data-group="kg"]').style.display = v === 'kg' ? '' : 'none';
      formEl.querySelector('[data-group="lb"]').style.display = v === 'lb' ? '' : 'none';
      calc();
    });
    function calc() {
      if (dir === 'kg') {
        const kg = +qs(formEl, '#ktl-kg').value || 0;
        if (!kg) { resultEl.innerHTML = emptyResult('Enter a weight in kilograms'); return; }
        const lb = kg * 2.2046226218;
        resultEl.innerHTML = heroBlock(`${fmtNum(kg, 1)} kg =`, `${fmtNum(lb, 2)} lb`, `${fmtNum(lb / 14, 3)} stone`) +
          `<div class="result-rows">${resultRow('In stone & pounds', `${Math.floor(lb / 14)}st ${fmtNum(lb - Math.floor(lb / 14) * 14, 1)}lb`)}${resultRow('In ounces', `${fmtNum(lb * 16, 1)} oz`)}</div>` +
          infoNote('1 kilogram = 2.20462 pounds exactly (2.2046226218 to 10 significant figures).');
      } else {
        const lb = +qs(formEl, '#ktl-lb').value || 0;
        if (!lb) { resultEl.innerHTML = emptyResult('Enter a weight in pounds'); return; }
        const kg = lb * 0.45359237;
        resultEl.innerHTML = heroBlock(`${fmtNum(lb, 1)} lb =`, `${fmtNum(kg, 2)} kg`, `${fmtNum(kg / 1000, 4)} tonnes`) +
          `<div class="result-rows">${resultRow('In grams', `${fmtNum(kg * 1000, 0)} g`)}</div>` +
          infoNote('1 pound = 0.45359237 kilograms exactly — this is the internationally defined conversion factor.');
      }
    }
    wireLiveCalc(formEl, calc);
  }
};
