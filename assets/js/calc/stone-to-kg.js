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

/* ---------------- Stone to KG ---------------- */
CALCULATORS['stone-to-kg'] = {
  render(formEl, resultEl) {
    formEl.innerHTML = `
      <h3>Convert weight</h3>
      <div class="seg" data-seg="dir"><button data-value="st" class="active">Stone + lb → KG</button><button data-value="kg">KG → Stone + lb</button></div>
      <div class="field" style="margin-top:16px" data-group="st">
        <div class="field-row">
          <div><label>Stone</label><input type="number" id="stk-st" value="11" step="1"></div>
          <div><label>Pounds</label><input type="number" id="stk-lb" value="0" step="0.1"></div>
        </div>
      </div>
      <div class="field" data-group="kg" style="display:none">
        <label>Weight (kg)</label>
        <input type="number" id="stk-kg" value="70" step="0.1">
      </div>`;
    let dir = 'st';
    segControl(formEl, 'dir', v => {
      dir = v;
      formEl.querySelector('[data-group="st"]').style.display = v === 'st' ? '' : 'none';
      formEl.querySelector('[data-group="kg"]').style.display = v === 'kg' ? '' : 'none';
      calc();
    });
    function calc() {
      if (dir === 'st') {
        const st = +qs(formEl, '#stk-st').value || 0, lb = +qs(formEl, '#stk-lb').value || 0;
        const totalLb = st * 14 + lb;
        if (!totalLb) { resultEl.innerHTML = emptyResult('Enter a stone and pound value'); return; }
        const kg = totalLb * 0.45359237;
        resultEl.innerHTML = heroBlock(`${st}st ${fmtNum(lb, 1)}lb =`, `${fmtNum(kg, 2)} kg`, `${fmtNum(totalLb, 1)} lb`) +
          `<div class="result-rows">${resultRow('In pounds', `${fmtNum(totalLb, 1)} lb`)}</div>` +
          infoNote('1 stone = 14 pounds exactly; 1 pound = 0.45359237kg exactly.');
      } else {
        const kg = +qs(formEl, '#stk-kg').value || 0;
        if (!kg) { resultEl.innerHTML = emptyResult('Enter a weight in kilograms'); return; }
        const lb = kg / 0.45359237;
        const stone = Math.floor(lb / 14);
        const remLb = lb - stone * 14;
        resultEl.innerHTML = heroBlock(`${fmtNum(kg, 1)} kg =`, `${stone}st ${fmtNum(remLb, 1)}lb`, `${fmtNum(lb / 14, 3)} stone`) +
          `<div class="result-rows">${resultRow('In pounds', `${fmtNum(lb, 1)} lb`)}</div>` +
          infoNote('1 stone = 14 pounds exactly; 1 pound = 0.45359237kg exactly.');
      }
    }
    wireLiveCalc(formEl, calc);
  }
};
