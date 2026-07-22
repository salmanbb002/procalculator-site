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

/* ---------------- BMI ---------------- */
CALCULATORS['bmi'] = {
  render(formEl, resultEl) {
    formEl.innerHTML = `
      <h3>Your details</h3>
      <div class="seg" data-seg="unit"><button data-value="metric" class="active">Metric</button><button data-value="imperial">Imperial</button></div>
      <div class="field" style="margin-top:16px" data-group="metric">
        <div class="field-row">
          <div><label>Height (cm)</label><input type="number" id="bmi-h-cm" value="175"></div>
          <div><label>Weight (kg)</label><input type="number" id="bmi-w-kg" value="75"></div>
        </div>
      </div>
      <div class="field" data-group="imperial" style="display:none">
        <div class="field-row">
          <div><label>Height (ft / in)</label><div class="field-row"><input type="number" id="bmi-h-ft" value="5" placeholder="ft"><input type="number" id="bmi-h-in" value="9" placeholder="in"></div></div>
          <div><label>Weight (st / lb)</label><div class="field-row"><input type="number" id="bmi-w-st" value="11" placeholder="st"><input type="number" id="bmi-w-lb" value="11" placeholder="lb"></div></div>
        </div>
      </div>`;
    let unit = 'metric';
    segControl(formEl, 'unit', v => { unit = v; formEl.querySelector('[data-group="metric"]').style.display = v === 'metric' ? '' : 'none'; formEl.querySelector('[data-group="imperial"]').style.display = v === 'imperial' ? '' : 'none'; calc(); });
    function calc() {
      let heightM, weightKg;
      if (unit === 'metric') {
        heightM = (+qs(formEl, '#bmi-h-cm').value || 0) / 100;
        weightKg = +qs(formEl, '#bmi-w-kg').value || 0;
      } else {
        const ft = +qs(formEl, '#bmi-h-ft').value || 0, inch = +qs(formEl, '#bmi-h-in').value || 0;
        heightM = ((ft * 12) + inch) * 0.0254;
        const st = +qs(formEl, '#bmi-w-st').value || 0, lb = +qs(formEl, '#bmi-w-lb').value || 0;
        weightKg = ((st * 14) + lb) * 0.453592;
      }
      if (!heightM || !weightKg) { resultEl.innerHTML = emptyResult('Enter your height and weight'); return; }
      const bmi = weightKg / (heightM * heightM);
      let category, color;
      if (bmi < 18.5) { category = 'Underweight'; }
      else if (bmi < 25) { category = 'Healthy weight'; }
      else if (bmi < 30) { category = 'Overweight'; }
      else { category = 'Obese'; }
      resultEl.innerHTML = heroBlock('Your BMI', bmi.toFixed(1), category) +
        `<div class="result-rows">${resultRow('Height', unit === 'metric' ? `${(heightM * 100).toFixed(0)} cm` : `${qs(formEl, '#bmi-h-ft').value}′ ${qs(formEl, '#bmi-h-in').value}″`)}
        ${resultRow('Weight', unit === 'metric' ? `${weightKg.toFixed(1)} kg` : `${qs(formEl, '#bmi-w-st').value}st ${qs(formEl, '#bmi-w-lb').value}lb`)}
        ${resultRow('Healthy BMI range', '18.5 – 24.9')}</div>` +
        infoNote('BMI is a general screening tool and does not account for muscle mass, frame size or ethnicity. Speak to a GP for personalised advice.');
    }
    wireLiveCalc(formEl, calc);
  }
};

/* ---------------- Mortgage ---------------- */
CALCULATORS['mortgage-repayment'] = {
  render(formEl, resultEl) {
    formEl.innerHTML = `
      <h3>Mortgage details</h3>
      <div class="field"><label>Loan amount</label><input type="number" id="m-amount" value="250000"></div>
      <div class="field-row">
        <div class="field"><label>Interest rate (% p.a.)</label><input type="number" step="0.01" id="m-rate" value="4.5"></div>
        <div class="field"><label>Term (years)</label><input type="number" id="m-term" value="25"></div>
      </div>
      <div class="field"><label>Repayment type</label>
        <div class="seg" data-seg="type"><button data-value="repayment" class="active">Repayment</button><button data-value="interest-only">Interest only</button></div>
      </div>`;
    segControl(formEl, 'type', calc);
    function calc() {
      const P = +qs(formEl, '#m-amount').value || 0;
      const rate = +qs(formEl, '#m-rate').value || 0;
      const years = +qs(formEl, '#m-term').value || 0;
      const type = segValue(formEl, 'type');
      if (!P || !years) { resultEl.innerHTML = emptyResult('Enter your mortgage details'); return; }
      const r = rate / 100 / 12, n = years * 12;
      let monthly, totalPaid, totalInterest;
      if (type === 'interest-only') {
        monthly = P * (rate / 100 / 12);
        totalInterest = monthly * n;
        totalPaid = totalInterest + P;
      } else {
        monthly = r === 0 ? P / n : P * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
        totalPaid = monthly * n;
        totalInterest = totalPaid - P;
      }
      resultEl.innerHTML = heroBlock('Monthly payment', fmtGBP(monthly), `Over ${years} years at ${rate}%`) +
        `<div class="result-rows">${resultRow('Loan amount', fmtGBP(P))}${resultRow('Total repaid', fmtGBP(totalPaid))}${resultRow('Total interest', fmtGBP(totalInterest))}</div>` +
        infoNote('Estimate only — excludes fees, insurance and rate changes. Speak to a mortgage adviser for a formal quote.');
    }
    wireLiveCalc(formEl, calc);
  }
};

