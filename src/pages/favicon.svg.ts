import type { APIRoute } from 'astro';
import { token } from '../lib/tokens';

// The header crosshair as a favicon, colored from tokens.css. Replace along
// with Mark.astro when the real logo arrives.
export const GET: APIRoute = () => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" fill="${token('bg')}"/>
  <path d="M16 4v24M4 16h24" stroke="${token('faint')}" stroke-width="2"/>
  <circle cx="16" cy="16" r="6.5" fill="none" stroke="${token('accent')}" stroke-width="2"/>
</svg>
`;
  return new Response(svg, { headers: { 'Content-Type': 'image/svg+xml' } });
};
