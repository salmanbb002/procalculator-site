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

/* ---------------- Time with parents ---------------- */
CALCULATORS['time-with-parents'] = {
  render(formEl, resultEl) {
    formEl.innerHTML = `
      <h3>Estimate your remaining time together</h3>
      <div class="field-row">
        <div class="field"><label>Parent's current age</label><input type="number" id="tp-age" value="68"></div>
        <div class="field"><label>Assumed life expectancy</label><input type="number" id="tp-life" value="82"></div>
      </div>
      <div class="field-row">
        <div class="field"><label>Visits per year</label><input type="number" id="tp-visits" value="12"></div>
        <div class="field"><label>Hours per visit</label><input type="number" id="tp-hours" value="4"></div>
      </div>`;
    function calc() {
      const age = +qs(formEl, '#tp-age').value || 0, life = +qs(formEl, '#tp-life').value || 0;
      const visits = +qs(formEl, '#tp-visits').value || 0, hours = +qs(formEl, '#tp-hours').value || 0;
      const yearsLeft = Math.max(0, life - age);
      const totalHours = yearsLeft * visits * hours;
      resultEl.innerHTML = heroBlock('Estimated time remaining', `${fmtNum(totalHours, 0)} hours`, `≈ ${fmtNum(totalHours / 24, 0)} days together`) +
        `<div class="result-rows">${resultRow('Years remaining (estimate)', yearsLeft)}${resultRow('Total visits', yearsLeft * visits)}</div>` +
        infoNote('A gentle reminder, not a prediction — based on averages you provide. Make the visits count.');
    }
    wireLiveCalc(formEl, calc);
  }
};
