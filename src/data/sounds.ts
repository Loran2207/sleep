import type { JSX } from 'react';
import {
  GlyphRain, GlyphFlame, GlyphFlute, GlyphOcean, GlyphForest,
  GlyphCricket, GlyphChimes, GlyphWhite, GlyphFan, GlyphWind, GlyphCoffee, GlyphBook,
  GlyphThunder, GlyphRiver, GlyphSynth, GlyphBinaural, GlyphBrown, GlyphKeyboard, GlyphSeagull,
  type IconProps,
} from '../components/icons';

export type SoundCategory = 'all' | 'nature' | 'indoor' | 'ambient' | 'noise';

export type SoundEntry = {
  id: string;
  name: string;
  cat: Exclude<SoundCategory, 'all'>;
  Glyph: (p: IconProps) => JSX.Element;
};

export const SOUND_CATALOG: SoundEntry[] = [
  { id: 'rain', name: 'Rain', cat: 'nature', Glyph: GlyphRain },
  { id: 'thunder', name: 'Thunder', cat: 'nature', Glyph: GlyphThunder },
  { id: 'ocean', name: 'Ocean waves', cat: 'nature', Glyph: GlyphOcean },
  { id: 'forest', name: 'Forest', cat: 'nature', Glyph: GlyphForest },
  { id: 'river', name: 'River', cat: 'nature', Glyph: GlyphRiver },
  { id: 'crickets', name: 'Crickets', cat: 'nature', Glyph: GlyphCricket },
  { id: 'wind', name: 'Wind', cat: 'nature', Glyph: GlyphWind },
  { id: 'seagull', name: 'Seagulls', cat: 'nature', Glyph: GlyphSeagull },
  { id: 'campfire', name: 'Campfire', cat: 'indoor', Glyph: GlyphFlame },
  { id: 'fan', name: 'Fan', cat: 'indoor', Glyph: GlyphFan },
  { id: 'coffee', name: 'Coffee shop', cat: 'indoor', Glyph: GlyphCoffee },
  { id: 'keyboard', name: 'Keyboard', cat: 'indoor', Glyph: GlyphKeyboard },
  { id: 'bookstore', name: 'Bookstore', cat: 'indoor', Glyph: GlyphBook },
  { id: 'chimes', name: 'Soft chimes', cat: 'ambient', Glyph: GlyphChimes },
  { id: 'flute', name: 'Flute', cat: 'ambient', Glyph: GlyphFlute },
  { id: 'synth', name: 'Synth pad', cat: 'ambient', Glyph: GlyphSynth },
  { id: 'binaural', name: 'Binaural', cat: 'ambient', Glyph: GlyphBinaural },
  { id: 'whitenoise', name: 'White noise', cat: 'noise', Glyph: GlyphWhite },
  { id: 'brown', name: 'Brown noise', cat: 'noise', Glyph: GlyphBrown },
];

export const SOUND_CATEGORIES: { id: SoundCategory; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'nature', label: 'Nature' },
  { id: 'indoor', label: 'Indoor' },
  { id: 'ambient', label: 'Ambient' },
  { id: 'noise', label: 'Noise' },
];

export function lookupSound(id: string): SoundEntry | undefined {
  return SOUND_CATALOG.find((s) => s.id === id);
}
