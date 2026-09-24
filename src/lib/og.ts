import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { token } from './tokens';

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

const fontDir = join(process.cwd(), 'src/og/fonts');
const fonts = [
  { name: 'Inter', data: readFileSync(join(fontDir, 'Inter-400.ttf')), weight: 400 as const, style: 'normal' as const },
  { name: 'Inter', data: readFileSync(join(fontDir, 'Inter-600.ttf')), weight: 600 as const, style: 'normal' as const },
  { name: 'JetBrains Mono', data: readFileSync(join(fontDir, 'JetBrainsMono-400.ttf')), weight: 400 as const, style: 'normal' as const },
];

export interface Card {
  eyebrow: string;
  title: string;
  subtitle: string;
}

type Node = { type: string; props: Record<string, unknown> & { style?: Record<string, unknown>; children?: unknown } };
const h = (type: string, style: Record<string, unknown>, children?: unknown): Node => ({
  type,
  props: { style, children },
});

// Larger type for shorter titles, so the title always dominates the card.
function titleSize(title: string): number {
  if (title.length <= 32) return 76;
  if (title.length <= 56) return 66;
  return 56;
}

// The header crosshair, scaled up: faint cross lines with an accent ring.
function mark(size: number): Node {
  const inset = size * (3.5 / 15);
  return h('div', { position: 'relative', display: 'flex', width: size, height: size }, [
    h('div', { position: 'absolute', left: size / 2 - 1, top: 0, width: 2, height: size, backgroundColor: token('faint') }),
    h('div', { position: 'absolute', top: size / 2 - 1, left: 0, height: 2, width: size, backgroundColor: token('faint') }),
    h('div', {
      position: 'absolute',
      left: inset,
      top: inset,
      width: size - inset * 2,
      height: size - inset * 2,
      border: `2px solid ${token('accent')}`,
      borderRadius: '50%',
    }),
  ]);
}

export async function renderCard({ eyebrow, title, subtitle }: Card): Promise<Buffer> {
  const size = titleSize(title);
  const tree = h(
    'div',
    {
      width: OG_WIDTH,
      height: OG_HEIGHT,
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: token('bg'),
      position: 'relative',
      padding: '84px 88px 72px',
    },
    [
      h('div', { position: 'absolute', top: 0, left: 0, width: OG_WIDTH, height: 2, backgroundColor: token('accent') }),
      h(
        'div',
        { fontFamily: 'JetBrains Mono', fontSize: 20, letterSpacing: 4.4, textTransform: 'uppercase', color: token('accent') },
        eyebrow,
      ),
      h(
        'div',
        {
          fontFamily: 'Inter',
          fontWeight: 600,
          fontSize: size,
          lineHeight: 1.08,
          letterSpacing: -size * 0.024,
          color: token('text-strong'),
          marginTop: 36,
          display: 'block',
          overflow: 'hidden',
          lineClamp: 3,
        },
        title,
      ),
      h(
        'div',
        {
          fontFamily: 'Inter',
          fontWeight: 400,
          fontSize: 30,
          lineHeight: 1.4,
          color: token('muted'),
          marginTop: 28,
          display: 'block',
          overflow: 'hidden',
          lineClamp: 2,
        },
        subtitle,
      ),
      h('div', { display: 'flex', alignItems: 'center', marginTop: 'auto' }, [
        mark(28),
        h(
          'div',
          {
            fontFamily: 'JetBrains Mono',
            fontSize: 20,
            letterSpacing: 4,
            textTransform: 'uppercase',
            color: token('text'),
            marginLeft: 18,
          },
          'WAR Sports Group',
        ),
      ]),
    ],
  );

  const svg = await satori(tree as never, { width: OG_WIDTH, height: OG_HEIGHT, fonts });
  return new Resvg(svg, { fitTo: { mode: 'width', value: OG_WIDTH } }).render().asPng();
}
