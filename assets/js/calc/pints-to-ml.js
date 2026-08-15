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

/* ---------------- Pints to ML ---------------- */
CALCULATORS['pints-to-ml'] = {
  render(formEl, resultEl) {
    formEl.innerHTML = `
      <h3>Convert volume</h3>
      <div class="seg" data-seg="ptype"><button data-value="uk" class="active">UK / Imperial pint</button><button data-value="us">US pint</button></div>
      <div class="field" style="margin-top:16px"><label>Pints</label><input type="number" id="ptm-val" value="1" step="0.25"></div>`;
    let ptype = 'uk';
    segControl(formEl, 'ptype', v => { ptype = v; calc(); });
    const FACTORS = { uk: 568.26125, us: 473.176473 };
    function calc() {
      const val = +qs(formEl, '#ptm-val').value || 0;
      if (!val) { resultEl.innerHTML = emptyResult('Enter a number of pints'); return; }
      const ml = val * FACTORS[ptype];
      const other = ptype === 'uk' ? 'us' : 'uk';
      const otherMl = val * FACTORS[other];
      resultEl.innerHTML = heroBlock(`${fmtNum(val, 2)} ${ptype === 'uk' ? 'UK' : 'US'} pint${val === 1 ? '' : 's'} =`, `${fmtNum(ml, 1)} ml`, `${fmtNum(ml / 1000, 3)} litres`) +
        `<div class="result-rows">${resultRow(ptype === 'uk' ? 'If US pint instead' : 'If UK pint instead', `${fmtNum(otherMl, 1)} ml`)}${resultRow('In fluid ounces', ptype === 'uk' ? `${fmtNum(val * 20, 1)} imp fl oz` : `${fmtNum(val * 16, 1)} US fl oz`)}</div>` +
        infoNote('A UK (imperial) pint is 568.26ml; a US pint is 473.18ml — about 20% smaller.');
    }
    wireLiveCalc(formEl, calc);
  }
};
