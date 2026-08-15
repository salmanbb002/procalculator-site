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

/* ---------------- Dilution calculator (C1V1=C2V2) ---------------- */
CALCULATORS['dilution-calculator'] = {
  render(formEl, resultEl) {
    formEl.innerHTML = `
      <h3>Solve for</h3>
      <div class="field"><label>Which value do you need?</label>
        <div class="seg" data-seg="solve"><button data-value="v1" class="active">Volume of stock (V1)</button><button data-value="v2">Final volume (V2)</button></div>
      </div>
      <div class="field-row">
        <div class="field"><label>Stock concentration (C1)</label><input type="number" id="di-c1" value="10"></div>
        <div class="field"><label>Target concentration (C2)</label><input type="number" id="di-c2" value="1"></div>
      </div>
      <div class="field" data-group="v1"><label>Final volume (V2)</label><input type="number" id="di-v2" value="500"></div>
      <div class="field" data-group="v2" style="display:none"><label>Volume of stock (V1)</label><input type="number" id="di-v1" value="50"></div>`;
    segControl(formEl, 'solve', () => {
      const solve = segValue(formEl, 'solve');
      formEl.querySelector('[data-group="v1"]').style.display = solve === 'v1' ? '' : 'none';
      formEl.querySelector('[data-group="v2"]').style.display = solve === 'v2' ? '' : 'none';
      calc();
    });
    function calc() {
      const c1 = +qs(formEl, '#di-c1').value || 0;
      const c2 = +qs(formEl, '#di-c2').value || 0;
      const solve = segValue(formEl, 'solve');
      if (!c1 || !c2) { resultEl.innerHTML = emptyResult('Enter both concentrations'); return; }
      if (solve === 'v1') {
        const v2 = +qs(formEl, '#di-v2').value || 0;
        const v1 = (c2 * v2) / c1;
        resultEl.innerHTML = heroBlock('Stock volume needed (V1)', `${fmtNum(v1, 2)}`, `Plus ${fmtNum(v2 - v1, 2)} diluent to reach ${v2}`) +
          `<div class="result-rows">${resultRow('Stock volume (V1)', fmtNum(v1, 2))}${resultRow('Diluent to add', fmtNum(v2 - v1, 2))}${resultRow('Final volume (V2)', v2)}</div>`;
      } else {
        const v1 = +qs(formEl, '#di-v1').value || 0;
        const v2 = (c1 * v1) / c2;
        resultEl.innerHTML = heroBlock('Final volume (V2)', `${fmtNum(v2, 2)}`, `Add ${fmtNum(v2 - v1, 2)} diluent to ${v1}`) +
          `<div class="result-rows">${resultRow('Starting volume (V1)', v1)}${resultRow('Diluent to add', fmtNum(v2 - v1, 2))}${resultRow('Final volume (V2)', fmtNum(v2, 2))}</div>`;
      }
      resultEl.innerHTML += infoNote('Uses C1V1 = C2V2. Use consistent units throughout (e.g. both concentrations in the same unit, both volumes in the same unit).');
    }
    wireLiveCalc(formEl, calc);
  }
};
