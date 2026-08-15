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

/* ---------------- Skip size selector ---------------- */
CALCULATORS['skip-size'] = {
  render(formEl, resultEl) {
    formEl.innerHTML = `
      <h3>Your waste</h3>
      <div class="field"><label>Estimated waste volume (m³)</label><input type="number" step="0.1" id="sk-volume" value="4"></div>`;
    const SKIPS = [
      { name: 'Mini skip', size: '2 yd³ (~1.5 m³)', m3: 1.5 },
      { name: 'Midi skip', size: '4 yd³ (~3 m³)', m3: 3 },
      { name: 'Builders skip', size: '6 yd³ (~4.5 m³)', m3: 4.5 },
      { name: 'Large skip', size: '8 yd³ (~6 m³)', m3: 6 },
      { name: 'Roll-on-roll-off', size: '12-40 yd³ (~9-30 m³)', m3: 9 },
    ];
    function calc() {
      const volume = +qs(formEl, '#sk-volume').value || 0;
      if (!volume) { resultEl.innerHTML = emptyResult('Enter your estimated waste volume'); return; }
      const recommended = SKIPS.find(s => s.m3 >= volume) || SKIPS[SKIPS.length - 1];
      resultEl.innerHTML = heroBlock('Recommended skip', recommended.name, recommended.size) +
        `<div class="result-rows">${SKIPS.map(s => resultRow(s.name, s.size)).join('')}</div>` +
        infoNote('Standard UK skip size categories — never fill a skip above its rim (this is illegal on the public highway) and check local permit requirements if placing a skip on the road.');
    }
    wireLiveCalc(formEl, calc);
  }
};