/* ---------------- VAT ---------------- */
CALCULATORS['vat'] = {
  render(formEl, resultEl) {
    formEl.innerHTML = `
      <h3>VAT details</h3>
      <div class="field"><label>Mode</label>
        <div class="seg" data-seg="mode"><button data-value="add" class="active">Add VAT (net → gross)</button><button data-value="remove">Remove VAT (gross → net)</button></div>
      </div>
      <div class="field-row">
        <div class="field"><label>Amount (£)</label><input type="number" id="vat-amount" value="100"></div>
        <div class="field"><label>VAT rate (%)</label><input type="number" id="vat-rate" value="20"></div>
      </div>`;
    segControl(formEl, 'mode', calc);
    function calc() {
      const amount = +qs(formEl, '#vat-amount').value || 0;
      const rate = +qs(formEl, '#vat-rate').value || 0;
      const mode = segValue(formEl, 'mode');
      let net, gross, vat;
      if (mode === 'add') { net = amount; gross = net * (1 + rate / 100); vat = gross - net; }
      else { gross = amount; net = gross / (1 + rate / 100); vat = gross - net; }
      resultEl.innerHTML = heroBlock(mode === 'add' ? 'Gross amount' : 'Net amount', fmtGBP(mode === 'add' ? gross : net), `${rate}% VAT`) +
        `<div class="result-rows">${resultRow('Net (excl. VAT)', fmtGBP(net))}${resultRow('VAT amount', fmtGBP(vat))}${resultRow('Gross (incl. VAT)', fmtGBP(gross))}</div>`;
    }
    wireLiveCalc(formEl, calc);
  }
};

/* ---------------- Salary take-home ---------------- */
CALCULATORS['salary-take-home'] = {
  render(formEl, resultEl) {
    formEl.innerHTML = `
      <h3>Your income</h3>
      <div class="field"><label>Annual gross salary</label><input type="number" id="s-gross" value="38000"></div>
      <div class="field"><label>Pension contribution (% of salary, salary sacrifice)</label><input type="number" id="s-pension" value="5"></div>`;
    function calc() {
      const gross = +qs(formEl, '#s-gross').value || 0;
      const pensionPct = +qs(formEl, '#s-pension').value || 0;
      if (!gross) { resultEl.innerHTML = emptyResult('Enter your annual salary'); return; }
      const pensionAmt = gross * pensionPct / 100;
      let taxableIncome = gross - pensionAmt;

      let personalAllowance = 12570;
      if (taxableIncome > 100000) personalAllowance = Math.max(0, 12570 - (taxableIncome - 100000) / 2);

      const basicBand = 50270, higherBand = 125140;
      let tax = 0;
      const taxable = Math.max(0, taxableIncome - personalAllowance);
      const basicPortion = Math.min(taxable, Math.max(0, basicBand - personalAllowance));
      const higherPortion = Math.min(Math.max(0, taxable - basicPortion), Math.max(0, higherBand - basicBand));
      const additionalPortion = Math.max(0, taxable - basicPortion - higherPortion);
      tax = basicPortion * 0.20 + higherPortion * 0.40 + additionalPortion * 0.45;

      const niPrimary = 12570, niUpper = 50270;
      let ni = 0;
      if (taxableIncome > niPrimary) {
        const niBasic = Math.min(taxableIncome, niUpper) - niPrimary;
        ni += Math.max(0, niBasic) * 0.08;
        if (taxableIncome > niUpper) ni += (taxableIncome - niUpper) * 0.02;
      }

      const takeHome = taxableIncome - tax - ni;
      const monthly = takeHome / 12;
      const effectiveRate = gross ? ((tax + ni) / gross) * 100 : 0;

      resultEl.innerHTML = heroBlock('Monthly take-home', fmtGBP(monthly), `${fmtGBP(takeHome)} per year`) +
        `<div class="result-rows">
          ${resultRow('Gross salary', fmtGBP(gross))}
          ${resultRow('Pension contribution', fmtGBP(pensionAmt))}
          ${resultRow('Income Tax', fmtGBP(tax))}
          ${resultRow('National Insurance', fmtGBP(ni))}
          ${resultRow('Effective tax + NI rate', fmtNum(effectiveRate, 1) + '%')}
        </div>` +
        infoNote('Simplified estimate using standard England/Wales/NI tax bands. Excludes student loans, benefits-in-kind and Scottish tax rates. Not financial advice.');
    }
    wireLiveCalc(formEl, calc);
  }
};

