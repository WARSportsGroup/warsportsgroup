// Display number, e.g. 1 renders as 001.
export function formatNumber(n: number): string {
  return String(n).padStart(3, '0');
}

// Frontmatter dates are calendar dates, so format in UTC to avoid
// shifting a day across time zones.
export function formatMonthYear(date: Date, month: 'long' | 'short' = 'long'): string {
  return date.toLocaleDateString('en-US', { month, year: 'numeric', timeZone: 'UTC' });
}

const ROMAN: [number, string][] = [
  [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'],
  [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
];

export function toRoman(n: number): string {
  let out = '';
  for (const [value, numeral] of ROMAN) {
    while (n >= value) {
      out += numeral;
      n -= value;
    }
  }
  return out;
}
