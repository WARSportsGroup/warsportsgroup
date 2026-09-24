import { getCollection, type CollectionEntry } from 'astro:content';

export type WritingEntry = CollectionEntry<'writing'>;

let cache: Promise<WritingEntry[]> | undefined;

// Single entry point for the collection. Checks rules zod cannot express
// per file, so any page that lists writing fails the build on a bad set.
export function getWriting(): Promise<WritingEntry[]> {
  cache ??= load();
  return cache;
}

async function load(): Promise<WritingEntry[]> {
  const entries = await getCollection('writing');

  const byNumber = new Map<number, string>();
  for (const entry of entries) {
    const existing = byNumber.get(entry.data.number);
    if (existing) {
      throw new Error(
        `[writing] Duplicate number ${entry.data.number} in "${existing}" and "${entry.id}". Every piece needs a unique number.`,
      );
    }
    byNumber.set(entry.data.number, entry.id);
  }

  const featured = entries.filter((entry) => entry.data.featured);
  if (featured.length > 1) {
    throw new Error(
      `[writing] Only one piece may be featured. Found ${featured.length}: ${featured.map((e) => `"${e.id}"`).join(', ')}.`,
    );
  }

  return entries;
}

// Public and gated pieces appear in the index. Unlisted pieces do not.
export const isListed = (entry: WritingEntry) => entry.data.visibility !== 'unlisted';

// Public and unlisted pieces get an article page. Gated pieces do not.
export const hasPage = (entry: WritingEntry) => entry.data.visibility !== 'gated';
