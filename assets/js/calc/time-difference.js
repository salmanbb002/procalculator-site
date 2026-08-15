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

/* ---------------- Time difference ---------------- */
CALCULATORS['time-difference'] = {
  render(formEl, resultEl) {
    formEl.innerHTML = `
      <h3>Select two dates</h3>
      <div class="field"><label>Start</label><input type="datetime-local" id="td-start" value="2026-07-01T09:00"></div>
      <div class="field"><label>End</label><input type="datetime-local" id="td-end" value="2026-07-22T17:30"></div>`;
    function calc() {
      const s = qs(formEl, '#td-start').value, e = qs(formEl, '#td-end').value;
      if (!s || !e) { resultEl.innerHTML = emptyResult('Select a start and end date/time'); return; }
      const start = new Date(s), end = new Date(e);
      let diff = end - start;
      const negative = diff < 0;
      diff = Math.abs(diff);
      const totalMinutes = Math.floor(diff / 60000);
      const days = Math.floor(totalMinutes / 1440);
      const hours = Math.floor((totalMinutes % 1440) / 60);
      const minutes = totalMinutes % 60;
      resultEl.innerHTML = heroBlock('Duration', `${days}d ${hours}h ${minutes}m`, negative ? 'End is before start' : '') +
        `<div class="result-rows">${resultRow('Total days', fmtNum(diff / 86400000, 2))}${resultRow('Total hours', fmtNum(diff / 3600000, 1))}${resultRow('Total minutes', fmtNum(totalMinutes, 0))}</div>`;
    }
    wireLiveCalc(formEl, calc);
  }
};
