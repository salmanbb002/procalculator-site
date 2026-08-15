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

/* ---------------- Daily water intake calculator ---------------- */
CALCULATORS['water-intake'] = {
  render(formEl, resultEl) {
    formEl.innerHTML = `
      <h3>Your details</h3>
      <div class="field-row">
        <div class="field"><label>Weight (kg)</label><input type="number" id="wi-weight" value="75"></div>
        <div class="field"><label>Activity level</label>
          <div class="seg" data-seg="activity"><button data-value="low" class="active">Low</button><button data-value="moderate">Moderate</button><button data-value="high">High</button></div>
        </div>
      </div>`;
    segControl(formEl, 'activity', calc);
    function calc() {
      const weight = +qs(formEl, '#wi-weight').value || 0;
      const activity = segValue(formEl, 'activity');
      if (!weight) { resultEl.innerHTML = emptyResult('Enter your weight'); return; }
      const mlPerKg = activity === 'low' ? 30 : activity === 'moderate' ? 35 : 40;
      const totalMl = weight * mlPerKg;
      const litres = totalMl / 1000;
      resultEl.innerHTML = heroBlock('Suggested daily intake', `${fmtNum(litres, 1)} L`, `≈ ${Math.round(litres / 0.25)} glasses (250ml)`) +
        `<div class="result-rows">${resultRow('Body weight', `${weight} kg`)}${resultRow('Activity level', activity)}${resultRow('Suggested intake', `${fmtNum(litres, 1)} L`)}</div>` +
        infoNote('A general guideline (roughly 30-40ml per kg of body weight, adjusted for activity), not personalised medical advice. Needs vary with climate, health conditions, pregnancy/breastfeeding and individual factors — consult a healthcare professional for specific guidance.');
    }
    wireLiveCalc(formEl, calc);
  }
};
