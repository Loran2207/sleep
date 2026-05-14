// Themed line-art glyphs used by the quiz cards. Each renders inside a
// 24x24 viewBox so it fits cleanly in a tinted tile of any size.

import type { ReactNode } from 'react';

function Glyph({ children, size = 22, stroke = 'currentColor' }: {
  children: ReactNode; size?: number; stroke?: string;
}) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={stroke} strokeWidth={1.7}
      strokeLinecap="round" strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

// Sun rising over a horizon with a small swirl tail — chronotype.
export function IconChronotype(p: { size?: number }) {
  return (
    <Glyph size={p.size}>
      <path d="M3 18h18" />
      <path d="M7 14a5 5 0 0 1 10 0" />
      <path d="M12 4v3" />
      <path d="M5 8l1.5 1.5" />
      <path d="M19 8l-1.5 1.5" />
    </Glyph>
  );
}

// Hourglass — sleep need.
export function IconHourglass(p: { size?: number }) {
  return (
    <Glyph size={p.size}>
      <path d="M7 3h10" />
      <path d="M7 21h10" />
      <path d="M7 3v3.5c0 2 5 3 5 5.5s-5 3.5-5 5.5V21" />
      <path d="M17 3v3.5c0 2-5 3-5 5.5s5 3.5 5 5.5V21" />
    </Glyph>
  );
}

// Heart with an EKG line under it — anxiety self-check.
export function IconHeartwave(p: { size?: number }) {
  return (
    <Glyph size={p.size}>
      <path d="M12 17s-6-3.5-6-8a3.5 3.5 0 0 1 6-2.4A3.5 3.5 0 0 1 18 9c0 4.5-6 8-6 8z" />
      <path d="M3 20h4l1.5-3 3 5 2-4 1.5 2H21" />
    </Glyph>
  );
}

// Moon over a bed — sleep quality.
export function IconMoonBed(p: { size?: number }) {
  return (
    <Glyph size={p.size}>
      <path d="M15 5.5a4 4 0 1 0 3.5 5.5" />
      <path d="M3 18v-4a2 2 0 0 1 2-2h11a4 4 0 0 1 4 4v2" />
      <path d="M3 18h18" />
      <path d="M8 12v-1.5a1.5 1.5 0 0 1 1.5-1.5h2A1.5 1.5 0 0 1 13 10.5V12" />
    </Glyph>
  );
}
