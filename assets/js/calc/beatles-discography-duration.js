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

/* ---------------- Beatles discography duration ---------------- */
CALCULATORS['beatles-discography-duration'] = {
  render(formEl, resultEl) {
    formEl.innerHTML = `
      <h3>Discography (or any artist/collection)</h3>
      <div class="field-row">
        <div class="field"><label>Number of albums</label><input type="number" id="bd-albums" value="13"></div>
        <div class="field"><label>Average album length (minutes)</label><input type="number" id="bd-avg" value="35"></div>
      </div>`;
    function calc() {
      const albums = +qs(formEl, '#bd-albums').value || 0;
      const avg = +qs(formEl, '#bd-avg').value || 0;
      if (!albums || !avg) { resultEl.innerHTML = emptyResult('Enter album count and average length'); return; }
      const totalMin = albums * avg;
      const hours = totalMin / 60;
      resultEl.innerHTML = heroBlock('Total listening time', `${fmtNum(hours, 1)} hours`, `${albums} albums at ~${avg} min each`) +
        `<div class="result-rows">${resultRow('Total albums', albums)}${resultRow('Total minutes', fmtNum(totalMin, 0))}${resultRow('Total hours', fmtNum(hours, 1))}</div>` +
        infoNote('Enter your own album count and average length for any artist or collection — this is a general listening-time calculator, not based on a specific verified discography database.');
    }
    wireLiveCalc(formEl, calc);
  }
};
