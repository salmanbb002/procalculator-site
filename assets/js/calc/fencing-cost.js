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

/* ---------------- Fencing cost calculator ---------------- */
CALCULATORS['fencing-cost'] = {
  render(formEl, resultEl) {
    formEl.innerHTML = `
      <h3>Fence run</h3>
      <div class="field-row">
        <div class="field"><label>Fence length (m)</label><input type="number" id="fc-length" value="20"></div>
        <div class="field"><label>Panel width (m)</label><input type="number" step="0.1" id="fc-panel-w" value="1.83"></div>
      </div>
      <div class="field-row">
        <div class="field"><label>Panel price (£ each)</label><input type="number" id="fc-panel-price" value="35"></div>
        <div class="field"><label>Post price (£ each)</label><input type="number" id="fc-post-price" value="12"></div>
      </div>`;
    function calc() {
      const length = +qs(formEl, '#fc-length').value || 0;
      const panelW = +qs(formEl, '#fc-panel-w').value || 0;
      const panelPrice = +qs(formEl, '#fc-panel-price').value || 0;
      const postPrice = +qs(formEl, '#fc-post-price').value || 0;
      if (!length || !panelW) { resultEl.innerHTML = emptyResult('Enter fence length and panel width'); return; }
      const panels = Math.ceil(length / panelW);
      const posts = panels + 1;
      const totalCost = panels * panelPrice + posts * postPrice;
      resultEl.innerHTML = heroBlock('Estimated material cost', fmtGBP(totalCost), `${panels} panels, ${posts} posts`) +
        `<div class="result-rows">${resultRow('Panels needed', panels)}${resultRow('Posts needed', posts)}${resultRow('Panel cost', fmtGBP(panels * panelPrice))}${resultRow('Post cost', fmtGBP(posts * postPrice))}</div>` +
        infoNote('Excludes concrete/postcrete, gravel boards, fixings and labour. Uses the unit prices you enter — check current prices with your local merchant.');
    }
    wireLiveCalc(formEl, calc);
  }
};
