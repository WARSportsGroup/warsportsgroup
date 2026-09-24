import css from '../styles/tokens.css?raw';

// Reads custom properties out of tokens.css so build-time output that cannot
// use CSS variables (share cards, the favicon) still has one source of color.
const values = new Map<string, string>();
for (const [, name, value] of css.matchAll(/--([\w-]+):\s*([^;]+);/g)) {
  values.set(name, value.trim());
}

export function token(name: string): string {
  const value = values.get(name);
  if (!value) throw new Error(`[tokens] --${name} is not defined in tokens.css`);
  return value;
}
