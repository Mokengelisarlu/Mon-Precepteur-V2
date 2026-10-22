import { elevation, palette, radii, spacing, themeColor } from '@/lib/theme';

describe('theme tokens', () => {
  it('exposes the approved status colours', () => {
    expect(palette.success).toBe('#2E6B3F');
    expect(palette['success-container']).toBe('#CDEFD6');
    expect(palette['on-success-container']).toBe('#0C2011');
    expect(palette.warning).toBe('#8A5300');
    expect(palette.info).toBe('#2F5D9C');
    expect(palette['on-success']).toBe('#FFFFFF');
  });

  it('derives the elevation tokens from the outline-variant tint', () => {
    expect(elevation['elevation-1'].boxShadow).toBe('0 1px 2px 0 rgba(214, 194, 181, 0.45)');
    expect(elevation['elevation-2'].boxShadow).toBe('0 2px 6px 0 rgba(214, 194, 181, 0.60)');
    expect(elevation['elevation-3'].boxShadow).toBe('0 6px 16px 0 rgba(214, 194, 181, 0.80)');
  });

  it('exposes spacing and radii scales', () => {
    expect(spacing.l).toBe(16);
    expect(radii.field).toBe(16);
    expect(radii.sheet).toBe(28);
  });

  it('resolves a palette colour by token name', () => {
    expect(themeColor('primary')).toBe(palette.primary);
  });
});
