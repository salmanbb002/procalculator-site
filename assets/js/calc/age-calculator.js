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

/* ---------------- Age calculator ---------------- */
CALCULATORS['age-calculator'] = {
  render(formEl, resultEl) {
    formEl.innerHTML = `
      <h3>Your date of birth</h3>
      <div class="field"><label>Date of birth</label><input type="date" id="age-dob" value="1995-06-15"></div>`;
    function calc() {
      const dobVal = qs(formEl, '#age-dob').value;
      if (!dobVal) { resultEl.innerHTML = emptyResult('Select your date of birth'); return; }
      const dob = new Date(dobVal + 'T00:00:00');
      const now = new Date();
      if (dob > now) { resultEl.innerHTML = emptyResult('Date of birth must be in the past'); return; }
      let years = now.getFullYear() - dob.getFullYear();
      let months = now.getMonth() - dob.getMonth();
      let days = now.getDate() - dob.getDate();
      if (days < 0) { months--; days += new Date(now.getFullYear(), now.getMonth(), 0).getDate(); }
      if (months < 0) { years--; months += 12; }
      const totalDays = Math.floor((now - dob) / 86400000);
      let nextBday = new Date(now.getFullYear(), dob.getMonth(), dob.getDate());
      if (nextBday < now) nextBday.setFullYear(now.getFullYear() + 1);
      const daysToBday = Math.ceil((nextBday - now) / 86400000);
      resultEl.innerHTML = heroBlock('Your age', `${years} years`, `${months} months, ${days} days`) +
        `<div class="result-rows">${resultRow('Total days lived', fmtNum(totalDays, 0))}${resultRow('Days to next birthday', daysToBday)}</div>`;
    }
    wireLiveCalc(formEl, calc);
  }
};
