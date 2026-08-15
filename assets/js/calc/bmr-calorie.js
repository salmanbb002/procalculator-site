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

/* ---------------- BMR / Calorie ---------------- */
CALCULATORS['bmr-calorie'] = {
  render(formEl, resultEl) {
    formEl.innerHTML = `
      <h3>Your details</h3>
      <div class="seg" data-seg="sex"><button data-value="male" class="active">Male</button><button data-value="female">Female</button></div>
      <div class="field-row" style="margin-top:16px">
        <div class="field"><label>Age</label><input type="number" id="bm-age" value="30"></div>
        <div class="field"><label>Height (cm)</label><input type="number" id="bm-h" value="175"></div>
      </div>
      <div class="field-row">
        <div class="field"><label>Weight (kg)</label><input type="number" id="bm-w" value="75"></div>
        <div class="field"><label>Activity level</label>
          <select id="bm-activity">
            <option value="1.2">Sedentary</option>
            <option value="1.375" selected>Light exercise</option>
            <option value="1.55">Moderate exercise</option>
            <option value="1.725">Very active</option>
            <option value="1.9">Extremely active</option>
          </select>
        </div>
      </div>`;
    segControl(formEl, 'sex', calc);
    function calc() {
      const sex = segValue(formEl, 'sex');
      const age = +qs(formEl, '#bm-age').value || 0, h = +qs(formEl, '#bm-h').value || 0, w = +qs(formEl, '#bm-w').value || 0;
      const activity = +qs(formEl, '#bm-activity').value;
      if (!age || !h || !w) { resultEl.innerHTML = emptyResult('Enter your age, height and weight'); return; }
      const bmr = sex === 'male' ? 10 * w + 6.25 * h - 5 * age + 5 : 10 * w + 6.25 * h - 5 * age - 161;
      const tdee = bmr * activity;
      resultEl.innerHTML = heroBlock('Maintenance calories', `${fmtNum(tdee, 0)} kcal/day`, `BMR: ${fmtNum(bmr, 0)} kcal/day`) +
        `<div class="result-rows">${resultRow('Mild weight loss', fmtNum(tdee - 500, 0) + ' kcal/day')}${resultRow('Mild weight gain', fmtNum(tdee + 500, 0) + ' kcal/day')}</div>` +
        infoNote('Based on the Mifflin-St Jeor equation. Individual needs vary — consult a health professional for tailored advice.');
    }
    wireLiveCalc(formEl, calc);
  }
};
