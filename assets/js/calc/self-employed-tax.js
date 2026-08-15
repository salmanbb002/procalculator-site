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

/* ---------------- Self-employed tax ---------------- */
CALCULATORS['self-employed-tax'] = {
  render(formEl, resultEl) {
    formEl.innerHTML = `
      <h3>Your profit</h3>
      <div class="field"><label>Annual profit (after expenses)</label><input type="number" id="se-profit" value="35000"></div>`;
    function calc() {
      const profit = +qs(formEl, '#se-profit').value || 0;
      if (!profit) { resultEl.innerHTML = emptyResult('Enter your annual profit'); return; }
      const personalAllowance = profit > 100000 ? Math.max(0, 12570 - (profit - 100000) / 2) : 12570;
      const basicBand = 50270, higherBand = 125140;
      const taxable = Math.max(0, profit - personalAllowance);
      const basicPortion = Math.min(taxable, Math.max(0, basicBand - personalAllowance));
      const higherPortion = Math.min(Math.max(0, taxable - basicPortion), Math.max(0, higherBand - basicBand));
      const additionalPortion = Math.max(0, taxable - basicPortion - higherPortion);
      const incomeTax = basicPortion * 0.20 + higherPortion * 0.40 + additionalPortion * 0.45;

      const class4Lower = 12570, class4Upper = 50270;
      let class4 = 0;
      if (profit > class4Lower) {
        class4 += (Math.min(profit, class4Upper) - class4Lower) * 0.06;
        if (profit > class4Upper) class4 += (profit - class4Upper) * 0.02;
      }
      const totalDue = incomeTax + class4;
      const takeHome = profit - totalDue;
      resultEl.innerHTML = heroBlock('Estimated tax + Class 4 NI', fmtGBP(totalDue), `Leaves ${fmtGBP(takeHome)} take-home`) +
        `<div class="result-rows">${resultRow('Income Tax', fmtGBP(incomeTax))}${resultRow('Class 4 NI', fmtGBP(class4))}${resultRow('Estimated take-home', fmtGBP(takeHome))}</div>` +
        infoNote('Simplified estimate using standard England/Wales/NI bands. Class 2 NI rules have changed in recent years — check current gov.uk guidance. Excludes allowable expenses already deducted, student loans and Scottish rates. Not tax advice.');
    }
    wireLiveCalc(formEl, calc);
  }
};
