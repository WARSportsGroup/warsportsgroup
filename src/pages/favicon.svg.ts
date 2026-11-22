import type { APIRoute } from 'astro';
import { token } from '../lib/tokens';
import { markSvg } from '../lib/mark';

// The heavy-weight mark on a dark square, colored from tokens.css.
export const GET: APIRoute = () =>
  new Response(markSvg('heavy', token('text'), token('bg')) + '\n', {
    headers: { 'Content-Type': 'image/svg+xml' },
  });
