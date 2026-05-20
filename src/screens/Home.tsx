import { W } from '../tokens';
import { go } from '../state/navigation';
import {
  TopPad, LiquidGlassNav, SectionLabel,
} from '../components/shared';
import { useBreathSessions, useNightShiftDone, useQuizSession } from '../state/store';
import { QUIZZES, type Quiz } from '../data/quizzes';
import { TODAY_DATE, dayToDate, dayLabel } from '../data/days';

export { dayToDate, dayLabel };

// Lightweight Home: a small greeting, then the tools the user reaches
// for during the day. The bedtime countdown and sleep-flow CTA moved
// to the bottom-nav central action and the Journal screen respectively.
export function Home() {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: W.bg, color: W.ink, fontFamily: W.font, position: 'relative' }}>
      <TopPad h={12} />
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 130 }}>
        <Greeting />

        <div style={{ padding: '8px 16px 0' }}>
          <SectionLabel>Tonight's tools</SectionLabel>
          <BreathingCard />
          <SoundsCard />
          <SectionLabel style={{ marginTop: 18 }}>Wind down</SectionLabel>
          <DistractionCard />
          <NightShiftCard />
        </div>

        <QuizSection />
      </div>
      <LiquidGlassNav active="home" />
    </div>
  );
}

function Greeting() {
  // Mock current hour for prototype — the seeded "today" is an evening
  // session so we lean into the "Tonight" mood. Real app would key off
  // Date.now() and react to morning / midday / evening.
  return (
    <div style={{ padding: '10px 22px 6px' }}>
      <div style={{
        fontSize: 26, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.15,
        color: W.ink,
      }}>
        A softer landing
      </div>
      <div style={{
        fontSize: 13, color: W.weak, marginTop: 4, lineHeight: 1.4,
      }}>
        Pick a tool to take you down tonight.
      </div>
    </div>
  );
}

// Shared anim keyframes used by the paired Home tiles.
function ToolCardKeyframes() {
  return (
    <style>{`
      @keyframes breath-pulse {
        0%, 100% { transform: scale(0.78); opacity: 0.55; }
        50% { transform: scale(1); opacity: 1; }
      }
      @keyframes sound-bar {
        0%, 100% { transform: scaleY(0.32); }
        50% { transform: scaleY(1); }
      }
      @keyframes sound-ring {
        0% { transform: scale(0.7); opacity: 0.6; }
        100% { transform: scale(1.5); opacity: 0; }
      }
      @keyframes sunset-glow {
        0%, 100% { transform: scale(0.92); opacity: 0.78; }
        50% { transform: scale(1.04); opacity: 1; }
      }
    `}</style>
  );
}

const TILE_BASE: React.CSSProperties = {
  position: 'relative', overflow: 'hidden',
  borderRadius: 18, padding: '16px',
  marginBottom: 10, cursor: 'pointer',
  display: 'flex', alignItems: 'center', gap: 14,
};

function BreathingCard() {
  const { forDate } = useBreathSessions();
  const todaySessions = forDate(TODAY_DATE);
  const breaths = todaySessions.reduce((s, x) => s + x.breaths, 0);

  return (
    <div onClick={() => go('practice-intro')} style={{
      ...TILE_BASE,
      background: `
        radial-gradient(70% 70% at 14% 30%, rgba(138,161,255,0.32) 0%, rgba(138,161,255,0) 70%),
        radial-gradient(120% 90% at 95% 100%, rgba(138,161,255,0.08) 0%, rgba(138,161,255,0) 60%),
        linear-gradient(180deg, #161A26 0%, #0F121A 100%)`,
      border: '1px solid rgba(138,161,255,0.26)',
      boxShadow: '0 14px 30px rgba(138,161,255,0.10)',
    }}>
      <ToolCardKeyframes />
      <BreathRing />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: W.ink, letterSpacing: '-0.01em' }}>
          Breathing
        </div>
        <div style={{
          fontSize: 12, color: W.weak, marginTop: 3, lineHeight: 1.4,
        }}>
          {todaySessions.length === 0
            ? '4‑7‑8 breath. Slow down anytime.'
            : <>
                <span style={{ color: '#8AA1FF', fontWeight: 600 }}>
                  {todaySessions.length} session{todaySessions.length === 1 ? '' : 's'} today
                </span>
                <span> · {breaths} breaths</span>
              </>}
        </div>
      </div>
      <div style={{
        padding: '8px 14px', borderRadius: 999,
        background: 'rgba(138,161,255,0.14)',
        border: '1px solid rgba(138,161,255,0.40)',
        color: '#B5C2FF', fontSize: 12, fontWeight: 600,
        flexShrink: 0,
      }}>Start</div>
    </div>
  );
}

