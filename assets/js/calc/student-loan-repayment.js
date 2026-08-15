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

/* ---------------- Student loan repayment calculator ---------------- */
CALCULATORS['student-loan-repayment'] = {
  render(formEl, resultEl) {
    const PLANS = {
      plan1: { threshold: 24990, rate: 0.09, label: 'Plan 1' },
      plan2: { threshold: 27295, rate: 0.09, label: 'Plan 2' },
      plan4: { threshold: 31395, rate: 0.09, label: 'Plan 4 (Scotland)' },
      plan5: { threshold: 25000, rate: 0.09, label: 'Plan 5' },
      postgrad: { threshold: 21000, rate: 0.06, label: 'Postgraduate Loan' },
    };
    formEl.innerHTML = `
      <h3>Your loan</h3>
      <div class="field"><label>Plan type</label>
        <select id="sl-plan">${Object.entries(PLANS).map(([k, v]) => `<option value="${k}">${v.label}</option>`).join('')}</select>
      </div>
      <div class="field"><label>Annual gross salary</label><input type="number" id="sl-salary" value="32000"></div>`;
    formEl.querySelector('#sl-plan').addEventListener('change', calc);
    function calc() {
      const plan = PLANS[qs(formEl, '#sl-plan').value];
      const salary = +qs(formEl, '#sl-salary').value || 0;
      if (!salary) { resultEl.innerHTML = emptyResult('Enter your annual salary'); return; }
      const excess = Math.max(0, salary - plan.threshold);
      const annualRepayment = excess * plan.rate;
      const monthlyRepayment = annualRepayment / 12;
      resultEl.innerHTML = heroBlock('Monthly repayment', fmtGBP(monthlyRepayment), `${plan.label}, ${fmtNum(plan.rate * 100, 0)}% above ${fmtGBP(plan.threshold)}`) +
        `<div class="result-rows">${resultRow('Repayment threshold', fmtGBP(plan.threshold))}${resultRow('Income above threshold', fmtGBP(excess))}${resultRow('Annual repayment', fmtGBP(annualRepayment))}</div>` +
        infoNote('Uses standard plan repayment rates and thresholds — these are reviewed and can change (thresholds are usually adjusted, sometimes annually). Always confirm your specific plan and current threshold on gov.uk or via the Student Loans Company.');
    }
    wireLiveCalc(formEl, calc);
  }
};
