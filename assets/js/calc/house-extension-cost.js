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

/* ---------------- House extension cost estimator ---------------- */
CALCULATORS['house-extension-cost'] = {
  render(formEl, resultEl) {
    formEl.innerHTML = `
      <h3>Extension details</h3>
      <div class="field-row">
        <div class="field"><label>Floor area (m²)</label><input type="number" id="hx-area" value="20"></div>
        <div class="field"><label>Storeys</label>
          <div class="seg" data-seg="storeys"><button data-value="1" class="active">Single</button><button data-value="2">Double</button></div>
        </div>
      </div>
      <div class="field"><label>Estimated cost per m² (your local build rate)</label><input type="number" id="hx-rate" value="2200"></div>
      <div class="field"><label>Additional costs (fit-out, fees, etc.)</label><input type="number" id="hx-extra" value="8000"></div>`;
    segControl(formEl, 'storeys', calc);
    function calc() {
      const area = +qs(formEl, '#hx-area').value || 0;
      const rate = +qs(formEl, '#hx-rate').value || 0;
      const storeys = +segValue(formEl, 'storeys') || 1;
      const extra = +qs(formEl, '#hx-extra').value || 0;
      if (!area || !rate) { resultEl.innerHTML = emptyResult('Enter floor area and cost per m²'); return; }
      const buildCost = area * rate * storeys;
      const total = buildCost + extra;
      resultEl.innerHTML = heroBlock('Estimated total cost', fmtGBP(total), `${area}m² × ${storeys} storey(s)`) +
        `<div class="result-rows">${resultRow('Build cost', fmtGBP(buildCost))}${resultRow('Additional costs', fmtGBP(extra))}${resultRow('Cost per m² (all-in)', fmtGBP(total / area))}</div>` +
        infoNote('Build costs per m² vary hugely by region, specification and builder — the default is illustrative only. Get quotes from local builders for an accurate figure, and budget a contingency of 10-15% on top.');
    }
    wireLiveCalc(formEl, calc);
  }
};
