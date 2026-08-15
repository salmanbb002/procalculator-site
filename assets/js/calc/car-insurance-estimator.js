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

/* ---------------- Car insurance payment comparator ---------------- */
CALCULATORS['car-insurance-estimator'] = {
  render(formEl, resultEl) {
    formEl.innerHTML = `
      <h3>Your quote</h3>
      <div class="field"><label>Annual premium (paid upfront)</label><input type="number" id="ci-annual" value="600"></div>
      <div class="field-row">
        <div class="field"><label>Monthly price offered</label><input type="number" id="ci-monthly" value="55"></div>
        <div class="field"><label>Deposit (if any)</label><input type="number" id="ci-deposit" value="0"></div>
      </div>`;
    function calc() {
      const annual = +qs(formEl, '#ci-annual').value || 0;
      const monthly = +qs(formEl, '#ci-monthly').value || 0;
      const deposit = +qs(formEl, '#ci-deposit').value || 0;
      if (!annual || !monthly) { resultEl.innerHTML = emptyResult('Enter both the annual and monthly price'); return; }
      const totalMonthlyCost = deposit + monthly * 11; // typical 12-payment plan: deposit + 11 monthly
      const extraCost = totalMonthlyCost - annual;
      const impliedAPR = annual ? (extraCost / annual) * 100 : 0;
      resultEl.innerHTML = heroBlock('Extra cost of paying monthly', fmtGBP(extraCost), `${fmtNum(impliedAPR, 1)}% more than paying annually`) +
        `<div class="result-rows">${resultRow('Pay annually', fmtGBP(annual))}${resultRow('Pay monthly (total)', fmtGBP(totalMonthlyCost))}${resultRow('Extra cost', fmtGBP(extraCost))}</div>` +
        infoNote("Insurers usually charge interest for spreading payments monthly — this compares the two options you enter. This tool doesn't predict your premium, since real quotes depend on dozens of individual rating factors only an insurer can assess.");
    }
    wireLiveCalc(formEl, calc);
  }
};
