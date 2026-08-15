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

/* ---------------- University degree classification ---------------- */
CALCULATORS['uni-degree-classification'] = {
  render(formEl, resultEl) {
    formEl.innerHTML = `
      <h3>Your marks</h3>
      <div class="field-row">
        <div class="field"><label>Year 2 average (%)</label><input type="number" id="dc-y2" value="65"></div>
        <div class="field"><label>Year 2 weighting (%)</label><input type="number" id="dc-y2w" value="33"></div>
      </div>
      <div class="field-row">
        <div class="field"><label>Year 3 average (%)</label><input type="number" id="dc-y3" value="70"></div>
        <div class="field"><label>Year 3 weighting (%)</label><input type="number" id="dc-y3w" value="67"></div>
      </div>`;
    function calc() {
      const y2 = +qs(formEl, '#dc-y2').value || 0, y2w = +qs(formEl, '#dc-y2w').value || 0;
      const y3 = +qs(formEl, '#dc-y3').value || 0, y3w = +qs(formEl, '#dc-y3w').value || 0;
      const totalWeight = y2w + y3w;
      if (!totalWeight) { resultEl.innerHTML = emptyResult('Enter your marks and weightings'); return; }
      const weighted = (y2 * y2w + y3 * y3w) / totalWeight;
      let classification;
      if (weighted >= 70) classification = 'First-Class Honours (1st)';
      else if (weighted >= 60) classification = 'Upper Second-Class Honours (2:1)';
      else if (weighted >= 50) classification = 'Lower Second-Class Honours (2:2)';
      else if (weighted >= 40) classification = 'Third-Class Honours (3rd)';
      else classification = 'Below honours threshold';
      resultEl.innerHTML = heroBlock('Estimated classification', classification, `${fmtNum(weighted, 1)}% weighted average`) +
        `<div class="result-rows">${resultRow('Weighted average', `${fmtNum(weighted, 1)}%`)}${resultRow('Year 2 contribution', `${y2}% × ${y2w}%`)}${resultRow('Year 3 contribution', `${y3}% × ${y3w}%`)}</div>` +
        infoNote('Uses standard UK classification bands (70/60/50/40) with the weighting you enter. Exact weighting schemes, borderline/discretionary rules and whether year 1 counts vary significantly by university — check your specific institution\'s regulations.');
    }
    wireLiveCalc(formEl, calc);
  }
};
