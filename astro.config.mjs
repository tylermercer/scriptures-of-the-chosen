import cloudflare from "@astrojs/cloudflare";
import sitemap from "@astrojs/sitemap";
import icon from 'astro-icon';
import metaTags from "astro-meta-tags";
import { defineConfig } from 'astro/config';
import remarkEmdash from './src/plugins/remark/emdash';

// https://astro.build/config
export default defineConfig({
  output: "static",
  adapter: cloudflare(),
  site: "https://scripturesofthechosen.tylermercer.net",
  integrations: [sitemap(), icon(), metaTags()],
  markdown: {
    remarkPlugins: [remarkEmdash],
  },
  scopedStyleStrategy: 'class',
  vite: {
    server: {
      hostname: 'sotc.localhost'
    },
    ssr: {
      external: ['@jam-comments/server-utilities', 'node-fetch']
    }
  }
});