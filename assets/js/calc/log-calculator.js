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

/* ---------------- Logarithm calculator ---------------- */
CALCULATORS['log-calculator'] = {
  render(formEl, resultEl) {
    formEl.innerHTML = `
      <h3>Logarithm</h3>
      <div class="field-row">
        <div class="field"><label>Number</label><input type="number" id="log-n" value="100"></div>
        <div class="field"><label>Base</label><input type="number" id="log-base" value="10"></div>
      </div>`;
    function calc() {
      const n = +qs(formEl, '#log-n').value || 0;
      const base = +qs(formEl, '#log-base').value || 0;
      if (n <= 0 || base <= 0 || base === 1) { resultEl.innerHTML = emptyResult('Enter a positive number and a valid base (not 1)'); return; }
      const result = Math.log(n) / Math.log(base);
      resultEl.innerHTML = heroBlock(`log${base}(${n})`, fmtNum(result, 6), `Natural log: ${fmtNum(Math.log(n), 6)}`) +
        `<div class="result-rows">${resultRow('log base ' + base, fmtNum(result, 6))}${resultRow('Natural log (ln)', fmtNum(Math.log(n), 6))}${resultRow('log base 10', fmtNum(Math.log10(n), 6))}</div>`;
    }
    wireLiveCalc(formEl, calc);
  }
};
