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

/* ---------------- CM to Inches ---------------- */
CALCULATORS['cm-to-inches'] = {
  render(formEl, resultEl) {
    formEl.innerHTML = `
      <h3>Convert length</h3>
      <div class="seg" data-seg="dir"><button data-value="cm" class="active">CM → Inches</button><button data-value="in">Inches → CM</button></div>
      <div class="field" style="margin-top:16px" data-group="cm">
        <label>Centimetres</label>
        <input type="number" id="cti-cm" value="30" step="0.1">
      </div>
      <div class="field" data-group="in" style="display:none">
        <label>Inches</label>
        <input type="number" id="cti-in" value="12" step="0.1">
      </div>`;
    let dir = 'cm';
    segControl(formEl, 'dir', v => {
      dir = v;
      formEl.querySelector('[data-group="cm"]').style.display = v === 'cm' ? '' : 'none';
      formEl.querySelector('[data-group="in"]').style.display = v === 'in' ? '' : 'none';
      calc();
    });
    function calc() {
      if (dir === 'cm') {
        const cm = +qs(formEl, '#cti-cm').value || 0;
        if (!cm) { resultEl.innerHTML = emptyResult('Enter a length in centimetres'); return; }
        const inch = cm / 2.54;
        resultEl.innerHTML = heroBlock(`${fmtNum(cm, 1)} cm =`, `${fmtNum(inch, 3)} in`, `${fmtNum(inch / 12, 2)} feet`) +
          `<div class="result-rows">${resultRow('In feet', `${fmtNum(inch / 12, 3)} ft`)}${resultRow('In millimetres', `${fmtNum(cm * 10, 1)} mm`)}</div>` +
          infoNote('1 inch = 2.54cm exactly — the internationally agreed conversion factor since 1959.');
      } else {
        const inch = +qs(formEl, '#cti-in').value || 0;
        if (!inch) { resultEl.innerHTML = emptyResult('Enter a length in inches'); return; }
        const cm = inch * 2.54;
        resultEl.innerHTML = heroBlock(`${fmtNum(inch, 2)} in =`, `${fmtNum(cm, 2)} cm`, `${fmtNum(cm / 100, 3)} m`) +
          `<div class="result-rows">${resultRow('In millimetres', `${fmtNum(cm * 10, 1)} mm`)}</div>` +
          infoNote('1 inch = 2.54cm exactly — the internationally agreed conversion factor since 1959.');
      }
    }
    wireLiveCalc(formEl, calc);
  }
};
