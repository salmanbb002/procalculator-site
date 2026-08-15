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

/* ---------------- Redundancy pay ---------------- */
CALCULATORS['redundancy-pay'] = {
  render(formEl, resultEl) {
    const CAP = 719;
    formEl.innerHTML = `
      <h3>Your details</h3>
      <div class="field-row">
        <div class="field"><label>Current age</label><input type="number" id="r-age" value="45"></div>
        <div class="field"><label>Full years of service</label><input type="number" id="r-years" value="8"></div>
      </div>
      <div class="field"><label>Weekly pay (before tax)</label><input type="number" id="r-weekly" value="600"></div>`;
    function calc() {
      const age = +qs(formEl, '#r-age').value || 0;
      const years = Math.min(20, +qs(formEl, '#r-years').value || 0);
      const weeklyPay = Math.min(CAP, +qs(formEl, '#r-weekly').value || 0);
      if (!age || !years) { resultEl.innerHTML = emptyResult('Enter your age and length of service'); return; }
      let weeksOwed = 0;
      for (let i = 0; i < years; i++) {
        const ageThatYear = age - i;
        if (ageThatYear < 22) weeksOwed += 0.5;
        else if (ageThatYear <= 40) weeksOwed += 1;
        else weeksOwed += 1.5;
      }
      const total = weeksOwed * weeklyPay;
      resultEl.innerHTML = heroBlock('Estimated redundancy pay', fmtGBP(total), `${fmtNum(weeksOwed, 1)} weeks' pay`) +
        `<div class="result-rows">${resultRow('Capped weekly pay used', fmtGBP(weeklyPay))}${resultRow('Years counted (max 20)', years)}</div>` +
        infoNote(`Uses the statutory weekly pay cap of ${fmtGBP(CAP)}. Check gov.uk for the current cap — this changes each tax year.`);
    }
    wireLiveCalc(formEl, calc);
  }
};
