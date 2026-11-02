import { describe, expect, it } from 'vitest';
import { normalizeVietnameseName } from '../format-utils';

describe('normalizeVietnameseName', () => {
  it('title-cases each word', () => {
    expect(normalizeVietnameseName('minh anh')).toBe('Minh Anh');
    expect(normalizeVietnameseName('THÁI')).toBe('Thái');
    expect(normalizeVietnameseName('  an   khang ')).toBe('An Khang');
  });

  it('moves the tone mark to o in open oa syllables', () => {
    expect(normalizeVietnameseName('Hoà')).toBe('Hòa');
    expect(normalizeVietnameseName('toà')).toBe('Tòa');
    expect(normalizeVietnameseName('OẠ')).toBe('Ọa');
  });

  it('moves the tone mark to u in open uy syllables', () => {
    expect(normalizeVietnameseName('Thuý')).toBe('Thúy');
    expect(normalizeVietnameseName('Thuỷ')).toBe('Thủy');
    expect(normalizeVietnameseName('quỵ')).toBe('Qụy');
  });

  it('keeps marks in closed syllables (hoàng, hoành, quỳnh, hoàn)', () => {
    expect(normalizeVietnameseName('hoàng')).toBe('Hoàng');
    expect(normalizeVietnameseName('hoành')).toBe('Hoành');
    expect(normalizeVietnameseName('quỳnh')).toBe('Quỳnh');
    expect(normalizeVietnameseName('hoàn')).toBe('Hoàn');
  });

  it('moves the tone mark to o in open oe syllables', () => {
    expect(normalizeVietnameseName('Khoẻ')).toBe('Khỏe');
    expect(normalizeVietnameseName('loè')).toBe('Lòe');
    expect(normalizeVietnameseName('XOẸ')).toBe('Xọe');
  });

  it('strips digits, punctuation and symbols', () => {
    expect(normalizeVietnameseName('An3 Khang!')).toBe('An Khang');
    expect(normalizeVietnameseName('Minh-Anh')).toBe('Minh Anh');
    expect(normalizeVietnameseName('thiên @an ❤️')).toBe('Thiên An');
    expect(normalizeVietnameseName("'Nam")).toBe('Nam');
  });

  it('handles decomposed unicode input', () => {
    expect(normalizeVietnameseName('hoà')).toBe('Hòa'); // hoà = o + a + combining grave
  });
});
