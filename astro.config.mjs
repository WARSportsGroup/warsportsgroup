// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import { unified } from '@astrojs/markdown-remark';
import rehypeSections from './src/lib/rehypeSections.ts';

export default defineConfig({
  site: 'https://www.warsportsgroup.com',
  output: 'static',
  trailingSlash: 'never',
  build: {
    format: 'file',
  },
  markdown: {
    // The unified processor runs rehype plugins. MDX inherits it.
    processor: unified({ rehypePlugins: [rehypeSections] }),
  },
  integrations: [mdx()],
});
