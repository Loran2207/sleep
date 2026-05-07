// Friendly blob face that morphs by 2D mood position.
// x ∈ [0,1] runs sad → happy (drives mouth curve).
// y ∈ [0,1] runs low → high energy (drives brows / sleepy eyes).
export function MoodFace({ tint, x, y, size = 96, glow = false }: {
  tint: string; x: number; y: number; size?: number; glow?: boolean;
}) {
  const smile = (x - 0.5) * 14;
  const browTilt = (y - 0.5) * 6;
  const sleepy = y < 0.2;
  // A unique gradient id per render so multiple faces on a screen don't share state.
  const gradId = `mood-blob-${size}-${Math.round(x * 100)}-${Math.round(y * 100)}`;

  return (
    <div style={{
      width: size, height: size, position: 'relative',
      filter: glow
        ? `drop-shadow(0 0 24px ${tint}) drop-shadow(0 6px 18px rgba(0,0,0,0.4))`
        : 'drop-shadow(0 6px 18px rgba(0,0,0,0.35))',
    }}>
      <svg width={size} height={size} viewBox="0 0 96 96">
        <defs>
          <radialGradient id={gradId} cx="35%" cy="30%" r="80%">
            <stop offset="0%" stopColor="#FFFCEB" />
            <stop offset="100%" stopColor={tint} />
          </radialGradient>
        </defs>
        <path
          d="M 48 6
             C 70 6 88 22 88 44
             C 88 66 72 90 48 90
             C 24 90 8 66 8 44
             C 8 22 26 6 48 6 Z"
          fill={`url(#${gradId})`}
        />
        <path
          d={`M 30 ${36 - browTilt} L 40 ${36 + browTilt * 0.4}`}
          stroke="#0E0E11" strokeWidth="2.5" strokeLinecap="round" fill="none"
        />
        <path
          d={`M 56 ${36 + browTilt * 0.4} L 66 ${36 - browTilt}`}
          stroke="#0E0E11" strokeWidth="2.5" strokeLinecap="round" fill="none"
        />
        {sleepy ? (
          <>
            <path d="M 32 50 Q 36 53 40 50" stroke="#0E0E11" strokeWidth="2.4" strokeLinecap="round" fill="none" />
            <path d="M 56 50 Q 60 53 64 50" stroke="#0E0E11" strokeWidth="2.4" strokeLinecap="round" fill="none" />
          </>
        ) : (
          <>
            <circle cx="36" cy="48" r="2.6" fill="#0E0E11" />
            <circle cx="60" cy="48" r="2.6" fill="#0E0E11" />
          </>
        )}
        <path
          d={`M 38 64 Q 48 ${64 + smile} 58 64`}
          stroke="#0E0E11" strokeWidth="2.5" strokeLinecap="round" fill="none"
        />
      </svg>
    </div>
  );
}
