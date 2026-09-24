const WORDS_PER_MINUTE = 225;

// Estimates minutes from the raw MDX body. Component tags and their props
// (chart data, captions) are dropped so only the prose is counted.
export function readingTime(body: string): number {
  const text = body
    .replace(/<[A-Z][\s\S]*?(\/>|<\/[A-Z][A-Za-z]*>)/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[#>*_`~[\]()!-]/g, ' ');
  const words = text.match(/\S+/g)?.length ?? 0;
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}
