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

/* ---------------- BMI ---------------- */
CALCULATORS['bmi'] = {
  render(formEl, resultEl) {
    formEl.innerHTML = `
      <h3>Your details</h3>
      <div class="seg" data-seg="unit"><button data-value="metric" class="active">Metric</button><button data-value="imperial">Imperial</button></div>
      <div class="field" style="margin-top:16px" data-group="metric">
        <div class="field-row">
          <div><label>Height (cm)</label><input type="number" id="bmi-h-cm" value="175"></div>
          <div><label>Weight (kg)</label><input type="number" id="bmi-w-kg" value="75"></div>
        </div>
      </div>
      <div class="field" data-group="imperial" style="display:none">
        <div class="field-row">
          <div><label>Height (ft / in)</label><div class="field-row"><input type="number" id="bmi-h-ft" value="5" placeholder="ft"><input type="number" id="bmi-h-in" value="9" placeholder="in"></div></div>
          <div><label>Weight (st / lb)</label><div class="field-row"><input type="number" id="bmi-w-st" value="11" placeholder="st"><input type="number" id="bmi-w-lb" value="11" placeholder="lb"></div></div>
        </div>
      </div>`;
    let unit = 'metric';
    segControl(formEl, 'unit', v => { unit = v; formEl.querySelector('[data-group="metric"]').style.display = v === 'metric' ? '' : 'none'; formEl.querySelector('[data-group="imperial"]').style.display = v === 'imperial' ? '' : 'none'; calc(); });
    function calc() {
      let heightM, weightKg;
      if (unit === 'metric') {
        heightM = (+qs(formEl, '#bmi-h-cm').value || 0) / 100;
        weightKg = +qs(formEl, '#bmi-w-kg').value || 0;
      } else {
        const ft = +qs(formEl, '#bmi-h-ft').value || 0, inch = +qs(formEl, '#bmi-h-in').value || 0;
        heightM = ((ft * 12) + inch) * 0.0254;
        const st = +qs(formEl, '#bmi-w-st').value || 0, lb = +qs(formEl, '#bmi-w-lb').value || 0;
        weightKg = ((st * 14) + lb) * 0.453592;
      }
      if (!heightM || !weightKg) { resultEl.innerHTML = emptyResult('Enter your height and weight'); return; }
      const bmi = weightKg / (heightM * heightM);
      let category, color;
      if (bmi < 18.5) { category = 'Underweight'; }
      else if (bmi < 25) { category = 'Healthy weight'; }
      else if (bmi < 30) { category = 'Overweight'; }
      else { category = 'Obese'; }
      resultEl.innerHTML = heroBlock('Your BMI', bmi.toFixed(1), category) +
        `<div class="result-rows">${resultRow('Height', unit === 'metric' ? `${(heightM * 100).toFixed(0)} cm` : `${qs(formEl, '#bmi-h-ft').value}′ ${qs(formEl, '#bmi-h-in').value}″`)}
        ${resultRow('Weight', unit === 'metric' ? `${weightKg.toFixed(1)} kg` : `${qs(formEl, '#bmi-w-st').value}st ${qs(formEl, '#bmi-w-lb').value}lb`)}
        ${resultRow('Healthy BMI range', '18.5 – 24.9')}</div>` +
        infoNote('BMI is a general screening tool and does not account for muscle mass, frame size or ethnicity. Speak to a GP for personalised advice.');
    }
    wireLiveCalc(formEl, calc);
  }
};
