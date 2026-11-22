// The WAR Sports Group mark: a thin precision crosshair. One definition feeds
// the header, the share cards and the favicon. The heavy weight is drawn for
// favicon sizes, where the regular hairlines would fade.

export type MarkWeight = 'regular' | 'heavy';

const PATHS: Record<MarkWeight, string> = {
  regular: `
    <circle cx="50" cy="50" r="34" fill="none" stroke-width="4"/>
    <circle cx="50" cy="50" r="11" fill="none" stroke-width="2.5"/>
    <path d="M50 3 V39 M50 61 V97 M3 50 H39 M61 50 H97" stroke-width="4"/>
    <path d="M50 46 V54 M46 50 H54" stroke-width="2"/>`,
  heavy: `
    <circle cx="50" cy="50" r="32" fill="none" stroke-width="9"/>
    <circle cx="50" cy="50" r="12" fill="none" stroke-width="6.5"/>
    <path d="M50 0 V34 M50 66 V100 M0 50 H34 M66 50 H100" stroke-width="9"/>`,
};

// Returns the mark's inner SVG (no <svg> wrapper), stroked in `color`.
export function markPaths(weight: MarkWeight, color = 'currentColor'): string {
  return `<g stroke="${color}">${PATHS[weight]}</g>`;
}

// Returns a complete standalone SVG document.
export function markSvg(weight: MarkWeight, color: string, background?: string): string {
  const bg = background ? `<rect width="100" height="100" fill="${background}"/>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${bg}${markPaths(weight, color)}</svg>`;
}
