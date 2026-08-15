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

/* ---------------- Sleep cycle calculator ---------------- */
CALCULATORS['sleep-cycle-calculator'] = {
  render(formEl, resultEl) {
    formEl.innerHTML = `
      <h3>Plan around</h3>
      <div class="field"><label>Mode</label>
        <div class="seg" data-seg="mode"><button data-value="wake" class="active">I need to wake up at...</button><button data-value="bed">I'm going to bed at...</button></div>
      </div>
      <div class="field"><label>Time</label><input type="time" id="sc-time" value="07:00"></div>
      <div class="field"><label>Minutes to fall asleep</label><input type="number" id="sc-fallasleep" value="15"></div>`;
    segControl(formEl, 'mode', calc);
    function calc() {
      const [h, m] = qs(formEl, '#sc-time').value.split(':').map(Number);
      const fallAsleep = +qs(formEl, '#sc-fallasleep').value || 0;
      const mode = segValue(formEl, 'mode');
      if (isNaN(h)) { resultEl.innerHTML = emptyResult('Enter a time'); return; }
      const baseMinutes = h * 60 + m;
      const cycles = [3, 4, 5, 6];
      const times = cycles.map(c => {
        const cycleMin = c * 90;
        let target = mode === 'wake' ? baseMinutes - cycleMin - fallAsleep : baseMinutes + cycleMin + fallAsleep;
        target = ((target % 1440) + 1440) % 1440;
        const th = Math.floor(target / 60), tm = target % 60;
        return { cycles: c, time: `${String(th).padStart(2, '0')}:${String(tm).padStart(2, '0')}`, hours: fmtNum(cycleMin / 60, 1) };
      });
      resultEl.innerHTML = heroBlock(mode === 'wake' ? 'Best bedtimes' : 'Best wake times', times[2].time, `${times[2].cycles} cycles (${times[2].hours}h) — a good default`) +
        `<div class="result-rows">${times.map(t => resultRow(`${t.cycles} cycles (${t.hours}h)`, t.time)).join('')}</div>` +
        infoNote('Based on the standard ~90-minute sleep cycle model. Individual cycle length varies (roughly 70-120 minutes), so treat these as a helpful guide, not an exact science.');
    }
    wireLiveCalc(formEl, calc);
  }
};
