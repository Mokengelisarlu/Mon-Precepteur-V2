import tokens from './tokens.json';

export const palette = tokens.palette;

export const spacing = tokens.spacing;

export const radii = tokens.radii;

export const elevation = tokens.elevation;

export const motion = tokens.motion;

export type PaletteColor = keyof typeof palette;

export type SpacingToken = keyof typeof spacing;

export type RadiusToken = keyof typeof radii;

export type ElevationToken = keyof typeof elevation;

export function themeColor(name: PaletteColor): string {
  return palette[name];
}