function SoundsCard() {
  return (
    <div onClick={() => go('sounds-player')} style={{
      ...TILE_BASE,
      background: `
        radial-gradient(70% 70% at 14% 30%, rgba(255,142,124,0.32) 0%, rgba(255,142,124,0) 70%),
        radial-gradient(120% 90% at 95% 100%, rgba(255,142,124,0.08) 0%, rgba(255,142,124,0) 60%),
        linear-gradient(180deg, #1C1614 0%, #15100F 100%)`,
      border: '1px solid rgba(255,142,124,0.28)',
      boxShadow: '0 14px 30px rgba(255,142,124,0.10)',
    }}>
      <ToolCardKeyframes />
      <SoundOrb />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: W.ink, letterSpacing: '-0.01em' }}>
          Sounds
        </div>
        <div style={{
          fontSize: 12, color: W.weak, marginTop: 3, lineHeight: 1.4,
        }}>
          Drift off to rain, fire or waves.
        </div>
      </div>
      <div style={{
        padding: '8px 14px', borderRadius: 999,
        background: 'rgba(255,142,124,0.14)',
        border: '1px solid rgba(255,142,124,0.42)',
        color: '#FFC9C0', fontSize: 12, fontWeight: 600,
        flexShrink: 0,
      }}>Listen</div>
    </div>
  );
}

function SoundOrb() {
  return (
    <div style={{
      width: 44, height: 44, position: 'relative', flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        borderRadius: '50%', border: '1px dashed rgba(255,142,124,0.50)',
      }} />
      <div style={{
        position: 'absolute', width: 32, height: 32, borderRadius: 16,
        background: 'radial-gradient(circle at 35% 30%, rgba(255,210,200,0.60), rgba(255,142,124,0.10) 65%, transparent 80%)',
        border: '1px solid rgba(255,142,124,0.60)',
      }} />
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 2 }}>
        {[0, 0.18, 0.36].map((d, i) => (
          <div key={i} style={{
            width: 2, height: 12, borderRadius: 1,
            background: '#FFE0DA',
            transformOrigin: 'center',
            animation: `sound-bar 1.${4 + i}s ease-in-out infinite`,
            animationDelay: `${d}s`,
          }} />
        ))}
      </div>
    </div>
  );
}

// ─── Distraction blocking tile (matches Breathing / Sounds) ─────
function DistractionCard() {
  return (
    <div onClick={() => go('routine')} style={{
      ...TILE_BASE,
      background: `
        radial-gradient(70% 70% at 14% 30%, rgba(127,227,161,0.30) 0%, rgba(127,227,161,0) 70%),
        radial-gradient(120% 90% at 95% 100%, rgba(127,227,161,0.06) 0%, rgba(127,227,161,0) 60%),
        linear-gradient(180deg, #131A17 0%, #0F1311 100%)`,
      border: '1px solid rgba(127,227,161,0.26)',
      boxShadow: '0 14px 30px rgba(127,227,161,0.10)',
    }}>
      <ToolCardKeyframes />
      <FocusOrb />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: W.ink, letterSpacing: '-0.01em' }}>
          Block distracting apps
        </div>
        <div style={{ fontSize: 12, color: W.weak, marginTop: 3, lineHeight: 1.4 }}>
          Social and games go silent 30 min before bed.
        </div>
      </div>
      <div style={{
        padding: '8px 14px', borderRadius: 999,
        background: 'rgba(127,227,161,0.14)',
        border: '1px solid rgba(127,227,161,0.42)',
        color: '#B7F0CA', fontSize: 12, fontWeight: 600,
        flexShrink: 0,
      }}>Set up</div>
    </div>
  );
}

