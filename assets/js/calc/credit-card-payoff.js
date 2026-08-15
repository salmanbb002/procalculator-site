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

/* ---------------- Credit card payoff ---------------- */
CALCULATORS['credit-card-payoff'] = {
  render(formEl, resultEl) {
    formEl.innerHTML = `
      <h3>Your balance</h3>
      <div class="field-row">
        <div class="field"><label>Current balance</label><input type="number" id="cc-balance" value="2500"></div>
        <div class="field"><label>APR (%)</label><input type="number" step="0.1" id="cc-apr" value="24.9"></div>
      </div>
      <div class="field"><label>Monthly payment</label><input type="number" id="cc-payment" value="150"></div>`;
    function calc() {
      const balance = +qs(formEl, '#cc-balance').value || 0;
      const apr = +qs(formEl, '#cc-apr').value || 0;
      const payment = +qs(formEl, '#cc-payment').value || 0;
      if (!balance || !payment) { resultEl.innerHTML = emptyResult('Enter your balance and monthly payment'); return; }
      const monthlyRate = apr / 100 / 12;
      const minPaymentNeeded = balance * monthlyRate;
      if (payment <= minPaymentNeeded) {
        resultEl.innerHTML = heroBlock('Payment too low', '—', 'This payment never clears the balance') +
          infoNote(`At ${apr}% APR, interest alone costs ${fmtGBP(minPaymentNeeded)}/month — increase your monthly payment above this to make progress.`);
        return;
      }
      let bal = balance, months = 0, totalPaid = 0;
      while (bal > 0 && months < 1200) {
        const interest = bal * monthlyRate;
        const principal = Math.min(bal, payment - interest);
        bal -= principal;
        totalPaid += Math.min(payment, principal + interest);
        months++;
      }
      const totalInterest = totalPaid - balance;
      const years = Math.floor(months / 12), remMonths = months % 12;
      resultEl.innerHTML = heroBlock('Time to pay off', `${months} months`, `${years > 0 ? years + 'y ' : ''}${remMonths}m at ${fmtGBP(payment)}/month`) +
        `<div class="result-rows">${resultRow('Starting balance', fmtGBP(balance))}${resultRow('Total interest paid', fmtGBP(totalInterest))}${resultRow('Total repaid', fmtGBP(totalPaid))}</div>` +
        infoNote('Assumes no further spending on the card and a fixed monthly payment. Real card interest calculations vary by provider (daily vs monthly compounding).');
    }
    wireLiveCalc(formEl, calc);
  }
};