/* ---------------- Compound interest ---------------- */
CALCULATORS['compound-interest'] = {
  render(formEl, resultEl) {
    formEl.innerHTML = `
      <h3>Savings details</h3>
      <div class="field-row">
        <div class="field"><label>Starting amount</label><input type="number" id="c-principal" value="5000"></div>
        <div class="field"><label>Monthly contribution</label><input type="number" id="c-monthly" value="200"></div>
      </div>
      <div class="field-row">
        <div class="field"><label>Annual interest rate (%)</label><input type="number" step="0.1" id="c-rate" value="5"></div>
        <div class="field"><label>Years</label><input type="number" id="c-years" value="10"></div>
      </div>`;
    function calc() {
      const P = +qs(formEl, '#c-principal').value || 0;
      const pmt = +qs(formEl, '#c-monthly').value || 0;
      const rate = +qs(formEl, '#c-rate').value || 0;
      const years = +qs(formEl, '#c-years').value || 0;
      if (!years) { resultEl.innerHTML = emptyResult('Enter a savings term'); return; }
      const r = rate / 100 / 12, n = years * 12;
      const fvPrincipal = P * Math.pow(1 + r, n);
      const fvContrib = r === 0 ? pmt * n : pmt * ((Math.pow(1 + r, n) - 1) / r);
      const futureValue = fvPrincipal + fvContrib;
      const totalContributions = P + pmt * n;
      const totalInterest = futureValue - totalContributions;
      resultEl.innerHTML = heroBlock('Future value', fmtGBP(futureValue), `After ${years} years`) +
        `<div class="result-rows">${resultRow('Total contributions', fmtGBP(totalContributions))}${resultRow('Interest earned', fmtGBP(totalInterest))}</div>` +
        infoNote('Assumes monthly compounding at a fixed rate. Real returns vary with the account or investment used.');
    }
    wireLiveCalc(formEl, calc);
  }
};

/* ---------------- Loan repayment ---------------- */
CALCULATORS['loan-repayment'] = {
  render(formEl, resultEl) {
    formEl.innerHTML = `
      <h3>Loan details</h3>
      <div class="field"><label>Loan amount</label><input type="number" id="l-amount" value="12000"></div>
      <div class="field-row">
        <div class="field"><label>APR (%)</label><input type="number" step="0.1" id="l-rate" value="8.9"></div>
        <div class="field"><label>Term (months)</label><input type="number" id="l-term" value="48"></div>
      </div>`;
    function calc() {
      const P = +qs(formEl, '#l-amount').value || 0;
      const rate = +qs(formEl, '#l-rate').value || 0;
      const n = +qs(formEl, '#l-term').value || 0;
      if (!P || !n) { resultEl.innerHTML = emptyResult('Enter your loan details'); return; }
      const r = rate / 100 / 12;
      const monthly = r === 0 ? P / n : P * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
      const totalPaid = monthly * n;
      resultEl.innerHTML = heroBlock('Monthly repayment', fmtGBP(monthly), `Over ${n} months at ${rate}% APR`) +
        `<div class="result-rows">${resultRow('Loan amount', fmtGBP(P))}${resultRow('Total repayable', fmtGBP(totalPaid))}${resultRow('Total interest', fmtGBP(totalPaid - P))}</div>`;
    }
    wireLiveCalc(formEl, calc);
  }
};

/* ---------------- Redundancy pay ---------------- */
CALCULATORS['redundancy-pay'] = {
  render(formEl, resultEl) {
    const CAP = 719;
    formEl.innerHTML = `
      <h3>Your details</h3>
      <div class="field-row">
        <div class="field"><label>Current age</label><input type="number" id="r-age" value="45"></div>
        <div class="field"><label>Full years of service</label><input type="number" id="r-years" value="8"></div>
      </div>
      <div class="field"><label>Weekly pay (before tax)</label><input type="number" id="r-weekly" value="600"></div>`;
    function calc() {
      const age = +qs(formEl, '#r-age').value || 0;
      const years = Math.min(20, +qs(formEl, '#r-years').value || 0);
      const weeklyPay = Math.min(CAP, +qs(formEl, '#r-weekly').value || 0);
      if (!age || !years) { resultEl.innerHTML = emptyResult('Enter your age and length of service'); return; }
      let weeksOwed = 0;
      for (let i = 0; i < years; i++) {
        const ageThatYear = age - i;
        if (ageThatYear < 22) weeksOwed += 0.5;
        else if (ageThatYear <= 40) weeksOwed += 1;
        else weeksOwed += 1.5;
      }
      const total = weeksOwed * weeklyPay;
      resultEl.innerHTML = heroBlock('Estimated redundancy pay', fmtGBP(total), `${fmtNum(weeksOwed, 1)} weeks' pay`) +
        `<div class="result-rows">${resultRow('Capped weekly pay used', fmtGBP(weeklyPay))}${resultRow('Years counted (max 20)', years)}</div>` +
        infoNote(`Uses the statutory weekly pay cap of ${fmtGBP(CAP)}. Check gov.uk for the current cap — this changes each tax year.`);
    }
    wireLiveCalc(formEl, calc);
  }
};

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

