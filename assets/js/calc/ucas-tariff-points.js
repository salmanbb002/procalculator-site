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

/* ---------------- UCAS tariff points calculator ---------------- */
CALCULATORS['ucas-tariff-points'] = {
  render(formEl, resultEl) {
    const ALEVEL = { 'A*': 56, 'A': 48, 'B': 40, 'C': 32, 'D': 24, 'E': 16 };
    formEl.innerHTML = `
      <h3>A-level grades</h3>
      <p class="hint" style="margin-bottom:12px">Select up to 4 A-levels (leave as "—" if not used)</p>
      <div class="field-row">
        <div class="field"><label>Subject 1</label><select class="ucas-grade">${Object.keys(ALEVEL).map(g => `<option>${g}</option>`).join('')}<option value="">—</option></select></div>
        <div class="field"><label>Subject 2</label><select class="ucas-grade">${Object.keys(ALEVEL).map(g => `<option>${g}</option>`).join('')}<option value="">—</option></select></div>
      </div>
      <div class="field-row">
        <div class="field"><label>Subject 3</label><select class="ucas-grade">${Object.keys(ALEVEL).map(g => `<option>${g}</option>`).join('')}<option value="" selected>—</option></select></div>
        <div class="field"><label>Subject 4</label><select class="ucas-grade">${Object.keys(ALEVEL).map(g => `<option>${g}</option>`).join('')}<option value="" selected>—</option></select></div>
      </div>`;
    formEl.querySelectorAll('.ucas-grade')[2].value = '';
    formEl.querySelectorAll('.ucas-grade')[3].value = '';
    function calc() {
      const grades = [...formEl.querySelectorAll('.ucas-grade')].map(s => s.value).filter(Boolean);
      if (!grades.length) { resultEl.innerHTML = emptyResult('Select at least one grade'); return; }
      const total = grades.reduce((sum, g) => sum + (ALEVEL[g] || 0), 0);
      resultEl.innerHTML = heroBlock('Total UCAS points', total, `${grades.length} A-level(s): ${grades.join(', ')}`) +
        `<div class="result-rows">${grades.map(g => resultRow(g, ALEVEL[g])).join('')}</div>` +
        infoNote('Uses the standard UCAS Tariff points table for A-levels only. BTECs, Scottish Highers, IB and other qualifications use separate tariff tables not included here — check ucas.com for your specific qualification.');
    }
    formEl.addEventListener('change', calc);
    calc();
  }
};
