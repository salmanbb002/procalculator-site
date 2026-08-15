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

/* ---------------- Concrete mix ---------------- */
CALCULATORS['concrete-mix'] = {
  render(formEl, resultEl) {
    formEl.innerHTML = `
      <h3>Pour dimensions</h3>
      <div class="field-row">
        <div class="field"><label>Length (m)</label><input type="number" id="cm-l" value="4"></div>
        <div class="field"><label>Width (m)</label><input type="number" id="cm-w" value="3"></div>
      </div>
      <div class="field"><label>Depth (mm)</label><input type="number" id="cm-d" value="100"></div>
      <div class="field"><label>Mix ratio (cement : sand : aggregate)</label>
        <select id="cm-ratio">
          <option value="1,2,4" selected>1 : 2 : 4 (general purpose)</option>
          <option value="1,1.5,3">1 : 1.5 : 3 (standard/paths)</option>
          <option value="1,3,6">1 : 3 : 6 (mass concrete)</option>
        </select>
      </div>`;
    function calc() {
      const L = +qs(formEl, '#cm-l').value || 0, W = +qs(formEl, '#cm-w').value || 0, D = (+qs(formEl, '#cm-d').value || 0) / 1000;
      const [c, s, a] = qs(formEl, '#cm-ratio').value.split(',').map(Number);
      const volume = L * W * D;
      if (!volume) { resultEl.innerHTML = emptyResult('Enter the pour dimensions'); return; }
      const dryVolume = volume * 1.54;
      const parts = c + s + a;
      const cementVol = dryVolume * (c / parts), sandVol = dryVolume * (s / parts), aggVol = dryVolume * (a / parts);
      const cementKg = cementVol * 1440;
      const bags25 = cementKg / 25;
      resultEl.innerHTML = heroBlock('Concrete volume', `${fmtNum(volume, 3)} m³`, `${fmtNum(bags25, 1)} × 25kg cement bags`) +
        `<div class="result-rows">${resultRow('Cement', `${fmtNum(cementKg, 0)} kg`)}${resultRow('Sand', `${fmtNum(sandVol, 3)} m³`)}${resultRow('Aggregate', `${fmtNum(aggVol, 3)} m³`)}</div>` +
        infoNote('Estimate includes a 1.54× dry-volume allowance for shrinkage and voids. Always round materials up.');
    }
    wireLiveCalc(formEl, calc);
  }
};
