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

/* ---------------- CM to Feet ---------------- */
CALCULATORS['cm-to-feet'] = {
  render(formEl, resultEl) {
    formEl.innerHTML = `
      <h3>Convert height / length</h3>
      <div class="seg" data-seg="dir"><button data-value="cm" class="active">CM → Feet &amp; Inches</button><button data-value="ft">Feet &amp; Inches → CM</button></div>
      <div class="field" style="margin-top:16px" data-group="cm">
        <label>Centimetres</label>
        <input type="number" id="ctf-cm" value="175" step="0.1">
      </div>
      <div class="field" data-group="ft" style="display:none">
        <div class="field-row">
          <div><label>Feet</label><input type="number" id="ctf-ft" value="5" step="1"></div>
          <div><label>Inches</label><input type="number" id="ctf-in" value="9" step="0.1"></div>
        </div>
      </div>`;
    let dir = 'cm';
    segControl(formEl, 'dir', v => {
      dir = v;
      formEl.querySelector('[data-group="cm"]').style.display = v === 'cm' ? '' : 'none';
      formEl.querySelector('[data-group="ft"]').style.display = v === 'ft' ? '' : 'none';
      calc();
    });
    function calc() {
      if (dir === 'cm') {
        const cm = +qs(formEl, '#ctf-cm').value || 0;
        if (!cm) { resultEl.innerHTML = emptyResult('Enter a height in centimetres'); return; }
        const totalIn = cm / 2.54;
        const ft = Math.floor(totalIn / 12);
        const remIn = totalIn - ft * 12;
        resultEl.innerHTML = heroBlock(`${fmtNum(cm, 1)} cm =`, `${ft}ft ${fmtNum(remIn, 1)}in`, `${fmtNum(totalIn, 2)} inches total`) +
          `<div class="result-rows">${resultRow('Total inches', `${fmtNum(totalIn, 2)} in`)}${resultRow('In metres', `${fmtNum(cm / 100, 3)} m`)}</div>` +
          infoNote('1 foot = 30.48cm exactly (12 inches × 2.54cm).');
      } else {
        const ft = +qs(formEl, '#ctf-ft').value || 0, inch = +qs(formEl, '#ctf-in').value || 0;
        const totalCm = (ft * 12 + inch) * 2.54;
        if (!totalCm) { resultEl.innerHTML = emptyResult('Enter a feet and inches value'); return; }
        resultEl.innerHTML = heroBlock(`${ft}ft ${fmtNum(inch, 1)}in =`, `${fmtNum(totalCm, 1)} cm`, `${fmtNum(totalCm / 100, 3)} m`) +
          `<div class="result-rows">${resultRow('In metres', `${fmtNum(totalCm / 100, 3)} m`)}</div>` +
          infoNote('1 foot = 30.48cm exactly (12 inches × 2.54cm).');
      }
    }
    wireLiveCalc(formEl, calc);
  }
};