/* ---------------- Standard deviation ---------------- */
CALCULATORS['standard-deviation'] = {
  render(formEl, resultEl) {
    formEl.innerHTML = `
      <h3>Enter your data</h3>
      <div class="field"><label>Numbers (comma or space separated)</label><textarea id="sd-data" rows="4">4, 8, 6, 5, 3, 9, 7</textarea><span class="hint">Example: 4, 8, 6, 5, 3, 9, 7</span></div>`;
    function calc() {
      const raw = qs(formEl, '#sd-data').value;
      const nums = raw.split(/[\s,]+/).map(Number).filter(n => !isNaN(n) && raw.trim() !== '');
      if (nums.length < 2) { resultEl.innerHTML = emptyResult('Enter at least two numbers'); return; }
      const mean = nums.reduce((a, b) => a + b, 0) / nums.length;
      const sqDiffs = nums.map(n => Math.pow(n - mean, 2));
      const popVariance = sqDiffs.reduce((a, b) => a + b, 0) / nums.length;
      const sampleVariance = sqDiffs.reduce((a, b) => a + b, 0) / (nums.length - 1);
      resultEl.innerHTML = heroBlock('Standard deviation (sample)', fmtNum(Math.sqrt(sampleVariance), 3)) +
        `<div class="result-rows">${resultRow('Count', nums.length)}${resultRow('Mean', fmtNum(mean, 3))}${resultRow('Sample variance', fmtNum(sampleVariance, 3))}${resultRow('Population std. dev.', fmtNum(Math.sqrt(popVariance), 3))}</div>`;
    }
    wireLiveCalc(formEl, calc);
  }
};

/* ---------------- Quadratic solver ---------------- */
CALCULATORS['quadratic-solver'] = {
  render(formEl, resultEl) {
    formEl.innerHTML = `
      <h3>ax² + bx + c = 0</h3>
      <div class="field-row">
        <div class="field"><label>a</label><input type="number" id="q-a" value="1"></div>
        <div class="field"><label>b</label><input type="number" id="q-b" value="-3"></div>
        <div class="field"><label>c</label><input type="number" id="q-c" value="2"></div>
      </div>`;
    function calc() {
      const a = +qs(formEl, '#q-a').value || 0, b = +qs(formEl, '#q-b').value || 0, c = +qs(formEl, '#q-c').value || 0;
      if (!a) { resultEl.innerHTML = emptyResult('"a" cannot be zero in a quadratic equation'); return; }
      const d = b * b - 4 * a * c;
      if (d > 0) {
        const x1 = (-b + Math.sqrt(d)) / (2 * a), x2 = (-b - Math.sqrt(d)) / (2 * a);
        resultEl.innerHTML = heroBlock('Two real roots', `x₁ = ${fmtNum(x1, 4)}`, `x₂ = ${fmtNum(x2, 4)}`) + `<div class="result-rows">${resultRow('Discriminant', fmtNum(d, 4))}</div>`;
      } else if (d === 0) {
        const x = -b / (2 * a);
        resultEl.innerHTML = heroBlock('One real root', `x = ${fmtNum(x, 4)}`) + `<div class="result-rows">${resultRow('Discriminant', '0')}</div>`;
      } else {
        const re = (-b / (2 * a)).toFixed(4), im = (Math.sqrt(-d) / (2 * a)).toFixed(4);
        resultEl.innerHTML = heroBlock('Two complex roots', `${re} ± ${im}i`) + `<div class="result-rows">${resultRow('Discriminant', fmtNum(d, 4))}</div>`;
      }
    }
    wireLiveCalc(formEl, calc);
  }
};

/* ---------------- BMR / Calorie ---------------- */
CALCULATORS['bmr-calorie'] = {
  render(formEl, resultEl) {
    formEl.innerHTML = `
      <h3>Your details</h3>
      <div class="seg" data-seg="sex"><button data-value="male" class="active">Male</button><button data-value="female">Female</button></div>
      <div class="field-row" style="margin-top:16px">
        <div class="field"><label>Age</label><input type="number" id="bm-age" value="30"></div>
        <div class="field"><label>Height (cm)</label><input type="number" id="bm-h" value="175"></div>
      </div>
      <div class="field-row">
        <div class="field"><label>Weight (kg)</label><input type="number" id="bm-w" value="75"></div>
        <div class="field"><label>Activity level</label>
          <select id="bm-activity">
            <option value="1.2">Sedentary</option>
            <option value="1.375" selected>Light exercise</option>
            <option value="1.55">Moderate exercise</option>
            <option value="1.725">Very active</option>
            <option value="1.9">Extremely active</option>
          </select>
        </div>
      </div>`;
    segControl(formEl, 'sex', calc);
    function calc() {
      const sex = segValue(formEl, 'sex');
      const age = +qs(formEl, '#bm-age').value || 0, h = +qs(formEl, '#bm-h').value || 0, w = +qs(formEl, '#bm-w').value || 0;
      const activity = +qs(formEl, '#bm-activity').value;
      if (!age || !h || !w) { resultEl.innerHTML = emptyResult('Enter your age, height and weight'); return; }
      const bmr = sex === 'male' ? 10 * w + 6.25 * h - 5 * age + 5 : 10 * w + 6.25 * h - 5 * age - 161;
      const tdee = bmr * activity;
      resultEl.innerHTML = heroBlock('Maintenance calories', `${fmtNum(tdee, 0)} kcal/day`, `BMR: ${fmtNum(bmr, 0)} kcal/day`) +
        `<div class="result-rows">${resultRow('Mild weight loss', fmtNum(tdee - 500, 0) + ' kcal/day')}${resultRow('Mild weight gain', fmtNum(tdee + 500, 0) + ' kcal/day')}</div>` +
        infoNote('Based on the Mifflin-St Jeor equation. Individual needs vary — consult a health professional for tailored advice.');
    }
    wireLiveCalc(formEl, calc);
  }
};

