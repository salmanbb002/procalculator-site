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

/* ---------------- Stamp Duty Land Tax ---------------- */
CALCULATORS['stamp-duty-land-tax'] = {
  render(formEl, resultEl) {
    formEl.innerHTML = `
      <h3>Property details</h3>
      <div class="field"><label>Purchase price</label><input type="number" id="sdlt-price" value="350000"></div>
      <div class="field"><label>Buyer type</label>
        <div class="seg" data-seg="type"><button data-value="standard" class="active">Standard</button><button data-value="ftb">First-time buyer</button><button data-value="additional">Additional property</button></div>
      </div>`;
    segControl(formEl, 'type', calc);
    function bandTax(price, bands) {
      let tax = 0, last = 0;
      for (const [threshold, rate] of bands) {
        if (price > last) { tax += (Math.min(price, threshold) - last) * rate; last = threshold; }
        else break;
      }
      return tax;
    }
    function calc() {
      const price = +qs(formEl, '#sdlt-price').value || 0;
      const type = segValue(formEl, 'type');
      if (!price) { resultEl.innerHTML = emptyResult('Enter the purchase price'); return; }
      const standardBands = [[250000, 0], [925000, 0.05], [1500000, 0.10], [Infinity, 0.12]];
      const ftbBands = [[425000, 0], [625000, 0.05]];
      let tax;
      if (type === 'ftb' && price <= 625000) {
        tax = bandTax(price, ftbBands);
      } else {
        tax = bandTax(price, standardBands);
        if (type === 'additional') tax += price * 0.05;
      }
      const effRate = price ? (tax / price) * 100 : 0;
      resultEl.innerHTML = heroBlock('Estimated SDLT', fmtGBP(tax), `${fmtNum(effRate, 1)}% effective rate`) +
        `<div class="result-rows">${resultRow('Purchase price', fmtGBP(price))}${resultRow('Buyer type', type === 'ftb' ? 'First-time buyer' : type === 'additional' ? 'Additional property' : 'Standard')}</div>` +
        infoNote('Illustrative estimate using standard England/NI residential SDLT bands. Scotland (LBTT) and Wales (LTT) use different systems. Rates and thresholds change — always confirm on gov.uk before a purchase.');
    }
    wireLiveCalc(formEl, calc);
  }
};

/* ---------------- ISA growth projection ---------------- */
CALCULATORS['isa-growth-projection'] = {
  render(formEl, resultEl) {
    formEl.innerHTML = `
      <h3>Your ISA</h3>
      <div class="field-row">
        <div class="field"><label>Starting balance</label><input type="number" id="isa-start" value="5000"></div>
        <div class="field"><label>Monthly contribution</label><input type="number" id="isa-monthly" value="200"></div>
      </div>
      <div class="field-row">
        <div class="field"><label>Growth rate (% p.a.)</label><input type="number" step="0.1" id="isa-rate" value="5"></div>
        <div class="field"><label>Years</label><input type="number" id="isa-years" value="10"></div>
      </div>`;
    function calc() {
      const start = +qs(formEl, '#isa-start').value || 0;
      const monthly = +qs(formEl, '#isa-monthly').value || 0;
      const rate = +qs(formEl, '#isa-rate').value || 0;
      const years = +qs(formEl, '#isa-years').value || 0;
      if (!years) { resultEl.innerHTML = emptyResult('Enter a projection period'); return; }
      const monthlyRate = rate / 100 / 12;
      const months = years * 12;
      let balance = start;
      let contributed = start;
      for (let i = 0; i < months; i++) {
        balance = balance * (1 + monthlyRate) + monthly;
        contributed += monthly;
      }
      const growth = balance - contributed;
      resultEl.innerHTML = heroBlock('Projected balance', fmtGBP(balance), `After ${years} years`) +
        `<div class="result-rows">${resultRow('Total contributed', fmtGBP(contributed))}${resultRow('Estimated growth', fmtGBP(growth))}</div>` +
        infoNote(`Contributions above £${fmtNum(20000,0)}/year exceed the standard annual ISA allowance — check the current allowance on gov.uk. Growth rate is illustrative, not guaranteed.`);
    }
    wireLiveCalc(formEl, calc);
  }
};

/* ---------------- Pension pot projection ---------------- */
CALCULATORS['pension-pot-projection'] = {
  render(formEl, resultEl) {
    formEl.innerHTML = `
      <h3>Your pension</h3>
      <div class="field-row">
        <div class="field"><label>Current age</label><input type="number" id="pp-age" value="35"></div>
        <div class="field"><label>Retirement age</label><input type="number" id="pp-retire" value="67"></div>
      </div>
      <div class="field-row">
        <div class="field"><label>Current pot</label><input type="number" id="pp-pot" value="20000"></div>
        <div class="field"><label>Monthly contribution (you + employer)</label><input type="number" id="pp-monthly" value="300"></div>
      </div>
      <div class="field"><label>Growth rate (% p.a.)</label><input type="number" step="0.1" id="pp-rate" value="5"></div>`;
    function calc() {
      const age = +qs(formEl, '#pp-age').value || 0;
      const retire = +qs(formEl, '#pp-retire').value || 0;
      const pot = +qs(formEl, '#pp-pot').value || 0;
      const monthly = +qs(formEl, '#pp-monthly').value || 0;
      const rate = +qs(formEl, '#pp-rate').value || 0;
      const years = retire - age;
      if (years <= 0) { resultEl.innerHTML = emptyResult('Retirement age must be after current age'); return; }
      const monthlyRate = rate / 100 / 12;
      let balance = pot;
      let contributed = pot;
      for (let i = 0; i < years * 12; i++) {
        balance = balance * (1 + monthlyRate) + monthly;
        contributed += monthly;
      }
      resultEl.innerHTML = heroBlock('Projected pot at retirement', fmtGBP(balance), `In ${years} years, aged ${retire}`) +
        `<div class="result-rows">${resultRow('Total contributed', fmtGBP(contributed))}${resultRow('Estimated growth', fmtGBP(balance - contributed))}</div>` +
        infoNote('Illustrative projection only — real pension growth depends on fund performance, fees and charges, which vary significantly. Not financial advice.');
    }
    wireLiveCalc(formEl, calc);
  }
};

/* ---------------- Self-employed tax ---------------- */
CALCULATORS['self-employed-tax'] = {
  render(formEl, resultEl) {
    formEl.innerHTML = `
      <h3>Your profit</h3>
      <div class="field"><label>Annual profit (after expenses)</label><input type="number" id="se-profit" value="35000"></div>`;
    function calc() {
      const profit = +qs(formEl, '#se-profit').value || 0;
      if (!profit) { resultEl.innerHTML = emptyResult('Enter your annual profit'); return; }
      const personalAllowance = profit > 100000 ? Math.max(0, 12570 - (profit - 100000) / 2) : 12570;
      const basicBand = 50270, higherBand = 125140;
      const taxable = Math.max(0, profit - personalAllowance);
      const basicPortion = Math.min(taxable, Math.max(0, basicBand - personalAllowance));
      const higherPortion = Math.min(Math.max(0, taxable - basicPortion), Math.max(0, higherBand - basicBand));
      const additionalPortion = Math.max(0, taxable - basicPortion - higherPortion);
      const incomeTax = basicPortion * 0.20 + higherPortion * 0.40 + additionalPortion * 0.45;

      const class4Lower = 12570, class4Upper = 50270;
      let class4 = 0;
      if (profit > class4Lower) {
        class4 += (Math.min(profit, class4Upper) - class4Lower) * 0.06;
        if (profit > class4Upper) class4 += (profit - class4Upper) * 0.02;
      }
      const totalDue = incomeTax + class4;
      const takeHome = profit - totalDue;
      resultEl.innerHTML = heroBlock('Estimated tax + Class 4 NI', fmtGBP(totalDue), `Leaves ${fmtGBP(takeHome)} take-home`) +
        `<div class="result-rows">${resultRow('Income Tax', fmtGBP(incomeTax))}${resultRow('Class 4 NI', fmtGBP(class4))}${resultRow('Estimated take-home', fmtGBP(takeHome))}</div>` +
        infoNote('Simplified estimate using standard England/Wales/NI bands. Class 2 NI rules have changed in recent years — check current gov.uk guidance. Excludes allowable expenses already deducted, student loans and Scottish rates. Not tax advice.');
    }
    wireLiveCalc(formEl, calc);
  }
};

