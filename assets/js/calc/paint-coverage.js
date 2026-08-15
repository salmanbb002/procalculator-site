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

/* ---------------- Paint coverage ---------------- */
CALCULATORS['paint-coverage'] = {
  render(formEl, resultEl) {
    formEl.innerHTML = `
      <h3>Room dimensions</h3>
      <div class="field-row">
        <div class="field"><label>Length (m)</label><input type="number" id="pc-l" value="4"></div>
        <div class="field"><label>Width (m)</label><input type="number" id="pc-w" value="3.5"></div>
      </div>
      <div class="field-row">
        <div class="field"><label>Height (m)</label><input type="number" id="pc-h" value="2.4"></div>
        <div class="field"><label>Coats</label><input type="number" id="pc-coats" value="2"></div>
      </div>
      <div class="field-row">
        <div class="field"><label>Doors</label><input type="number" id="pc-doors" value="1"></div>
        <div class="field"><label>Windows</label><input type="number" id="pc-windows" value="1"></div>
      </div>`;
    function calc() {
      const L = +qs(formEl, '#pc-l').value || 0, W = +qs(formEl, '#pc-w').value || 0, H = +qs(formEl, '#pc-h').value || 0;
      const coats = +qs(formEl, '#pc-coats').value || 1;
      const doors = +qs(formEl, '#pc-doors').value || 0, windows = +qs(formEl, '#pc-windows').value || 0;
      const wallArea = Math.max(0, 2 * (L + W) * H - doors * 1.6 - windows * 1.4);
      if (!wallArea) { resultEl.innerHTML = emptyResult('Enter your room dimensions'); return; }
      const coverageRate = 12;
      const litres = (wallArea * coats) / coverageRate;
      resultEl.innerHTML = heroBlock('Paint needed', `${fmtNum(litres, 1)} litres`, `${coats} coat(s) at ~${coverageRate}m²/litre`) +
        `<div class="result-rows">${resultRow('Wall area', `${fmtNum(wallArea, 1)} m²`)}${resultRow('Suggested tins', litres <= 2.5 ? '1 × 2.5L' : litres <= 5 ? '1 × 5L' : `${Math.ceil(litres / 5)} × 5L`)}</div>`;
    }
    wireLiveCalc(formEl, calc);
  }
};
