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

/* ---------------- VAT ---------------- */
CALCULATORS['vat'] = {
  render(formEl, resultEl) {
    formEl.innerHTML = `
      <h3>VAT details</h3>
      <div class="field"><label>Mode</label>
        <div class="seg" data-seg="mode"><button data-value="add" class="active">Add VAT (net → gross)</button><button data-value="remove">Remove VAT (gross → net)</button></div>
      </div>
      <div class="field-row">
        <div class="field"><label>Amount (£)</label><input type="number" id="vat-amount" value="100"></div>
        <div class="field"><label>VAT rate (%)</label><input type="number" id="vat-rate" value="20"></div>
      </div>`;
    segControl(formEl, 'mode', calc);
    function calc() {
      const amount = +qs(formEl, '#vat-amount').value || 0;
      const rate = +qs(formEl, '#vat-rate').value || 0;
      const mode = segValue(formEl, 'mode');
      let net, gross, vat;
      if (mode === 'add') { net = amount; gross = net * (1 + rate / 100); vat = gross - net; }
      else { gross = amount; net = gross / (1 + rate / 100); vat = gross - net; }
      resultEl.innerHTML = heroBlock(mode === 'add' ? 'Gross amount' : 'Net amount', fmtGBP(mode === 'add' ? gross : net), `${rate}% VAT`) +
        `<div class="result-rows">${resultRow('Net (excl. VAT)', fmtGBP(net))}${resultRow('VAT amount', fmtGBP(vat))}${resultRow('Gross (incl. VAT)', fmtGBP(gross))}</div>`;
    }
    wireLiveCalc(formEl, calc);
  }
};
