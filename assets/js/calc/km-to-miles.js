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

/* ---------------- KM to Miles ---------------- */
CALCULATORS['km-to-miles'] = {
  render(formEl, resultEl) {
    formEl.innerHTML = `
      <h3>Convert distance</h3>
      <div class="seg" data-seg="dir"><button data-value="km" class="active">KM → Miles</button><button data-value="mi">Miles → KM</button></div>
      <div class="field" style="margin-top:16px" data-group="km">
        <label>Kilometres</label>
        <input type="number" id="ktm-km" value="10" step="0.1">
      </div>
      <div class="field" data-group="mi" style="display:none">
        <label>Miles</label>
        <input type="number" id="ktm-mi" value="6.2" step="0.1">
      </div>`;
    let dir = 'km';
    segControl(formEl, 'dir', v => {
      dir = v;
      formEl.querySelector('[data-group="km"]').style.display = v === 'km' ? '' : 'none';
      formEl.querySelector('[data-group="mi"]').style.display = v === 'mi' ? '' : 'none';
      calc();
    });
    function calc() {
      if (dir === 'km') {
        const km = +qs(formEl, '#ktm-km').value || 0;
        if (!km) { resultEl.innerHTML = emptyResult('Enter a distance in kilometres'); return; }
        const mi = km / 1.609344;
        resultEl.innerHTML = heroBlock(`${fmtNum(km, 2)} km =`, `${fmtNum(mi, 3)} miles`, `${fmtNum(km * 1000, 0)} m`) +
          `<div class="result-rows">${resultRow('In metres', `${fmtNum(km * 1000, 0)} m`)}${resultRow('In yards', `${fmtNum(mi * 1760, 0)} yd`)}</div>` +
          infoNote('1 mile = 1.609344km exactly — the UK statute mile, fixed by international agreement in 1959.');
      } else {
        const mi = +qs(formEl, '#ktm-mi').value || 0;
        if (!mi) { resultEl.innerHTML = emptyResult('Enter a distance in miles'); return; }
        const km = mi * 1.609344;
        resultEl.innerHTML = heroBlock(`${fmtNum(mi, 2)} miles =`, `${fmtNum(km, 3)} km`, `${fmtNum(km * 1000, 0)} m`) +
          `<div class="result-rows">${resultRow('In yards', `${fmtNum(mi * 1760, 0)} yd`)}</div>` +
          infoNote('1 mile = 1.609344km exactly — the UK statute mile, fixed by international agreement in 1959.');
      }
    }
    wireLiveCalc(formEl, calc);
  }
};
