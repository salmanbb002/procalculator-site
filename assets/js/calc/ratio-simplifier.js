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

/* ---------------- Ratio simplifier ---------------- */
CALCULATORS['ratio-simplifier'] = {
  render(formEl, resultEl) {
    formEl.innerHTML = `
      <h3>Your ratio</h3>
      <div class="field-row">
        <div class="field"><label>First value</label><input type="number" id="rs-a" value="16"></div>
        <div class="field"><label>Second value</label><input type="number" id="rs-b" value="24"></div>
      </div>`;
    function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { [a, b] = [b, a % b]; } return a; }
    function calc() {
      const a = +qs(formEl, '#rs-a').value || 0;
      const b = +qs(formEl, '#rs-b').value || 0;
      if (!a || !b) { resultEl.innerHTML = emptyResult('Enter both values'); return; }
      const divisor = gcd(Math.round(a), Math.round(b));
      const simpleA = a / divisor, simpleB = b / divisor;
      resultEl.innerHTML = heroBlock('Simplified ratio', `${fmtNum(simpleA, 0)} : ${fmtNum(simpleB, 0)}`, `From ${a} : ${b}`) +
        `<div class="result-rows">${resultRow('Greatest common divisor', divisor)}${resultRow('Decimal equivalent', fmtNum(simpleA / simpleB, 4))}</div>`;
    }
    wireLiveCalc(formEl, calc);
  }
};
