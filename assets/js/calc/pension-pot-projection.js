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

/* ---------------- Pension pot projection ---------------- */
CALCULATORS['pension-pot-projection'] = {
  render(formEl, resultEl) {
    formEl.innerHTML = `
      <h3>Your pension</h3>
      <div class="field-row">
        <div class="field"><label>Current age</label><input type="number" id="pp-age" value="35"></div>
        <div class="field"><label>Retirement age</label><input type="number" id="pp-retire" value="67"></div>
      </div>
      <div class="field-row">
        <div class="field"><label>Current pot</label><input type="number" id="pp-pot" value="20000"></div>
        <div class="field"><label>Monthly contribution (you + employer)</label><input type="number" id="pp-monthly" value="300"></div>
      </div>
      <div class="field"><label>Growth rate (% p.a.)</label><input type="number" step="0.1" id="pp-rate" value="5"></div>`;
    function calc() {
      const age = +qs(formEl, '#pp-age').value || 0;
      const retire = +qs(formEl, '#pp-retire').value || 0;
      const pot = +qs(formEl, '#pp-pot').value || 0;
      const monthly = +qs(formEl, '#pp-monthly').value || 0;
      const rate = +qs(formEl, '#pp-rate').value || 0;
      const years = retire - age;
      if (years <= 0) { resultEl.innerHTML = emptyResult('Retirement age must be after current age'); return; }
      const monthlyRate = rate / 100 / 12;
      let balance = pot;
      let contributed = pot;
      for (let i = 0; i < years * 12; i++) {
        balance = balance * (1 + monthlyRate) + monthly;
        contributed += monthly;
      }
      resultEl.innerHTML = heroBlock('Projected pot at retirement', fmtGBP(balance), `In ${years} years, aged ${retire}`) +
        `<div class="result-rows">${resultRow('Total contributed', fmtGBP(contributed))}${resultRow('Estimated growth', fmtGBP(balance - contributed))}</div>` +
        infoNote('Illustrative projection only — real pension growth depends on fund performance, fees and charges, which vary significantly. Not financial advice.');
    }
    wireLiveCalc(formEl, calc);
  }
};
