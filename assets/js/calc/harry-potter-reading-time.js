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

/* ---------------- Harry Potter reading time estimator ---------------- */
CALCULATORS['harry-potter-reading-time'] = {
  render(formEl, resultEl) {
    const TOTAL_WORDS = 1084170; // commonly cited approximate total word count for the 7-book series
    formEl.innerHTML = `
      <h3>Your reading speed</h3>
      <div class="field"><label>Words per minute</label><input type="number" id="hp-wpm" value="238"></div>
      <p class="hint" style="margin-top:-8px">Average adult reading speed is roughly 200-260 wpm. The full 7-book series is commonly cited at around ${fmtNum(TOTAL_WORDS, 0)} words.</p>`;
    function calc() {
      const wpm = +qs(formEl, '#hp-wpm').value || 0;
      if (!wpm) { resultEl.innerHTML = emptyResult('Enter your reading speed'); return; }
      const totalMin = TOTAL_WORDS / wpm;
      const hours = totalMin / 60;
      const days = hours / 8; // assuming 8 hrs/day reading marathon, just for fun context
      resultEl.innerHTML = heroBlock('Total reading time', `${fmtNum(hours, 1)} hours`, `≈ ${fmtNum(days, 1)} days at 8hrs/day`) +
        `<div class="result-rows">${resultRow('Total words (all 7 books)', fmtNum(TOTAL_WORDS, 0))}${resultRow('Your reading speed', `${wpm} wpm`)}${resultRow('Total time', `${fmtNum(hours, 1)} hours`)}</div>` +
        infoNote('Uses a commonly cited approximate total word count for the series and the reading speed you enter — a fun estimate, not an exact publisher-verified figure.');
    }
    wireLiveCalc(formEl, calc);
  }
};
