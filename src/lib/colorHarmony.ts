// Helper for generating harmonic, vibrant color palettes from a single hue slider (0° - 360°)
// Designed for game layouts and totems to unify styling without picking color by color.

export interface LayoutColorPalette {
  hue: number;
  name?: string;
  primary: string;
  secondary: string;
  darkShade: string;
  accent: string;
  glowColor: string;
  glowHex: string;
  textColor: string;
}

export interface QuickHuePreset {
  name: string;
  hue: number;
  previewHex: string;
}

export const QUICK_HUE_PRESETS: QuickHuePreset[] = [
  { name: 'Ciano Neon', hue: 185, previewHex: '#06B6D4' },
  { name: 'Magenta Pink', hue: 315, previewHex: '#EC4899' },
  { name: 'Roxo Cósmico', hue: 270, previewHex: '#8B5CF6' },
  { name: 'Verde Matrix', hue: 145, previewHex: '#10B981' },
  { name: 'Ouro Real', hue: 45, previewHex: '#F59E0B' },
  { name: 'Laranja Solar', hue: 25, previewHex: '#F97316' },
  { name: 'Vermelho Fogo', hue: 0, previewHex: '#EF4444' },
  { name: 'Azul Elétrico', hue: 215, previewHex: '#3B82F6' },
  { name: 'Verde Lima', hue: 85, previewHex: '#84CC16' },
];

export const DEFAULT_LAYOUT_HUES: Record<string, number> = {
  cartoon_pop: 40,      // Amber / Orange
  cartoon_comic: 195,   // Sky Blue
  neon_arcade: 185,     // Cyan
  bento_tech: 155,      // Emerald Green
  neumorphic_luxe: 42,  // Gold
  modern_glass: 220,    // Electric Blue
  spatial_3d: 275,      // Purple
  pixel_retro: 50,      // Retro Arcade Yellow
  cyber_matrix: 145,    // Matrix Green
  synthwave_grid: 320,  // Synthwave Pink
  golden_casino: 42,    // Luxury Gold
  bubble_toon: 330,     // Bubble Pink
};

/**
 * Converts HSL (H: 0-360, S: 0-100, L: 0-100) to Hex #RRGGBB
 */
export function hslToHex(h: number, s: number, l: number): string {
  const normalizedH = ((h % 360) + 360) % 360;
  const sat = Math.max(0, Math.min(100, s)) / 100;
  const light = Math.max(0, Math.min(100, l)) / 100;

  const c = (1 - Math.abs(2 * light - 1)) * sat;
  const x = c * (1 - Math.abs(((normalizedH / 60) % 2) - 1));
  const m = light - c / 2;

  let r = 0, g = 0, b = 0;
  if (normalizedH < 60) {
    r = c; g = x; b = 0;
  } else if (normalizedH < 120) {
    r = x; g = c; b = 0;
  } else if (normalizedH < 180) {
    r = 0; g = c; b = x;
  } else if (normalizedH < 240) {
    r = 0; g = x; b = c;
  } else if (normalizedH < 300) {
    r = x; g = 0; b = c;
  } else {
    r = c; g = 0; b = x;
  }

  const toHex = (n: number) => {
    const val = Math.round((n + m) * 255);
    return Math.max(0, Math.min(255, val)).toString(16).padStart(2, '0').toUpperCase();
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Converts Hex to RGBA string
 */
export function hexToRgba(hex: string, alpha: number): string {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16) || 0;
  const g = parseInt(cleanHex.substring(2, 4), 16) || 0;
  const b = parseInt(cleanHex.substring(4, 6), 16) || 0;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Generates a full balanced harmonic palette from a single hue (0 - 360)
 */
export function generateLayoutPalette(hue: number, isLight = false): LayoutColorPalette {
  const safeHue = ((Math.round(hue) % 360) + 360) % 360;

  // Primary: Vibrant, saturated tone
  const primary = hslToHex(safeHue, 95, isLight ? 42 : 52);

  // Secondary: Adjacent complementary / deeper tone (shift hue +30°)
  const secondary = hslToHex((safeHue + 32) % 360, 90, isLight ? 36 : 46);

  // Accent: High-contrast split tone (shift hue +180°)
  const accent = hslToHex((safeHue + 180) % 360, 95, 58);

  // Glow: Luminescent aura for borders and buttons
  const glowColor = hexToRgba(primary, isLight ? 0.35 : 0.55);

  // Deep saturated shade for 3D bottom drop-shadows and tactile borders
  const darkShade = hslToHex(safeHue, 95, isLight ? 22 : 18);

  return {
    hue: safeHue,
    primary,
    secondary,
    darkShade,
    accent,
    glowColor,
    glowHex: primary,
    textColor: isLight ? '#0F172A' : '#FFFFFF',
  };
}

/**
 * Resolves initial hue for a given layout ID or fallback
 */
export function getDefaultHueForLayout(layoutId?: string): number {
  if (layoutId && DEFAULT_LAYOUT_HUES[layoutId] !== undefined) {
    return DEFAULT_LAYOUT_HUES[layoutId];
  }
  return 185; // Default Cyan
}
