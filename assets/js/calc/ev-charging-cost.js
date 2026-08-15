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

/* ---------------- EV charging cost ---------------- */
CALCULATORS['ev-charging-cost'] = {
  render(formEl, resultEl) {
    formEl.innerHTML = `
      <h3>Charging details</h3>
      <div class="field-row">
        <div class="field"><label>Battery size (kWh)</label><input type="number" id="ev-battery" value="60"></div>
        <div class="field"><label>Electricity price (p/kWh)</label><input type="number" step="0.1" id="ev-price" value="28"></div>
      </div>
      <div class="field-row">
        <div class="field"><label>Current charge (%)</label><input type="number" id="ev-from" value="20"></div>
        <div class="field"><label>Target charge (%)</label><input type="number" id="ev-to" value="80"></div>
      </div>`;
    function calc() {
      const battery = +qs(formEl, '#ev-battery').value || 0;
      const price = +qs(formEl, '#ev-price').value || 0;
      const from = +qs(formEl, '#ev-from').value || 0;
      const to = +qs(formEl, '#ev-to').value || 0;
      if (!battery || to <= from) { resultEl.innerHTML = emptyResult('Enter battery size and a valid charge range'); return; }
      const kwhNeeded = battery * (to - from) / 100;
      const cost = kwhNeeded * price / 100;
      const costPerMile = cost / (kwhNeeded * 3.5); // rough 3.5 mi/kWh assumption for range context
      resultEl.innerHTML = heroBlock('Charging cost', fmtGBP(cost), `${fmtNum(kwhNeeded, 1)} kWh from ${from}% to ${to}%`) +
        `<div class="result-rows">${resultRow('Energy added', `${fmtNum(kwhNeeded, 1)} kWh`)}${resultRow('Price per kWh', `${price}p`)}${resultRow('Total cost', fmtGBP(cost))}</div>` +
        infoNote('Home electricity tariffs vary, especially with EV/off-peak tariffs which can be significantly cheaper overnight. Public rapid chargers are typically priced higher per kWh than home charging.');
    }
    wireLiveCalc(formEl, calc);
  }
};
