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

/* ---------------- Fuel cost / MPG ---------------- */
CALCULATORS['fuel-cost-mpg'] = {
  render(formEl, resultEl) {
    formEl.innerHTML = `
      <h3>Trip details</h3>
      <div class="field-row">
        <div class="field"><label>Distance (miles)</label><input type="number" id="fc-dist" value="200"></div>
        <div class="field"><label>Fuel economy (MPG)</label><input type="number" id="fc-mpg" value="45"></div>
      </div>
      <div class="field"><label>Fuel price (£ per litre)</label><input type="number" step="0.01" id="fc-price" value="1.48"></div>`;
    function calc() {
      const dist = +qs(formEl, '#fc-dist').value || 0, mpg = +qs(formEl, '#fc-mpg').value || 0, price = +qs(formEl, '#fc-price').value || 0;
      if (!dist || !mpg) { resultEl.innerHTML = emptyResult('Enter distance and MPG'); return; }
      const l100km = 282.481 / mpg;
      const km = dist * 1.60934;
      const litresUsed = (km / 100) * l100km;
      const cost = litresUsed * price;
      resultEl.innerHTML = heroBlock('Trip fuel cost', fmtGBP(cost), `${fmtNum(litresUsed, 1)} litres used`) +
        `<div class="result-rows">${resultRow('Fuel economy', `${fmtNum(l100km, 1)} L/100km`)}${resultRow('Distance', `${dist} miles (${fmtNum(km, 0)} km)`)}</div>`;
    }
    wireLiveCalc(formEl, calc);
  }
};
