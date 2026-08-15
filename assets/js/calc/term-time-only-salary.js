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

/* ---------------- Term-time only salary calculator ---------------- */
CALCULATORS['term-time-only-salary'] = {
  render(formEl, resultEl) {
    formEl.innerHTML = `
      <h3>Salary details</h3>
      <div class="field"><label>Full-year equivalent salary</label><input type="number" id="tt-salary" value="24000"></div>
      <div class="field-row">
        <div class="field"><label>Weeks worked per year</label><input type="number" id="tt-weeks" value="39"></div>
        <div class="field"><label>Include holiday pay weeks</label><input type="number" id="tt-holiday" value="5.6"></div>
      </div>`;
    function calc() {
      const salary = +qs(formEl, '#tt-salary').value || 0;
      const weeks = +qs(formEl, '#tt-weeks').value || 0;
      const holiday = +qs(formEl, '#tt-holiday').value || 0;
      if (!salary || !weeks) { resultEl.innerHTML = emptyResult('Enter salary and weeks worked'); return; }
      const paidWeeks = weeks + holiday;
      const proRated = salary * (paidWeeks / 52.14);
      resultEl.innerHTML = heroBlock('Term-time-only salary', fmtGBP(proRated), `${fmtNum(paidWeeks, 1)} paid weeks of 52.14`) +
        `<div class="result-rows">${resultRow('Full-year equivalent', fmtGBP(salary))}${resultRow('Weeks worked', weeks)}${resultRow('Holiday pay weeks', holiday)}${resultRow('Monthly (spread over 12)', fmtGBP(proRated / 12))}</div>` +
        infoNote('Pro-rates the full-year salary by paid weeks (worked + statutory holiday entitlement) out of 52.14 weeks in a year. Many term-time-only roles have pay spread evenly across 12 months rather than paid only in worked weeks — check your specific contract.');
    }
    wireLiveCalc(formEl, calc);
  }
};
