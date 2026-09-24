import type { Element, ElementContent, Root, RootContent } from 'hast';

// Wraps each H2 and everything after it, up to the next H2, in
// <section class="chunk reveal">. The sections drive the fade-up on entry
// and the active state in the desktop table of contents. Content before
// the first H2 (the intro) stays unwrapped.
export default function rehypeSections() {
  return (tree: Root) => {
    const out: RootContent[] = [];
    let current: Element | null = null;

    for (const node of tree.children) {
      const isH2 = node.type === 'element' && node.tagName === 'h2';
      // MDX import and export statements must stay at the top level.
      const isEsm = (node.type as string) === 'mdxjsEsm';

      if (isH2) {
        current = {
          type: 'element',
          tagName: 'section',
          properties: { className: ['chunk', 'reveal'] },
          children: [],
        };
        out.push(current);
      }

      if (current && !isEsm) {
        current.children.push(node as ElementContent);
      } else {
        out.push(node);
      }
    }

    tree.children = out;
  };
}