function FocusOrb() {
  return (
    <div style={{
      width: 44, height: 44, position: 'relative', flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        borderRadius: '50%', border: '1px dashed rgba(127,227,161,0.50)',
        animation: 'breath-pulse 6s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute', width: 32, height: 32, borderRadius: 16,
        background: 'radial-gradient(circle at 35% 30%, rgba(183,240,202,0.65), rgba(127,227,161,0.10) 65%, transparent 80%)',
        border: '1px solid rgba(127,227,161,0.60)',
      }} />
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke="#B7F0CA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        style={{ position: 'relative' }}>
        <rect x="7" y="3" width="10" height="18" rx="2.5" />
        <path d="M5 4l14 16" />
      </svg>
    </div>
  );
}

// ─── Night Shift tile (matches Breathing / Sounds) ──────────────
function NightShiftCard() {
  const [done] = useNightShiftDone();
  return (
    <div onClick={() => go('night-shift-guide')} style={{
      ...TILE_BASE,
      background: done
        ? `
          radial-gradient(70% 70% at 14% 30%, rgba(127,227,161,0.28) 0%, rgba(127,227,161,0) 70%),
          radial-gradient(120% 90% at 95% 100%, rgba(127,227,161,0.06) 0%, rgba(127,227,161,0) 60%),
          linear-gradient(180deg, #131A17 0%, #0F1311 100%)`
        : `
          radial-gradient(70% 70% at 14% 30%, rgba(255,185,92,0.32) 0%, rgba(255,185,92,0) 70%),
          radial-gradient(120% 90% at 95% 100%, rgba(255,185,92,0.08) 0%, rgba(255,185,92,0) 60%),
          linear-gradient(180deg, #1A1611 0%, #15110C 100%)`,
      border: done
        ? '1px solid rgba(127,227,161,0.30)'
        : '1px solid rgba(255,185,92,0.28)',
      boxShadow: done
        ? '0 14px 30px rgba(127,227,161,0.10)'
        : '0 14px 30px rgba(255,185,92,0.12)',
    }}>
      <ToolCardKeyframes />
      <SunsetOrb done={done} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: W.ink, letterSpacing: '-0.01em' }}>
          Night Shift
        </div>
        <div style={{ fontSize: 12, color: W.weak, marginTop: 3, lineHeight: 1.4 }}>
          {done
            ? <><span style={{ color: '#B7F0CA', fontWeight: 600 }}>On</span> · tap to review.</>
            : 'Warm your screen after sunset.'}
        </div>
      </div>
      <div style={{
        padding: '8px 14px', borderRadius: 999,
        background: done ? 'rgba(127,227,161,0.14)' : 'rgba(255,185,92,0.14)',
        border: `1px solid ${done ? 'rgba(127,227,161,0.42)' : 'rgba(255,185,92,0.42)'}`,
        color: done ? '#B7F0CA' : '#FFD58A', fontSize: 12, fontWeight: 600,
        flexShrink: 0,
      }}>{done ? 'Done' : 'How to'}</div>
    </div>
  );
}

function SunsetOrb({ done }: { done: boolean }) {
  const accent = done ? 'rgba(127,227,161,' : 'rgba(255,185,92,';
  const highlight = done ? 'rgba(183,240,202,' : 'rgba(255,210,150,';
  const glyph = done ? '#B7F0CA' : '#FFD58A';
  return (
    <div style={{
      width: 44, height: 44, position: 'relative', flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        borderRadius: '50%', border: `1px dashed ${accent}0.55)`,
      }} />
      <div style={{
        position: 'absolute', width: 32, height: 32, borderRadius: 16,
        background: `radial-gradient(circle at 35% 30%, ${highlight}0.65), ${accent}0.10) 65%, transparent 80%)`,
        border: `1px solid ${accent}0.60)`,
        animation: 'sunset-glow 5.5s ease-in-out infinite',
      }} />
      {done ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke={glyph} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"
          style={{ position: 'relative' }}>
          <path d="M5 12l4 4 10-10" />
        </svg>
      ) : (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
          stroke={glyph} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
          style={{ position: 'relative' }}>
          <circle cx="12" cy="12" r="4" fill={glyph} />
          <path d="M12 5V3M12 21v-2M5 12H3M21 12h-2M6.5 6.5L5 5M19 19l-1.5-1.5M6.5 17.5L5 19M19 5l-1.5 1.5" />
        </svg>
      )}
    </div>
  );
}

