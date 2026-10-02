/**
 * Outline of the bottom bar around the raised "Tengo un hueco" button: flat → concave
 * fillet up → over the top of the button → concave fillet down → flat, like a wave.
 *
 * Coordinates are in px inside an SVG whose bottom edge sits 1px below the bar's top
 * edge (so the fill hides the bar's hairline under the hump).
 */
export interface WaveGeometry {
  width: number;
  height: number;
  /** y of the bar's top edge inside the SVG. */
  baseline: number;
  /** How far the button's center sits above the bar's top edge. */
  fabLift: number;
  /** Closed shape filled with the bar color. */
  fillPath: string;
  /** Open outline continuing the bar's hairline. */
  strokePath: string;
}

export interface WaveOptions {
  /** Gap between the button and the wave. */
  pad: number;
  /** Radius of the concave curves joining the flat bar. */
  fillet: number;
}

export function waveGeometry(
  fabWidth: number,
  fabHeight: number,
  { pad, fillet }: WaveOptions,
): WaveGeometry {
  // The hump is a pill around the button. Its sides are vertical at the pill's
  // center height, so the button is lifted by `fillet` for the concave curve to meet
  // the hump tangentially.
  const radius = fabHeight / 2 + pad;
  const humpWidth = fabWidth + 2 * pad;
  const width = humpWidth + 2 * fillet;
  const baseline = fillet + radius;
  const center = baseline - fillet;
  const top = center - radius;
  // The 1px outline is centered half a pixel above the bar edge, like the bar's hairline.
  const line = baseline - 0.5;

  const wave = [
    `M 0 ${line}`,
    `A ${fillet} ${fillet - 0.5} 0 0 0 ${fillet} ${center}`,
    `A ${radius} ${radius} 0 0 1 ${fillet + radius} ${top}`,
    `H ${fillet + humpWidth - radius}`,
    `A ${radius} ${radius} 0 0 1 ${fillet + humpWidth} ${center}`,
    `A ${fillet} ${fillet - 0.5} 0 0 0 ${width} ${line}`,
  ].join(' ');

  const height = baseline + 1;
  return {
    width,
    height,
    baseline,
    fabLift: fillet,
    strokePath: wave,
    fillPath: `${wave} V ${height} H 0 Z`,
  };
}
