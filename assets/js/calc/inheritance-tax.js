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

/* ---------------- Inheritance Tax ---------------- */
CALCULATORS['inheritance-tax'] = {
  render(formEl, resultEl) {
    formEl.innerHTML = `
      <h3>Estate details</h3>
      <div class="field"><label>Total estate value</label><input type="number" id="iht-estate" value="500000"></div>
      <div class="field"><label>Include main residence to direct descendants?</label>
        <div class="seg" data-seg="residence"><button data-value="yes" class="active">Yes</button><button data-value="no">No</button></div>
      </div>`;
    segControl(formEl, 'residence', calc);
    function calc() {
      const estate = +qs(formEl, '#iht-estate').value || 0;
      const residence = segValue(formEl, 'residence');
      const nilRateBand = 325000;
      const residenceNilRateBand = residence === 'yes' ? Math.max(0, 175000 - Math.max(0, (estate - 2000000) / 2)) : 0;
      const totalAllowance = nilRateBand + residenceNilRateBand;
      const taxableEstate = Math.max(0, estate - totalAllowance);
      const tax = taxableEstate * 0.40;
      resultEl.innerHTML = heroBlock('Estimated IHT due', fmtGBP(tax), `40% on ${fmtGBP(taxableEstate)} above allowances`) +
        `<div class="result-rows">${resultRow('Estate value', fmtGBP(estate))}${resultRow('Nil-rate band', fmtGBP(nilRateBand))}${resultRow('Residence nil-rate band', fmtGBP(residenceNilRateBand))}${resultRow('Taxable estate', fmtGBP(taxableEstate))}</div>` +
        infoNote('Illustrative estimate only — IHT has many reliefs and exemptions (spousal transfer, gifts, business/agricultural relief) not included here. Thresholds change. Seek professional advice for actual estate planning.');
    }
    wireLiveCalc(formEl, calc);
  }
};
