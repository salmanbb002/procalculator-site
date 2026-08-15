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

/* ---------------- Car finance PCP/HP ---------------- */
CALCULATORS['car-finance-pcp'] = {
  render(formEl, resultEl) {
    formEl.innerHTML = `
      <h3>Finance details</h3>
      <div class="field"><label>Cash price</label><input type="number" id="cf-price" value="24000"></div>
      <div class="field-row">
        <div class="field"><label>Deposit</label><input type="number" id="cf-deposit" value="3000"></div>
        <div class="field"><label>Balloon / GFV (0 for HP)</label><input type="number" id="cf-gfv" value="9000"></div>
      </div>
      <div class="field-row">
        <div class="field"><label>APR (%)</label><input type="number" step="0.1" id="cf-apr" value="7.9"></div>
        <div class="field"><label>Term (months)</label><input type="number" id="cf-term" value="36"></div>
      </div>`;
    function calc() {
      const price = +qs(formEl, '#cf-price').value || 0, deposit = +qs(formEl, '#cf-deposit').value || 0;
      const gfv = +qs(formEl, '#cf-gfv').value || 0, apr = +qs(formEl, '#cf-apr').value || 0, n = +qs(formEl, '#cf-term').value || 0;
      const financeAmount = price - deposit - gfv;
      if (!price || !n || financeAmount <= 0) { resultEl.innerHTML = emptyResult('Check your price, deposit and balloon amount'); return; }
      const r = apr / 100 / 12;
      const monthly = r === 0 ? financeAmount / n : financeAmount * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
      const totalPayable = deposit + monthly * n + gfv;
      resultEl.innerHTML = heroBlock('Estimated monthly payment', fmtGBP(monthly), `Over ${n} months at ${apr}% APR`) +
        `<div class="result-rows">${resultRow('Amount financed', fmtGBP(financeAmount))}${resultRow('Optional final payment (GFV)', fmtGBP(gfv))}${resultRow('Total payable', fmtGBP(totalPayable))}</div>` +
        infoNote('Simplified estimate — real PCP/HP quotes depend on the lender\'s specific rate calculation and fees.');
    }
    wireLiveCalc(formEl, calc);
  }
};
