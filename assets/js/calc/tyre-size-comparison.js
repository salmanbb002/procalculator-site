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

/* ---------------- Tyre size comparison ---------------- */
CALCULATORS['tyre-size-comparison'] = {
  render(formEl, resultEl) {
    formEl.innerHTML = `
      <h3>Compare two tyre sizes</h3>
      <div class="field"><label>Current tyre (width/aspect R rim)</label>
        <div class="field-row"><input type="number" id="ty-w1" value="205" placeholder="Width"><input type="number" id="ty-a1" value="55" placeholder="Aspect"><input type="number" id="ty-r1" value="16" placeholder="Rim (in)"></div>
      </div>
      <div class="field"><label>New tyre (width/aspect R rim)</label>
        <div class="field-row"><input type="number" id="ty-w2" value="215" placeholder="Width"><input type="number" id="ty-a2" value="50" placeholder="Aspect"><input type="number" id="ty-r2" value="17" placeholder="Rim (in)"></div>
      </div>`;
    function diameter(w, a, r) { return (r * 25.4) + (2 * w * (a / 100)); }
    function calc() {
      const w1 = +qs(formEl, '#ty-w1').value || 0, a1 = +qs(formEl, '#ty-a1').value || 0, r1 = +qs(formEl, '#ty-r1').value || 0;
      const w2 = +qs(formEl, '#ty-w2').value || 0, a2 = +qs(formEl, '#ty-a2').value || 0, r2 = +qs(formEl, '#ty-r2').value || 0;
      if (!w1 || !r1 || !w2 || !r2) { resultEl.innerHTML = emptyResult('Enter both tyre sizes'); return; }
      const d1 = diameter(w1, a1, r1), d2 = diameter(w2, a2, r2);
      const diffPct = ((d2 - d1) / d1) * 100;
      const speedoAt70 = 70 * (d2 / d1);
      resultEl.innerHTML = heroBlock('Diameter difference', `${diffPct > 0 ? '+' : ''}${fmtNum(diffPct, 1)}%`, diffPct > 0 ? 'New tyre is larger overall' : 'New tyre is smaller overall') +
        `<div class="result-rows">${resultRow('Current diameter', `${fmtNum(d1, 0)} mm`)}${resultRow('New diameter', `${fmtNum(d2, 0)} mm`)}${resultRow('Speedometer at true 70mph', `${fmtNum(speedoAt70, 0)} mph`)}</div>` +
        infoNote("A significant diameter change affects speedometer accuracy and can affect gearing, ABS/ESP calibration and insurance/legal compliance — keep within your tyre manufacturer's and vehicle manual's approved size range.");
    }
    wireLiveCalc(formEl, calc);
  }
};
