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

/* ---------------- Inch to MM ---------------- */
CALCULATORS['inch-to-mm'] = {
  render(formEl, resultEl) {
    formEl.innerHTML = `
      <h3>Convert length</h3>
      <div class="seg" data-seg="dir"><button data-value="in" class="active">Inches → MM</button><button data-value="mm">MM → Inches</button></div>
      <div class="field" style="margin-top:16px" data-group="in">
        <label>Inches</label>
        <input type="number" id="itm-in" value="1" step="0.0625">
      </div>
      <div class="field" data-group="mm" style="display:none">
        <label>Millimetres</label>
        <input type="number" id="itm-mm" value="25.4" step="0.1">
      </div>`;
    let dir = 'in';
    segControl(formEl, 'dir', v => {
      dir = v;
      formEl.querySelector('[data-group="in"]').style.display = v === 'in' ? '' : 'none';
      formEl.querySelector('[data-group="mm"]').style.display = v === 'mm' ? '' : 'none';
      calc();
    });
    function calc() {
      if (dir === 'in') {
        const inch = +qs(formEl, '#itm-in').value || 0;
        if (!inch) { resultEl.innerHTML = emptyResult('Enter a length in inches'); return; }
        const mm = inch * 25.4;
        resultEl.innerHTML = heroBlock(`${fmtNum(inch, 4)} in =`, `${fmtNum(mm, 2)} mm`, `${fmtNum(mm / 10, 3)} cm`) +
          `<div class="result-rows">${resultRow('In centimetres', `${fmtNum(mm / 10, 3)} cm`)}</div>` +
          infoNote('1 inch = 25.4mm exactly — the internationally agreed conversion factor since 1959.');
      } else {
        const mm = +qs(formEl, '#itm-mm').value || 0;
        if (!mm) { resultEl.innerHTML = emptyResult('Enter a length in millimetres'); return; }
        const inch = mm / 25.4;
        resultEl.innerHTML = heroBlock(`${fmtNum(mm, 2)} mm =`, `${fmtNum(inch, 4)} in`, `${fmtNum(inch, 4)} in`) +
          `<div class="result-rows">${resultRow('As a fraction (nearest 1/16")', `${fmtNum(Math.round(inch * 16) / 16, 4)} in`)}</div>` +
          infoNote('1 inch = 25.4mm exactly — the internationally agreed conversion factor since 1959.');
      }
    }
    wireLiveCalc(formEl, calc);
  }
};
