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

/* ---------------- Timezone converter ---------------- */
CALCULATORS['timezone-converter'] = {
  render(formEl, resultEl) {
    const ZONES = [
      'Europe/London', 'Europe/Paris', 'America/New_York', 'America/Los_Angeles', 'America/Chicago',
      'Asia/Dubai', 'Asia/Kolkata', 'Asia/Singapore', 'Asia/Tokyo', 'Australia/Sydney', 'Pacific/Auckland', 'UTC'
    ];
    formEl.innerHTML = `
      <h3>Convert time</h3>
      <div class="field-row">
        <div class="field"><label>Date & time</label><input type="datetime-local" id="tz-datetime"></div>
        <div class="field"><label>From timezone</label><select id="tz-from">${ZONES.map(z => `<option ${z === 'Europe/London' ? 'selected' : ''}>${z}</option>`).join('')}</select></div>
      </div>
      <div class="field"><label>To timezone</label><select id="tz-to">${ZONES.map(z => `<option ${z === 'America/New_York' ? 'selected' : ''}>${z}</option>`).join('')}</select></div>`;
    const now = new Date();
    qs(formEl, '#tz-datetime').value = now.toISOString().slice(0, 16);
    function calc() {
      const dtVal = qs(formEl, '#tz-datetime').value;
      const fromZone = qs(formEl, '#tz-from').value;
      const toZone = qs(formEl, '#tz-to').value;
      if (!dtVal) { resultEl.innerHTML = emptyResult('Choose a date and time'); return; }
      try {
        // Interpret the entered local time as if it occurred in the "from" zone
        const [datePart, timePart] = dtVal.split('T');
        const [y, mo, d] = datePart.split('-').map(Number);
        const [h, mi] = timePart.split(':').map(Number);
        // Find UTC instant matching that wall-clock time in fromZone via iterative offset lookup
        let guess = new Date(Date.UTC(y, mo - 1, d, h, mi));
        for (let i = 0; i < 3; i++) {
          const parts = new Intl.DateTimeFormat('en-GB', { timeZone: fromZone, hour12: false, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).formatToParts(guess);
          const get = t => +parts.find(p => p.type === t).value;
          const asUTC = Date.UTC(get('year'), get('month') - 1, get('day'), get('hour') === 24 ? 0 : get('hour'), get('minute'));
          const diff = Date.UTC(y, mo - 1, d, h, mi) - asUTC;
          guess = new Date(guess.getTime() + diff);
        }
        const fmt = (zone) => new Intl.DateTimeFormat('en-GB', { timeZone: zone, dateStyle: 'medium', timeStyle: 'short' }).format(guess);
        resultEl.innerHTML = heroBlock('Converted time', fmt(toZone), toZone) +
          `<div class="result-rows">${resultRow(fromZone, fmt(fromZone))}${resultRow(toZone, fmt(toZone))}</div>` +
          infoNote('Uses your browser\'s IANA timezone database, so daylight saving time is handled automatically and correctly for the date you choose.');
      } catch (e) {
        resultEl.innerHTML = emptyResult('Could not convert — check your date/time');
      }
    }
    wireLiveCalc(formEl, calc);
  }
};
