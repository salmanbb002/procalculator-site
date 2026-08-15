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

/* ---------------- VO2 max estimator ---------------- */
CALCULATORS['vo2-max-estimator'] = {
  render(formEl, resultEl) {
    formEl.innerHTML = `
      <h3>Cooper 12-minute run test</h3>
      <div class="field"><label>Distance covered in 12 minutes (metres)</label><input type="number" id="vo-dist" value="2400"></div>
      <p class="hint" style="margin-top:-8px">Run/jog as far as you can in exactly 12 minutes, then enter the distance.</p>`;
    function calc() {
      const dist = +qs(formEl, '#vo-dist').value || 0;
      if (!dist) { resultEl.innerHTML = emptyResult('Enter your 12-minute distance'); return; }
      const vo2max = (dist - 504.9) / 44.73;
      let rating;
      if (vo2max < 30) rating = 'Below average';
      else if (vo2max < 40) rating = 'Average';
      else if (vo2max < 50) rating = 'Good';
      else if (vo2max < 60) rating = 'Excellent';
      else rating = 'Superior';
      resultEl.innerHTML = heroBlock('Estimated VO2 max', `${fmtNum(vo2max, 1)} ml/kg/min`, rating) +
        `<div class="result-rows">${resultRow('Distance covered', `${dist} m`)}${resultRow('Estimated VO2 max', `${fmtNum(vo2max, 1)} ml/kg/min`)}${resultRow('General category', rating)}</div>` +
        infoNote('Uses the Cooper 12-minute run test formula, a widely used field-test estimate — not as precise as a laboratory gas-exchange VO2 max test. Categories are general and vary by age and sex.');
    }
    wireLiveCalc(formEl, calc);
  }
};
