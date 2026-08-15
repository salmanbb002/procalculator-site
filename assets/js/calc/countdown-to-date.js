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

/* ---------------- Countdown calculator ---------------- */
CALCULATORS['countdown-to-date'] = {
  render(formEl, resultEl) {
    formEl.innerHTML = `
      <h3>Target date</h3>
      <div class="field"><label>Date and time</label><input type="datetime-local" id="cd-target"></div>`;
    const target = new Date(); target.setDate(target.getDate() + 30);
    qs(formEl, '#cd-target').value = target.toISOString().slice(0, 16);
    function calc() {
      const target = new Date(qs(formEl, '#cd-target').value);
      if (isNaN(target)) { resultEl.innerHTML = emptyResult('Choose a target date and time'); return; }
      const now = new Date();
      const diffMs = target - now;
      const isPast = diffMs < 0;
      const absMs = Math.abs(diffMs);
      const days = Math.floor(absMs / 86400000);
      const hours = Math.floor((absMs % 86400000) / 3600000);
      const minutes = Math.floor((absMs % 3600000) / 60000);
      resultEl.innerHTML = heroBlock(isPast ? 'Time since' : 'Time remaining', `${days}d ${hours}h ${minutes}m`, isPast ? 'This date has passed' : 'Until your target date') +
        `<div class="result-rows">${resultRow('Days', days)}${resultRow('Hours', hours)}${resultRow('Minutes', minutes)}</div>`;
    }
    wireLiveCalc(formEl, calc);
  }
};
