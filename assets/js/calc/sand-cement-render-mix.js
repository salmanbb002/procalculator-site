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

/* ---------------- Sand & cement render mix ---------------- */
CALCULATORS['sand-cement-render-mix'] = {
  render(formEl, resultEl) {
    formEl.innerHTML = `
      <h3>Wall to render</h3>
      <div class="field-row">
        <div class="field"><label>Wall area (m²)</label><input type="number" id="rm-area" value="20"></div>
        <div class="field"><label>Render thickness (mm)</label><input type="number" id="rm-thick" value="12"></div>
      </div>
      <div class="field"><label>Mix ratio (cement : sand)</label>
        <div class="seg" data-seg="ratio"><button data-value="1:3" class="active">1:3</button><button data-value="1:4">1:4</button><button data-value="1:5">1:5</button></div>
      </div>`;
    segControl(formEl, 'ratio', calc);
    function calc() {
      const area = +qs(formEl, '#rm-area').value || 0;
      const thickMm = +qs(formEl, '#rm-thick').value || 0;
      const ratio = segValue(formEl, 'ratio');
      if (!area || !thickMm) { resultEl.innerHTML = emptyResult('Enter wall area and thickness'); return; }
      const volume = area * (thickMm / 1000); // m3
      const wetVolume = volume * 1.3; // allow for compaction/waste
      const parts = ratio === '1:3' ? 4 : ratio === '1:4' ? 5 : 6;
      const cementVolume = wetVolume / parts;
      const sandVolume = wetVolume - cementVolume;
      const cementBags = cementVolume * 1440 / 25; // ~1440kg/m3 dry cement, 25kg bags
      resultEl.innerHTML = heroBlock('Cement bags needed', `${fmtNum(Math.ceil(cementBags), 0)} bags`, `25kg bags, ${ratio} mix`) +
        `<div class="result-rows">${resultRow('Render volume', `${fmtNum(volume, 3)} m³`)}${resultRow('Cement volume', `${fmtNum(cementVolume, 3)} m³`)}${resultRow('Sand volume', `${fmtNum(sandVolume, 3)} m³`)}</div>` +
        infoNote("Estimate includes an allowance for compaction and waste. Always check the specific product manufacturer's mixing guidance for structural or exterior render work.");
    }
    wireLiveCalc(formEl, calc);
  }
};
