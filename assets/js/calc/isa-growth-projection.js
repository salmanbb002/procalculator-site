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

/* ---------------- ISA growth projection ---------------- */
CALCULATORS['isa-growth-projection'] = {
  render(formEl, resultEl) {
    formEl.innerHTML = `
      <h3>Your ISA</h3>
      <div class="field-row">
        <div class="field"><label>Starting balance</label><input type="number" id="isa-start" value="5000"></div>
        <div class="field"><label>Monthly contribution</label><input type="number" id="isa-monthly" value="200"></div>
      </div>
      <div class="field-row">
        <div class="field"><label>Growth rate (% p.a.)</label><input type="number" step="0.1" id="isa-rate" value="5"></div>
        <div class="field"><label>Years</label><input type="number" id="isa-years" value="10"></div>
      </div>`;
    function calc() {
      const start = +qs(formEl, '#isa-start').value || 0;
      const monthly = +qs(formEl, '#isa-monthly').value || 0;
      const rate = +qs(formEl, '#isa-rate').value || 0;
      const years = +qs(formEl, '#isa-years').value || 0;
      if (!years) { resultEl.innerHTML = emptyResult('Enter a projection period'); return; }
      const monthlyRate = rate / 100 / 12;
      const months = years * 12;
      let balance = start;
      let contributed = start;
      for (let i = 0; i < months; i++) {
        balance = balance * (1 + monthlyRate) + monthly;
        contributed += monthly;
      }
      const growth = balance - contributed;
      resultEl.innerHTML = heroBlock('Projected balance', fmtGBP(balance), `After ${years} years`) +
        `<div class="result-rows">${resultRow('Total contributed', fmtGBP(contributed))}${resultRow('Estimated growth', fmtGBP(growth))}</div>` +
        infoNote(`Contributions above £${fmtNum(20000,0)}/year exceed the standard annual ISA allowance — check the current allowance on gov.uk. Growth rate is illustrative, not guaranteed.`);
    }
    wireLiveCalc(formEl, calc);
  }
};
