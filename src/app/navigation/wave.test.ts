import { describe, expect, it } from 'vitest';
import { waveGeometry } from './wave';

const options = { pad: 6, fillet: 14 };

describe('waveGeometry', () => {
  it('wraps the button with padding and fillets on both sides', () => {
    const wave = waveGeometry(220, 52, options);
    expect(wave.width).toBe(220 + 2 * 6 + 2 * 14);
    // Top of the hump at 0, bar edge below the lifted button.
    expect(wave.baseline).toBe(14 + 52 / 2 + 6);
    expect(wave.height).toBe(wave.baseline + 1);
    expect(wave.fabLift).toBe(14);
  });

  it('starts and ends on the bar hairline so the outline is continuous', () => {
    const wave = waveGeometry(180, 52, options);
    const line = wave.baseline - 0.5;
    expect(wave.strokePath.startsWith(`M 0 ${line} `)).toBe(true);
    expect(wave.strokePath.endsWith(` ${wave.width} ${line}`)).toBe(true);
  });

  it('closes the fill down to the bottom edge to hide the hairline under the hump', () => {
    const wave = waveGeometry(180, 52, options);
    expect(wave.fillPath).toBe(`${wave.strokePath} V ${wave.height} H 0 Z`);
  });

  it('follows the button width (locale, font size)', () => {
    expect(waveGeometry(240, 52, options).width - waveGeometry(200, 52, options).width).toBe(40);
  });
});