/* ---------------- Capital Gains Tax ---------------- */
CALCULATORS['capital-gains-tax'] = {
  render(formEl, resultEl) {
    formEl.innerHTML = `
      <h3>Your gain</h3>
      <div class="field"><label>Asset type</label>
        <div class="seg" data-seg="asset"><button data-value="other" class="active">Shares / other assets</button><button data-value="property">Residential property</button></div>
      </div>
      <div class="field-row">
        <div class="field"><label>Total gain</label><input type="number" id="cgt-gain" value="15000"></div>
        <div class="field"><label>Tax-free allowance</label><input type="number" id="cgt-allowance" value="3000"></div>
      </div>
      <div class="field"><label>Your tax band</label>
        <div class="seg" data-seg="band"><button data-value="basic" class="active">Basic rate</button><button data-value="higher">Higher/additional rate</button></div>
      </div>`;
    segControl(formEl, 'asset', calc);
    segControl(formEl, 'band', calc);
    function calc() {
      const gain = +qs(formEl, '#cgt-gain').value || 0;
      const allowance = +qs(formEl, '#cgt-allowance').value || 0;
      const asset = segValue(formEl, 'asset');
      const band = segValue(formEl, 'band');
      const taxableGain = Math.max(0, gain - allowance);
      let rate;
      if (asset === 'property') rate = band === 'higher' ? 0.24 : 0.18;
      else rate = band === 'higher' ? 0.20 : 0.10;
      const tax = taxableGain * rate;
      resultEl.innerHTML = heroBlock('Estimated CGT owed', fmtGBP(tax), `${fmtNum(rate * 100, 0)}% on ${fmtGBP(taxableGain)} taxable gain`) +
        `<div class="result-rows">${resultRow('Total gain', fmtGBP(gain))}${resultRow('Tax-free allowance used', fmtGBP(Math.min(gain, allowance)))}${resultRow('Taxable gain', fmtGBP(taxableGain))}</div>` +
        infoNote('Illustrative estimate — CGT rates and the annual exempt amount change and depend on your total taxable income. Always check current gov.uk rates and consider professional advice for significant disposals.');
    }
    wireLiveCalc(formEl, calc);
  }
};

/* ---------------- Inheritance Tax ---------------- */
CALCULATORS['inheritance-tax'] = {
  render(formEl, resultEl) {
    formEl.innerHTML = `
      <h3>Estate details</h3>
      <div class="field"><label>Total estate value</label><input type="number" id="iht-estate" value="500000"></div>
      <div class="field"><label>Include main residence to direct descendants?</label>
        <div class="seg" data-seg="residence"><button data-value="yes" class="active">Yes</button><button data-value="no">No</button></div>
      </div>`;
    segControl(formEl, 'residence', calc);
    function calc() {
      const estate = +qs(formEl, '#iht-estate').value || 0;
      const residence = segValue(formEl, 'residence');
      const nilRateBand = 325000;
      const residenceNilRateBand = residence === 'yes' ? Math.max(0, 175000 - Math.max(0, (estate - 2000000) / 2)) : 0;
      const totalAllowance = nilRateBand + residenceNilRateBand;
      const taxableEstate = Math.max(0, estate - totalAllowance);
      const tax = taxableEstate * 0.40;
      resultEl.innerHTML = heroBlock('Estimated IHT due', fmtGBP(tax), `40% on ${fmtGBP(taxableEstate)} above allowances`) +
        `<div class="result-rows">${resultRow('Estate value', fmtGBP(estate))}${resultRow('Nil-rate band', fmtGBP(nilRateBand))}${resultRow('Residence nil-rate band', fmtGBP(residenceNilRateBand))}${resultRow('Taxable estate', fmtGBP(taxableEstate))}</div>` +
        infoNote('Illustrative estimate only — IHT has many reliefs and exemptions (spousal transfer, gifts, business/agricultural relief) not included here. Thresholds change. Seek professional advice for actual estate planning.');
    }
    wireLiveCalc(formEl, calc);
  }
};

/* ---------------- Credit card payoff ---------------- */
CALCULATORS['credit-card-payoff'] = {
  render(formEl, resultEl) {
    formEl.innerHTML = `
      <h3>Your balance</h3>
      <div class="field-row">
        <div class="field"><label>Current balance</label><input type="number" id="cc-balance" value="2500"></div>
        <div class="field"><label>APR (%)</label><input type="number" step="0.1" id="cc-apr" value="24.9"></div>
      </div>
      <div class="field"><label>Monthly payment</label><input type="number" id="cc-payment" value="150"></div>`;
    function calc() {
      const balance = +qs(formEl, '#cc-balance').value || 0;
      const apr = +qs(formEl, '#cc-apr').value || 0;
      const payment = +qs(formEl, '#cc-payment').value || 0;
      if (!balance || !payment) { resultEl.innerHTML = emptyResult('Enter your balance and monthly payment'); return; }
      const monthlyRate = apr / 100 / 12;
      const minPaymentNeeded = balance * monthlyRate;
      if (payment <= minPaymentNeeded) {
        resultEl.innerHTML = heroBlock('Payment too low', '—', 'This payment never clears the balance') +
          infoNote(`At ${apr}% APR, interest alone costs ${fmtGBP(minPaymentNeeded)}/month — increase your monthly payment above this to make progress.`);
        return;
      }
      let bal = balance, months = 0, totalPaid = 0;
      while (bal > 0 && months < 1200) {
        const interest = bal * monthlyRate;
        const principal = Math.min(bal, payment - interest);
        bal -= principal;
        totalPaid += Math.min(payment, principal + interest);
        months++;
      }
      const totalInterest = totalPaid - balance;
      const years = Math.floor(months / 12), remMonths = months % 12;
      resultEl.innerHTML = heroBlock('Time to pay off', `${months} months`, `${years > 0 ? years + 'y ' : ''}${remMonths}m at ${fmtGBP(payment)}/month`) +
        `<div class="result-rows">${resultRow('Starting balance', fmtGBP(balance))}${resultRow('Total interest paid', fmtGBP(totalInterest))}${resultRow('Total repaid', fmtGBP(totalPaid))}</div>` +
        infoNote('Assumes no further spending on the card and a fixed monthly payment. Real card interest calculations vary by provider (daily vs monthly compounding).');
    }
    wireLiveCalc(formEl, calc);
  }
};

/* ---------------- 50/30/20 Budget Planner ---------------- */
CALCULATORS['budget-50-30-20'] = {
  render(formEl, resultEl) {
    formEl.innerHTML = `
      <h3>Your income</h3>
      <div class="field"><label>Monthly take-home pay</label><input type="number" id="b502-income" value="2400"></div>`;
    function calc() {
      const income = +qs(formEl, '#b502-income').value || 0;
      if (!income) { resultEl.innerHTML = emptyResult('Enter your monthly take-home pay'); return; }
      const needs = income * 0.50, wants = income * 0.30, savings = income * 0.20;
      resultEl.innerHTML = heroBlock('Monthly savings target', fmtGBP(savings), '20% of take-home pay') +
        `<div class="result-rows">${resultRow('Needs (50%)', fmtGBP(needs))}${resultRow('Wants (30%)', fmtGBP(wants))}${resultRow('Savings (20%)', fmtGBP(savings))}</div>` +
        infoNote('A popular budgeting guideline, not a fixed rule — adjust the split to fit your circumstances, especially in higher cost-of-living areas.');
    }
    wireLiveCalc(formEl, calc);
  }
};

/* ---------------- Sand & cement render mix ---------------- */
CALCULATORS['sand-cement-render-mix'] = {
  render(formEl, resultEl) {
    formEl.innerHTML = `
      <h3>Wall to render</h3>
      <div class="field-row">
        <div class="field"><label>Wall area (m²)</label><input type="number" id="rm-area" value="20"></div>
        <div class="field"><label>Render thickness (mm)</label><input type="number" id="rm-thick" value="12"></div>
      </div>
      <div class="field"><label>Mix ratio (cement : sand)</label>
        <div class="seg" data-seg="ratio"><button data-value="1:3" class="active">1:3</button><button data-value="1:4">1:4</button><button data-value="1:5">1:5</button></div>
      </div>`;
    segControl(formEl, 'ratio', calc);
    function calc() {
      const area = +qs(formEl, '#rm-area').value || 0;
      const thickMm = +qs(formEl, '#rm-thick').value || 0;
      const ratio = segValue(formEl, 'ratio');
      if (!area || !thickMm) { resultEl.innerHTML = emptyResult('Enter wall area and thickness'); return; }
      const volume = area * (thickMm / 1000); // m3
      const wetVolume = volume * 1.3; // allow for compaction/waste
      const parts = ratio === '1:3' ? 4 : ratio === '1:4' ? 5 : 6;
      const cementVolume = wetVolume / parts;
      const sandVolume = wetVolume - cementVolume;
      const cementBags = cementVolume * 1440 / 25; // ~1440kg/m3 dry cement, 25kg bags
      resultEl.innerHTML = heroBlock('Cement bags needed', `${fmtNum(Math.ceil(cementBags), 0)} bags`, `25kg bags, ${ratio} mix`) +
        `<div class="result-rows">${resultRow('Render volume', `${fmtNum(volume, 3)} m³`)}${resultRow('Cement volume', `${fmtNum(cementVolume, 3)} m³`)}${resultRow('Sand volume', `${fmtNum(sandVolume, 3)} m³`)}</div>` +
        infoNote("Estimate includes an allowance for compaction and waste. Always check the specific product manufacturer's mixing guidance for structural or exterior render work.");
    }
    wireLiveCalc(formEl, calc);
  }
};

