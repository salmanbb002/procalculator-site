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

/* ---------------- Speeding fine estimator ---------------- */
CALCULATORS['speeding-fine-estimator'] = {
  render(formEl, resultEl) {
    formEl.innerHTML = `
      <h3>Details</h3>
      <div class="field-row">
        <div class="field"><label>Speed limit (mph)</label><input type="number" id="sf-limit" value="30"></div>
        <div class="field"><label>Recorded speed (mph)</label><input type="number" id="sf-speed" value="42"></div>
      </div>
      <div class="field"><label>Weekly income (net)</label><input type="number" id="sf-income" value="500"></div>`;
    function calc() {
      const limit = +qs(formEl, '#sf-limit').value || 0;
      const speed = +qs(formEl, '#sf-speed').value || 0;
      const income = +qs(formEl, '#sf-income').value || 0;
      if (!limit || !speed || speed <= limit) { resultEl.innerHTML = emptyResult('Enter a recorded speed above the limit'); return; }
      const pctOver = ((speed - limit) / limit) * 100;
      let band, points, finePct;
      if (pctOver < 50) { band = 'Band A'; points = '3 points'; finePct = 0.5; }
      else if (pctOver < 100) { band = 'Band B'; points = '4-6 points or disqualification'; finePct = 1.0; }
      else { band = 'Band C'; points = '6 points or disqualification'; finePct = 1.5; }
      const fine = Math.min(income * finePct, 2500);
      resultEl.innerHTML = heroBlock('Guideline fine range', band, `~${fmtGBP(fine)}, capped by statutory maximum`) +
        `<div class="result-rows">${resultRow('Speed over limit', `${fmtNum(pctOver, 0)}%`)}${resultRow('Sentencing band', band)}${resultRow('Typical penalty points', points)}</div>` +
        infoNote('Based on published UK sentencing guidelines (bands relative to speed and income), not a guaranteed outcome — actual fines and points are set by police/court discretion and individual circumstances. Many cases are instead offered a speed awareness course.');
    }
    wireLiveCalc(formEl, calc);
  }
};
