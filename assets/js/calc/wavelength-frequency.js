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

/* ---------------- Wavelength & frequency calculator ---------------- */
CALCULATORS['wavelength-frequency'] = {
  render(formEl, resultEl) {
    formEl.innerHTML = `
      <h3>Wave details</h3>
      <div class="field"><label>Wave type</label>
        <div class="seg" data-seg="type"><button data-value="light" class="active">Light/EM wave</button><button data-value="sound">Sound</button></div>
      </div>
      <div class="field" data-group="sound" style="display:none"><label>Wave speed (m/s)</label><input type="number" id="wf-speed" value="343"></div>
      <div class="field"><label>Mode</label>
        <div class="seg" data-seg="mode"><button data-value="freq" class="active">I know frequency (Hz)</button><button data-value="wave">I know wavelength (m)</button></div>
      </div>
      <div class="field" data-group="freq"><label>Frequency (Hz)</label><input type="number" id="wf-freq" value="500000000000000"></div>
      <div class="field" data-group="wave" style="display:none"><label>Wavelength (m)</label><input type="number" id="wf-wave" value="0.0000006"></div>`;
    segControl(formEl, 'type', () => { formEl.querySelector('[data-group="sound"]').style.display = segValue(formEl, 'type') === 'sound' ? '' : 'none'; calc(); });
    segControl(formEl, 'mode', () => {
      const mode = segValue(formEl, 'mode');
      formEl.querySelector('[data-group="freq"]').style.display = mode === 'freq' ? '' : 'none';
      formEl.querySelector('[data-group="wave"]').style.display = mode === 'wave' ? '' : 'none';
      calc();
    });
    function calc() {
      const type = segValue(formEl, 'type');
      const mode = segValue(formEl, 'mode');
      const speed = type === 'sound' ? (+qs(formEl, '#wf-speed').value || 343) : 299792458;
      let freq, wave;
      if (mode === 'freq') {
        freq = +qs(formEl, '#wf-freq').value || 0;
        wave = freq ? speed / freq : 0;
      } else {
        wave = +qs(formEl, '#wf-wave').value || 0;
        freq = wave ? speed / wave : 0;
      }
      if (!freq && !wave) { resultEl.innerHTML = emptyResult('Enter a frequency or wavelength'); return; }
      resultEl.innerHTML = heroBlock('Wavelength', `${fmtNum(wave, 6)} m`, `At ${fmtNum(freq, 2)} Hz`) +
        `<div class="result-rows">${resultRow('Frequency', `${fmtNum(freq, 2)} Hz`)}${resultRow('Wavelength', `${fmtNum(wave, 6)} m`)}${resultRow('Wave speed used', `${fmtNum(speed, 0)} m/s`)}</div>` +
        infoNote('Uses wave speed = frequency × wavelength. Light/EM waves use the speed of light in a vacuum (299,792,458 m/s); sound speed varies by medium and temperature — 343 m/s is a typical value for air at room temperature.');
    }
    wireLiveCalc(formEl, calc);
  }
};