/* ---------------- House extension cost estimator ---------------- */
CALCULATORS['house-extension-cost'] = {
  render(formEl, resultEl) {
    formEl.innerHTML = `
      <h3>Extension details</h3>
      <div class="field-row">
        <div class="field"><label>Floor area (m²)</label><input type="number" id="hx-area" value="20"></div>
        <div class="field"><label>Storeys</label>
          <div class="seg" data-seg="storeys"><button data-value="1" class="active">Single</button><button data-value="2">Double</button></div>
        </div>
      </div>
      <div class="field"><label>Estimated cost per m² (your local build rate)</label><input type="number" id="hx-rate" value="2200"></div>
      <div class="field"><label>Additional costs (fit-out, fees, etc.)</label><input type="number" id="hx-extra" value="8000"></div>`;
    segControl(formEl, 'storeys', calc);
    function calc() {
      const area = +qs(formEl, '#hx-area').value || 0;
      const rate = +qs(formEl, '#hx-rate').value || 0;
      const storeys = +segValue(formEl, 'storeys') || 1;
      const extra = +qs(formEl, '#hx-extra').value || 0;
      if (!area || !rate) { resultEl.innerHTML = emptyResult('Enter floor area and cost per m²'); return; }
      const buildCost = area * rate * storeys;
      const total = buildCost + extra;
      resultEl.innerHTML = heroBlock('Estimated total cost', fmtGBP(total), `${area}m² × ${storeys} storey(s)`) +
        `<div class="result-rows">${resultRow('Build cost', fmtGBP(buildCost))}${resultRow('Additional costs', fmtGBP(extra))}${resultRow('Cost per m² (all-in)', fmtGBP(total / area))}</div>` +
        infoNote('Build costs per m² vary hugely by region, specification and builder — the default is illustrative only. Get quotes from local builders for an accurate figure, and budget a contingency of 10-15% on top.');
    }
    wireLiveCalc(formEl, calc);
  }
};

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

/* ---------------- Insulation U-value calculator ---------------- */
CALCULATORS['insulation-u-value'] = {
  render(formEl, resultEl) {
    formEl.innerHTML = `
      <h3>Build-up</h3>
      <div class="field"><label>Existing structure thermal resistance (m²K/W)</label><input type="number" step="0.01" id="uv-existing" value="0.5"></div>
      <div class="field-row">
        <div class="field"><label>Insulation thickness (mm)</label><input type="number" id="uv-thick" value="100"></div>
        <div class="field"><label>Insulation conductivity (W/mK)</label><input type="number" step="0.001" id="uv-conductivity" value="0.035"></div>
      </div>`;
    function calc() {
      const existingR = +qs(formEl, '#uv-existing').value || 0;
      const thickMm = +qs(formEl, '#uv-thick').value || 0;
      const conductivity = +qs(formEl, '#uv-conductivity').value || 0;
      if (!thickMm || !conductivity) { resultEl.innerHTML = emptyResult('Enter insulation thickness and conductivity'); return; }
      const insulationR = (thickMm / 1000) / conductivity;
      const surfaceR = 0.17; // typical combined internal+external surface resistance allowance
      const totalR = existingR + insulationR + surfaceR;
      const uValue = 1 / totalR;
      resultEl.innerHTML = heroBlock('Estimated U-value', `${fmtNum(uValue, 2)} W/m²K`, 'Lower is better insulated') +
        `<div class="result-rows">${resultRow('Insulation resistance', `${fmtNum(insulationR, 2)} m²K/W`)}${resultRow('Existing structure resistance', `${fmtNum(existingR, 2)} m²K/W`)}${resultRow('Total resistance', `${fmtNum(totalR, 2)} m²K/W`)}</div>` +
        infoNote('Simplified single-layer estimate with a standard surface resistance allowance. Real build-ups have multiple layers and cavities — for Building Regulations compliance, use a full calculation from your insulation manufacturer or a qualified assessor.');
    }
    wireLiveCalc(formEl, calc);
  }
};

/* ---------------- Roof tile quantity calculator ---------------- */
CALCULATORS['roof-tile-quantity'] = {
  render(formEl, resultEl) {
    formEl.innerHTML = `
      <h3>Roof area</h3>
      <div class="field-row">
        <div class="field"><label>Roof area (m²)</label><input type="number" id="rt-area" value="80"></div>
        <div class="field"><label>Tiles per m²</label><input type="number" step="0.1" id="rt-per-m2" value="10"></div>
      </div>
      <div class="field"><label>Waste allowance (%)</label><input type="number" id="rt-waste" value="5"></div>`;
    function calc() {
      const area = +qs(formEl, '#rt-area').value || 0;
      const perM2 = +qs(formEl, '#rt-per-m2').value || 0;
      const waste = +qs(formEl, '#rt-waste').value || 0;
      if (!area || !perM2) { resultEl.innerHTML = emptyResult('Enter roof area and tiles per m²'); return; }
      const baseTiles = area * perM2;
      const totalTiles = Math.ceil(baseTiles * (1 + waste / 100));
      resultEl.innerHTML = heroBlock('Tiles needed', `${fmtNum(totalTiles, 0)} tiles`, `Incl. ${waste}% waste allowance`) +
        `<div class="result-rows">${resultRow('Roof area', `${area} m²`)}${resultRow('Base quantity', fmtNum(Math.ceil(baseTiles), 0))}${resultRow('With waste allowance', fmtNum(totalTiles, 0))}</div>` +
        infoNote("Tiles-per-m² varies by tile profile and gauge — check your specific tile manufacturer's coverage rate for an accurate figure. Excludes ridge, hip and verge tiles.");
    }
    wireLiveCalc(formEl, calc);
  }
};

/* ---------------- Plasterboard quantity calculator ---------------- */
CALCULATORS['plasterboard-quantity'] = {
  render(formEl, resultEl) {
    formEl.innerHTML = `
      <h3>Room dimensions</h3>
      <div class="field-row">
        <div class="field"><label>Room length (m)</label><input type="number" step="0.1" id="pb-length" value="4"></div>
        <div class="field"><label>Room width (m)</label><input type="number" step="0.1" id="pb-width" value="3.5"></div>
      </div>
      <div class="field"><label>Wall height (m)</label><input type="number" step="0.1" id="pb-height" value="2.4"></div>
      <div class="field"><label>Include ceiling?</label>
        <div class="seg" data-seg="ceiling"><button data-value="yes" class="active">Yes</button><button data-value="no">No</button></div>
      </div>`;
    segControl(formEl, 'ceiling', calc);
    function calc() {
      const length = +qs(formEl, '#pb-length').value || 0;
      const width = +qs(formEl, '#pb-width').value || 0;
      const height = +qs(formEl, '#pb-height').value || 0;
      const ceiling = segValue(formEl, 'ceiling');
      if (!length || !width || !height) { resultEl.innerHTML = emptyResult('Enter room dimensions'); return; }
      const wallArea = 2 * (length + width) * height;
      const ceilingArea = ceiling === 'yes' ? length * width : 0;
      const totalArea = wallArea + ceilingArea;
      const sheetArea = 2.4 * 1.2; // standard sheet size m2
      const sheets = Math.ceil(totalArea / sheetArea * 1.1); // 10% waste
      resultEl.innerHTML = heroBlock('Sheets needed', `${sheets} sheets`, `2400×1200mm standard sheets, incl. 10% waste`) +
        `<div class="result-rows">${resultRow('Wall area', `${fmtNum(wallArea, 1)} m²`)}${resultRow('Ceiling area', `${fmtNum(ceilingArea, 1)} m²`)}${resultRow('Total area', `${fmtNum(totalArea, 1)} m²`)}</div>` +
        infoNote('Excludes door and window openings (which would reduce the total slightly) and assumes standard 2400×1200mm sheets — adjust if using a different sheet size.');
    }
    wireLiveCalc(formEl, calc);
  }
};

