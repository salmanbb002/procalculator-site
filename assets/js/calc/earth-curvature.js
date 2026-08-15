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

/* ---------------- Earth curvature calculator ---------------- */
CALCULATORS['earth-curvature'] = {
  render(formEl, resultEl) {
    const EARTH_RADIUS_KM = 6371;
    formEl.innerHTML = `
      <h3>Distance</h3>
      <div class="field"><label>Distance (km)</label><input type="number" id="ec-dist" value="10"></div>`;
    function calc() {
      const distKm = +qs(formEl, '#ec-dist').value || 0;
      if (!distKm) { resultEl.innerHTML = emptyResult('Enter a distance'); return; }
      const dropM = Math.pow(distKm * 1000, 2) / (2 * EARTH_RADIUS_KM * 1000);
      const dropMRefracted = dropM * 0.87; // standard atmospheric refraction correction (~13% reduction)
      resultEl.innerHTML = heroBlock('Curvature drop', `${fmtNum(dropM, 1)} m`, `Over ${distKm} km, ignoring refraction`) +
        `<div class="result-rows">${resultRow('Geometric drop', `${fmtNum(dropM, 1)} m`)}${resultRow('With typical atmospheric refraction', `${fmtNum(dropMRefracted, 1)} m`)}</div>` +
        infoNote('Uses the simple flat-Earth-chord approximation (accurate for terrestrial distances) with Earth\'s mean radius. Atmospheric refraction varies with weather/temperature, so the refracted figure is an illustrative typical correction, not exact.');
    }
    wireLiveCalc(formEl, calc);
  }
};
