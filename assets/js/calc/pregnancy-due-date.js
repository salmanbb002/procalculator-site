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

/* ---------------- Pregnancy due date ---------------- */
CALCULATORS['pregnancy-due-date'] = {
  render(formEl, resultEl) {
    const today = new Date().toISOString().split('T')[0];
    formEl.innerHTML = `
      <h3>First day of your last period</h3>
      <div class="field"><label>Last menstrual period (LMP) date</label><input type="date" id="pg-lmp" value="${today}"></div>`;
    function calc() {
      const lmpVal = qs(formEl, '#pg-lmp').value;
      if (!lmpVal) { resultEl.innerHTML = emptyResult('Select the first day of your last period'); return; }
      const lmp = new Date(lmpVal + 'T00:00:00');
      const due = new Date(lmp.getTime() + 280 * 86400000);
      const now = new Date();
      const daysSince = Math.floor((now - lmp) / 86400000);
      const weeks = Math.floor(daysSince / 7), days = daysSince % 7;
      const dueStr = due.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
      let trimester = 'Not yet started';
      if (daysSince >= 0 && daysSince < 280) trimester = daysSince < 91 ? 'First trimester' : daysSince < 189 ? 'Second trimester' : 'Third trimester';
      resultEl.innerHTML = heroBlock('Estimated due date', dueStr, '40 weeks from LMP') +
        `<div class="result-rows">${resultRow('Current gestation', daysSince >= 0 ? `${weeks}w ${days}d` : '—')}${resultRow('Trimester', trimester)}</div>` +
        infoNote('Based on a standard 280-day (40-week) pregnancy from your last period. Your midwife may adjust this after a scan.');
    }
    wireLiveCalc(formEl, calc);
  }
};