/* ---------------- Skip size selector ---------------- */
CALCULATORS['skip-size'] = {
  render(formEl, resultEl) {
    formEl.innerHTML = `
      <h3>Your waste</h3>
      <div class="field"><label>Estimated waste volume (m³)</label><input type="number" step="0.1" id="sk-volume" value="4"></div>`;
    const SKIPS = [
      { name: 'Mini skip', size: '2 yd³ (~1.5 m³)', m3: 1.5 },
      { name: 'Midi skip', size: '4 yd³ (~3 m³)', m3: 3 },
      { name: 'Builders skip', size: '6 yd³ (~4.5 m³)', m3: 4.5 },
      { name: 'Large skip', size: '8 yd³ (~6 m³)', m3: 6 },
      { name: 'Roll-on-roll-off', size: '12-40 yd³ (~9-30 m³)', m3: 9 },
    ];
    function calc() {
      const volume = +qs(formEl, '#sk-volume').value || 0;
      if (!volume) { resultEl.innerHTML = emptyResult('Enter your estimated waste volume'); return; }
      const recommended = SKIPS.find(s => s.m3 >= volume) || SKIPS[SKIPS.length - 1];
      resultEl.innerHTML = heroBlock('Recommended skip', recommended.name, recommended.size) +
        `<div class="result-rows">${SKIPS.map(s => resultRow(s.name, s.size)).join('')}</div>` +
        infoNote('Standard UK skip size categories — never fill a skip above its rim (this is illegal on the public highway) and check local permit requirements if placing a skip on the road.');
    }
    wireLiveCalc(formEl, calc);
  }
};

/* ---------------- Road Tax (VED) estimator ---------------- */
CALCULATORS['road-tax-estimator'] = {
  render(formEl, resultEl) {
    formEl.innerHTML = `
      <h3>Vehicle details</h3>
      <div class="field"><label>When was the car first registered?</label>
        <div class="seg" data-seg="age"><button data-value="new" class="active">First year (new)</button><button data-value="standard">2nd year onwards</button></div>
      </div>
      <div class="field" data-group="new"><label>CO2 emissions (g/km)</label><input type="number" id="rt-co2" value="120"></div>
      <div class="field"><label>List price when new</label><input type="number" id="rt-price" value="30000"></div>`;
    segControl(formEl, 'age', () => { formEl.querySelector('[data-group="new"]').style.display = segValue(formEl, 'age') === 'new' ? '' : 'none'; calc(); });
    const CO2_BANDS = [
      [0, 0], [50, 10], [75, 30], [90, 135], [100, 175], [110, 195], [130, 220], [150, 270], [170, 680], [190, 1095], [225, 1650], [255, 2340], [Infinity, 2745]
    ];
    function calc() {
      const age = segValue(formEl, 'age');
      const price = +qs(formEl, '#rt-price').value || 0;
      const STANDARD_RATE = 190;
      const EXPENSIVE_SUPPLEMENT = 410;
      let tax;
      if (age === 'new') {
        const co2 = +qs(formEl, '#rt-co2').value || 0;
        const band = CO2_BANDS.find(b => co2 <= b[0]) || CO2_BANDS[CO2_BANDS.length - 1];
        tax = band[1];
      } else {
        tax = STANDARD_RATE + (price > 40000 ? EXPENSIVE_SUPPLEMENT : 0);
      }
      resultEl.innerHTML = heroBlock('Estimated annual VED', fmtGBP(tax), age === 'new' ? 'First-year rate (CO2-based)' : 'Standard rate') +
        `<div class="result-rows">${resultRow('Vehicle stage', age === 'new' ? 'First year' : 'Standard (year 2+)')}${price > 40000 && age !== 'new' ? resultRow('Includes expensive car supplement', 'Yes (list price over £40,000)') : ''}</div>` +
        infoNote('Illustrative estimate using the current-era CO2-banded VED structure for petrol/diesel cars. Electric vehicles, motorcycles, vans and pre-2017 registered cars use different rules, and rates change — always confirm on gov.uk.');
    }
    wireLiveCalc(formEl, calc);
  }
};

/* ---------------- Car insurance payment comparator ---------------- */
CALCULATORS['car-insurance-estimator'] = {
  render(formEl, resultEl) {
    formEl.innerHTML = `
      <h3>Your quote</h3>
      <div class="field"><label>Annual premium (paid upfront)</label><input type="number" id="ci-annual" value="600"></div>
      <div class="field-row">
        <div class="field"><label>Monthly price offered</label><input type="number" id="ci-monthly" value="55"></div>
        <div class="field"><label>Deposit (if any)</label><input type="number" id="ci-deposit" value="0"></div>
      </div>`;
    function calc() {
      const annual = +qs(formEl, '#ci-annual').value || 0;
      const monthly = +qs(formEl, '#ci-monthly').value || 0;
      const deposit = +qs(formEl, '#ci-deposit').value || 0;
      if (!annual || !monthly) { resultEl.innerHTML = emptyResult('Enter both the annual and monthly price'); return; }
      const totalMonthlyCost = deposit + monthly * 11; // typical 12-payment plan: deposit + 11 monthly
      const extraCost = totalMonthlyCost - annual;
      const impliedAPR = annual ? (extraCost / annual) * 100 : 0;
      resultEl.innerHTML = heroBlock('Extra cost of paying monthly', fmtGBP(extraCost), `${fmtNum(impliedAPR, 1)}% more than paying annually`) +
        `<div class="result-rows">${resultRow('Pay annually', fmtGBP(annual))}${resultRow('Pay monthly (total)', fmtGBP(totalMonthlyCost))}${resultRow('Extra cost', fmtGBP(extraCost))}</div>` +
        infoNote("Insurers usually charge interest for spreading payments monthly — this compares the two options you enter. This tool doesn't predict your premium, since real quotes depend on dozens of individual rating factors only an insurer can assess.");
    }
    wireLiveCalc(formEl, calc);
  }
};

/* ---------------- Speeding fine estimator ---------------- */
CALCULATORS['speeding-fine-estimator'] = {
  render(formEl, resultEl) {
    formEl.innerHTML = `
      <h3>Details</h3>
      <div class="field-row">
        <div class="field"><label>Speed limit (mph)</label><input type="number" id="sf-limit" value="30"></div>
        <div class="field"><label>Recorded speed (mph)</label><input type="number" id="sf-speed" value="42"></div>
      </div>
      <div class="field"><label>Weekly income (net)</label><input type="number" id="sf-income" value="500"></div>`;
    function calc() {
      const limit = +qs(formEl, '#sf-limit').value || 0;
      const speed = +qs(formEl, '#sf-speed').value || 0;
      const income = +qs(formEl, '#sf-income').value || 0;
      if (!limit || !speed || speed <= limit) { resultEl.innerHTML = emptyResult('Enter a recorded speed above the limit'); return; }
      const pctOver = ((speed - limit) / limit) * 100;
      let band, points, finePct;
      if (pctOver < 50) { band = 'Band A'; points = '3 points'; finePct = 0.5; }
      else if (pctOver < 100) { band = 'Band B'; points = '4-6 points or disqualification'; finePct = 1.0; }
      else { band = 'Band C'; points = '6 points or disqualification'; finePct = 1.5; }
      const fine = Math.min(income * finePct, 2500);
      resultEl.innerHTML = heroBlock('Guideline fine range', band, `~${fmtGBP(fine)}, capped by statutory maximum`) +
        `<div class="result-rows">${resultRow('Speed over limit', `${fmtNum(pctOver, 0)}%`)}${resultRow('Sentencing band', band)}${resultRow('Typical penalty points', points)}</div>` +
        infoNote('Based on published UK sentencing guidelines (bands relative to speed and income), not a guaranteed outcome — actual fines and points are set by police/court discretion and individual circumstances. Many cases are instead offered a speed awareness course.');
    }
    wireLiveCalc(formEl, calc);
  }
};

