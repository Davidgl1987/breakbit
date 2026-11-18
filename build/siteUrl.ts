import type { Plugin } from 'vite';

/**
 * Fills `%SITE_URL%` in index.html with the public address of the app (SITE_URL in the
 * deploy workflow, ending in `/`). Link previews (Open Graph) need absolute URLs; without
 * SITE_URL, e.g. locally, the base path stands in.
 */
export function siteUrl(): Plugin {
  let url = '/';
  return {
    name: 'breakbit-site-url',
    configResolved(config) {
      url = withSlash(process.env.SITE_URL ?? config.base);
    },
    transformIndexHtml(html) {
      return html.replaceAll('%SITE_URL%', url);
    },
  };
}

export function withSlash(url: string): string {
  return url.endsWith('/') ? url : `${url}/`;
}