function QuizSection() {
  const { start } = useQuizSession();
  function openQuiz(q: Quiz) {
    start(q.id);
    go('quiz-intro');
  }
  return (
    <div style={{ marginTop: 26 }}>
      <div style={{
        padding: '0 16px 12px 16px',
        fontSize: 13, color: W.weak, fontWeight: 600,
      }}>Self-checks</div>
      <div style={{
        display: 'flex', gap: 12, overflowX: 'auto',
        padding: '8px 16px 36px 16px',
        scrollSnapType: 'x mandatory',
        scrollPaddingLeft: 16,
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none',
      }}>
        {QUIZZES.map((q) => (
          <QuizCard key={q.id} quiz={q} onClick={() => openQuiz(q)} />
        ))}
      </div>
    </div>
  );
}

function QuizCard({ quiz, onClick }: { quiz: Quiz; onClick: () => void }) {
  const Icon = quiz.icon;
  return (
    <div onClick={onClick} style={{
      flex: '0 0 148px', minHeight: 148,
      scrollSnapAlign: 'start',
      position: 'relative', overflow: 'hidden',
      borderRadius: 20, padding: '14px 14px 14px',
      background: `
        radial-gradient(95% 70% at 22% 18%, ${hexA(quiz.accent, 0.42)} 0%, ${hexA(quiz.accent, 0)} 70%),
        radial-gradient(120% 90% at 90% 100%, ${hexA(quiz.accent, 0.10)} 0%, ${hexA(quiz.accent, 0)} 60%),
        linear-gradient(180deg, ${hexA(quiz.accent, 0.08)} 0%, #14141A 100%)`,
      border: `1px solid ${hexA(quiz.accent, 0.28)}`,
      cursor: 'pointer',
      display: 'flex', flexDirection: 'column',
      boxShadow: `0 14px 30px ${hexA(quiz.accent, 0.10)}`,
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 12,
        background: `linear-gradient(135deg, ${hexA(quiz.accent, 0.40)} 0%, ${hexA(quiz.accent, 0.12)} 100%)`,
        border: `1px solid ${hexA(quiz.accent, 0.55)}`,
        color: quiz.accent,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: `0 6px 18px ${hexA(quiz.accent, 0.32)}, inset 0 1px 0 ${hexA(quiz.accent, 0.20)}`,
      }}>
        <Icon size={19} />
      </div>
      <div style={{ flex: 1 }} />
      <div style={{
        fontSize: 14, fontWeight: 700, color: W.ink,
        letterSpacing: '-0.01em', lineHeight: 1.25,
      }}>{quiz.title}</div>
      <div style={{
        marginTop: 4, fontSize: 11, color: W.weak, lineHeight: 1.3,
        fontWeight: 500,
      }}>{quizDuration(quiz)}</div>
    </div>
  );
}

function quizDuration(quiz: Quiz): string {
  const parts = quiz.meta.split('·').map((p) => p.trim());
  return parts[parts.length - 1] || quiz.meta;
}

function hexA(hex: string, a: number) {
  const c = hex.replace('#', '');
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

function BreathRing() {
  return (
    <div style={{
      width: 44, height: 44, position: 'relative', flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        borderRadius: '50%', border: '1px dashed rgba(138,161,255,0.50)',
      }} />
      <div style={{
        width: 32, height: 32, borderRadius: 16,
        background: 'radial-gradient(circle at 35% 30%, rgba(195,205,255,0.70), rgba(138,161,255,0.10) 65%, transparent 80%)',
        border: '1px solid rgba(138,161,255,0.60)',
        animation: 'breath-pulse 4.2s ease-in-out infinite',
      }} />
    </div>
  );
}
