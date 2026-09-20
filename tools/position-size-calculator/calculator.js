(function () {
  'use strict';

  function positiveNumber(value, fieldName) {
    const number = Number.parseFloat(value);
    if (!Number.isFinite(number) || number <= 0) {
      throw new Error(`${fieldName} must be greater than zero.`);
    }
    return number;
  }

  function optionalPositiveNumber(value, fieldName) {
    if (value === '' || value === null || value === undefined) return null;
    return positiveNumber(value, fieldName);
  }

  function calculatePositionSize(values) {
    const account = positiveNumber(values.account, 'Account size');
    const riskPct = positiveNumber(values.riskPct, 'Risk per trade');
    if (riskPct > 100) throw new Error('Risk per trade cannot exceed 100%.');

    let stopDistancePct;
    let entry = null;
    let units = null;
    let rr = null;

    if (values.mode === 'price') {
      entry = positiveNumber(values.entry, 'Entry price');
      const stop = positiveNumber(values.stop, 'Stop loss price');
      const stopDistance = Math.abs(entry - stop);
      if (stopDistance === 0) throw new Error('Entry and stop loss must be different.');
      stopDistancePct = (stopDistance / entry) * 100;

      const takeProfit = optionalPositiveNumber(values.takeProfit, 'Take profit price');
      if (takeProfit !== null) rr = Math.abs(takeProfit - entry) / stopDistance;
    } else {
      stopDistancePct = positiveNumber(values.stopPct, 'Stop distance');
      const takeProfitPct = optionalPositiveNumber(values.takeProfitPct, 'Take profit distance');
      if (takeProfitPct !== null) rr = takeProfitPct / stopDistancePct;
    }

    const riskAmount = account * (riskPct / 100);
    const positionSize = riskAmount / (stopDistancePct / 100);
    if (entry !== null) units = positionSize / entry;

    const leverage = optionalPositiveNumber(values.leverage, 'Leverage');
    const margin = leverage !== null && leverage > 1 ? positionSize / leverage : null;

    return { riskAmount, positionSize, stopDistancePct, units, rr, margin, leverage };
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { calculatePositionSize };
  }

  if (typeof document === 'undefined') return;

  const form = document.getElementById('position-form');
  const modeButtons = Array.from(document.querySelectorAll('.mode-button'));
  const priceFields = document.getElementById('price-fields');
  const percentageFields = document.getElementById('percentage-fields');
  const error = document.getElementById('form-error');
  const result = document.getElementById('calculation-result');
  let mode = 'pct';

  function setMode(nextMode) {
    mode = nextMode;
    const priceMode = mode === 'price';
    priceFields.hidden = !priceMode;
    percentageFields.hidden = priceMode;
    modeButtons.forEach((button) => {
      const active = button.dataset.mode === mode;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    error.hidden = true;
    result.hidden = true;
  }

  function value(id) {
    return document.getElementById(id).value.trim();
  }

  function money(number) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(number);
  }

  function quantity(number) {
    return number >= 1 ? number.toFixed(4) : number.toFixed(6);
  }

  function showOptionalRow(rowId, valueId, displayValue) {
    const row = document.getElementById(rowId);
    row.hidden = displayValue === null;
    if (displayValue !== null) document.getElementById(valueId).textContent = displayValue;
  }

  modeButtons.forEach((button) => button.addEventListener('click', () => setMode(button.dataset.mode)));

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    error.hidden = true;

    try {
      const calculated = calculatePositionSize({
        mode,
        account: value('account'),
        riskPct: value('risk-pct'),
        entry: value('entry'),
        stop: value('stop'),
        takeProfit: value('take-profit'),
        stopPct: value('stop-pct'),
        takeProfitPct: value('take-profit-pct'),
        leverage: value('leverage'),
      });

      document.getElementById('position-size').textContent = money(calculated.positionSize);
      document.getElementById('risk-amount').textContent = money(calculated.riskAmount);
      document.getElementById('stop-distance').textContent = `${calculated.stopDistancePct.toFixed(2)}%`;
      showOptionalRow('units-result', 'units', calculated.units === null ? null : quantity(calculated.units));
      showOptionalRow('rr-result', 'rr-ratio', calculated.rr === null ? null : `1 : ${calculated.rr.toFixed(2)}`);
      showOptionalRow('margin-result', 'margin', calculated.margin === null ? null : `${money(calculated.margin)} at ${calculated.leverage}×`);

      result.hidden = false;
      result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } catch (calculationError) {
      result.hidden = true;
      error.textContent = calculationError.message;
      error.hidden = false;
    }
  });

  setMode('pct');
})();