/* ---------------- Pregnancy due date ---------------- */
CALCULATORS['pregnancy-due-date'] = {
  render(formEl, resultEl) {
    const today = new Date().toISOString().split('T')[0];
    formEl.innerHTML = `
      <h3>First day of your last period</h3>
      <div class="field"><label>Last menstrual period (LMP) date</label><input type="date" id="pg-lmp" value="${today}"></div>`;
    function calc() {
      const lmpVal = qs(formEl, '#pg-lmp').value;
      if (!lmpVal) { resultEl.innerHTML = emptyResult('Select the first day of your last period'); return; }
      const lmp = new Date(lmpVal + 'T00:00:00');
      const due = new Date(lmp.getTime() + 280 * 86400000);
      const now = new Date();
      const daysSince = Math.floor((now - lmp) / 86400000);
      const weeks = Math.floor(daysSince / 7), days = daysSince % 7;
      const dueStr = due.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
      let trimester = 'Not yet started';
      if (daysSince >= 0 && daysSince < 280) trimester = daysSince < 91 ? 'First trimester' : daysSince < 189 ? 'Second trimester' : 'Third trimester';
      resultEl.innerHTML = heroBlock('Estimated due date', dueStr, '40 weeks from LMP') +
        `<div class="result-rows">${resultRow('Current gestation', daysSince >= 0 ? `${weeks}w ${days}d` : '—')}${resultRow('Trimester', trimester)}</div>` +
        infoNote('Based on a standard 280-day (40-week) pregnancy from your last period. Your midwife may adjust this after a scan.');
    }
    wireLiveCalc(formEl, calc);
  }
};

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

/* ---------------- Time difference ---------------- */
CALCULATORS['time-difference'] = {
  render(formEl, resultEl) {
    formEl.innerHTML = `
      <h3>Select two dates</h3>
      <div class="field"><label>Start</label><input type="datetime-local" id="td-start" value="2026-07-01T09:00"></div>
      <div class="field"><label>End</label><input type="datetime-local" id="td-end" value="2026-07-22T17:30"></div>`;
    function calc() {
      const s = qs(formEl, '#td-start').value, e = qs(formEl, '#td-end').value;
      if (!s || !e) { resultEl.innerHTML = emptyResult('Select a start and end date/time'); return; }
      const start = new Date(s), end = new Date(e);
      let diff = end - start;
      const negative = diff < 0;
      diff = Math.abs(diff);
      const totalMinutes = Math.floor(diff / 60000);
      const days = Math.floor(totalMinutes / 1440);
      const hours = Math.floor((totalMinutes % 1440) / 60);
      const minutes = totalMinutes % 60;
      resultEl.innerHTML = heroBlock('Duration', `${days}d ${hours}h ${minutes}m`, negative ? 'End is before start' : '') +
        `<div class="result-rows">${resultRow('Total days', fmtNum(diff / 86400000, 2))}${resultRow('Total hours', fmtNum(diff / 3600000, 1))}${resultRow('Total minutes', fmtNum(totalMinutes, 0))}</div>`;
    }
    wireLiveCalc(formEl, calc);
  }
};

/* ---------------- Concrete mix ---------------- */
CALCULATORS['concrete-mix'] = {
  render(formEl, resultEl) {
    formEl.innerHTML = `
      <h3>Pour dimensions</h3>
      <div class="field-row">
        <div class="field"><label>Length (m)</label><input type="number" id="cm-l" value="4"></div>
        <div class="field"><label>Width (m)</label><input type="number" id="cm-w" value="3"></div>
      </div>
      <div class="field"><label>Depth (mm)</label><input type="number" id="cm-d" value="100"></div>
      <div class="field"><label>Mix ratio (cement : sand : aggregate)</label>
        <select id="cm-ratio">
          <option value="1,2,4" selected>1 : 2 : 4 (general purpose)</option>
          <option value="1,1.5,3">1 : 1.5 : 3 (standard/paths)</option>
          <option value="1,3,6">1 : 3 : 6 (mass concrete)</option>
        </select>
      </div>`;
    function calc() {
      const L = +qs(formEl, '#cm-l').value || 0, W = +qs(formEl, '#cm-w').value || 0, D = (+qs(formEl, '#cm-d').value || 0) / 1000;
      const [c, s, a] = qs(formEl, '#cm-ratio').value.split(',').map(Number);
      const volume = L * W * D;
      if (!volume) { resultEl.innerHTML = emptyResult('Enter the pour dimensions'); return; }
      const dryVolume = volume * 1.54;
      const parts = c + s + a;
      const cementVol = dryVolume * (c / parts), sandVol = dryVolume * (s / parts), aggVol = dryVolume * (a / parts);
      const cementKg = cementVol * 1440;
      const bags25 = cementKg / 25;
      resultEl.innerHTML = heroBlock('Concrete volume', `${fmtNum(volume, 3)} m³`, `${fmtNum(bags25, 1)} × 25kg cement bags`) +
        `<div class="result-rows">${resultRow('Cement', `${fmtNum(cementKg, 0)} kg`)}${resultRow('Sand', `${fmtNum(sandVol, 3)} m³`)}${resultRow('Aggregate', `${fmtNum(aggVol, 3)} m³`)}</div>` +
        infoNote('Estimate includes a 1.54× dry-volume allowance for shrinkage and voids. Always round materials up.');
    }
    wireLiveCalc(formEl, calc);
  }
};

