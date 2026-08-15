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

/* ---------------- Moment of force calculator ---------------- */
CALCULATORS['moment-of-force'] = {
  render(formEl, resultEl) {
    formEl.innerHTML = `
      <h3>Force and distance</h3>
      <div class="field-row">
        <div class="field"><label>Force (N)</label><input type="number" id="mf-force" value="50"></div>
        <div class="field"><label>Perpendicular distance from pivot (m)</label><input type="number" step="0.01" id="mf-dist" value="0.75"></div>
      </div>`;
    function calc() {
      const force = +qs(formEl, '#mf-force').value || 0;
      const dist = +qs(formEl, '#mf-dist').value || 0;
      if (!force || !dist) { resultEl.innerHTML = emptyResult('Enter force and distance'); return; }
      const moment = force * dist;
      resultEl.innerHTML = heroBlock('Moment (turning force)', `${fmtNum(moment, 2)} Nm`, `${force}N at ${dist}m from pivot`) +
        `<div class="result-rows">${resultRow('Force', `${force} N`)}${resultRow('Distance', `${dist} m`)}${resultRow('Moment', `${fmtNum(moment, 2)} Nm`)}</div>` +
        infoNote('Uses moment = force × perpendicular distance from the pivot. If the force isn\'t applied perpendicular to the lever, only the perpendicular component contributes to the moment.');
    }
    wireLiveCalc(formEl, calc);
  }
};
