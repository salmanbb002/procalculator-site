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

/* ---------------- Stamp Duty Land Tax ---------------- */
CALCULATORS['stamp-duty-land-tax'] = {
  render(formEl, resultEl) {
    formEl.innerHTML = `
      <h3>Property details</h3>
      <div class="field"><label>Purchase price</label><input type="number" id="sdlt-price" value="350000"></div>
      <div class="field"><label>Buyer type</label>
        <div class="seg" data-seg="type"><button data-value="standard" class="active">Standard</button><button data-value="ftb">First-time buyer</button><button data-value="additional">Additional property</button></div>
      </div>`;
    segControl(formEl, 'type', calc);
    function bandTax(price, bands) {
      let tax = 0, last = 0;
      for (const [threshold, rate] of bands) {
        if (price > last) { tax += (Math.min(price, threshold) - last) * rate; last = threshold; }
        else break;
      }
      return tax;
    }
    function calc() {
      const price = +qs(formEl, '#sdlt-price').value || 0;
      const type = segValue(formEl, 'type');
      if (!price) { resultEl.innerHTML = emptyResult('Enter the purchase price'); return; }
      const standardBands = [[250000, 0], [925000, 0.05], [1500000, 0.10], [Infinity, 0.12]];
      const ftbBands = [[425000, 0], [625000, 0.05]];
      let tax;
      if (type === 'ftb' && price <= 625000) {
        tax = bandTax(price, ftbBands);
      } else {
        tax = bandTax(price, standardBands);
        if (type === 'additional') tax += price * 0.05;
      }
      const effRate = price ? (tax / price) * 100 : 0;
      resultEl.innerHTML = heroBlock('Estimated SDLT', fmtGBP(tax), `${fmtNum(effRate, 1)}% effective rate`) +
        `<div class="result-rows">${resultRow('Purchase price', fmtGBP(price))}${resultRow('Buyer type', type === 'ftb' ? 'First-time buyer' : type === 'additional' ? 'Additional property' : 'Standard')}</div>` +
        infoNote('Illustrative estimate using standard England/NI residential SDLT bands. Scotland (LBTT) and Wales (LTT) use different systems. Rates and thresholds change — always confirm on gov.uk before a purchase.');
    }
    wireLiveCalc(formEl, calc);
  }
};
