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

/* ---------------- Salary take-home ---------------- */
CALCULATORS['salary-take-home'] = {
  render(formEl, resultEl) {
    formEl.innerHTML = `
      <h3>Your income</h3>
      <div class="field"><label>Annual gross salary</label><input type="number" id="s-gross" value="38000"></div>
      <div class="field"><label>Pension contribution (% of salary, salary sacrifice)</label><input type="number" id="s-pension" value="5"></div>`;
    function calc() {
      const gross = +qs(formEl, '#s-gross').value || 0;
      const pensionPct = +qs(formEl, '#s-pension').value || 0;
      if (!gross) { resultEl.innerHTML = emptyResult('Enter your annual salary'); return; }
      const pensionAmt = gross * pensionPct / 100;
      let taxableIncome = gross - pensionAmt;

      let personalAllowance = 12570;
      if (taxableIncome > 100000) personalAllowance = Math.max(0, 12570 - (taxableIncome - 100000) / 2);

      const basicBand = 50270, higherBand = 125140;
      let tax = 0;
      const taxable = Math.max(0, taxableIncome - personalAllowance);
      const basicPortion = Math.min(taxable, Math.max(0, basicBand - personalAllowance));
      const higherPortion = Math.min(Math.max(0, taxable - basicPortion), Math.max(0, higherBand - basicBand));
      const additionalPortion = Math.max(0, taxable - basicPortion - higherPortion);
      tax = basicPortion * 0.20 + higherPortion * 0.40 + additionalPortion * 0.45;

      const niPrimary = 12570, niUpper = 50270;
      let ni = 0;
      if (taxableIncome > niPrimary) {
        const niBasic = Math.min(taxableIncome, niUpper) - niPrimary;
        ni += Math.max(0, niBasic) * 0.08;
        if (taxableIncome > niUpper) ni += (taxableIncome - niUpper) * 0.02;
      }

      const takeHome = taxableIncome - tax - ni;
      const monthly = takeHome / 12;
      const effectiveRate = gross ? ((tax + ni) / gross) * 100 : 0;

      resultEl.innerHTML = heroBlock('Monthly take-home', fmtGBP(monthly), `${fmtGBP(takeHome)} per year`) +
        `<div class="result-rows">
          ${resultRow('Gross salary', fmtGBP(gross))}
          ${resultRow('Pension contribution', fmtGBP(pensionAmt))}
          ${resultRow('Income Tax', fmtGBP(tax))}
          ${resultRow('National Insurance', fmtGBP(ni))}
          ${resultRow('Effective tax + NI rate', fmtNum(effectiveRate, 1) + '%')}
        </div>` +
        infoNote('Simplified estimate using standard England/Wales/NI tax bands. Excludes student loans, benefits-in-kind and Scottish tax rates. Not financial advice.');
    }
    wireLiveCalc(formEl, calc);
  }
};
