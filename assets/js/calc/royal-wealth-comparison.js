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

/* ---------------- Wealth comparison (fun) ---------------- */
CALCULATORS['royal-wealth-comparison'] = {
  render(formEl, resultEl) {
    formEl.innerHTML = `
      <h3>Compare your savings</h3>
      <div class="field-row">
        <div class="field"><label>Your savings/net worth (£)</label><input type="number" id="rw-mine" value="5000"></div>
        <div class="field"><label>Comparison wealth figure (£)</label><input type="number" id="rw-theirs" value="500000000"></div>
      </div>
      <p class="hint" style="margin-top:-8px">Enter any wealth figure you've seen reported to compare against — public estimates of individual or family wealth vary widely and aren't independently verifiable here.</p>`;
    function calc() {
      const mine = +qs(formEl, '#rw-mine').value || 0;
      const theirs = +qs(formEl, '#rw-theirs').value || 0;
      if (!mine || !theirs) { resultEl.innerHTML = emptyResult('Enter both figures'); return; }
      const multiple = theirs / mine;
      const yearsAt10kSaving = theirs / 10000;
      resultEl.innerHTML = heroBlock('They have', `${fmtNum(multiple, 0)}× more`, 'than your current savings') +
        `<div class="result-rows">${resultRow('Your savings', fmtGBP(mine))}${resultRow('Comparison figure', fmtGBP(theirs))}${resultRow('Years to match, saving £10k/yr', fmtNum(yearsAt10kSaving, 0))}</div>` +
        infoNote('Just for fun — enter any wealth figure you\'ve seen reported. Public wealth estimates for individuals and families are just that (estimates), often vary hugely between sources, and aren\'t independently verified here.');
    }
    wireLiveCalc(formEl, calc);
  }
};
