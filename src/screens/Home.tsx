import { W } from '../tokens';
import { go } from '../state/navigation';
import { PhoneOffIcon } from '../components/icons';
import {
  TopPad, LiquidGlassNav, SettingsCard, NightShiftCard,
} from '../components/shared';
import { useBreathSessions, useQuizSession } from '../state/store';
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
          <BreathingCard />
          <SoundsCard />

          <ToolsSectionHeader title="Wind down" style={{ marginTop: 20 }} />
          <SettingsCard
            icon={<PhoneOffIcon size={22} stroke={W.ink} />}
            title="Block distracting apps"
            desc="Social and games go silent 30 min before bedtime, until you wake up."
            onClick={() => go('routine')}
          />
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
    <div style={{ padding: '14px 22px 12px' }}>
      <div style={{ fontSize: 12, fontWeight: 500, color: W.weak, letterSpacing: 0.3 }}>
        Tonight
      </div>
      <div style={{
        fontSize: 26, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.15,
        marginTop: 4, color: W.ink,
      }}>
        Tools for a softer landing
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

function ToolsSectionHeader({ title, style }: { title: string; style?: React.CSSProperties }) {
  return (
    <div style={{
      padding: '12px 4px 10px',
      fontSize: 13, color: W.weak, fontWeight: 600,
      ...style,
    }}>{title}</div>
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
