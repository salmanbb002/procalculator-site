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

/* ---------------- Mileage allowance calculator ---------------- */
CALCULATORS['mileage-allowance'] = {
  render(formEl, resultEl) {
    formEl.innerHTML = `
      <h3>Business travel</h3>
      <div class="field-row">
        <div class="field"><label>Business miles this tax year</label><input type="number" id="ma-miles" value="8000"></div>
        <div class="field"><label>Vehicle type</label>
          <div class="seg" data-seg="type"><button data-value="car" class="active">Car/van</button><button data-value="bike">Motorcycle</button></div>
        </div>
      </div>`;
    segControl(formEl, 'type', calc);
    function calc() {
      const miles = +qs(formEl, '#ma-miles').value || 0;
      const type = segValue(formEl, 'type');
      if (!miles) { resultEl.innerHTML = emptyResult('Enter your business mileage'); return; }
      let allowance;
      if (type === 'bike') {
        allowance = miles * 0.24;
      } else {
        const first10k = Math.min(miles, 10000);
        const remainder = Math.max(0, miles - 10000);
        allowance = first10k * 0.45 + remainder * 0.25;
      }
      resultEl.innerHTML = heroBlock('Tax-free mileage allowance', fmtGBP(allowance), `${fmtNum(miles, 0)} business miles`) +
        `<div class="result-rows">${resultRow('Vehicle type', type === 'bike' ? 'Motorcycle' : 'Car/van')}${resultRow('Rate structure', type === 'bike' ? '24p/mile flat' : '45p first 10,000mi, 25p after')}</div>` +
        infoNote("Uses HMRC's standard Approved Mileage Allowance Payment (AMAP) rate structure. Confirm current rates on gov.uk, since they can change and this is what your employer can pay tax-free without it counting as a benefit.");
    }
    wireLiveCalc(formEl, calc);
  }
};