/* ---------------- EV charging cost ---------------- */
CALCULATORS['ev-charging-cost'] = {
  render(formEl, resultEl) {
    formEl.innerHTML = `
      <h3>Charging details</h3>
      <div class="field-row">
        <div class="field"><label>Battery size (kWh)</label><input type="number" id="ev-battery" value="60"></div>
        <div class="field"><label>Electricity price (p/kWh)</label><input type="number" step="0.1" id="ev-price" value="28"></div>
      </div>
      <div class="field-row">
        <div class="field"><label>Current charge (%)</label><input type="number" id="ev-from" value="20"></div>
        <div class="field"><label>Target charge (%)</label><input type="number" id="ev-to" value="80"></div>
      </div>`;
    function calc() {
      const battery = +qs(formEl, '#ev-battery').value || 0;
      const price = +qs(formEl, '#ev-price').value || 0;
      const from = +qs(formEl, '#ev-from').value || 0;
      const to = +qs(formEl, '#ev-to').value || 0;
      if (!battery || to <= from) { resultEl.innerHTML = emptyResult('Enter battery size and a valid charge range'); return; }
      const kwhNeeded = battery * (to - from) / 100;
      const cost = kwhNeeded * price / 100;
      const costPerMile = cost / (kwhNeeded * 3.5); // rough 3.5 mi/kWh assumption for range context
      resultEl.innerHTML = heroBlock('Charging cost', fmtGBP(cost), `${fmtNum(kwhNeeded, 1)} kWh from ${from}% to ${to}%`) +
        `<div class="result-rows">${resultRow('Energy added', `${fmtNum(kwhNeeded, 1)} kWh`)}${resultRow('Price per kWh', `${price}p`)}${resultRow('Total cost', fmtGBP(cost))}</div>` +
        infoNote('Home electricity tariffs vary, especially with EV/off-peak tariffs which can be significantly cheaper overnight. Public rapid chargers are typically priced higher per kWh than home charging.');
    }
    wireLiveCalc(formEl, calc);
  }
};

/* ---------------- Mileage allowance calculator ---------------- */
CALCULATORS['mileage-allowance'] = {
  render(formEl, resultEl) {
    formEl.innerHTML = `
      <h3>Business travel</h3>
      <div class="field-row">
        <div class="field"><label>Business miles this tax year</label><input type="number" id="ma-miles" value="8000"></div>
        <div class="field"><label>Vehicle type</label>
          <div class="seg" data-seg="type"><button data-value="car" class="active">Car/van</button><button data-value="bike">Motorcycle</button></div>
        </div>
      </div>`;
    segControl(formEl, 'type', calc);
    function calc() {
      const miles = +qs(formEl, '#ma-miles').value || 0;
      const type = segValue(formEl, 'type');
      if (!miles) { resultEl.innerHTML = emptyResult('Enter your business mileage'); return; }
      let allowance;
      if (type === 'bike') {
        allowance = miles * 0.24;
      } else {
        const first10k = Math.min(miles, 10000);
        const remainder = Math.max(0, miles - 10000);
        allowance = first10k * 0.45 + remainder * 0.25;
      }
      resultEl.innerHTML = heroBlock('Tax-free mileage allowance', fmtGBP(allowance), `${fmtNum(miles, 0)} business miles`) +
        `<div class="result-rows">${resultRow('Vehicle type', type === 'bike' ? 'Motorcycle' : 'Car/van')}${resultRow('Rate structure', type === 'bike' ? '24p/mile flat' : '45p first 10,000mi, 25p after')}</div>` +
        infoNote("Uses HMRC's standard Approved Mileage Allowance Payment (AMAP) rate structure. Confirm current rates on gov.uk, since they can change and this is what your employer can pay tax-free without it counting as a benefit.");
    }
    wireLiveCalc(formEl, calc);
  }
};

/* ---------------- Tyre size comparison ---------------- */
CALCULATORS['tyre-size-comparison'] = {
  render(formEl, resultEl) {
    formEl.innerHTML = `
      <h3>Compare two tyre sizes</h3>
      <div class="field"><label>Current tyre (width/aspect R rim)</label>
        <div class="field-row"><input type="number" id="ty-w1" value="205" placeholder="Width"><input type="number" id="ty-a1" value="55" placeholder="Aspect"><input type="number" id="ty-r1" value="16" placeholder="Rim (in)"></div>
      </div>
      <div class="field"><label>New tyre (width/aspect R rim)</label>
        <div class="field-row"><input type="number" id="ty-w2" value="215" placeholder="Width"><input type="number" id="ty-a2" value="50" placeholder="Aspect"><input type="number" id="ty-r2" value="17" placeholder="Rim (in)"></div>
      </div>`;
    function diameter(w, a, r) { return (r * 25.4) + (2 * w * (a / 100)); }
    function calc() {
      const w1 = +qs(formEl, '#ty-w1').value || 0, a1 = +qs(formEl, '#ty-a1').value || 0, r1 = +qs(formEl, '#ty-r1').value || 0;
      const w2 = +qs(formEl, '#ty-w2').value || 0, a2 = +qs(formEl, '#ty-a2').value || 0, r2 = +qs(formEl, '#ty-r2').value || 0;
      if (!w1 || !r1 || !w2 || !r2) { resultEl.innerHTML = emptyResult('Enter both tyre sizes'); return; }
      const d1 = diameter(w1, a1, r1), d2 = diameter(w2, a2, r2);
      const diffPct = ((d2 - d1) / d1) * 100;
      const speedoAt70 = 70 * (d2 / d1);
      resultEl.innerHTML = heroBlock('Diameter difference', `${diffPct > 0 ? '+' : ''}${fmtNum(diffPct, 1)}%`, diffPct > 0 ? 'New tyre is larger overall' : 'New tyre is smaller overall') +
        `<div class="result-rows">${resultRow('Current diameter', `${fmtNum(d1, 0)} mm`)}${resultRow('New diameter', `${fmtNum(d2, 0)} mm`)}${resultRow('Speedometer at true 70mph', `${fmtNum(speedoAt70, 0)} mph`)}</div>` +
        infoNote("A significant diameter change affects speedometer accuracy and can affect gearing, ABS/ESP calibration and insurance/legal compliance — keep within your tyre manufacturer's and vehicle manual's approved size range.");
    }
    wireLiveCalc(formEl, calc);
  }
};

/* ---------------- Ratio simplifier ---------------- */
CALCULATORS['ratio-simplifier'] = {
  render(formEl, resultEl) {
    formEl.innerHTML = `
      <h3>Your ratio</h3>
      <div class="field-row">
        <div class="field"><label>First value</label><input type="number" id="rs-a" value="16"></div>
        <div class="field"><label>Second value</label><input type="number" id="rs-b" value="24"></div>
      </div>`;
    function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { [a, b] = [b, a % b]; } return a; }
    function calc() {
      const a = +qs(formEl, '#rs-a').value || 0;
      const b = +qs(formEl, '#rs-b').value || 0;
      if (!a || !b) { resultEl.innerHTML = emptyResult('Enter both values'); return; }
      const divisor = gcd(Math.round(a), Math.round(b));
      const simpleA = a / divisor, simpleB = b / divisor;
      resultEl.innerHTML = heroBlock('Simplified ratio', `${fmtNum(simpleA, 0)} : ${fmtNum(simpleB, 0)}`, `From ${a} : ${b}`) +
        `<div class="result-rows">${resultRow('Greatest common divisor', divisor)}${resultRow('Decimal equivalent', fmtNum(simpleA / simpleB, 4))}</div>`;
    }
    wireLiveCalc(formEl, calc);
  }
};

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

/* ---------------- Unit circle angle finder ---------------- */
CALCULATORS['unit-circle-angle'] = {
  render(formEl, resultEl) {
    formEl.innerHTML = `
      <h3>Angle</h3>
      <div class="field"><label>Angle</label><input type="number" id="uc-angle" value="45"></div>
      <div class="field"><label>Unit</label>
        <div class="seg" data-seg="unit"><button data-value="deg" class="active">Degrees</button><button data-value="rad">Radians</button></div>
      </div>`;
    segControl(formEl, 'unit', calc);
    function calc() {
      const angle = +qs(formEl, '#uc-angle').value || 0;
      const unit = segValue(formEl, 'unit');
      const rad = unit === 'deg' ? angle * Math.PI / 180 : angle;
      const sin = Math.sin(rad), cos = Math.cos(rad), tan = Math.cos(rad) !== 0 ? Math.tan(rad) : NaN;
      resultEl.innerHTML = heroBlock('sin, cos, tan', `${fmtNum(sin, 4)}, ${fmtNum(cos, 4)}, ${isNaN(tan) ? 'undefined' : fmtNum(tan, 4)}`, `At ${angle}${unit === 'deg' ? '°' : ' rad'}`) +
        `<div class="result-rows">${resultRow('sin', fmtNum(sin, 4))}${resultRow('cos', fmtNum(cos, 4))}${resultRow('tan', isNaN(tan) ? 'undefined' : fmtNum(tan, 4))}${resultRow('Angle in radians', fmtNum(rad, 4))}</div>`;
    }
    wireLiveCalc(formEl, calc);
  }
};

