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

/* ---------------- LBS to Stone ---------------- */
CALCULATORS['lbs-to-stone'] = {
  render(formEl, resultEl) {
    formEl.innerHTML = `
      <h3>Convert weight</h3>
      <div class="seg" data-seg="dir"><button data-value="lbs" class="active">Pounds → Stone</button><button data-value="stone">Stone + lb → Pounds</button></div>
      <div class="field" style="margin-top:16px" data-group="lbs">
        <label>Weight (lb)</label>
        <input type="number" id="lts-lbs" value="154" step="0.1">
      </div>
      <div class="field" data-group="stone" style="display:none">
        <div class="field-row">
          <div><label>Stone</label><input type="number" id="lts-st" value="11" step="1"></div>
          <div><label>Pounds</label><input type="number" id="lts-lb2" value="0" step="0.1"></div>
        </div>
      </div>`;
    let dir = 'lbs';
    segControl(formEl, 'dir', v => {
      dir = v;
      formEl.querySelector('[data-group="lbs"]').style.display = v === 'lbs' ? '' : 'none';
      formEl.querySelector('[data-group="stone"]').style.display = v === 'stone' ? '' : 'none';
      calc();
    });
    function calc() {
      if (dir === 'lbs') {
        const lbs = +qs(formEl, '#lts-lbs').value || 0;
        if (!lbs) { resultEl.innerHTML = emptyResult('Enter a weight in pounds'); return; }
        const stoneTotal = lbs / 14;
        const stone = Math.floor(stoneTotal);
        const remLb = lbs - stone * 14;
        const kg = lbs * 0.45359237;
        resultEl.innerHTML = heroBlock(`${fmtNum(lbs)} lb =`, `${stone}st ${fmtNum(remLb, 1)}lb`, `${fmtNum(stoneTotal, 3)} stone (decimal)`) +
          `<div class="result-rows">${resultRow('In kilograms', `${fmtNum(kg, 1)} kg`)}${resultRow('Decimal stone', fmtNum(stoneTotal, 3))}</div>` +
          infoNote('1 stone = 14 pounds exactly, the UK imperial standard.');
      } else {
        const st = +qs(formEl, '#lts-st').value || 0, lb2 = +qs(formEl, '#lts-lb2').value || 0;
        const totalLbs = st * 14 + lb2;
        if (!totalLbs) { resultEl.innerHTML = emptyResult('Enter a stone and pound value'); return; }
        const kg = totalLbs * 0.45359237;
        resultEl.innerHTML = heroBlock(`${st}st ${fmtNum(lb2, 1)}lb =`, `${fmtNum(totalLbs, 1)} lb`, `${fmtNum(kg, 1)} kg`) +
          `<div class="result-rows">${resultRow('In kilograms', `${fmtNum(kg, 1)} kg`)}</div>` +
          infoNote('1 stone = 14 pounds exactly, the UK imperial standard.');
      }
    }
    wireLiveCalc(formEl, calc);
  }
};
