/**
 * Outline of the bottom bar around the raised "Tengo un hueco" button. Small square
 * steps at the joins and top corners follow the app’s discreet pixel cuts.
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
  /** Width of the joins between the flat bar and the raised action. */
  fillet: number;
}

export function waveGeometry(
  fabWidth: number,
  fabHeight: number,
  { pad, fillet }: WaveOptions,
): WaveGeometry {
  // Keep the original lift and clearance around the action so the three tabs
  // retain their spacing beneath it.
  const radius = fabHeight / 2 + pad;
  const humpWidth = fabWidth + 2 * pad;
  const width = humpWidth + 2 * fillet;
  const baseline = fillet + radius;
  const center = baseline - fillet;
  const top = center - radius;
  // The 1px outline is centered half a pixel above the bar edge, like the bar's hairline.
  const line = baseline - 0.5;

  // Short 4px steps follow the new square-cut button corners. The rise and lift
  // are unchanged, so the action stays centered with the same space above the tabs.
  const step = Math.min(4, fillet / 2, radius / 4);
  const wave = [
    `M 0 ${line}`,
    `H ${step} V ${line - step}`,
    `H ${fillet} V ${top + 2 * step}`,
    `H ${fillet + step} V ${top + step}`,
    `H ${fillet + 2 * step} V ${top}`,
    `H ${fillet + humpWidth - 2 * step} V ${top + step}`,
    `H ${fillet + humpWidth - step} V ${top + 2 * step}`,
    `H ${fillet + humpWidth} V ${line - step}`,
    `H ${width - step} V ${line}`,
    `L ${width} ${line}`,
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
