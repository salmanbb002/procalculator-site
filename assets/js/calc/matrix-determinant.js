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

/* ---------------- Matrix determinant ---------------- */
CALCULATORS['matrix-determinant'] = {
  render(formEl, resultEl) {
    formEl.innerHTML = `
      <h3>Matrix size</h3>
      <div class="field"><label>Size</label>
        <div class="seg" data-seg="size"><button data-value="2" class="active">2×2</button><button data-value="3">3×3</button></div>
      </div>
      <div data-group="grid"></div>`;
    function renderGrid() {
      const size = +segValue(formEl, 'size') || 2;
      const grid = formEl.querySelector('[data-group="grid"]');
      let html = '<div style="display:grid;grid-template-columns:repeat(' + size + ',1fr);gap:8px;margin-top:8px">';
      for (let i = 0; i < size * size; i++) html += `<input type="number" class="mx-cell" data-i="${i}" value="${i % (size + 1) === 0 ? 1 : 0}">`;
      html += '</div>';
      grid.innerHTML = html;
      grid.querySelectorAll('.mx-cell').forEach(el => el.addEventListener('input', calc));
    }
    segControl(formEl, 'size', () => { renderGrid(); calc(); });
    function calc() {
      const size = +segValue(formEl, 'size') || 2;
      const cells = [...formEl.querySelectorAll('.mx-cell')].map(el => +el.value || 0);
      let det;
      if (size === 2) {
        det = cells[0] * cells[3] - cells[1] * cells[2];
      } else {
        const m = [[cells[0], cells[1], cells[2]], [cells[3], cells[4], cells[5]], [cells[6], cells[7], cells[8]]];
        det = m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1])
            - m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0])
            + m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);
      }
      resultEl.innerHTML = heroBlock('Determinant', fmtNum(det, 4), `${size}×${size} matrix`) +
        infoNote(det === 0 ? 'A determinant of zero means this matrix is singular (not invertible).' : 'A non-zero determinant means this matrix is invertible.');
    }
    renderGrid();
    calc();
  }
};
