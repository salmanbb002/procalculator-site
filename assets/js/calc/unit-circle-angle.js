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

/* ---------------- Unit circle angle finder ---------------- */
CALCULATORS['unit-circle-angle'] = {
  render(formEl, resultEl) {
    formEl.innerHTML = `
      <h3>Angle</h3>
      <div class="field"><label>Angle</label><input type="number" id="uc-angle" value="45"></div>
      <div class="field"><label>Unit</label>
        <div class="seg" data-seg="unit"><button data-value="deg" class="active">Degrees</button><button data-value="rad">Radians</button></div>
      </div>`;
    segControl(formEl, 'unit', calc);
    function calc() {
      const angle = +qs(formEl, '#uc-angle').value || 0;
      const unit = segValue(formEl, 'unit');
      const rad = unit === 'deg' ? angle * Math.PI / 180 : angle;
      const sin = Math.sin(rad), cos = Math.cos(rad), tan = Math.cos(rad) !== 0 ? Math.tan(rad) : NaN;
      resultEl.innerHTML = heroBlock('sin, cos, tan', `${fmtNum(sin, 4)}, ${fmtNum(cos, 4)}, ${isNaN(tan) ? 'undefined' : fmtNum(tan, 4)}`, `At ${angle}${unit === 'deg' ? '°' : ' rad'}`) +
        `<div class="result-rows">${resultRow('sin', fmtNum(sin, 4))}${resultRow('cos', fmtNum(cos, 4))}${resultRow('tan', isNaN(tan) ? 'undefined' : fmtNum(tan, 4))}${resultRow('Angle in radians', fmtNum(rad, 4))}</div>`;
    }
    wireLiveCalc(formEl, calc);
  }
};
