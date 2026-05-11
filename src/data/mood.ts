// Mood map for the 2D feeling picker.
// x ∈ [0,1] runs sad → happy
// y ∈ [0,1] runs low energy → high energy

export type MoodReading = {
  feeling: string;
  desc: string;
  // Tint colour for the page glow
  tint: string;
  legacyMood: 'great' | 'good' | 'meh' | 'bad' | 'awful';
};

export function readMood(x: number, y: number): MoodReading {
  // Clamp
  x = Math.max(0, Math.min(1, x));
  y = Math.max(0, Math.min(1, y));
  const high = y > 0.6;
  const mid = y > 0.35 && y <= 0.6;

  if (high) {
    if (x < 0.33) return { feeling: 'Stressed', desc: 'On edge', tint: '#E27462', legacyMood: 'bad' };
    if (x < 0.66) return { feeling: 'Motivated', desc: 'Driven to act', tint: '#E5D267', legacyMood: 'good' };
    return { feeling: 'Excited', desc: 'Buzzing with energy', tint: '#7FE3A1', legacyMood: 'great' };
  }
  if (mid) {
    if (x < 0.33) return { feeling: 'Anxious', desc: 'Worried', tint: '#E59A6F', legacyMood: 'bad' };
    if (x < 0.66) return { feeling: 'Neutral', desc: 'Just here', tint: '#9C9C9C', legacyMood: 'meh' };
    return { feeling: 'Happy', desc: 'Light and clear', tint: '#9BE3B8', legacyMood: 'great' };
  }
  if (x < 0.33) return { feeling: 'Sad', desc: 'Heavy', tint: '#6B92E0', legacyMood: 'awful' };
  if (x < 0.66) return { feeling: 'Tired', desc: 'Out of fuel', tint: '#7C7C8A', legacyMood: 'meh' };
  return { feeling: 'Calm', desc: 'At ease', tint: '#7FB6E3', legacyMood: 'good' };
}

// Maps a coarse legacy mood category onto a 2D mood-grid position
// (and its tint). Used to draw the same MoodFace blob anywhere the
// app only stores the legacy mood (day strip, past-day card).
export type LegacyMood = 'great' | 'good' | 'meh' | 'bad' | 'awful';
export function moodToPosition(mood: LegacyMood): { x: number; y: number; tint: string } {
  const map: Record<LegacyMood, { x: number; y: number }> = {
    great: { x: 0.85, y: 0.55 },
    good:  { x: 0.7,  y: 0.4 },
    meh:   { x: 0.5,  y: 0.45 },
    bad:   { x: 0.3,  y: 0.7 },
    awful: { x: 0.15, y: 0.5 },
  };
  const pos = map[mood];
  return { ...pos, tint: readMood(pos.x, pos.y).tint };
}

export const CONTEXT_TAGS: { id: string; label: string }[] = [
  { id: 'work', label: 'work' },
  { id: 'study', label: 'study' },
  { id: 'exercise', label: 'exercise' },
  { id: 'shop', label: 'shop' },
  { id: 'commute', label: 'commute' },
  { id: 'relax', label: 'relax' },
  { id: 'create', label: 'create' },
  { id: 'scroll', label: 'scroll' },
  { id: 'game', label: 'game' },
  { id: 'sleep', label: 'sleep' },
  { id: 'alone', label: 'alone' },
  { id: 'partner', label: 'partner' },
  { id: 'family', label: 'family' },
  { id: 'friends', label: 'friends' },
  { id: 'coworkers', label: 'coworkers' },
  { id: 'boss', label: 'boss' },
  { id: 'strangers', label: 'strangers' },
  { id: 'pets', label: 'pets' },
  { id: 'kids', label: 'kids' },
  { id: 'parents', label: 'parents' },
  { id: 'home', label: 'home' },
  { id: 'outdoors', label: 'outdoors' },
  { id: 'gym', label: 'gym' },
  { id: 'café', label: 'café' },
  { id: 'transit', label: 'transit' },
  { id: 'bed', label: 'bed' },
];
