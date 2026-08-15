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

/* ---------------- Percentage ---------------- */
CALCULATORS['percentage'] = {
  render(formEl, resultEl) {
    formEl.innerHTML = `
      <h3>Choose a calculation</h3>
      <div class="seg" data-seg="mode">
        <button data-value="of" class="active">X% of Y</button>
        <button data-value="what">X is what % of Y</button>
        <button data-value="change">% change</button>
      </div>
      <div class="field-row" style="margin-top:16px">
        <div class="field"><label id="p-label-x">X (%)</label><input type="number" id="p-x" value="20"></div>
        <div class="field"><label id="p-label-y">Y</label><input type="number" id="p-y" value="80"></div>
      </div>`;
    const labels = {
      of: ['X (%)', 'Y'],
      what: ['X', 'Y'],
      change: ['From', 'To'],
    };
    segControl(formEl, 'mode', v => {
      qs(formEl, '#p-label-x').textContent = labels[v][0];
      qs(formEl, '#p-label-y').textContent = labels[v][1];
      calc();
    });
    function calc() {
      const mode = segValue(formEl, 'mode');
      const x = +qs(formEl, '#p-x').value || 0;
      const y = +qs(formEl, '#p-y').value || 0;
      if (mode === 'of') {
        const result = (x / 100) * y;
        resultEl.innerHTML = heroBlock(`${x}% of ${y}`, fmtNum(result)) + infoNote(`${x}% of ${y} = ${fmtNum(result)}`);
      } else if (mode === 'what') {
        const result = y ? (x / y) * 100 : 0;
        resultEl.innerHTML = heroBlock('Percentage', fmtNum(result) + '%') + infoNote(`${x} is ${fmtNum(result)}% of ${y}`);
      } else {
        const result = x ? ((y - x) / x) * 100 : 0;
        const dir = result >= 0 ? 'increase' : 'decrease';
        resultEl.innerHTML = heroBlock('Percentage change', `${result >= 0 ? '+' : ''}${fmtNum(result)}%`, `A ${fmtNum(Math.abs(result))}% ${dir}`);
      }
    }
    wireLiveCalc(formEl, calc);
  }
};
