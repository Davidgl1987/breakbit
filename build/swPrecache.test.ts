import { describe, expect, it } from 'vitest';
import { shellFiles } from './swPrecache';

describe('offline shell', () => {
  it('keeps the page, built code and styles, woff2 fonts, the manifest and the icons', () => {
    expect(
      shellFiles([
        'index.html',
        'sw.js',
        'manifest.webmanifest',
        'assets/index-abc.js',
        'assets/index-abc.css',
        'assets/nunito-400.woff2',
        'assets/nunito-400.woff',
        'assets/index-abc.js.map',
        'app-icons/icon-192.png',
        'brand/wordmark-light.png',
        'favicon.ico',
        'icons/24/plant.png',
        'icons/manifest.json',
      ]),
    ).toEqual([
      '/',
      '/app-icons/icon-192.png',
      '/assets/index-abc.css',
      '/assets/index-abc.js',
      '/assets/nunito-400.woff2',
      '/brand/wordmark-light.png',
      '/favicon.ico',
      '/icons/24/plant.png',
      '/index.html',
      '/manifest.webmanifest',
    ]);
  });
});
