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

/* ---------------- Netflix binge time calculator ---------------- */
CALCULATORS['netflix-binge-time'] = {
  render(formEl, resultEl) {
    formEl.innerHTML = `
      <h3>Your show</h3>
      <div class="field-row">
        <div class="field"><label>Number of episodes</label><input type="number" id="nb-episodes" value="24"></div>
        <div class="field"><label>Average episode length (minutes)</label><input type="number" id="nb-length" value="45"></div>
      </div>
      <div class="field"><label>Hours you'll watch per day</label><input type="number" id="nb-perday" value="2"></div>`;
    function calc() {
      const episodes = +qs(formEl, '#nb-episodes').value || 0;
      const length = +qs(formEl, '#nb-length').value || 0;
      const perDay = +qs(formEl, '#nb-perday').value || 0;
      if (!episodes || !length) { resultEl.innerHTML = emptyResult('Enter episode count and length'); return; }
      const totalMin = episodes * length;
      const totalHours = totalMin / 60;
      const days = perDay ? totalHours / perDay : 0;
      resultEl.innerHTML = heroBlock('Total binge time', `${fmtNum(totalHours, 1)} hours`, perDay ? `${fmtNum(days, 1)} days at ${perDay}hrs/day` : '') +
        `<div class="result-rows">${resultRow('Episodes', episodes)}${resultRow('Total time', `${fmtNum(totalHours, 1)} hours`)}${resultRow('Days to finish', perDay ? fmtNum(days, 1) : '—')}</div>`;
    }
    wireLiveCalc(formEl, calc);
  }
};
