import type { APIRoute, GetStaticPaths } from 'astro';
import { renderCard, type Card } from '../../lib/og';
import { getWriting, hasPage } from '../../lib/writing';
import { formatNumber } from '../../lib/format';
import { ABOUT, HOME } from '../../lib/site';

// One share card per page: /og/home.png, /og/about.png, /og/writing/<slug>.png
export const getStaticPaths = (async () => {
  const articles = (await getWriting()).filter(hasPage).map((e) => ({
    params: { slug: `writing/${e.id}` },
    props: {
      eyebrow: `${e.data.label} / ${formatNumber(e.data.number)}`,
      title: e.data.title,
      subtitle: e.data.subtitle,
    } satisfies Card,
  }));

  return [
    { params: { slug: 'home' }, props: { eyebrow: HOME.kicker, title: HOME.title, subtitle: HOME.description } },
    { params: { slug: 'about' }, props: { eyebrow: ABOUT.kicker, title: ABOUT.title, subtitle: ABOUT.description } },
    ...articles,
  ];
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ props }) => {
  const png = await renderCard(props as Card);
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
