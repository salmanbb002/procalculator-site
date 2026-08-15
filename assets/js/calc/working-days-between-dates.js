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

/* ---------------- Working days calculator ---------------- */
CALCULATORS['working-days-between-dates'] = {
  render(formEl, resultEl) {
    formEl.innerHTML = `
      <h3>Date range</h3>
      <div class="field-row">
        <div class="field"><label>Start date</label><input type="date" id="wd-start"></div>
        <div class="field"><label>End date</label><input type="date" id="wd-end"></div>
      </div>`;
    const today = new Date();
    qs(formEl, '#wd-start').value = today.toISOString().slice(0, 10);
    const later = new Date(today); later.setDate(later.getDate() + 30);
    qs(formEl, '#wd-end').value = later.toISOString().slice(0, 10);
    function calc() {
      const start = new Date(qs(formEl, '#wd-start').value);
      const end = new Date(qs(formEl, '#wd-end').value);
      if (isNaN(start) || isNaN(end) || end < start) { resultEl.innerHTML = emptyResult('Enter a valid date range'); return; }
      let workingDays = 0, totalDays = 0;
      const cur = new Date(start);
      while (cur <= end) {
        totalDays++;
        const day = cur.getDay();
        if (day !== 0 && day !== 6) workingDays++;
        cur.setDate(cur.getDate() + 1);
      }
      resultEl.innerHTML = heroBlock('Working days', workingDays, `Out of ${totalDays} total days`) +
        `<div class="result-rows">${resultRow('Total days', totalDays)}${resultRow('Working days (Mon-Fri)', workingDays)}${resultRow('Weekend days', totalDays - workingDays)}</div>` +
        infoNote('Excludes Saturdays and Sundays only. Doesn\'t exclude bank holidays automatically — subtract those separately if needed for your specific date range and nation.');
    }
    wireLiveCalc(formEl, calc);
  }
};