/* ---------------- Paint coverage ---------------- */
CALCULATORS['paint-coverage'] = {
  render(formEl, resultEl) {
    formEl.innerHTML = `
      <h3>Room dimensions</h3>
      <div class="field-row">
        <div class="field"><label>Length (m)</label><input type="number" id="pc-l" value="4"></div>
        <div class="field"><label>Width (m)</label><input type="number" id="pc-w" value="3.5"></div>
      </div>
      <div class="field-row">
        <div class="field"><label>Height (m)</label><input type="number" id="pc-h" value="2.4"></div>
        <div class="field"><label>Coats</label><input type="number" id="pc-coats" value="2"></div>
      </div>
      <div class="field-row">
        <div class="field"><label>Doors</label><input type="number" id="pc-doors" value="1"></div>
        <div class="field"><label>Windows</label><input type="number" id="pc-windows" value="1"></div>
      </div>`;
    function calc() {
      const L = +qs(formEl, '#pc-l').value || 0, W = +qs(formEl, '#pc-w').value || 0, H = +qs(formEl, '#pc-h').value || 0;
      const coats = +qs(formEl, '#pc-coats').value || 1;
      const doors = +qs(formEl, '#pc-doors').value || 0, windows = +qs(formEl, '#pc-windows').value || 0;
      const wallArea = Math.max(0, 2 * (L + W) * H - doors * 1.6 - windows * 1.4);
      if (!wallArea) { resultEl.innerHTML = emptyResult('Enter your room dimensions'); return; }
      const coverageRate = 12;
      const litres = (wallArea * coats) / coverageRate;
      resultEl.innerHTML = heroBlock('Paint needed', `${fmtNum(litres, 1)} litres`, `${coats} coat(s) at ~${coverageRate}m²/litre`) +
        `<div class="result-rows">${resultRow('Wall area', `${fmtNum(wallArea, 1)} m²`)}${resultRow('Suggested tins', litres <= 2.5 ? '1 × 2.5L' : litres <= 5 ? '1 × 5L' : `${Math.ceil(litres / 5)} × 5L`)}</div>`;
    }
    wireLiveCalc(formEl, calc);
  }
};

/* ---------------- Fuel cost / MPG ---------------- */
CALCULATORS['fuel-cost-mpg'] = {
  render(formEl, resultEl) {
    formEl.innerHTML = `
      <h3>Trip details</h3>
      <div class="field-row">
        <div class="field"><label>Distance (miles)</label><input type="number" id="fc-dist" value="200"></div>
        <div class="field"><label>Fuel economy (MPG)</label><input type="number" id="fc-mpg" value="45"></div>
      </div>
      <div class="field"><label>Fuel price (£ per litre)</label><input type="number" step="0.01" id="fc-price" value="1.48"></div>`;
    function calc() {
      const dist = +qs(formEl, '#fc-dist').value || 0, mpg = +qs(formEl, '#fc-mpg').value || 0, price = +qs(formEl, '#fc-price').value || 0;
      if (!dist || !mpg) { resultEl.innerHTML = emptyResult('Enter distance and MPG'); return; }
      const l100km = 282.481 / mpg;
      const km = dist * 1.60934;
      const litresUsed = (km / 100) * l100km;
      const cost = litresUsed * price;
      resultEl.innerHTML = heroBlock('Trip fuel cost', fmtGBP(cost), `${fmtNum(litresUsed, 1)} litres used`) +
        `<div class="result-rows">${resultRow('Fuel economy', `${fmtNum(l100km, 1)} L/100km`)}${resultRow('Distance', `${dist} miles (${fmtNum(km, 0)} km)`)}</div>`;
    }
    wireLiveCalc(formEl, calc);
  }
};

