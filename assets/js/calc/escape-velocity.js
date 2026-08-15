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

/* ---------------- Escape velocity calculator ---------------- */
CALCULATORS['escape-velocity'] = {
  render(formEl, resultEl) {
    const G = 6.674e-11;
    formEl.innerHTML = `
      <h3>Body details</h3>
      <div class="field-row">
        <div class="field"><label>Mass (kg)</label><input type="number" id="ev2-mass" value="5.972e24"></div>
        <div class="field"><label>Radius (m)</label><input type="number" id="ev2-radius" value="6371000"></div>
      </div>
      <p class="hint" style="margin-top:-8px">Defaults are Earth's mass and radius.</p>`;
    function calc() {
      const mass = +qs(formEl, '#ev2-mass').value || 0;
      const radius = +qs(formEl, '#ev2-radius').value || 0;
      if (!mass || !radius) { resultEl.innerHTML = emptyResult('Enter mass and radius'); return; }
      const v = Math.sqrt((2 * G * mass) / radius);
      resultEl.innerHTML = heroBlock('Escape velocity', `${fmtNum(v / 1000, 2)} km/s`, `${fmtNum(v, 0)} m/s`) +
        `<div class="result-rows">${resultRow('Mass', mass.toExponential(3) + ' kg')}${resultRow('Radius', fmtNum(radius, 0) + ' m')}${resultRow('Escape velocity', fmtNum(v / 1000, 2) + ' km/s')}</div>` +
        infoNote('Uses v = √(2GM/r) with the gravitational constant G = 6.674×10⁻¹¹ N·m²/kg². Ignores atmospheric drag.');
    }
    wireLiveCalc(formEl, calc);
  }
};
