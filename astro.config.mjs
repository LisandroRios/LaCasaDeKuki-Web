// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

import partytown from '@astrojs/partytown';

// https://astro.build/config
export default defineConfig({
  site: 'https://lacasadekuki.com.ar',
  adapter: vercel(),
  vite: {
    plugins: [tailwindcss()]
  },
  integrations: [
    sitemap(),
    // Partytown: corre scripts de terceros (GA4) en un web worker
    partytown({
      config: {
        forward: ['dataLayer.push', 'gtag'],
      },
    }),
  ]
});