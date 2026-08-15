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

/* ---------------- Quadratic solver ---------------- */
CALCULATORS['quadratic-solver'] = {
  render(formEl, resultEl) {
    formEl.innerHTML = `
      <h3>ax² + bx + c = 0</h3>
      <div class="field-row">
        <div class="field"><label>a</label><input type="number" id="q-a" value="1"></div>
        <div class="field"><label>b</label><input type="number" id="q-b" value="-3"></div>
        <div class="field"><label>c</label><input type="number" id="q-c" value="2"></div>
      </div>`;
    function calc() {
      const a = +qs(formEl, '#q-a').value || 0, b = +qs(formEl, '#q-b').value || 0, c = +qs(formEl, '#q-c').value || 0;
      if (!a) { resultEl.innerHTML = emptyResult('"a" cannot be zero in a quadratic equation'); return; }
      const d = b * b - 4 * a * c;
      if (d > 0) {
        const x1 = (-b + Math.sqrt(d)) / (2 * a), x2 = (-b - Math.sqrt(d)) / (2 * a);
        resultEl.innerHTML = heroBlock('Two real roots', `x₁ = ${fmtNum(x1, 4)}`, `x₂ = ${fmtNum(x2, 4)}`) + `<div class="result-rows">${resultRow('Discriminant', fmtNum(d, 4))}</div>`;
      } else if (d === 0) {
        const x = -b / (2 * a);
        resultEl.innerHTML = heroBlock('One real root', `x = ${fmtNum(x, 4)}`) + `<div class="result-rows">${resultRow('Discriminant', '0')}</div>`;
      } else {
        const re = (-b / (2 * a)).toFixed(4), im = (Math.sqrt(-d) / (2 * a)).toFixed(4);
        resultEl.innerHTML = heroBlock('Two complex roots', `${re} ± ${im}i`) + `<div class="result-rows">${resultRow('Discriminant', fmtNum(d, 4))}</div>`;
      }
    }
    wireLiveCalc(formEl, calc);
  }
};
