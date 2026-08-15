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

/* ---------------- Capital Gains Tax ---------------- */
CALCULATORS['capital-gains-tax'] = {
  render(formEl, resultEl) {
    formEl.innerHTML = `
      <h3>Your gain</h3>
      <div class="field"><label>Asset type</label>
        <div class="seg" data-seg="asset"><button data-value="other" class="active">Shares / other assets</button><button data-value="property">Residential property</button></div>
      </div>
      <div class="field-row">
        <div class="field"><label>Total gain</label><input type="number" id="cgt-gain" value="15000"></div>
        <div class="field"><label>Tax-free allowance</label><input type="number" id="cgt-allowance" value="3000"></div>
      </div>
      <div class="field"><label>Your tax band</label>
        <div class="seg" data-seg="band"><button data-value="basic" class="active">Basic rate</button><button data-value="higher">Higher/additional rate</button></div>
      </div>`;
    segControl(formEl, 'asset', calc);
    segControl(formEl, 'band', calc);
    function calc() {
      const gain = +qs(formEl, '#cgt-gain').value || 0;
      const allowance = +qs(formEl, '#cgt-allowance').value || 0;
      const asset = segValue(formEl, 'asset');
      const band = segValue(formEl, 'band');
      const taxableGain = Math.max(0, gain - allowance);
      let rate;
      if (asset === 'property') rate = band === 'higher' ? 0.24 : 0.18;
      else rate = band === 'higher' ? 0.20 : 0.10;
      const tax = taxableGain * rate;
      resultEl.innerHTML = heroBlock('Estimated CGT owed', fmtGBP(tax), `${fmtNum(rate * 100, 0)}% on ${fmtGBP(taxableGain)} taxable gain`) +
        `<div class="result-rows">${resultRow('Total gain', fmtGBP(gain))}${resultRow('Tax-free allowance used', fmtGBP(Math.min(gain, allowance)))}${resultRow('Taxable gain', fmtGBP(taxableGain))}</div>` +
        infoNote('Illustrative estimate — CGT rates and the annual exempt amount change and depend on your total taxable income. Always check current gov.uk rates and consider professional advice for significant disposals.');
    }
    wireLiveCalc(formEl, calc);
  }
};
