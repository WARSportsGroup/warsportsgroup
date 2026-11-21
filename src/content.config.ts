import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

export const LABELS = ['Essay', 'Organizational Study', 'Research', 'Private Report'] as const;
export const VISIBILITY = ['public', 'gated', 'unlisted'] as const;

// Frontmatter is generated, never hand-written, so the schema is strict:
// unknown keys fail the build instead of being silently ignored.
const writing = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/writing' }),
  schema: z
    .strictObject({
      title: z.string().min(1),
      subtitle: z.string().min(1),
      date: z.coerce.date(),
      number: z.number().int().positive(),
      // One label, or up to two for a piece that is both (e.g. a study that is also research).
      label: z
        .union([z.enum(LABELS), z.array(z.enum(LABELS)).min(1).max(2)])
        .transform((v) => (Array.isArray(v) ? v : [v]))
        .refine((v) => new Set(v).size === v.length, 'labels must not repeat'),
      visibility: z.enum(VISIBILITY),
      origin: z.string().min(1).optional(),
      featured: z.boolean().default(false),
      readingTime: z.number().int().positive().optional(),
      topic: z.string().min(1).optional(),
      // Off for pieces that carry their own part numbering in the headings.
      sectionNumbers: z.boolean().default(true),
    })
    .refine((d) => d.label.includes('Private Report') === (d.visibility === 'gated'), {
      message: 'label "Private Report" and visibility "gated" must be used together',
      path: ['visibility'],
    }),
});

export const collections = { writing };
