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

/* ---------------- Mortgage ---------------- */
CALCULATORS['mortgage-repayment'] = {
  render(formEl, resultEl) {
    formEl.innerHTML = `
      <h3>Mortgage details</h3>
      <div class="field"><label>Loan amount</label><input type="number" id="m-amount" value="250000"></div>
      <div class="field-row">
        <div class="field"><label>Interest rate (% p.a.)</label><input type="number" step="0.01" id="m-rate" value="4.5"></div>
        <div class="field"><label>Term (years)</label><input type="number" id="m-term" value="25"></div>
      </div>
      <div class="field"><label>Repayment type</label>
        <div class="seg" data-seg="type"><button data-value="repayment" class="active">Repayment</button><button data-value="interest-only">Interest only</button></div>
      </div>`;
    segControl(formEl, 'type', calc);
    function calc() {
      const P = +qs(formEl, '#m-amount').value || 0;
      const rate = +qs(formEl, '#m-rate').value || 0;
      const years = +qs(formEl, '#m-term').value || 0;
      const type = segValue(formEl, 'type');
      if (!P || !years) { resultEl.innerHTML = emptyResult('Enter your mortgage details'); return; }
      const r = rate / 100 / 12, n = years * 12;
      let monthly, totalPaid, totalInterest;
      if (type === 'interest-only') {
        monthly = P * (rate / 100 / 12);
        totalInterest = monthly * n;
        totalPaid = totalInterest + P;
      } else {
        monthly = r === 0 ? P / n : P * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
        totalPaid = monthly * n;
        totalInterest = totalPaid - P;
      }
      resultEl.innerHTML = heroBlock('Monthly payment', fmtGBP(monthly), `Over ${years} years at ${rate}%`) +
        `<div class="result-rows">${resultRow('Loan amount', fmtGBP(P))}${resultRow('Total repaid', fmtGBP(totalPaid))}${resultRow('Total interest', fmtGBP(totalInterest))}</div>` +
        infoNote('Estimate only — excludes fees, insurance and rate changes. Speak to a mortgage adviser for a formal quote.');
    }
    wireLiveCalc(formEl, calc);
  }
};
