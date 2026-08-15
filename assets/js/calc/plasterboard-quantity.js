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

/* ---------------- Plasterboard quantity calculator ---------------- */
CALCULATORS['plasterboard-quantity'] = {
  render(formEl, resultEl) {
    formEl.innerHTML = `
      <h3>Room dimensions</h3>
      <div class="field-row">
        <div class="field"><label>Room length (m)</label><input type="number" step="0.1" id="pb-length" value="4"></div>
        <div class="field"><label>Room width (m)</label><input type="number" step="0.1" id="pb-width" value="3.5"></div>
      </div>
      <div class="field"><label>Wall height (m)</label><input type="number" step="0.1" id="pb-height" value="2.4"></div>
      <div class="field"><label>Include ceiling?</label>
        <div class="seg" data-seg="ceiling"><button data-value="yes" class="active">Yes</button><button data-value="no">No</button></div>
      </div>`;
    segControl(formEl, 'ceiling', calc);
    function calc() {
      const length = +qs(formEl, '#pb-length').value || 0;
      const width = +qs(formEl, '#pb-width').value || 0;
      const height = +qs(formEl, '#pb-height').value || 0;
      const ceiling = segValue(formEl, 'ceiling');
      if (!length || !width || !height) { resultEl.innerHTML = emptyResult('Enter room dimensions'); return; }
      const wallArea = 2 * (length + width) * height;
      const ceilingArea = ceiling === 'yes' ? length * width : 0;
      const totalArea = wallArea + ceilingArea;
      const sheetArea = 2.4 * 1.2; // standard sheet size m2
      const sheets = Math.ceil(totalArea / sheetArea * 1.1); // 10% waste
      resultEl.innerHTML = heroBlock('Sheets needed', `${sheets} sheets`, `2400×1200mm standard sheets, incl. 10% waste`) +
        `<div class="result-rows">${resultRow('Wall area', `${fmtNum(wallArea, 1)} m²`)}${resultRow('Ceiling area', `${fmtNum(ceilingArea, 1)} m²`)}${resultRow('Total area', `${fmtNum(totalArea, 1)} m²`)}</div>` +
        infoNote('Excludes door and window openings (which would reduce the total slightly) and assumes standard 2400×1200mm sheets — adjust if using a different sheet size.');
    }
    wireLiveCalc(formEl, calc);
  }
};
