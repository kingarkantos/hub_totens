import { Campaign, CampaignStylePackage, ThemeId } from '../types';

export const COPIED_STYLE_STORAGE_KEY = 'hubtotens_copied_style';

/**
 * Extracts all visual styling properties from a campaign into a portable package.
 */
export function extractCampaignStyle(camp: Campaign): CampaignStylePackage {
  const gamesConfig = camp.games_config || {};

  // Extract all game-specific styling overrides (ending with _layout, _font, _layout_color_hue)
  const gameSpecificStyles: Record<string, any> = {};
  Object.keys(gamesConfig).forEach((key) => {
    if (key.endsWith('_layout') || key.endsWith('_font') || key.endsWith('_layout_color_hue')) {
      gameSpecificStyles[key] = gamesConfig[key];
    }
  });

  return {
    sourceCampaignId: camp.id,
    sourceCampaignName: camp.name,
    theme_id: camp.theme_id || 'honda-red',
    theme_mode: (camp.theme_mode || gamesConfig.theme_mode || 'dark') as 'light' | 'dark',
    layout_color_hue: gamesConfig.layout_color_hue !== undefined ? Number(gamesConfig.layout_color_hue) : undefined,
    game_layout: gamesConfig.game_layout,
    campaign_font: gamesConfig.campaign_font,
    splash_bg_effect: gamesConfig.splash_bg_effect,
    splash_button_style: gamesConfig.splash_button_style,
    splash_button_hue: gamesConfig.splash_button_hue !== undefined ? Number(gamesConfig.splash_button_hue) : undefined,
    custom_colors: gamesConfig.custom_colors,
    game_specific_styles: Object.keys(gameSpecificStyles).length > 0 ? gameSpecificStyles : undefined,
    copiedAt: new Date().toISOString(),
  };
}

/**
 * Persists copied style to localStorage.
 */
export function saveCopiedStyle(style: CampaignStylePackage): void {
  try {
    localStorage.setItem(COPIED_STYLE_STORAGE_KEY, JSON.stringify(style));
  } catch (err) {
    console.error('Failed to save copied style to localStorage', err);
  }
}

/**
 * Loads copied style from localStorage if present.
 */
export function getCopiedStyle(): CampaignStylePackage | null {
  try {
    const raw = localStorage.getItem(COPIED_STYLE_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CampaignStylePackage;
  } catch {
    return null;
  }
}

/**
 * Clears copied style from localStorage.
 */
export function clearCopiedStyle(): void {
  try {
    localStorage.removeItem(COPIED_STYLE_STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear copied style from localStorage', err);
  }
}

/**
 * Merges a copied style package into an existing games_config while preserving all
 * content, rules, rankings, questions, timers, and non-styling fields.
 */
export function mergeStyleIntoCampaignConfig(
  existingConfig: Record<string, any> | undefined,
  style: CampaignStylePackage
): Record<string, any> {
  const merged: Record<string, any> = {
    ...(existingConfig || {}),
    theme_mode: style.theme_mode || 'dark',
  };

  if (style.layout_color_hue !== undefined) {
    merged.layout_color_hue = style.layout_color_hue;
  }
  if (style.game_layout) {
    merged.game_layout = style.game_layout;
  }
  if (style.campaign_font) {
    merged.campaign_font = style.campaign_font;
  }
  if (style.splash_bg_effect) {
    merged.splash_bg_effect = style.splash_bg_effect;
  }
  if (style.splash_button_style) {
    merged.splash_button_style = style.splash_button_style;
  }
  if (style.splash_button_hue !== undefined) {
    merged.splash_button_hue = style.splash_button_hue;
  }
  if (style.custom_colors) {
    merged.custom_colors = style.custom_colors;
  }
  if (style.game_specific_styles) {
    Object.assign(merged, style.game_specific_styles);
  }

  return merged;
}
