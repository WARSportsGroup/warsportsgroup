import type { APIRoute } from 'astro';
import { getWriting, hasPage, isListed } from '../lib/writing';

// Public pages only. Unlisted pieces are reachable by URL but never listed,
// and gated pieces have no page.
export const GET: APIRoute = async ({ site }) => {
  const articles = (await getWriting()).filter((e) => hasPage(e) && isListed(e));
  const url = (path: string) => new URL(path, site).href;

  const entries = [
    `<url><loc>${url('/')}</loc></url>`,
    `<url><loc>${url('/about')}</loc></url>`,
    ...articles.map(
      (e) => `<url><loc>${url(`/writing/${e.id}`)}</loc><lastmod>${e.data.date.toISOString().slice(0, 10)}</lastmod></url>`,
    ),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n')}\n</urlset>\n`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml' } });
};
