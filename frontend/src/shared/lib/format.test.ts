import { describe, expect, it } from 'vitest';
import { formatCurrency, initials, scoreColor } from './format';

describe('format helpers', () => {
  it('formats large currency values compactly', () => {
    expect(formatCurrency(2_500_000_000)).toBe('$2.5B');
    expect(formatCurrency(3_400_000)).toBe('$3.4M');
    expect(formatCurrency(12_000)).toBe('$12.0K');
    expect(formatCurrency(500)).toBe('$500');
  });

  it('derives initials from a name', () => {
    expect(initials('Jordan Rivera')).toBe('JR');
    expect(initials('Ada')).toBe('A');
  });

  it('maps scores to color tiers', () => {
    expect(scoreColor(85)).toContain('emerald');
    expect(scoreColor(70)).toContain('cyan');
    expect(scoreColor(55)).toContain('amber');
    expect(scoreColor(40)).toContain('rose');
  });
});
