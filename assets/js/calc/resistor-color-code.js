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

/* ---------------- Resistor colour code calculator ---------------- */
CALCULATORS['resistor-color-code'] = {
  render(formEl, resultEl) {
    const COLORS = [
      { name: 'Black', digit: 0, mult: 1, color: '#000000' },
      { name: 'Brown', digit: 1, mult: 10, tol: 1, color: '#8B4513' },
      { name: 'Red', digit: 2, mult: 100, tol: 2, color: '#DC2626' },
      { name: 'Orange', digit: 3, mult: 1000, color: '#F97316' },
      { name: 'Yellow', digit: 4, mult: 10000, color: '#EAB308' },
      { name: 'Green', digit: 5, mult: 100000, tol: 0.5, color: '#16A34A' },
      { name: 'Blue', digit: 6, mult: 1000000, tol: 0.25, color: '#2563EB' },
      { name: 'Violet', digit: 7, mult: 10000000, tol: 0.1, color: '#7C3AED' },
      { name: 'Grey', digit: 8, mult: 100000000, color: '#6B7280' },
      { name: 'White', digit: 9, mult: 1000000000, color: '#F3F4F6' },
      { name: 'Gold', mult: 0.1, tol: 5, color: '#D4AF37' },
      { name: 'Silver', mult: 0.01, tol: 10, color: '#C0C0C0' },
    ];
    const digitOptions = COLORS.filter(c => c.digit !== undefined);
    const multOptions = COLORS;
    const tolOptions = COLORS.filter(c => c.tol !== undefined);
    const opts = (list, key) => list.map(c => `<option value="${c.name}">${c.name}${key ? ` (${key === 'mult' ? '×' + c.mult : c.tol + '%'})` : ''}</option>`).join('');
    formEl.innerHTML = `
      <h3>Colour bands (4-band resistor)</h3>
      <div class="field"><label>Band 1 (1st digit)</label><select id="rc-1">${opts(digitOptions)}</select></div>
      <div class="field"><label>Band 2 (2nd digit)</label><select id="rc-2">${opts(digitOptions)}</select></div>
      <div class="field"><label>Band 3 (multiplier)</label><select id="rc-3">${opts(multOptions, 'mult')}</select></div>
      <div class="field"><label>Band 4 (tolerance)</label><select id="rc-4">${opts(tolOptions, 'tol')}</select></div>`;
    formEl.querySelector('#rc-3').value = 'Red';
    formEl.querySelector('#rc-4').value = 'Gold';
    function calc() {
      const c1 = COLORS.find(c => c.name === qs(formEl, '#rc-1').value);
      const c2 = COLORS.find(c => c.name === qs(formEl, '#rc-2').value);
      const c3 = COLORS.find(c => c.name === qs(formEl, '#rc-3').value);
      const c4 = COLORS.find(c => c.name === qs(formEl, '#rc-4').value);
      const value = (c1.digit * 10 + c2.digit) * c3.mult;
      let display = value >= 1000000 ? fmtNum(value / 1000000, 2) + ' MΩ' : value >= 1000 ? fmtNum(value / 1000, 2) + ' kΩ' : fmtNum(value, 2) + ' Ω';
      resultEl.innerHTML = heroBlock('Resistance', display, `±${c4.tol}% tolerance`) +
        `<div class="result-rows">${resultRow('Value', display)}${resultRow('Tolerance', `±${c4.tol}%`)}${resultRow('Range', `${fmtNum(value * (1 - c4.tol / 100), 1)} – ${fmtNum(value * (1 + c4.tol / 100), 1)} Ω`)}</div>`;
    }
    formEl.addEventListener('change', calc);
    calc();
  }
};
