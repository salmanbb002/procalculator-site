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

/* ---------------- Heart rate zone calculator ---------------- */
CALCULATORS['heart-rate-zone'] = {
  render(formEl, resultEl) {
    formEl.innerHTML = `
      <h3>Your age</h3>
      <div class="field"><label>Age</label><input type="number" id="hr-age" value="35"></div>`;
    function calc() {
      const age = +qs(formEl, '#hr-age').value || 0;
      if (!age) { resultEl.innerHTML = emptyResult('Enter your age'); return; }
      const maxHR = 220 - age;
      const zones = [
        { name: 'Zone 1 — Very light', low: 0.50, high: 0.60 },
        { name: 'Zone 2 — Light (fat burn)', low: 0.60, high: 0.70 },
        { name: 'Zone 3 — Moderate (aerobic)', low: 0.70, high: 0.80 },
        { name: 'Zone 4 — Hard (anaerobic)', low: 0.80, high: 0.90 },
        { name: 'Zone 5 — Maximum', low: 0.90, high: 1.00 },
      ];
      resultEl.innerHTML = heroBlock('Estimated max heart rate', `${maxHR} bpm`, `220 − ${age}`) +
        `<div class="result-rows">${zones.map(z => resultRow(z.name, `${Math.round(maxHR * z.low)}–${Math.round(maxHR * z.high)} bpm`)).join('')}</div>` +
        infoNote('Uses the common 220-minus-age estimate for maximum heart rate, which is a population average with significant individual variation. For precise training zones, a lab-based or field max-HR test is more accurate.');
    }
    wireLiveCalc(formEl, calc);
  }
};
