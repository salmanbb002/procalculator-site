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

/* ---------------- Road Tax (VED) estimator ---------------- */
CALCULATORS['road-tax-estimator'] = {
  render(formEl, resultEl) {
    formEl.innerHTML = `
      <h3>Vehicle details</h3>
      <div class="field"><label>When was the car first registered?</label>
        <div class="seg" data-seg="age"><button data-value="new" class="active">First year (new)</button><button data-value="standard">2nd year onwards</button></div>
      </div>
      <div class="field" data-group="new"><label>CO2 emissions (g/km)</label><input type="number" id="rt-co2" value="120"></div>
      <div class="field"><label>List price when new</label><input type="number" id="rt-price" value="30000"></div>`;
    segControl(formEl, 'age', () => { formEl.querySelector('[data-group="new"]').style.display = segValue(formEl, 'age') === 'new' ? '' : 'none'; calc(); });
    const CO2_BANDS = [
      [0, 0], [50, 10], [75, 30], [90, 135], [100, 175], [110, 195], [130, 220], [150, 270], [170, 680], [190, 1095], [225, 1650], [255, 2340], [Infinity, 2745]
    ];
    function calc() {
      const age = segValue(formEl, 'age');
      const price = +qs(formEl, '#rt-price').value || 0;
      const STANDARD_RATE = 190;
      const EXPENSIVE_SUPPLEMENT = 410;
      let tax;
      if (age === 'new') {
        const co2 = +qs(formEl, '#rt-co2').value || 0;
        const band = CO2_BANDS.find(b => co2 <= b[0]) || CO2_BANDS[CO2_BANDS.length - 1];
        tax = band[1];
      } else {
        tax = STANDARD_RATE + (price > 40000 ? EXPENSIVE_SUPPLEMENT : 0);
      }
      resultEl.innerHTML = heroBlock('Estimated annual VED', fmtGBP(tax), age === 'new' ? 'First-year rate (CO2-based)' : 'Standard rate') +
        `<div class="result-rows">${resultRow('Vehicle stage', age === 'new' ? 'First year' : 'Standard (year 2+)')}${price > 40000 && age !== 'new' ? resultRow('Includes expensive car supplement', 'Yes (list price over £40,000)') : ''}</div>` +
        infoNote('Illustrative estimate using the current-era CO2-banded VED structure for petrol/diesel cars. Electric vehicles, motorcycles, vans and pre-2017 registered cars use different rules, and rates change — always confirm on gov.uk.');
    }
    wireLiveCalc(formEl, calc);
  }
};