/* ---------------- Prime factorisation ---------------- */
CALCULATORS['prime-factorization'] = {
  render(formEl, resultEl) {
    formEl.innerHTML = `
      <h3>Number</h3>
      <div class="field"><label>Whole number (2 or greater)</label><input type="number" id="pf-n" value="360"></div>`;
    function factorize(n) {
      const factors = [];
      let d = 2;
      while (d * d <= n) {
        while (n % d === 0) { factors.push(d); n /= d; }
        d++;
      }
      if (n > 1) factors.push(n);
      return factors;
    }
    function calc() {
      let n = Math.round(+qs(formEl, '#pf-n').value || 0);
      if (n < 2) { resultEl.innerHTML = emptyResult('Enter a whole number 2 or greater'); return; }
      const factors = factorize(n);
      const counts = {};
      factors.forEach(f => counts[f] = (counts[f] || 0) + 1);
      const expression = Object.entries(counts).map(([f, c]) => c > 1 ? `${f}^${c}` : `${f}`).join(' × ');
      resultEl.innerHTML = heroBlock('Prime factorisation', expression, `${factors.length} prime factor(s)`) +
        `<div class="result-rows">${resultRow('Original number', n)}${resultRow('Factor list', factors.join(', '))}${resultRow('Is prime?', factors.length === 1 ? 'Yes' : 'No')}</div>`;
    }
    wireLiveCalc(formEl, calc);
  }
};

/* ---------------- Logarithm calculator ---------------- */
CALCULATORS['log-calculator'] = {
  render(formEl, resultEl) {
    formEl.innerHTML = `
      <h3>Logarithm</h3>
      <div class="field-row">
        <div class="field"><label>Number</label><input type="number" id="log-n" value="100"></div>
        <div class="field"><label>Base</label><input type="number" id="log-base" value="10"></div>
      </div>`;
    function calc() {
      const n = +qs(formEl, '#log-n').value || 0;
      const base = +qs(formEl, '#log-base').value || 0;
      if (n <= 0 || base <= 0 || base === 1) { resultEl.innerHTML = emptyResult('Enter a positive number and a valid base (not 1)'); return; }
      const result = Math.log(n) / Math.log(base);
      resultEl.innerHTML = heroBlock(`log${base}(${n})`, fmtNum(result, 6), `Natural log: ${fmtNum(Math.log(n), 6)}`) +
        `<div class="result-rows">${resultRow('log base ' + base, fmtNum(result, 6))}${resultRow('Natural log (ln)', fmtNum(Math.log(n), 6))}${resultRow('log base 10', fmtNum(Math.log10(n), 6))}</div>`;
    }
    wireLiveCalc(formEl, calc);
  }
};

/* ---------------- Earth curvature calculator ---------------- */
CALCULATORS['earth-curvature'] = {
  render(formEl, resultEl) {
    const EARTH_RADIUS_KM = 6371;
    formEl.innerHTML = `
      <h3>Distance</h3>
      <div class="field"><label>Distance (km)</label><input type="number" id="ec-dist" value="10"></div>`;
    function calc() {
      const distKm = +qs(formEl, '#ec-dist').value || 0;
      if (!distKm) { resultEl.innerHTML = emptyResult('Enter a distance'); return; }
      const dropM = Math.pow(distKm * 1000, 2) / (2 * EARTH_RADIUS_KM * 1000);
      const dropMRefracted = dropM * 0.87; // standard atmospheric refraction correction (~13% reduction)
      resultEl.innerHTML = heroBlock('Curvature drop', `${fmtNum(dropM, 1)} m`, `Over ${distKm} km, ignoring refraction`) +
        `<div class="result-rows">${resultRow('Geometric drop', `${fmtNum(dropM, 1)} m`)}${resultRow('With typical atmospheric refraction', `${fmtNum(dropMRefracted, 1)} m`)}</div>` +
        infoNote('Uses the simple flat-Earth-chord approximation (accurate for terrestrial distances) with Earth\'s mean radius. Atmospheric refraction varies with weather/temperature, so the refracted figure is an illustrative typical correction, not exact.');
    }
    wireLiveCalc(formEl, calc);
  }
};

/* ---------------- Wavelength & frequency calculator ---------------- */
CALCULATORS['wavelength-frequency'] = {
  render(formEl, resultEl) {
    formEl.innerHTML = `
      <h3>Wave details</h3>
      <div class="field"><label>Wave type</label>
        <div class="seg" data-seg="type"><button data-value="light" class="active">Light/EM wave</button><button data-value="sound">Sound</button></div>
      </div>
      <div class="field" data-group="sound" style="display:none"><label>Wave speed (m/s)</label><input type="number" id="wf-speed" value="343"></div>
      <div class="field"><label>Mode</label>
        <div class="seg" data-seg="mode"><button data-value="freq" class="active">I know frequency (Hz)</button><button data-value="wave">I know wavelength (m)</button></div>
      </div>
      <div class="field" data-group="freq"><label>Frequency (Hz)</label><input type="number" id="wf-freq" value="500000000000000"></div>
      <div class="field" data-group="wave" style="display:none"><label>Wavelength (m)</label><input type="number" id="wf-wave" value="0.0000006"></div>`;
    segControl(formEl, 'type', () => { formEl.querySelector('[data-group="sound"]').style.display = segValue(formEl, 'type') === 'sound' ? '' : 'none'; calc(); });
    segControl(formEl, 'mode', () => {
      const mode = segValue(formEl, 'mode');
      formEl.querySelector('[data-group="freq"]').style.display = mode === 'freq' ? '' : 'none';
      formEl.querySelector('[data-group="wave"]').style.display = mode === 'wave' ? '' : 'none';
      calc();
    });
    function calc() {
      const type = segValue(formEl, 'type');
      const mode = segValue(formEl, 'mode');
      const speed = type === 'sound' ? (+qs(formEl, '#wf-speed').value || 343) : 299792458;
      let freq, wave;
      if (mode === 'freq') {
        freq = +qs(formEl, '#wf-freq').value || 0;
        wave = freq ? speed / freq : 0;
      } else {
        wave = +qs(formEl, '#wf-wave').value || 0;
        freq = wave ? speed / wave : 0;
      }
      if (!freq && !wave) { resultEl.innerHTML = emptyResult('Enter a frequency or wavelength'); return; }
      resultEl.innerHTML = heroBlock('Wavelength', `${fmtNum(wave, 6)} m`, `At ${fmtNum(freq, 2)} Hz`) +
        `<div class="result-rows">${resultRow('Frequency', `${fmtNum(freq, 2)} Hz`)}${resultRow('Wavelength', `${fmtNum(wave, 6)} m`)}${resultRow('Wave speed used', `${fmtNum(speed, 0)} m/s`)}</div>` +
        infoNote('Uses wave speed = frequency × wavelength. Light/EM waves use the speed of light in a vacuum (299,792,458 m/s); sound speed varies by medium and temperature — 343 m/s is a typical value for air at room temperature.');
    }
    wireLiveCalc(formEl, calc);
  }
};

