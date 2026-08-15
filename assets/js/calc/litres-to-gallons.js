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

/* ---------------- Litres to Gallons ---------------- */
CALCULATORS['litres-to-gallons'] = {
  render(formEl, resultEl) {
    formEl.innerHTML = `
      <h3>Convert volume</h3>
      <div class="field"><label>Litres</label><input type="number" id="ltg-val" value="50" step="0.1"></div>`;
    function calc() {
      const litres = +qs(formEl, '#ltg-val').value || 0;
      if (!litres) { resultEl.innerHTML = emptyResult('Enter a number of litres'); return; }
      const ukGal = litres / 4.54609;
      const usGal = litres / 3.785411784;
      resultEl.innerHTML = heroBlock(`${fmtNum(litres, 2)} litres =`, `${fmtNum(ukGal, 3)} UK gallons`, `${fmtNum(usGal, 3)} US gallons`) +
        `<div class="result-rows">${resultRow('UK / imperial gallons', fmtNum(ukGal, 3))}${resultRow('US gallons', fmtNum(usGal, 3))}${resultRow('In pints (UK)', `${fmtNum(litres / 0.56826125, 1)} pints`)}</div>` +
        infoNote('The UK/imperial gallon (4.54609 litres) is about 20% larger than the US gallon (3.78541 litres) — always check which one a source means.');
    }
    wireLiveCalc(formEl, calc);
  }
};
