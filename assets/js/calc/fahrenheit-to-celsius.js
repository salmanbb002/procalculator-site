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

/* ---------------- Fahrenheit to Celsius ---------------- */
CALCULATORS['fahrenheit-to-celsius'] = {
  render(formEl, resultEl) {
    formEl.innerHTML = `
      <h3>Convert temperature</h3>
      <div class="seg" data-seg="dir"><button data-value="f" class="active">°F → °C</button><button data-value="c">°C → °F</button></div>
      <div class="field" style="margin-top:16px" data-group="f">
        <label>Fahrenheit (°F)</label>
        <input type="number" id="ftc-f" value="98.6" step="0.1">
      </div>
      <div class="field" data-group="c" style="display:none">
        <label>Celsius (°C)</label>
        <input type="number" id="ftc-c" value="37" step="0.1">
      </div>`;
    let dir = 'f';
    segControl(formEl, 'dir', v => {
      dir = v;
      formEl.querySelector('[data-group="f"]').style.display = v === 'f' ? '' : 'none';
      formEl.querySelector('[data-group="c"]').style.display = v === 'c' ? '' : 'none';
      calc();
    });
    function calc() {
      if (dir === 'f') {
        const f = formEl.querySelector('#ftc-f').value;
        if (f === '') { resultEl.innerHTML = emptyResult('Enter a temperature in Fahrenheit'); return; }
        const c = (+f - 32) * 5 / 9;
        resultEl.innerHTML = heroBlock(`${fmtNum(+f, 1)}°F =`, `${fmtNum(c, 1)}°C`, `${fmtNum(c + 273.15, 1)} K`) +
          `<div class="result-rows">${resultRow('In Kelvin', `${fmtNum(c + 273.15, 2)} K`)}</div>` +
          infoNote('°C = (°F − 32) × 5⁄9. Body temperature 98.6°F = 37°C exactly.');
      } else {
        const c = formEl.querySelector('#ftc-c').value;
        if (c === '') { resultEl.innerHTML = emptyResult('Enter a temperature in Celsius'); return; }
        const f = (+c * 9 / 5) + 32;
        resultEl.innerHTML = heroBlock(`${fmtNum(+c, 1)}°C =`, `${fmtNum(f, 1)}°F`, `${fmtNum(+c + 273.15, 1)} K`) +
          `<div class="result-rows">${resultRow('In Kelvin', `${fmtNum(+c + 273.15, 2)} K`)}</div>` +
          infoNote('°F = (°C × 9⁄5) + 32. Water freezes at 0°C/32°F and boils at 100°C/212°F.');
      }
    }
    wireLiveCalc(formEl, calc);
  }
};
