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

/* ---------------- Loan repayment ---------------- */
CALCULATORS['loan-repayment'] = {
  render(formEl, resultEl) {
    formEl.innerHTML = `
      <h3>Loan details</h3>
      <div class="field"><label>Loan amount</label><input type="number" id="l-amount" value="12000"></div>
      <div class="field-row">
        <div class="field"><label>APR (%)</label><input type="number" step="0.1" id="l-rate" value="8.9"></div>
        <div class="field"><label>Term (months)</label><input type="number" id="l-term" value="48"></div>
      </div>`;
    function calc() {
      const P = +qs(formEl, '#l-amount').value || 0;
      const rate = +qs(formEl, '#l-rate').value || 0;
      const n = +qs(formEl, '#l-term').value || 0;
      if (!P || !n) { resultEl.innerHTML = emptyResult('Enter your loan details'); return; }
      const r = rate / 100 / 12;
      const monthly = r === 0 ? P / n : P * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
      const totalPaid = monthly * n;
      resultEl.innerHTML = heroBlock('Monthly repayment', fmtGBP(monthly), `Over ${n} months at ${rate}% APR`) +
        `<div class="result-rows">${resultRow('Loan amount', fmtGBP(P))}${resultRow('Total repayable', fmtGBP(totalPaid))}${resultRow('Total interest', fmtGBP(totalPaid - P))}</div>`;
    }
    wireLiveCalc(formEl, calc);
  }
};