/* ---------------- Car finance PCP/HP ---------------- */
CALCULATORS['car-finance-pcp'] = {
  render(formEl, resultEl) {
    formEl.innerHTML = `
      <h3>Finance details</h3>
      <div class="field"><label>Cash price</label><input type="number" id="cf-price" value="24000"></div>
      <div class="field-row">
        <div class="field"><label>Deposit</label><input type="number" id="cf-deposit" value="3000"></div>
        <div class="field"><label>Balloon / GFV (0 for HP)</label><input type="number" id="cf-gfv" value="9000"></div>
      </div>
      <div class="field-row">
        <div class="field"><label>APR (%)</label><input type="number" step="0.1" id="cf-apr" value="7.9"></div>
        <div class="field"><label>Term (months)</label><input type="number" id="cf-term" value="36"></div>
      </div>`;
    function calc() {
      const price = +qs(formEl, '#cf-price').value || 0, deposit = +qs(formEl, '#cf-deposit').value || 0;
      const gfv = +qs(formEl, '#cf-gfv').value || 0, apr = +qs(formEl, '#cf-apr').value || 0, n = +qs(formEl, '#cf-term').value || 0;
      const financeAmount = price - deposit - gfv;
      if (!price || !n || financeAmount <= 0) { resultEl.innerHTML = emptyResult('Check your price, deposit and balloon amount'); return; }
      const r = apr / 100 / 12;
      const monthly = r === 0 ? financeAmount / n : financeAmount * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
      const totalPayable = deposit + monthly * n + gfv;
      resultEl.innerHTML = heroBlock('Estimated monthly payment', fmtGBP(monthly), `Over ${n} months at ${apr}% APR`) +
        `<div class="result-rows">${resultRow('Amount financed', fmtGBP(financeAmount))}${resultRow('Optional final payment (GFV)', fmtGBP(gfv))}${resultRow('Total payable', fmtGBP(totalPayable))}</div>` +
        infoNote('Simplified estimate — real PCP/HP quotes depend on the lender\'s specific rate calculation and fees.');
    }
    wireLiveCalc(formEl, calc);
  }
};

/* ---------------- Unit converter ---------------- */
CALCULATORS['unit-converter'] = {
  render(formEl, resultEl) {
    const units = {
      length: { mm: 0.001, cm: 0.01, m: 1, km: 1000, in: 0.0254, ft: 0.3048, yd: 0.9144, mi: 1609.34 },
      weight: { mg: 0.000001, g: 0.001, kg: 1, tonne: 1000, oz: 0.0283495, lb: 0.453592, stone: 6.35029 },
      temperature: null,
    };
    formEl.innerHTML = `
      <h3>Convert units</h3>
      <div class="field"><label>Category</label>
        <select id="uc-cat"><option value="length">Length</option><option value="weight">Weight</option><option value="temperature">Temperature</option></select>
      </div>
      <div class="field-row">
        <div class="field"><label>Value</label><input type="number" id="uc-value" value="100"></div>
        <div class="field"><label>From</label><select id="uc-from"></select></div>
      </div>
      <div class="field"><label>To</label><select id="uc-to"></select></div>`;
    const fromSel = qs(formEl, '#uc-from'), toSel = qs(formEl, '#uc-to'), catSel = qs(formEl, '#uc-cat');
    function populate() {
      const cat = catSel.value;
      const keys = cat === 'temperature' ? ['C', 'F', 'K'] : Object.keys(units[cat]);
      fromSel.innerHTML = keys.map(k => `<option value="${k}">${k}</option>`).join('');
      toSel.innerHTML = keys.map((k, i) => `<option value="${k}" ${i === 1 ? 'selected' : ''}>${k}</option>`).join('');
    }
    function toCelsius(v, unit) { return unit === 'C' ? v : unit === 'F' ? (v - 32) * 5 / 9 : v - 273.15; }
    function fromCelsius(v, unit) { return unit === 'C' ? v : unit === 'F' ? v * 9 / 5 + 32 : v + 273.15; }
    function calc() {
      const cat = catSel.value, value = +qs(formEl, '#uc-value').value || 0;
      const from = fromSel.value, to = toSel.value;
      let result;
      if (cat === 'temperature') { result = fromCelsius(toCelsius(value, from), to); }
      else { result = (value * units[cat][from]) / units[cat][to]; }
      resultEl.innerHTML = heroBlock(`${fmtNum(value)} ${from} =`, `${fmtNum(result, 4)} ${to}`) +
        infoNote(`1 ${from} = ${fmtNum(cat === 'temperature' ? fromCelsius(toCelsius(1, from), to) : units[cat][from] / units[cat][to], 6)} ${to}`);
    }
    catSel.addEventListener('change', () => { populate(); calc(); });
    populate();
    wireLiveCalc(formEl, calc);
  }
};

/* ---------------- School year checker ---------------- */
CALCULATORS['school-year-checker'] = {
  render(formEl, resultEl) {
    formEl.innerHTML = `
      <h3>Child's date of birth</h3>
      <div class="field"><label>Date of birth</label><input type="date" id="sy-dob" value="2020-04-10"></div>
      <span class="hint">Uses the England &amp; Wales 1 September school-year cutoff.</span>`;
    function calc() {
      const dobVal = qs(formEl, '#sy-dob').value;
      if (!dobVal) { resultEl.innerHTML = emptyResult('Select a date of birth'); return; }
      const dob = new Date(dobVal + 'T00:00:00');
      const today = new Date();
      const cohortStart = (dob.getMonth() + 1) >= 9 ? dob.getFullYear() : dob.getFullYear() - 1;
      const academicStart = (today.getMonth() + 1) >= 9 ? today.getFullYear() : today.getFullYear() - 1;
      const n = academicStart - cohortStart;
      const yearGroup = n - 5;
      let label;
      if (yearGroup < 0) label = 'Not yet school age';
      else if (yearGroup === 0) label = 'Reception';
      else if (yearGroup >= 1 && yearGroup <= 11) label = `Year ${yearGroup}`;
      else if (yearGroup === 12) label = 'Year 12 (Lower Sixth)';
      else if (yearGroup === 13) label = 'Year 13 (Upper Sixth)';
      else label = 'Left secondary school';
      resultEl.innerHTML = heroBlock('Current school year', label, `Academic year ${academicStart}/${academicStart + 1}`) +
        infoNote('Scotland uses a different (1 March) cutoff, so results may vary north of the border.');
    }
    wireLiveCalc(formEl, calc);
  }
};

