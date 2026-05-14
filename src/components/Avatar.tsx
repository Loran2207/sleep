import { useState, type CSSProperties } from 'react';
import { W } from '../tokens';

// Profile picture with a graceful initials fallback. If the image at
// `src` fails to load (file missing, slow network), the component
// renders the user's initials on a tinted background instead. Used
// in both the Profile hero and the StickyTopBar trigger so the
// avatar stays consistent across surfaces.

export interface AvatarProps {
  src?: string;
  name: string;
  size: number;
  /** Optional override for the fallback background. */
  bg?: string;
  /** Optional override for the border. Pass null to drop it. */
  border?: string | null;
  /** Optional drop-shadow style for emphasis (used by the Profile hero). */
  shadow?: string;
  style?: CSSProperties;
}

export function Avatar({
  src = '/avatar.jpg',
  name,
  size,
  bg = W.fill,
  border = `1px solid ${W.veryweak}`,
  shadow,
  style,
}: AvatarProps) {
  const [failed, setFailed] = useState(false);
  const initials = initialsOf(name);

  return (
    <div style={{
      width: size, height: size, borderRadius: size / 2,
      background: bg,
      border: border ?? undefined,
      overflow: 'hidden', flexShrink: 0,
      position: 'relative',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: W.ink,
      boxShadow: shadow,
      ...style,
    }}>
      {!failed && (
        <img
          src={src}
          alt={name}
          onError={() => setFailed(true)}
          style={{
            width: '100%', height: '100%', objectFit: 'cover',
            display: 'block',
          }}
        />
      )}
      {failed && (
        <span style={{
          fontSize: size * 0.36, fontWeight: 600,
          letterSpacing: 0.5, color: W.ink,
        }}>{initials}</span>
      )}
    </div>
  );
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