/* ---------------- Resistor colour code calculator ---------------- */
CALCULATORS['resistor-color-code'] = {
  render(formEl, resultEl) {
    const COLORS = [
      { name: 'Black', digit: 0, mult: 1, color: '#000000' },
      { name: 'Brown', digit: 1, mult: 10, tol: 1, color: '#8B4513' },
      { name: 'Red', digit: 2, mult: 100, tol: 2, color: '#DC2626' },
      { name: 'Orange', digit: 3, mult: 1000, color: '#F97316' },
      { name: 'Yellow', digit: 4, mult: 10000, color: '#EAB308' },
      { name: 'Green', digit: 5, mult: 100000, tol: 0.5, color: '#16A34A' },
      { name: 'Blue', digit: 6, mult: 1000000, tol: 0.25, color: '#2563EB' },
      { name: 'Violet', digit: 7, mult: 10000000, tol: 0.1, color: '#7C3AED' },
      { name: 'Grey', digit: 8, mult: 100000000, color: '#6B7280' },
      { name: 'White', digit: 9, mult: 1000000000, color: '#F3F4F6' },
      { name: 'Gold', mult: 0.1, tol: 5, color: '#D4AF37' },
      { name: 'Silver', mult: 0.01, tol: 10, color: '#C0C0C0' },
    ];
    const digitOptions = COLORS.filter(c => c.digit !== undefined);
    const multOptions = COLORS;
    const tolOptions = COLORS.filter(c => c.tol !== undefined);
    const opts = (list, key) => list.map(c => `<option value="${c.name}">${c.name}${key ? ` (${key === 'mult' ? '×' + c.mult : c.tol + '%'})` : ''}</option>`).join('');
    formEl.innerHTML = `
      <h3>Colour bands (4-band resistor)</h3>
      <div class="field"><label>Band 1 (1st digit)</label><select id="rc-1">${opts(digitOptions)}</select></div>
      <div class="field"><label>Band 2 (2nd digit)</label><select id="rc-2">${opts(digitOptions)}</select></div>
      <div class="field"><label>Band 3 (multiplier)</label><select id="rc-3">${opts(multOptions, 'mult')}</select></div>
      <div class="field"><label>Band 4 (tolerance)</label><select id="rc-4">${opts(tolOptions, 'tol')}</select></div>`;
    formEl.querySelector('#rc-3').value = 'Red';
    formEl.querySelector('#rc-4').value = 'Gold';
    function calc() {
      const c1 = COLORS.find(c => c.name === qs(formEl, '#rc-1').value);
      const c2 = COLORS.find(c => c.name === qs(formEl, '#rc-2').value);
      const c3 = COLORS.find(c => c.name === qs(formEl, '#rc-3').value);
      const c4 = COLORS.find(c => c.name === qs(formEl, '#rc-4').value);
      const value = (c1.digit * 10 + c2.digit) * c3.mult;
      let display = value >= 1000000 ? fmtNum(value / 1000000, 2) + ' MΩ' : value >= 1000 ? fmtNum(value / 1000, 2) + ' kΩ' : fmtNum(value, 2) + ' Ω';
      resultEl.innerHTML = heroBlock('Resistance', display, `±${c4.tol}% tolerance`) +
        `<div class="result-rows">${resultRow('Value', display)}${resultRow('Tolerance', `±${c4.tol}%`)}${resultRow('Range', `${fmtNum(value * (1 - c4.tol / 100), 1)} – ${fmtNum(value * (1 + c4.tol / 100), 1)} Ω`)}</div>`;
    }
    formEl.addEventListener('change', calc);
    calc();
  }
};

/* ---------------- Dilution calculator (C1V1=C2V2) ---------------- */
CALCULATORS['dilution-calculator'] = {
  render(formEl, resultEl) {
    formEl.innerHTML = `
      <h3>Solve for</h3>
      <div class="field"><label>Which value do you need?</label>
        <div class="seg" data-seg="solve"><button data-value="v1" class="active">Volume of stock (V1)</button><button data-value="v2">Final volume (V2)</button></div>
      </div>
      <div class="field-row">
        <div class="field"><label>Stock concentration (C1)</label><input type="number" id="di-c1" value="10"></div>
        <div class="field"><label>Target concentration (C2)</label><input type="number" id="di-c2" value="1"></div>
      </div>
      <div class="field" data-group="v1"><label>Final volume (V2)</label><input type="number" id="di-v2" value="500"></div>
      <div class="field" data-group="v2" style="display:none"><label>Volume of stock (V1)</label><input type="number" id="di-v1" value="50"></div>`;
    segControl(formEl, 'solve', () => {
      const solve = segValue(formEl, 'solve');
      formEl.querySelector('[data-group="v1"]').style.display = solve === 'v1' ? '' : 'none';
      formEl.querySelector('[data-group="v2"]').style.display = solve === 'v2' ? '' : 'none';
      calc();
    });
    function calc() {
      const c1 = +qs(formEl, '#di-c1').value || 0;
      const c2 = +qs(formEl, '#di-c2').value || 0;
      const solve = segValue(formEl, 'solve');
      if (!c1 || !c2) { resultEl.innerHTML = emptyResult('Enter both concentrations'); return; }
      if (solve === 'v1') {
        const v2 = +qs(formEl, '#di-v2').value || 0;
        const v1 = (c2 * v2) / c1;
        resultEl.innerHTML = heroBlock('Stock volume needed (V1)', `${fmtNum(v1, 2)}`, `Plus ${fmtNum(v2 - v1, 2)} diluent to reach ${v2}`) +
          `<div class="result-rows">${resultRow('Stock volume (V1)', fmtNum(v1, 2))}${resultRow('Diluent to add', fmtNum(v2 - v1, 2))}${resultRow('Final volume (V2)', v2)}</div>`;
      } else {
        const v1 = +qs(formEl, '#di-v1').value || 0;
        const v2 = (c1 * v1) / c2;
        resultEl.innerHTML = heroBlock('Final volume (V2)', `${fmtNum(v2, 2)}`, `Add ${fmtNum(v2 - v1, 2)} diluent to ${v1}`) +
          `<div class="result-rows">${resultRow('Starting volume (V1)', v1)}${resultRow('Diluent to add', fmtNum(v2 - v1, 2))}${resultRow('Final volume (V2)', fmtNum(v2, 2))}</div>`;
      }
      resultEl.innerHTML += infoNote('Uses C1V1 = C2V2. Use consistent units throughout (e.g. both concentrations in the same unit, both volumes in the same unit).');
    }
    wireLiveCalc(formEl, calc);
  }
};

/* ---------------- Moment of force calculator ---------------- */
CALCULATORS['moment-of-force'] = {
  render(formEl, resultEl) {
    formEl.innerHTML = `
      <h3>Force and distance</h3>
      <div class="field-row">
        <div class="field"><label>Force (N)</label><input type="number" id="mf-force" value="50"></div>
        <div class="field"><label>Perpendicular distance from pivot (m)</label><input type="number" step="0.01" id="mf-dist" value="0.75"></div>
      </div>`;
    function calc() {
      const force = +qs(formEl, '#mf-force').value || 0;
      const dist = +qs(formEl, '#mf-dist').value || 0;
      if (!force || !dist) { resultEl.innerHTML = emptyResult('Enter force and distance'); return; }
      const moment = force * dist;
      resultEl.innerHTML = heroBlock('Moment (turning force)', `${fmtNum(moment, 2)} Nm`, `${force}N at ${dist}m from pivot`) +
        `<div class="result-rows">${resultRow('Force', `${force} N`)}${resultRow('Distance', `${dist} m`)}${resultRow('Moment', `${fmtNum(moment, 2)} Nm`)}</div>` +
        infoNote('Uses moment = force × perpendicular distance from the pivot. If the force isn\'t applied perpendicular to the lever, only the perpendicular component contributes to the moment.');
    }
    wireLiveCalc(formEl, calc);
  }
};

/* ---------------- Escape velocity calculator ---------------- */
CALCULATORS['escape-velocity'] = {
  render(formEl, resultEl) {
    const G = 6.674e-11;
    formEl.innerHTML = `
      <h3>Body details</h3>
      <div class="field-row">
        <div class="field"><label>Mass (kg)</label><input type="number" id="ev2-mass" value="5.972e24"></div>
        <div class="field"><label>Radius (m)</label><input type="number" id="ev2-radius" value="6371000"></div>
      </div>
      <p class="hint" style="margin-top:-8px">Defaults are Earth's mass and radius.</p>`;
    function calc() {
      const mass = +qs(formEl, '#ev2-mass').value || 0;
      const radius = +qs(formEl, '#ev2-radius').value || 0;
      if (!mass || !radius) { resultEl.innerHTML = emptyResult('Enter mass and radius'); return; }
      const v = Math.sqrt((2 * G * mass) / radius);
      resultEl.innerHTML = heroBlock('Escape velocity', `${fmtNum(v / 1000, 2)} km/s`, `${fmtNum(v, 0)} m/s`) +
        `<div class="result-rows">${resultRow('Mass', mass.toExponential(3) + ' kg')}${resultRow('Radius', fmtNum(radius, 0) + ' m')}${resultRow('Escape velocity', fmtNum(v / 1000, 2) + ' km/s')}</div>` +
        infoNote('Uses v = √(2GM/r) with the gravitational constant G = 6.674×10⁻¹¹ N·m²/kg². Ignores atmospheric drag.');
    }
    wireLiveCalc(formEl, calc);
  }
};