/* ---------------- Meal prep savings ---------------- */
CALCULATORS['meal-prep-savings'] = {
  render(formEl, resultEl) {
    formEl.innerHTML = `
      <h3>Your habits</h3>
      <div class="field-row">
        <div class="field"><label>Cost per meal eating out</label><input type="number" step="0.5" id="mp-out" value="12"></div>
        <div class="field"><label>Cost per meal-prepped meal</label><input type="number" step="0.5" id="mp-in" value="3.5"></div>
      </div>
      <div class="field"><label>Meals per week</label><input type="number" id="mp-count" value="5"></div>`;
    function calc() {
      const out = +qs(formEl, '#mp-out').value || 0, inn = +qs(formEl, '#mp-in').value || 0, count = +qs(formEl, '#mp-count').value || 0;
      const weekly = (out - inn) * count;
      resultEl.innerHTML = heroBlock('Yearly savings', fmtGBP(weekly * 52), `${fmtGBP(weekly)} per week`) +
        `<div class="result-rows">${resultRow('Monthly savings', fmtGBP(weekly * 4.33))}${resultRow('Weekly savings', fmtGBP(weekly))}</div>`;
    }
    wireLiveCalc(formEl, calc);
  }
};

/* ---------------- Sunday roast burpees ---------------- */
CALCULATORS['sunday-roast-burpees'] = {
  render(formEl, resultEl) {
    formEl.innerHTML = `
      <h3>Meal calories</h3>
      <div class="field"><label>Calories in your Sunday roast</label><input type="number" id="sr-cal" value="1200"></div>`;
    function calc() {
      const cal = +qs(formEl, '#sr-cal').value || 0;
      const burpees = cal / 0.71;
      const minutes = burpees / 15;
      resultEl.innerHTML = heroBlock('Burpees required', fmtNum(burpees, 0), `≈ ${fmtNum(minutes, 0)} minutes non-stop`) +
        infoNote('Based on ~0.71 kcal burned per burpee at a steady pace. Please stretch first.');
    }
    wireLiveCalc(formEl, calc);
  }
};

/* ---------------- Double decker height ---------------- */
CALCULATORS['double-decker-height'] = {
  render(formEl, resultEl) {
    formEl.innerHTML = `
      <h3>Your height</h3>
      <div class="field"><label>Height (cm)</label><input type="number" id="db-h" value="175"></div>`;
    function calc() {
      const h = +qs(formEl, '#db-h').value || 0;
      const buses = h / 443;
      resultEl.innerHTML = heroBlock('Double-decker buses', `${fmtNum(buses, 2)} 🚌`, `A London bus is ~4.43m tall`) +
        infoNote(`Stack ${fmtNum(1 / buses, 1)} of you to match one double-decker bus.`);
    }
    wireLiveCalc(formEl, calc);
  }
};

/* ---------------- Time with parents ---------------- */
CALCULATORS['time-with-parents'] = {
  render(formEl, resultEl) {
    formEl.innerHTML = `
      <h3>Estimate your remaining time together</h3>
      <div class="field-row">
        <div class="field"><label>Parent's current age</label><input type="number" id="tp-age" value="68"></div>
        <div class="field"><label>Assumed life expectancy</label><input type="number" id="tp-life" value="82"></div>
      </div>
      <div class="field-row">
        <div class="field"><label>Visits per year</label><input type="number" id="tp-visits" value="12"></div>
        <div class="field"><label>Hours per visit</label><input type="number" id="tp-hours" value="4"></div>
      </div>`;
    function calc() {
      const age = +qs(formEl, '#tp-age').value || 0, life = +qs(formEl, '#tp-life').value || 0;
      const visits = +qs(formEl, '#tp-visits').value || 0, hours = +qs(formEl, '#tp-hours').value || 0;
      const yearsLeft = Math.max(0, life - age);
      const totalHours = yearsLeft * visits * hours;
      resultEl.innerHTML = heroBlock('Estimated time remaining', `${fmtNum(totalHours, 0)} hours`, `≈ ${fmtNum(totalHours / 24, 0)} days together`) +
        `<div class="result-rows">${resultRow('Years remaining (estimate)', yearsLeft)}${resultRow('Total visits', yearsLeft * visits)}</div>` +
        infoNote('A gentle reminder, not a prediction — based on averages you provide. Make the visits count.');
    }
    wireLiveCalc(formEl, calc);
  }
};
