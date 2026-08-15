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

/* ---------------- GCSE grade boundary checker ---------------- */
CALCULATORS['gcse-grade-boundary'] = {
  render(formEl, resultEl) {
    formEl.innerHTML = `
      <h3>Your mark</h3>
      <div class="field-row">
        <div class="field"><label>Raw mark achieved</label><input type="number" id="gc-mark" value="65"></div>
        <div class="field"><label>Total marks available</label><input type="number" id="gc-total" value="100"></div>
      </div>`;
    function calc() {
      const mark = +qs(formEl, '#gc-mark').value || 0;
      const total = +qs(formEl, '#gc-total').value || 0;
      if (!total) { resultEl.innerHTML = emptyResult('Enter total marks available'); return; }
      const pct = (mark / total) * 100;
      const bands = [
        [90, '9'], [80, '8'], [70, '7'], [60, '6'], [50, '5'], [40, '4'], [30, '3'], [20, '2'], [10, '1'], [0, 'U']
      ];
      const grade = (bands.find(b => pct >= b[0]) || bands[bands.length - 1])[1];
      resultEl.innerHTML = heroBlock('Illustrative grade', grade, `${fmtNum(pct, 1)}% of available marks`) +
        `<div class="result-rows">${resultRow('Mark', `${mark} / ${total}`)}${resultRow('Percentage', `${fmtNum(pct, 1)}%`)}</div>` +
        infoNote('This uses evenly-spaced illustrative bands, NOT real grade boundaries. Actual GCSE grade boundaries are set separately for every subject, exam board and exam series based on that paper\'s difficulty, and are published by exam boards after results day — this tool cannot know your real boundary. Check your specific exam board\'s published boundaries for an accurate grade.');
    }
    wireLiveCalc(formEl, calc);
  }
};
