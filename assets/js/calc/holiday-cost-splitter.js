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

/* ---------------- Holiday cost splitter ---------------- */
CALCULATORS['holiday-cost-splitter'] = {
  render(formEl, resultEl) {
    formEl.innerHTML = `
      <h3>Trip costs</h3>
      <div class="field-row">
        <div class="field"><label>Total trip cost</label><input type="number" id="hc-total" value="1800"></div>
        <div class="field"><label>Number of travellers</label><input type="number" id="hc-people" value="4"></div>
      </div>
      <div class="field"><label>Any extra costs one person already covered</label><input type="number" id="hc-prepaid" value="0"></div>`;
    function calc() {
      const total = +qs(formEl, '#hc-total').value || 0;
      const people = +qs(formEl, '#hc-people').value || 0;
      const prepaid = +qs(formEl, '#hc-prepaid').value || 0;
      if (!total || !people) { resultEl.innerHTML = emptyResult('Enter total cost and number of travellers'); return; }
      const perPerson = total / people;
      const owedByOthers = perPerson * (people - 1) - prepaid;
      resultEl.innerHTML = heroBlock('Cost per person', fmtGBP(perPerson), `Split ${people} ways`) +
        `<div class="result-rows">${resultRow('Total trip cost', fmtGBP(total))}${resultRow('Number of travellers', people)}${resultRow('Each person owes', fmtGBP(perPerson))}</div>` +
        infoNote('Simple even split. For itemised splitting (where people paid different amounts for different things), you\'ll need to track individual contributions separately.');
    }
    wireLiveCalc(formEl, calc);
  }
};
