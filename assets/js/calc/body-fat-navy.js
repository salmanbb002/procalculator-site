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

/* ---------------- Body fat % (Navy method) ---------------- */
CALCULATORS['body-fat-navy'] = {
  render(formEl, resultEl) {
    formEl.innerHTML = `
      <h3>Your measurements (cm)</h3>
      <div class="field"><label>Sex</label>
        <div class="seg" data-seg="sex"><button data-value="male" class="active">Male</button><button data-value="female">Female</button></div>
      </div>
      <div class="field-row">
        <div class="field"><label>Height</label><input type="number" id="bf-height" value="178"></div>
        <div class="field"><label>Neck</label><input type="number" id="bf-neck" value="38"></div>
      </div>
      <div class="field-row">
        <div class="field"><label>Waist</label><input type="number" id="bf-waist" value="85"></div>
        <div class="field" data-group="hip" style="display:none"><label>Hip</label><input type="number" id="bf-hip" value="95"></div>
      </div>`;
    segControl(formEl, 'sex', () => { formEl.querySelector('[data-group="hip"]').style.display = segValue(formEl, 'sex') === 'female' ? '' : 'none'; calc(); });
    function toIn(cm) { return cm / 2.54; }
    function calc() {
      const sex = segValue(formEl, 'sex');
      const height = toIn(+qs(formEl, '#bf-height').value || 0);
      const neck = toIn(+qs(formEl, '#bf-neck').value || 0);
      const waist = toIn(+qs(formEl, '#bf-waist').value || 0);
      const hip = toIn(+qs(formEl, '#bf-hip').value || 0);
      if (!height || !neck || !waist) { resultEl.innerHTML = emptyResult('Enter your measurements'); return; }
      let bf;
      if (sex === 'male') {
        bf = 495 / (1.0324 - 0.19077 * Math.log10(waist - neck) + 0.15456 * Math.log10(height)) - 450;
      } else {
        bf = 495 / (1.29579 - 0.35004 * Math.log10(waist + hip - neck) + 0.22100 * Math.log10(height)) - 450;
      }
      resultEl.innerHTML = heroBlock('Estimated body fat', `${fmtNum(bf, 1)}%`, sex === 'male' ? 'US Navy method (male)' : 'US Navy method (female)') +
        `<div class="result-rows">${resultRow('Height', `${qs(formEl, '#bf-height').value} cm`)}${resultRow('Neck', `${qs(formEl, '#bf-neck').value} cm`)}${resultRow('Waist', `${qs(formEl, '#bf-waist').value} cm`)}</div>` +
        infoNote('Uses the US Navy circumference method — a widely used field estimate, less accurate than DEXA or hydrostatic weighing. Measure waist at the navel and neck just below the larynx for best accuracy.');
    }
    wireLiveCalc(formEl, calc);
  }
};
