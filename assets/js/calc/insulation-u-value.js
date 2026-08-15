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

/* ---------------- Insulation U-value calculator ---------------- */
CALCULATORS['insulation-u-value'] = {
  render(formEl, resultEl) {
    formEl.innerHTML = `
      <h3>Build-up</h3>
      <div class="field"><label>Existing structure thermal resistance (m²K/W)</label><input type="number" step="0.01" id="uv-existing" value="0.5"></div>
      <div class="field-row">
        <div class="field"><label>Insulation thickness (mm)</label><input type="number" id="uv-thick" value="100"></div>
        <div class="field"><label>Insulation conductivity (W/mK)</label><input type="number" step="0.001" id="uv-conductivity" value="0.035"></div>
      </div>`;
    function calc() {
      const existingR = +qs(formEl, '#uv-existing').value || 0;
      const thickMm = +qs(formEl, '#uv-thick').value || 0;
      const conductivity = +qs(formEl, '#uv-conductivity').value || 0;
      if (!thickMm || !conductivity) { resultEl.innerHTML = emptyResult('Enter insulation thickness and conductivity'); return; }
      const insulationR = (thickMm / 1000) / conductivity;
      const surfaceR = 0.17; // typical combined internal+external surface resistance allowance
      const totalR = existingR + insulationR + surfaceR;
      const uValue = 1 / totalR;
      resultEl.innerHTML = heroBlock('Estimated U-value', `${fmtNum(uValue, 2)} W/m²K`, 'Lower is better insulated') +
        `<div class="result-rows">${resultRow('Insulation resistance', `${fmtNum(insulationR, 2)} m²K/W`)}${resultRow('Existing structure resistance', `${fmtNum(existingR, 2)} m²K/W`)}${resultRow('Total resistance', `${fmtNum(totalR, 2)} m²K/W`)}</div>` +
        infoNote('Simplified single-layer estimate with a standard surface resistance allowance. Real build-ups have multiple layers and cavities — for Building Regulations compliance, use a full calculation from your insulation manufacturer or a qualified assessor.');
    }
    wireLiveCalc(formEl, calc);
  }
};
