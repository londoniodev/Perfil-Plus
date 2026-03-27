import { formatCurrency } from './utils.ts';
import { test, describe } from 'node:test';
import assert from 'node:assert';

describe('formatCurrency', () => {
  test('formats number correctly', () => {
    const result = formatCurrency(1000);
    // es-CO format is typically "$ 1.000" with a non-breaking space
    assert.match(result, /\$\s?1\.000/);
  });

  test('formats string number correctly', () => {
    const result = formatCurrency("2500");
    assert.match(result, /\$\s?2\.500/);
  });

  test('formats zero correctly', () => {
    const result = formatCurrency(0);
    assert.match(result, /\$\s?0/);
  });

  test('handles invalid string by returning $0', () => {
    const result = formatCurrency("abc");
    assert.strictEqual(result, '$0');
  });

  test('handles NaN by returning $0', () => {
    const result = formatCurrency(NaN);
    assert.strictEqual(result, '$0');
  });

  test('formats negative numbers correctly', () => {
    const result = formatCurrency(-500);
    assert.match(result, /500/);
  });

  test('formats large numbers correctly', () => {
    const result = formatCurrency(1000000);
    assert.match(result, /\$\s?1\.000\.000/);
  });

  test('handles decimals by rounding (as per maximumFractionDigits: 0)', () => {
    const result = formatCurrency(1234.56);
    // 1234.56 should round to 1.235
    assert.match(result, /\$\s?1\.235/);
  });
});
