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

/* ---------------- Roof tile quantity calculator ---------------- */
CALCULATORS['roof-tile-quantity'] = {
  render(formEl, resultEl) {
    formEl.innerHTML = `
      <h3>Roof area</h3>
      <div class="field-row">
        <div class="field"><label>Roof area (m²)</label><input type="number" id="rt-area" value="80"></div>
        <div class="field"><label>Tiles per m²</label><input type="number" step="0.1" id="rt-per-m2" value="10"></div>
      </div>
      <div class="field"><label>Waste allowance (%)</label><input type="number" id="rt-waste" value="5"></div>`;
    function calc() {
      const area = +qs(formEl, '#rt-area').value || 0;
      const perM2 = +qs(formEl, '#rt-per-m2').value || 0;
      const waste = +qs(formEl, '#rt-waste').value || 0;
      if (!area || !perM2) { resultEl.innerHTML = emptyResult('Enter roof area and tiles per m²'); return; }
      const baseTiles = area * perM2;
      const totalTiles = Math.ceil(baseTiles * (1 + waste / 100));
      resultEl.innerHTML = heroBlock('Tiles needed', `${fmtNum(totalTiles, 0)} tiles`, `Incl. ${waste}% waste allowance`) +
        `<div class="result-rows">${resultRow('Roof area', `${area} m²`)}${resultRow('Base quantity', fmtNum(Math.ceil(baseTiles), 0))}${resultRow('With waste allowance', fmtNum(totalTiles, 0))}</div>` +
        infoNote("Tiles-per-m² varies by tile profile and gauge — check your specific tile manufacturer's coverage rate for an accurate figure. Excludes ridge, hip and verge tiles.");
    }
    wireLiveCalc(formEl, calc);
  }
};
