(function () {
  'use strict';
  function calculate(values) {
    const numbers = {};
    for (const key of ['size', 'buyFeePct', 'sellFeePct', 'slippagePct', 'priority']) {
      const raw = values[key];
      const n = Number(raw);
      if (raw === '' || raw === null || raw === undefined || !Number.isFinite(n) || n < 0)
        throw new Error('Enter a finite, non-negative number in every required field.');
      numbers[key] = n;
    }
    const { size, buyFeePct, sellFeePct, slippagePct, priority } = numbers;
    if (size <= 0) throw new Error('Position size must be greater than zero.');
    if ([buyFeePct, sellFeePct, slippagePct].some(n => n > 100))
      throw new Error('Percentage inputs cannot exceed 100%.');
    const entryMcap = values.entryMcap === '' || values.entryMcap == null ? null : Number(values.entryMcap);
    if (entryMcap !== null && (!Number.isFinite(entryMcap) || entryMcap <= 0))
      throw new Error('Optional market cap must be greater than zero, or left blank.');
    const totalOut = size * (1 + buyFeePct / 100) + priority;
    if (!Number.isFinite(totalOut)) throw new Error('Inputs are too large.');
    const exitFraction = 1 - sellFeePct / 100 - slippagePct / 100;
    if (exitFraction <= 0) return { finite: false, totalOut };
    const requiredIn = totalOut / exitFraction;
    const multiple = requiredIn / size;
    const gain = (multiple - 1) * 100;
    const mcap = entryMcap === null ? null : entryMcap * multiple;
    if (![requiredIn, multiple, gain].every(Number.isFinite) || (mcap !== null && !Number.isFinite(mcap)))
      throw new Error('Inputs are too large or too close to an unrecoverable exit.');
    return { finite: true, totalOut, requiredIn, multiple, gain, mcap };
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = { calculate };
  if (typeof document === 'undefined') return;
  const form = document.getElementById('break-even-form');
  const result = document.getElementById('calc-result');
  const error = document.getElementById('calc-error');
  const money = n => new Intl.NumberFormat('en-US', {style:'currency',currency:'USD',maximumFractionDigits:2}).format(n);
  const put = (id, text) => { document.getElementById(id).textContent = text; };
  function render() {
    result.hidden = true;
    error.hidden = true;
    try {
      const values = Object.fromEntries(new FormData(form));
      const r = calculate(values);
      put('gain', r.finite ? r.gain.toFixed(2) + '%' : 'No finite break-even');
      put('outlay', money(r.totalOut));
      put('required-value', r.finite ? money(r.requiredIn) : 'Exit deductions reach or exceed 100%.');
      put('multiple', r.finite ? r.multiple.toFixed(4) + '×' : '—');
      const showMcap = r.finite && r.mcap !== null;
      document.getElementById('mcap-label').hidden = !showMcap;
      document.getElementById('mcap').hidden = !showMcap;
      put('mcap', showMcap ? money(r.mcap) : '');
      result.hidden = false;
    } catch (e) {
      error.textContent = e.message;
      error.hidden = false;
    }
  }
  form.addEventListener('submit', e => { e.preventDefault(); render(); });
  form.addEventListener('input', () => { result.hidden = true; error.hidden = true; });
  form.addEventListener('reset', () => { result.hidden = true; error.hidden = true; });
  render();
})();
