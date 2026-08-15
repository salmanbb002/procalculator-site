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

/* ---------------- Childcare cost estimator ---------------- */
CALCULATORS['childcare-cost-estimator'] = {
  render(formEl, resultEl) {
    formEl.innerHTML = `
      <h3>Your childcare</h3>
      <div class="field-row">
        <div class="field"><label>Hourly rate (£)</label><input type="number" step="0.01" id="cc-rate" value="6.50"></div>
        <div class="field"><label>Hours per day</label><input type="number" id="cc-hours" value="9"></div>
      </div>
      <div class="field"><label>Days per week</label><input type="number" id="cc-days" value="3"></div>`;
    function calc() {
      const rate = +qs(formEl, '#cc-rate').value || 0;
      const hours = +qs(formEl, '#cc-hours').value || 0;
      const days = +qs(formEl, '#cc-days').value || 0;
      if (!rate || !hours || !days) { resultEl.innerHTML = emptyResult('Enter rate, hours and days'); return; }
      const daily = rate * hours;
      const weekly = daily * days;
      const monthly = (weekly * 52) / 12;
      const annual = weekly * 52;
      resultEl.innerHTML = heroBlock('Monthly cost', fmtGBP(monthly), `${fmtGBP(weekly)}/week`) +
        `<div class="result-rows">${resultRow('Daily cost', fmtGBP(daily))}${resultRow('Weekly cost', fmtGBP(weekly))}${resultRow('Annual cost', fmtGBP(annual))}</div>` +
        infoNote('Uses the rate and hours you enter, since actual childcare costs vary hugely by region and provider. Doesn\'t account for government schemes (free hours, Tax-Free Childcare, Universal Credit childcare element) — check gov.uk for what you may be eligible for.');
    }
    wireLiveCalc(formEl, calc);
  }
};
