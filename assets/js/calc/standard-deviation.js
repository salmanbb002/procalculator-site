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

/* ---------------- Standard deviation ---------------- */
CALCULATORS['standard-deviation'] = {
  render(formEl, resultEl) {
    formEl.innerHTML = `
      <h3>Enter your data</h3>
      <div class="field"><label>Numbers (comma or space separated)</label><textarea id="sd-data" rows="4">4, 8, 6, 5, 3, 9, 7</textarea><span class="hint">Example: 4, 8, 6, 5, 3, 9, 7</span></div>`;
    function calc() {
      const raw = qs(formEl, '#sd-data').value;
      const nums = raw.split(/[\s,]+/).map(Number).filter(n => !isNaN(n) && raw.trim() !== '');
      if (nums.length < 2) { resultEl.innerHTML = emptyResult('Enter at least two numbers'); return; }
      const mean = nums.reduce((a, b) => a + b, 0) / nums.length;
      const sqDiffs = nums.map(n => Math.pow(n - mean, 2));
      const popVariance = sqDiffs.reduce((a, b) => a + b, 0) / nums.length;
      const sampleVariance = sqDiffs.reduce((a, b) => a + b, 0) / (nums.length - 1);
      resultEl.innerHTML = heroBlock('Standard deviation (sample)', fmtNum(Math.sqrt(sampleVariance), 3)) +
        `<div class="result-rows">${resultRow('Count', nums.length)}${resultRow('Mean', fmtNum(mean, 3))}${resultRow('Sample variance', fmtNum(sampleVariance, 3))}${resultRow('Population std. dev.', fmtNum(Math.sqrt(popVariance), 3))}</div>`;
    }
    wireLiveCalc(formEl, calc);
  }
};