/* ---------------- VO2 max estimator ---------------- */
CALCULATORS['vo2-max-estimator'] = {
  render(formEl, resultEl) {
    formEl.innerHTML = `
      <h3>Cooper 12-minute run test</h3>
      <div class="field"><label>Distance covered in 12 minutes (metres)</label><input type="number" id="vo-dist" value="2400"></div>
      <p class="hint" style="margin-top:-8px">Run/jog as far as you can in exactly 12 minutes, then enter the distance.</p>`;
    function calc() {
      const dist = +qs(formEl, '#vo-dist').value || 0;
      if (!dist) { resultEl.innerHTML = emptyResult('Enter your 12-minute distance'); return; }
      const vo2max = (dist - 504.9) / 44.73;
      let rating;
      if (vo2max < 30) rating = 'Below average';
      else if (vo2max < 40) rating = 'Average';
      else if (vo2max < 50) rating = 'Good';
      else if (vo2max < 60) rating = 'Excellent';
      else rating = 'Superior';
      resultEl.innerHTML = heroBlock('Estimated VO2 max', `${fmtNum(vo2max, 1)} ml/kg/min`, rating) +
        `<div class="result-rows">${resultRow('Distance covered', `${dist} m`)}${resultRow('Estimated VO2 max', `${fmtNum(vo2max, 1)} ml/kg/min`)}${resultRow('General category', rating)}</div>` +
        infoNote('Uses the Cooper 12-minute run test formula, a widely used field-test estimate — not as precise as a laboratory gas-exchange VO2 max test. Categories are general and vary by age and sex.');
    }
    wireLiveCalc(formEl, calc);
  }
};

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

/* ---------------- Body fat % (Navy method) ---------------- */
CALCULATORS['body-fat-navy'] = {
  render(formEl, resultEl) {
    formEl.innerHTML = `
      <h3>Your measurements (cm)</h3>
      <div class="field"><label>Sex</label>
        <div class="seg" data-seg="sex"><button data-value="male" class="active">Male</button><button data-value="female">Female</button></div>
      </div>
      <div class="field-row">
        <div class="field"><label>Height</label><input type="number" id="bf-height" value="178"></div>
        <div class="field"><label>Neck</label><input type="number" id="bf-neck" value="38"></div>
      </div>
      <div class="field-row">
        <div class="field"><label>Waist</label><input type="number" id="bf-waist" value="85"></div>
        <div class="field" data-group="hip" style="display:none"><label>Hip</label><input type="number" id="bf-hip" value="95"></div>
      </div>`;
    segControl(formEl, 'sex', () => { formEl.querySelector('[data-group="hip"]').style.display = segValue(formEl, 'sex') === 'female' ? '' : 'none'; calc(); });
    function toIn(cm) { return cm / 2.54; }
    function calc() {
      const sex = segValue(formEl, 'sex');
      const height = toIn(+qs(formEl, '#bf-height').value || 0);
      const neck = toIn(+qs(formEl, '#bf-neck').value || 0);
      const waist = toIn(+qs(formEl, '#bf-waist').value || 0);
      const hip = toIn(+qs(formEl, '#bf-hip').value || 0);
      if (!height || !neck || !waist) { resultEl.innerHTML = emptyResult('Enter your measurements'); return; }
      let bf;
      if (sex === 'male') {
        bf = 495 / (1.0324 - 0.19077 * Math.log10(waist - neck) + 0.15456 * Math.log10(height)) - 450;
      } else {
        bf = 495 / (1.29579 - 0.35004 * Math.log10(waist + hip - neck) + 0.22100 * Math.log10(height)) - 450;
      }
      resultEl.innerHTML = heroBlock('Estimated body fat', `${fmtNum(bf, 1)}%`, sex === 'male' ? 'US Navy method (male)' : 'US Navy method (female)') +
        `<div class="result-rows">${resultRow('Height', `${qs(formEl, '#bf-height').value} cm`)}${resultRow('Neck', `${qs(formEl, '#bf-neck').value} cm`)}${resultRow('Waist', `${qs(formEl, '#bf-waist').value} cm`)}</div>` +
        infoNote('Uses the US Navy circumference method — a widely used field estimate, less accurate than DEXA or hydrostatic weighing. Measure waist at the navel and neck just below the larynx for best accuracy.');
    }
    wireLiveCalc(formEl, calc);
  }
};

/* ---------------- Running pace calculator ---------------- */
CALCULATORS['pace-to-time'] = {
  render(formEl, resultEl) {
    formEl.innerHTML = `
      <h3>Your pace</h3>
      <div class="field-row">
        <div class="field"><label>Pace (min per km)</label><input type="number" step="0.01" id="pt-pace" value="5.5"></div>
        <div class="field"><label>Distance (km)</label><input type="number" step="0.1" id="pt-dist" value="21.1"></div>
      </div>`;
    function calc() {
      const pace = +qs(formEl, '#pt-pace').value || 0;
      const dist = +qs(formEl, '#pt-dist').value || 0;
      if (!pace || !dist) { resultEl.innerHTML = emptyResult('Enter pace and distance'); return; }
      const totalMin = pace * dist;
      const h = Math.floor(totalMin / 60), m = Math.floor(totalMin % 60), s = Math.round((totalMin % 1) * 60);
      const timeStr = `${h > 0 ? h + ':' : ''}${String(m).padStart(h > 0 ? 2 : 1, '0')}:${String(s).padStart(2, '0')}`;
      const paceMile = pace * 1.60934;
      resultEl.innerHTML = heroBlock('Finish time', timeStr, `At ${pace} min/km over ${dist} km`) +
        `<div class="result-rows">${resultRow('Pace per km', `${pace} min`)}${resultRow('Pace per mile', `${fmtNum(paceMile, 2)} min`)}${resultRow('Total distance', `${dist} km`)}</div>`;
    }
    wireLiveCalc(formEl, calc);
  }
};

/* ---------------- Daily water intake calculator ---------------- */
CALCULATORS['water-intake'] = {
  render(formEl, resultEl) {
    formEl.innerHTML = `
      <h3>Your details</h3>
      <div class="field-row">
        <div class="field"><label>Weight (kg)</label><input type="number" id="wi-weight" value="75"></div>
        <div class="field"><label>Activity level</label>
          <div class="seg" data-seg="activity"><button data-value="low" class="active">Low</button><button data-value="moderate">Moderate</button><button data-value="high">High</button></div>
        </div>
      </div>`;
    segControl(formEl, 'activity', calc);
    function calc() {
      const weight = +qs(formEl, '#wi-weight').value || 0;
      const activity = segValue(formEl, 'activity');
      if (!weight) { resultEl.innerHTML = emptyResult('Enter your weight'); return; }
      const mlPerKg = activity === 'low' ? 30 : activity === 'moderate' ? 35 : 40;
      const totalMl = weight * mlPerKg;
      const litres = totalMl / 1000;
      resultEl.innerHTML = heroBlock('Suggested daily intake', `${fmtNum(litres, 1)} L`, `≈ ${Math.round(litres / 0.25)} glasses (250ml)`) +
        `<div class="result-rows">${resultRow('Body weight', `${weight} kg`)}${resultRow('Activity level', activity)}${resultRow('Suggested intake', `${fmtNum(litres, 1)} L`)}</div>` +
        infoNote('A general guideline (roughly 30-40ml per kg of body weight, adjusted for activity), not personalised medical advice. Needs vary with climate, health conditions, pregnancy/breastfeeding and individual factors — consult a healthcare professional for specific guidance.');
    }
    wireLiveCalc(formEl, calc);
  }
};

/* ---------------- Heart rate zone calculator ---------------- */
CALCULATORS['heart-rate-zone'] = {
  render(formEl, resultEl) {
    formEl.innerHTML = `
      <h3>Your age</h3>
      <div class="field"><label>Age</label><input type="number" id="hr-age" value="35"></div>`;
    function calc() {
      const age = +qs(formEl, '#hr-age').value || 0;
      if (!age) { resultEl.innerHTML = emptyResult('Enter your age'); return; }
      const maxHR = 220 - age;
      const zones = [
        { name: 'Zone 1 — Very light', low: 0.50, high: 0.60 },
        { name: 'Zone 2 — Light (fat burn)', low: 0.60, high: 0.70 },
        { name: 'Zone 3 — Moderate (aerobic)', low: 0.70, high: 0.80 },
        { name: 'Zone 4 — Hard (anaerobic)', low: 0.80, high: 0.90 },
        { name: 'Zone 5 — Maximum', low: 0.90, high: 1.00 },
      ];
      resultEl.innerHTML = heroBlock('Estimated max heart rate', `${maxHR} bpm`, `220 − ${age}`) +
        `<div class="result-rows">${zones.map(z => resultRow(z.name, `${Math.round(maxHR * z.low)}–${Math.round(maxHR * z.high)} bpm`)).join('')}</div>` +
        infoNote('Uses the common 220-minus-age estimate for maximum heart rate, which is a population average with significant individual variation. For precise training zones, a lab-based or field max-HR test is more accurate.');
    }
    wireLiveCalc(formEl, calc);
  }
};
