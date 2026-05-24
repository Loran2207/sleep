import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { W } from '../tokens';
import {
  completeOnboarding, useSleepGoal, useSchedules, useMix,
} from '../state/store';
import { OptionCard, hexA } from '../components/QuizCard';
import { WheelPicker } from './WindDown';
import {
  MusicIcon, WindIcon, PencilIcon, MoonIcon, BellIcon,
  CheckIcon, ChevronLeftIcon, PhoneOffIcon, GlyphBook,
} from '../components/icons';

// Onboarding lives entirely outside the main nav stack — App renders it
// in place of the app shell until it's completed (or dev-skipped). It's a
// single component with an internal step cursor so the whole flow can
// share answer state, animate between steps, and feed the user's targets
// straight into the live stores at the end.

// Quiz palette, reused so every section feels native to the app.
const CORAL = '#FF8E7C';
const PERIWINKLE = '#8AA1FF';
const LAVENDER = '#C9A6FF';
const MINT = '#5DDDB3';

function pad(n: number) { return String(n).padStart(2, '0'); }
function fmt(h: number, m: number) { return `${pad(h)}:${pad(m)}`; }

// ─── Question model ──────────────────────────────────────────────
type Opt = { label: string; emoji?: string; score?: number; expand?: string };
type Q = {
  id: string;
  accent: string;
  section: string;
  prompt: string;
  sub?: string;
  options: Opt[];
  multi?: boolean;
  scored?: boolean;
};

const ABOUT: Q[] = [
  {
    id: 'age', accent: CORAL, section: 'About you',
    prompt: 'How old are you?',
    sub: 'Sleep needs shift with age — this helps us set the right target.',
    options: [
      { label: 'Under 18' }, { label: '18–24' }, { label: '25–34' },
      { label: '35–44' }, { label: '45–54' }, { label: '55 or older' },
    ],
  },
  {
    id: 'gender', accent: CORAL, section: 'About you',
    prompt: 'Which best describes you?',
    options: [
      { label: 'Female' }, { label: 'Male' },
      { label: 'Non-binary' }, { label: 'Prefer not to say' },
    ],
  },
  {
    id: 'chronotype', accent: CORAL, section: 'About you',
    prompt: 'When do you naturally feel most awake?',
    sub: 'Your body clock shapes the best moment to wind down.',
    options: [
      { label: 'Early morning', emoji: '🌅' },
      { label: 'Mid-morning', emoji: '☀️' },
      { label: 'Afternoon', emoji: '🌤️' },
      { label: 'Evening', emoji: '🌇' },
      { label: 'Late at night', emoji: '🌙' },
    ],
  },
];

const GOALS: Q = {
  id: 'goals', accent: LAVENDER, section: 'About you', multi: true,
  prompt: 'What do you want from night?',
  sub: 'Pick everything that matters — we’ll tailor your tools to match.',
  options: [
    { label: 'Fall asleep faster', emoji: '😴', expand: 'We’ll lead with wind-down breathing and soundscapes to quiet the body so sleep comes sooner.' },
    { label: 'Wake up with energy', emoji: '🔋', expand: 'A steady schedule and a smart wake window leave you sharper in the morning.' },
    { label: 'Calm a busy mind', emoji: '🧠', expand: 'Breathing practices and a quick journal ease the racing thoughts that keep you up.' },
    { label: 'Sleep through the night', emoji: '🌙', expand: 'Better sleep hygiene means fewer wake-ups and deeper, unbroken rest.' },
    { label: 'Build a routine that sticks', emoji: '🌿', expand: 'Gentle habits and reminders turn a few good nights into a lasting rhythm.' },
  ],
};

// Scored sleep self-check. 0 = healthy, 3 = needs the most help.
const SLEEP: Q[] = [
  {
    id: 'rating', accent: PERIWINKLE, section: 'Your sleep', scored: true,
    prompt: 'How would you rate your sleep lately?',
    options: [
      { label: 'Great', score: 0 }, { label: 'Good', score: 1 },
      { label: 'So-so', score: 2 }, { label: 'Poor', score: 3 },
    ],
  },
  {
    id: 'latency', accent: PERIWINKLE, section: 'Your sleep', scored: true,
    prompt: 'How long does it take you to fall asleep?',
    options: [
      { label: 'Under 10 minutes', score: 0 }, { label: '10–20 minutes', score: 1 },
      { label: '20–40 minutes', score: 2 }, { label: 'Over 40 minutes', score: 3 },
    ],
  },
  {
    id: 'awaken', accent: PERIWINKLE, section: 'Your sleep', scored: true,
    prompt: 'Do you wake up during the night?',
    options: [
      { label: 'Almost never', score: 0 }, { label: 'A few times a week', score: 1 },
      { label: 'Most nights', score: 2 }, { label: 'Every night', score: 3 },
    ],
  },
  {
    id: 'early', accent: PERIWINKLE, section: 'Your sleep', scored: true,
    prompt: 'Do you wake earlier than you’d like and can’t drift back?',
    options: [
      { label: 'Rarely', score: 0 }, { label: 'Sometimes', score: 1 },
      { label: 'Often', score: 2 }, { label: 'Most days', score: 3 },
    ],
  },
  {
    id: 'mind', accent: PERIWINKLE, section: 'Your sleep', scored: true,
    prompt: 'Is your mind racing when you try to sleep?',
    options: [
      { label: 'No, I drift off', score: 0 }, { label: 'A little', score: 1 },
      { label: 'Often', score: 2 }, { label: 'Every single night', score: 3 },
    ],
  },
  {
    id: 'screens', accent: PERIWINKLE, section: 'Your sleep', scored: true,
    prompt: 'Phone or screens in the last hour before bed?',
    options: [
      { label: 'Almost never', score: 0 }, { label: 'Sometimes', score: 1 },
      { label: 'Most nights', score: 2 }, { label: 'Always', score: 3 },
    ],
  },
  {
    id: 'caffeine', accent: PERIWINKLE, section: 'Your sleep', scored: true,
    prompt: 'Caffeine in the afternoon or evening?',
    options: [
      { label: 'Never', score: 0 }, { label: 'Rarely', score: 1 },
      { label: 'Sometimes', score: 2 }, { label: 'Most days', score: 3 },
    ],
  },
  {
    id: 'consistency', accent: PERIWINKLE, section: 'Your sleep', scored: true,
    prompt: 'Same bedtime and wake time each day?',
    options: [
      { label: 'Always', score: 0 }, { label: 'Mostly', score: 1 },
      { label: 'Rarely', score: 2 }, { label: 'Never', score: 3 },
    ],
  },
  {
    id: 'ritual', accent: PERIWINKLE, section: 'Your sleep', scored: true,
    prompt: 'Do you have a wind-down ritual before bed?',
    options: [
      { label: 'Yes, a solid one', score: 0 }, { label: 'Sometimes', score: 1 },
      { label: 'Not really', score: 2 }, { label: 'None at all', score: 3 },
    ],
  },
  {
    id: 'daytime', accent: PERIWINKLE, section: 'Your sleep', scored: true,
    prompt: 'How is your energy during the day?',
    options: [
      { label: 'Strong all day', score: 0 }, { label: 'Mostly fine', score: 1 },
      { label: 'Dips often', score: 2 }, { label: 'Tired constantly', score: 3 },
    ],
  },
];

// ─── Step model ──────────────────────────────────────────────────
type StepType =
  | 'welcome' | 'features' | 'benefits' | 'profileIntro' | 'transition'
  | 'section' | 'question' | 'goal' | 'wake' | 'reminders'
  | 'calculating' | 'score' | 'analysis' | 'plan';

type Step = {
  type: StepType;
  accent: string;
  title?: string;
  sub?: string;
  cta?: string;
  section?: string;
  part?: number;
  total?: number;
  q?: Q;
};

const STEPS: Step[] = [
  { type: 'welcome', accent: PERIWINKLE },
  { type: 'features', accent: PERIWINKLE },
  { type: 'benefits', accent: LAVENDER },
  { type: 'profileIntro', accent: CORAL },
  {
    type: 'transition', accent: PERIWINKLE,
    title: 'A few honest answers,\nand night does the rest.',
    sub: 'It takes about two minutes. There are no wrong answers.',
    cta: 'Let’s begin',
  },
  { type: 'section', accent: CORAL, section: 'About you', part: 1, total: 3, sub: 'First, a little context so we can personalize everything.' },
  ...ABOUT.map((q): Step => ({ type: 'question', accent: q.accent, q })),
  { type: 'question', accent: GOALS.accent, q: GOALS },
  { type: 'section', accent: PERIWINKLE, section: 'Your sleep', part: 2, total: 3, sub: 'Ten quick questions about how you sleep right now.' },
  ...SLEEP.map((q): Step => ({ type: 'question', accent: q.accent, q })),
  { type: 'calculating', accent: PERIWINKLE },
  { type: 'score', accent: PERIWINKLE },
  { type: 'analysis', accent: MINT },
  { type: 'section', accent: MINT, section: 'Your targets', part: 3, total: 3, sub: 'Last step — set the goals night will help you hold.' },
  { type: 'goal', accent: MINT },
  { type: 'wake', accent: MINT },
  { type: 'reminders', accent: MINT },
  { type: 'plan', accent: MINT },
];

const TRACKED: Set<StepType> = new Set(['section', 'question', 'goal', 'wake', 'reminders']);

// ─── Root ────────────────────────────────────────────────────────
export function Onboarding() {
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [multi, setMulti] = useState<Record<string, number[]>>({});
  const [goalH, setGoalH] = useState(8);
  const [wakeH, setWakeH] = useState(7);
  const [wakeM, setWakeM] = useState(0);
  const [reminders, setReminders] = useState<number | null>(null);

  const [, setSleepGoal] = useSleepGoal();
  const { update } = useSchedules();
  const { setAlarm } = useMix();

  const step = STEPS[idx];
  const len = STEPS.length;

  function next() { setIdx((i) => Math.min(len - 1, i + 1)); }
  function prev() { setIdx((i) => Math.max(0, i - 1)); }

  function finish() {
    setSleepGoal(goalH);
    update('weekdays', { wakeHour: wakeH, wakeMinute: wakeM });
    setAlarm(fmt(wakeH, wakeM));
    completeOnboarding();
  }
  function skip() { completeOnboarding(); }

  // Auto-advance for the calculating beat.
  useEffect(() => {
    if (step.type === 'calculating') {
      const t = setTimeout(next, 2400);
      return () => clearTimeout(t);
    }
  }, [idx]); // eslint-disable-line react-hooks/exhaustive-deps

  function pickSingle(qid: string, value: number) {
    setAnswers((a) => ({ ...a, [qid]: value }));
    const cur = idx;
    setTimeout(() => setIdx((i) => (i === cur ? Math.min(len - 1, i + 1) : i)), 300);
  }
  function toggleMulti(qid: string, value: number) {
    setMulti((m) => {
      const cur = m[qid] ?? [];
      return { ...m, [qid]: cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value] };
    });
  }
  function pickReminder(value: number) {
    setReminders(value);
    const cur = idx;
    setTimeout(() => setIdx((i) => (i === cur ? Math.min(len - 1, i + 1) : i)), 300);
  }

  const score = useMemo(() => {
    let sum = 0;
    for (const q of SLEEP) {
      const ai = answers[q.id];
      const sc = ai != null ? (q.options[ai].score ?? 0) : 1.5;
      sum += sc;
    }
    const max = SLEEP.length * 3;
    return Math.round(100 * (1 - sum / max));
  }, [answers]);

  const band = scoreBand(score);

  // Progress across the tracked (form) portion of the flow.
  const progress = useMemo(() => {
    if (!TRACKED.has(step.type)) return null;
    const trackedIdxs = STEPS.map((s, i) => (TRACKED.has(s.type) ? i : -1)).filter((i) => i >= 0);
    const pos = trackedIdxs.indexOf(idx);
    return pos / (trackedIdxs.length - 1);
  }, [idx, step.type]);

  const showBack = idx > 0 && step.type !== 'calculating';

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      background: '#0B0B0F', color: W.ink, fontFamily: W.font,
      position: 'relative', overflow: 'hidden',
    }}>
      <Keyframes />
      <Starfield accent={step.accent} />

      <Header
        showBack={showBack}
        onBack={prev}
        onSkip={skip}
        progress={progress}
        accent={step.accent}
        isWelcome={idx === 0}
      />

      <div key={idx} style={{
        position: 'relative', flex: 1, overflowY: 'auto',
        animation: 'ob-rise .42s cubic-bezier(.2,.7,.2,1) both',
      }}>
        {renderBody()}
      </div>

      {renderFooter()}
    </div>
  );

  function renderBody(): ReactNode {
    switch (step.type) {
      case 'welcome': return <WelcomeBody />;
      case 'features': return <FeaturesBody />;
      case 'benefits': return <BenefitsBody />;
      case 'profileIntro': return <ProfileIntroBody />;
      case 'transition': return <TransitionBody step={step} />;
      case 'section': return <SectionBody step={step} />;
      case 'question': return (
        <QuestionBody
          q={step.q!}
          answer={answers[step.q!.id]}
          multiSel={multi[step.q!.id] ?? []}
          onPick={(v) => pickSingle(step.q!.id, v)}
          onToggle={(v) => toggleMulti(step.q!.id, v)}
        />
      );
      case 'goal': return <GoalBody value={goalH} onChange={setGoalH} accent={step.accent} />;
      case 'wake': return (
        <WakeBody
          hour={wakeH} minute={wakeM} goalH={goalH}
          onChange={(h, m) => { setWakeH(h); setWakeM(m); }}
        />
      );
      case 'reminders': return (
        <RemindersBody selected={reminders} onPick={pickReminder} accent={step.accent} />
      );
      case 'calculating': return <CalculatingBody accent={step.accent} />;
      case 'score': return <ScoreBody score={score} band={band} />;
      case 'analysis': return <AnalysisBody band={band} accent={step.accent} />;
      case 'plan': return <PlanBody answers={answers} multi={multi} goalH={goalH} wake={fmt(wakeH, wakeM)} />;
      default: return null;
    }
  }

  function renderFooter(): ReactNode {
    switch (step.type) {
      case 'welcome':
        return <Footer><PrimaryButton label="Get started" onClick={next} /></Footer>;
      case 'features':
      case 'benefits':
        return <Footer><PrimaryButton label="Continue" onClick={next} /></Footer>;
      case 'profileIntro':
        return <Footer><PrimaryButton label="Create my profile" onClick={next} /></Footer>;
      case 'transition':
        return <Footer><PrimaryButton label={step.cta ?? 'Continue'} onClick={next} /></Footer>;
      case 'section':
        return <Footer><PrimaryButton label="Continue" onClick={next} /></Footer>;
      case 'question': {
        if (!step.q!.multi) return null; // single-select auto-advances
        const chosen = (multi[step.q!.id] ?? []).length;
        return (
          <Footer>
            <PrimaryButton label={chosen ? 'Continue' : 'Pick at least one'} onClick={next} disabled={!chosen} />
          </Footer>
        );
      }
      case 'goal':
      case 'wake':
        return <Footer><PrimaryButton label="Continue" onClick={next} /></Footer>;
      case 'score':
        return <Footer><PrimaryButton label="See my analysis" onClick={next} /></Footer>;
      case 'analysis':
        return <Footer><PrimaryButton label="Continue" onClick={next} /></Footer>;
      case 'plan':
        return <Footer><PrimaryButton label="Enter night" onClick={finish} /></Footer>;
      default:
        return null; // reminders + calculating advance on their own
    }
  }
}

// ─── Header ──────────────────────────────────────────────────────
function Header({ showBack, onBack, onSkip, progress, accent, isWelcome }: {
  showBack: boolean;
  onBack: () => void;
  onSkip: () => void;
  progress: number | null;
  accent: string;
  isWelcome: boolean;
}) {
  // The welcome screen stays chrome-free — no controls in the corners.
  if (isWelcome) {
    return <div style={{ height: 'calc(8px + env(safe-area-inset-top))', flexShrink: 0 }} />;
  }

  const left = showBack
    ? <RoundBtn onClick={onBack} label="Back"><ChevronLeftIcon size={16} stroke="#fff" /></RoundBtn>
    : <SkipPill onClick={onSkip} />;
  const right = showBack
    ? <SkipPill onClick={onSkip} />
    : <div style={{ width: 56 }} />;

  return (
    <>
      <div style={{ height: 'calc(8px + env(safe-area-inset-top))', flexShrink: 0 }} />
      <div style={{
        position: 'relative', display: 'flex', alignItems: 'center', gap: 12,
        padding: '4px 14px', minHeight: 40,
      }}>
        {left}
        {progress != null
          ? <ProgressBar value={progress} accent={accent} />
          : <div style={{ flex: 1 }} />}
        {right}
      </div>
    </>
  );
}

function RoundBtn({ children, onClick, label }: { children: ReactNode; onClick: () => void; label: string }) {
  return (
    <div onClick={onClick} aria-label={label} style={{
      width: 32, height: 32, borderRadius: 16, flexShrink: 0,
      background: 'rgba(255,255,255,0.08)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      cursor: 'pointer',
    }}>{children}</div>
  );
}

// Dev-only escape hatch. Faint + dashed so it reads as a build tool,
// not part of the product. Jumps straight to the home screen.
function SkipPill({ onClick }: { onClick: () => void }) {
  return (
    <div onClick={onClick} style={{
      flexShrink: 0,
      padding: '6px 12px', borderRadius: 999,
      border: '1px dashed rgba(255,255,255,0.22)',
      color: 'rgba(255,255,255,0.45)',
      fontSize: 11, fontWeight: 600, letterSpacing: 0.3,
      cursor: 'pointer',
    }}>skip</div>
  );
}

function ProgressBar({ value, accent }: { value: number; accent: string }) {
  return (
    <div style={{ flex: 1, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.10)', overflow: 'hidden' }}>
      <div style={{
        height: '100%', width: `${Math.max(4, value * 100)}%`,
        borderRadius: 2,
        background: `linear-gradient(90deg, ${hexA(accent, 0.7)}, ${accent})`,
        boxShadow: `0 0 12px ${hexA(accent, 0.5)}`,
        transition: 'width .35s cubic-bezier(.2,.7,.2,1)',
      }} />
    </div>
  );
}

// ─── Footer + buttons ────────────────────────────────────────────
function Footer({ children }: { children: ReactNode }) {
  return (
    <div style={{
      position: 'relative', flexShrink: 0,
      padding: '12px 20px calc(22px + env(safe-area-inset-bottom))',
      background: 'linear-gradient(180deg, rgba(11,11,15,0) 0%, rgba(11,11,15,0.85) 32%, #0B0B0F 100%)',
    }}>
      {children}
    </div>
  );
}

function PrimaryButton({ label, onClick, disabled }: { label: string; onClick: () => void; disabled?: boolean }) {
  return (
    <div onClick={disabled ? undefined : onClick} style={{
      padding: '17px 0', textAlign: 'center', borderRadius: 999,
      fontSize: 16, fontWeight: 600, letterSpacing: '-0.01em',
      background: disabled ? 'rgba(255,255,255,0.10)' : '#fff',
      color: disabled ? 'rgba(255,255,255,0.4)' : '#0B0B0F',
      cursor: disabled ? 'default' : 'pointer',
      boxShadow: disabled ? 'none' : '0 10px 28px rgba(0,0,0,0.5)',
      transition: 'background .15s ease, color .15s ease',
    }}>{label}</div>
  );
}

// ─── Shared layout pieces ────────────────────────────────────────
function Logo({ size = 26 }: { size?: number }) {
  return (
    <div style={{
      fontSize: size, fontWeight: 600, letterSpacing: -0.5,
      fontFamily: '"Times New Roman", Georgia, serif',
      fontStyle: 'italic', color: W.ink, lineHeight: 1,
    }}>night</div>
  );
}

function Title({ children, size = 28 }: { children: ReactNode; size?: number }) {
  return (
    <div style={{
      fontSize: size, fontWeight: 600, letterSpacing: '-0.02em',
      lineHeight: 1.15, whiteSpace: 'pre-line',
    }}>{children}</div>
  );
}

function Sub({ children }: { children: ReactNode }) {
  return (
    <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5, marginTop: 10 }}>
      {children}
    </div>
  );
}

// Eyebrow above a question prompt — names the current section.
function Eyebrow({ children, accent }: { children: ReactNode; accent: string }) {
  return (
    <div style={{
      fontSize: 13, fontWeight: 600, letterSpacing: 0.2,
      color: accent, marginBottom: 8,
    }}>{children}</div>
  );
}

// ─── Step bodies ─────────────────────────────────────────────────
function WelcomeBody() {
  return (
    <div style={{
      position: 'relative', minHeight: '100%', overflow: 'hidden',
      display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
      padding: '8px 30px 0',
    }}>
      <WelcomeWash />

      <div style={{ position: 'relative', zIndex: 2, paddingTop: 26 }}>
        <Logo size={24} />
      </div>

      <div style={{
        position: 'relative', zIndex: 2, flex: 1, width: '100%',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}>
        <BreathingOrb />
        <div style={{ marginTop: 48 }}>
          <Title size={34}>{'Sleep is a skill.\nLet’s build yours.'}</Title>
        </div>
        <div style={{
          marginTop: 14, maxWidth: 300,
          fontSize: 15, color: 'rgba(255,255,255,0.6)', lineHeight: 1.55,
        }}>
          Calm your mind, fall asleep faster, and wake up restored.
        </div>
      </div>
    </div>
  );
}

// A single luminous orb that slowly breathes, ringed by concentric
// ripples on the same rhythm — a quiet nod to the app's 4-7-8 wind-down.
function BreathingOrb() {
  return (
    <div style={{
      position: 'relative', width: 188, height: 188,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{
          position: 'absolute', width: 150, height: 150, borderRadius: '50%',
          border: '1px solid rgba(170,185,255,0.30)',
          animation: `ob-ripple 7s ease-out ${i * 2.33}s infinite`,
        }} />
      ))}
      <div style={{
        position: 'absolute', width: 210, height: 210, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(138,161,255,0.30), transparent 66%)',
        filter: 'blur(6px)', animation: 'ob-glow 7s ease-in-out infinite',
      }} />
      <div style={{
        position: 'relative', width: 124, height: 124, borderRadius: '50%',
        background: 'radial-gradient(circle at 36% 30%, #ffffff 0%, #EAEDFF 22%, #C3B0FF 54%, #8AA1FF 80%, rgba(138,161,255,0) 100%)',
        boxShadow: '0 0 72px 16px rgba(138,161,255,0.40), inset -8px -10px 30px rgba(45,30,95,0.30)',
        animation: 'ob-breathe 7s ease-in-out infinite',
      }} />
    </div>
  );
}

function WelcomeWash() {
  return (
    <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', top: '40%', left: '50%', width: 380, height: 380,
        transform: 'translate(-50%,-50%)', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(138,161,255,0.16), transparent 64%)',
      }} />
      <div style={{
        position: 'absolute', bottom: '-14%', left: '50%', width: 440, height: 300,
        transform: 'translateX(-50%)', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(201,166,255,0.12), transparent 70%)',
        filter: 'blur(10px)',
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `url("data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='140'%20height='140'%3E%3Cfilter%20id='n'%3E%3CfeTurbulence%20type='fractalNoise'%20baseFrequency='0.8'%20numOctaves='2'%20stitchTiles='stitch'/%3E%3C/filter%3E%3Crect%20width='140'%20height='140'%20filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundSize: '140px 140px',
        opacity: 0.05, mixBlendMode: 'overlay', filter: 'grayscale(1)',
      }} />
    </div>
  );
}

function FeaturesBody() {
  const items = [
    { icon: <MusicIcon size={20} stroke={PERIWINKLE} />, accent: PERIWINKLE, title: 'Soundscapes', desc: 'Layer rain, waves and fire into your own sleep mix.' },
    { icon: <WindIcon size={20} stroke={CORAL} />, accent: CORAL, title: 'Wind-down breathing', desc: 'Slow 4-7-8 sessions that settle your nervous system.' },
    { icon: <PencilIcon size={20} stroke={LAVENDER} />, accent: LAVENDER, title: 'Sleep journal', desc: 'Track mood and nights to see what truly helps.' },
    { icon: <GlyphBook size={20} stroke={MINT} />, accent: MINT, title: 'Guided course', desc: 'Learn the science of sleep, one short lesson at a time.' },
    { icon: <MoonIcon size={20} stroke={PERIWINKLE} />, accent: PERIWINKLE, title: 'Smart schedules', desc: 'Bed and wake times that adapt to your week.' },
  ];
  return (
    <div style={{ padding: '14px 22px 8px' }}>
      <Title>Everything for a better night</Title>
      <Sub>A calm toolkit you’ll actually reach for.</Sub>
      <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {items.map((it, i) => (
          <div key={it.title} style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: '14px 14px', borderRadius: 16,
            background: W.paper, border: `1px solid ${W.fill}`,
            animation: 'ob-rise .5s ease both', animationDelay: `${i * 80}ms`,
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: 13, flexShrink: 0,
              background: hexA(it.accent, 0.14), border: `1px solid ${hexA(it.accent, 0.32)}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>{it.icon}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 600 }}>{it.title}</div>
              <div style={{ fontSize: 13, color: W.weak, marginTop: 2, lineHeight: 1.4 }}>{it.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BenefitsBody() {
  const items = [
    'Fall asleep faster', 'Wake up clear-headed', 'Steadier mood all day',
    'Lower stress levels', 'Sharper focus', 'More energy that lasts',
    'Habits that finally stick', '…and much more',
  ];
  return (
    <div style={{ padding: '14px 22px 8px' }}>
      <Title>{'Good sleep changes\neverything else.'}</Title>
      <Sub>Here’s what gets better when your nights do.</Sub>
      <div style={{ marginTop: 26, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {items.map((label, i) => {
          const last = i === items.length - 1;
          return (
            <div key={label} style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: '11px 2px',
              animation: 'ob-rise .5s ease both', animationDelay: `${i * 130}ms`,
            }}>
              <div style={{
                width: 26, height: 26, borderRadius: 13, flexShrink: 0,
                background: last ? 'transparent' : hexA(LAVENDER, 0.16),
                border: last ? 'none' : `1px solid ${hexA(LAVENDER, 0.4)}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {!last && <CheckIcon size={14} stroke={LAVENDER} strokeWidth={2.4} />}
              </div>
              <div style={{
                fontSize: last ? 16 : 17,
                fontWeight: last ? 500 : 600,
                color: last ? W.weak : W.ink,
                fontStyle: last ? 'italic' : 'normal',
              }}>{label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ProfileIntroBody() {
  return (
    <div style={{
      minHeight: '100%', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', textAlign: 'center',
      padding: '8px 30px 0',
    }}>
      <div style={{
        width: 116, height: 116, borderRadius: 58, marginBottom: 28,
        background: `radial-gradient(circle at 50% 38%, ${hexA(CORAL, 0.30)} 0%, ${hexA(CORAL, 0.06)} 70%)`,
        border: `1px solid ${hexA(CORAL, 0.4)}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: `0 20px 50px ${hexA(CORAL, 0.18)}`,
        animation: 'ob-pop .5s cubic-bezier(.2,.8,.2,1) both',
      }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={CORAL}
          strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 20c0-4 3.6-6 8-6s8 2 8 6" />
        </svg>
      </div>
      <Title>Let’s build your sleep profile</Title>
      <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5, marginTop: 12, maxWidth: 320 }}>
        It’s quick — your answers shape the tools, tips and plan you’ll see inside.
      </div>
    </div>
  );
}

function TransitionBody({ step }: { step: Step }) {
  return (
    <div style={{
      minHeight: '100%', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', textAlign: 'center',
      padding: '8px 30px 0',
    }}>
      <Title size={30}>{step.title}</Title>
      {step.sub && (
        <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5, marginTop: 14, maxWidth: 320 }}>
          {step.sub}
        </div>
      )}
    </div>
  );
}

function SectionBody({ step }: { step: Step }) {
  return (
    <div style={{
      minHeight: '100%', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', textAlign: 'center',
      padding: '8px 30px 0',
    }}>
      <div style={{
        fontSize: 13, fontWeight: 600, letterSpacing: 0.3,
        color: step.accent, marginBottom: 16,
      }}>Part {step.part} of {step.total}</div>
      <Title size={32}>{step.section}</Title>
      {step.sub && (
        <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5, marginTop: 14, maxWidth: 300 }}>
          {step.sub}
        </div>
      )}
      <SectionDots total={step.total ?? 3} current={(step.part ?? 1) - 1} accent={step.accent} />
    </div>
  );
}

function SectionDots({ total, current, accent }: { total: number; current: number; accent: string }) {
  return (
    <div style={{ display: 'flex', gap: 8, marginTop: 28 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          width: i === current ? 26 : 8, height: 8, borderRadius: 4,
          background: i <= current ? accent : 'rgba(255,255,255,0.14)',
          boxShadow: i === current ? `0 0 12px ${hexA(accent, 0.5)}` : 'none',
          transition: 'width .3s ease',
        }} />
      ))}
    </div>
  );
}

function QuestionBody({ q, answer, multiSel, onPick, onToggle }: {
  q: Q;
  answer: number | undefined;
  multiSel: number[];
  onPick: (v: number) => void;
  onToggle: (v: number) => void;
}) {
  return (
    <div style={{ padding: '12px 20px 8px' }}>
      <Eyebrow accent={q.accent}>{q.section}</Eyebrow>
      <Title size={23}>{q.prompt}</Title>
      {q.sub && (
        <div style={{ fontSize: 14, color: W.weak, lineHeight: 1.5, marginTop: 8 }}>{q.sub}</div>
      )}
      <div style={{ marginTop: 22, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {q.options.map((opt, i) => {
          const selected = q.multi ? multiSel.includes(i) : answer === i;
          return (
            <OptionCard
              key={opt.label}
              label={opt.label}
              emoji={opt.emoji}
              expand={opt.expand}
              selected={selected}
              accent={q.accent}
              indicator={q.multi ? 'check' : 'radio'}
              onClick={() => (q.multi ? onToggle(i) : onPick(i))}
            />
          );
        })}
      </div>
    </div>
  );
}

// ─── Goal (tick-line picker, mirrors Profile) ────────────────────
function GoalBody({ value, onChange, accent }: { value: number; onChange: (v: number) => void; accent: string }) {
  const min = 5, max = 11;
  const range = max - min;
  const pct = (value - min) / range;
  const ticks = Array.from({ length: range + 1 }, (_, i) => min + i);
  return (
    <div style={{ padding: '12px 20px 8px' }}>
      <Eyebrow accent={accent}>Your targets</Eyebrow>
      <Title size={23}>{'How much sleep do you\nwant each night?'}</Title>
      <div style={{ fontSize: 14, color: W.weak, lineHeight: 1.5, marginTop: 8 }}>
        <strong style={{ color: W.ink, fontWeight: 600 }}>7 to 9 hours</strong> suits most adults. You can change this anytime.
      </div>

      <div style={{ position: 'relative', marginTop: 44, height: 170 }}>
        <div style={{
          position: 'absolute', left: `${pct * 100}%`, top: 0, transform: 'translateX(-50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          transition: 'left .2s cubic-bezier(.2,.7,.2,1)', pointerEvents: 'none',
        }}>
          <div style={{
            minWidth: 76, height: 76, padding: '0 6px', borderRadius: 38,
            background: '#0B0B0F', border: `2px solid ${accent}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 12px 28px ${hexA(accent, 0.3)}`,
            fontSize: 22, fontWeight: 600, color: W.ink,
            letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums', lineHeight: 1,
          }}>{value}h</div>
          <div style={{ width: 2, height: 22, background: accent, opacity: 0.9, marginTop: -1 }} />
        </div>

        <div style={{
          position: 'absolute', left: 0, right: 0, top: 100,
          display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: 28,
        }}>
          {ticks.map((h) => {
            const sel = h === value;
            return (
              <div key={h} onClick={() => onChange(h)} style={{
                flex: 1, height: '100%',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end',
                cursor: 'pointer',
              }}>
                <div style={{
                  width: 2, height: sel ? 22 : 14, borderRadius: 1,
                  background: sel ? accent : W.veryweak,
                  transition: 'height .15s ease, background .15s ease',
                }} />
              </div>
            );
          })}
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 136, display: 'flex', justifyContent: 'space-between' }}>
          {ticks.map((h) => (
            <div key={h} style={{
              flex: 1, textAlign: 'center',
              fontSize: 11, color: h === value ? W.ink : W.weak,
              fontWeight: h === value ? 600 : 500, fontVariantNumeric: 'tabular-nums',
            }}>{h}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Wake (reuses the wind-down WheelPicker) ─────────────────────
function WakeBody({ hour, minute, goalH, onChange }: {
  hour: number; minute: number; goalH: number;
  onChange: (h: number, m: number) => void;
}) {
  // Suggested lights-out so they hit their sleep goal.
  const bed = (() => {
    let t = hour * 60 + minute - goalH * 60;
    t = ((t % (24 * 60)) + 24 * 60) % (24 * 60);
    return fmt(Math.floor(t / 60), t % 60);
  })();
  return (
    <div style={{ padding: '12px 20px 8px' }}>
      <Eyebrow accent={MINT}>Your targets</Eyebrow>
      <Title size={23}>{'What time do you\nwant to wake up?'}</Title>
      <div style={{ fontSize: 14, color: W.weak, lineHeight: 1.5, marginTop: 8 }}>
        We’ll build your schedule and alarm around this.
      </div>

      <div style={{
        marginTop: 24, padding: '14px 16px',
        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 22,
      }}>
        <WheelPicker hour={hour} minute={minute} onChange={onChange} />
        <div style={{ marginTop: 10, textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.65)' }}>
          Lights out around <strong style={{ color: '#fff', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{bed}</strong> for {goalH}h of sleep
        </div>
      </div>
    </div>
  );
}

function RemindersBody({ selected, onPick, accent }: {
  selected: number | null; onPick: (v: number) => void; accent: string;
}) {
  const opts = [
    { label: 'Yes, remind me', sub: 'A gentle nudge when it’s time to wind down.' },
    { label: 'Not right now', sub: 'You can turn this on later in settings.' },
  ];
  return (
    <div style={{ padding: '12px 20px 8px' }}>
      <Eyebrow accent={accent}>Your targets</Eyebrow>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12, flexShrink: 0,
          background: hexA(accent, 0.14), border: `1px solid ${hexA(accent, 0.32)}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <BellIcon size={18} stroke={accent} />
        </div>
        <Title size={23}>Want a bedtime nudge?</Title>
      </div>
      <div style={{ marginTop: 22, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {opts.map((o, i) => (
          <OptionCard
            key={o.label}
            label={o.label}
            sublabel={o.sub}
            selected={selected === i}
            accent={accent}
            onClick={() => onPick(i)}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Calculating ─────────────────────────────────────────────────
function CalculatingBody({ accent }: { accent: string }) {
  const lines = ['Reading your answers…', 'Mapping your sleep profile…', 'Building your plan…'];
  const [li, setLi] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setLi((i) => Math.min(lines.length - 1, i + 1)), 780);
    return () => clearInterval(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div style={{
      minHeight: '100%', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: '8px 30px 0',
    }}>
      <div style={{ position: 'relative', width: 96, height: 96 }}>
        <svg width="96" height="96" viewBox="0 0 96 96" style={{ animation: 'ob-spin 1.1s linear infinite' }}>
          <circle cx="48" cy="48" r="40" fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="6" />
          <circle cx="48" cy="48" r="40" fill="none" stroke={accent} strokeWidth="6"
            strokeLinecap="round" strokeDasharray="62 251" />
        </svg>
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <MoonIcon size={28} stroke="#fff" />
        </div>
      </div>
      <div key={li} style={{
        marginTop: 28, fontSize: 17, fontWeight: 600, color: W.ink,
        animation: 'ob-fade .4s ease both',
      }}>{lines[li]}</div>
      <div style={{ marginTop: 8, fontSize: 13, color: W.weak }}>Hang tight for a moment.</div>
    </div>
  );
}

// ─── Score (animated gauge) ──────────────────────────────────────
type Band = { title: string; sub: string; color: string; tag: string };
function scoreBand(score: number): Band {
  if (score >= 80) return { title: 'Your sleep is in great shape', tag: 'Excellent', color: MINT, sub: 'You’ve built strong habits. We’ll help you protect them and fine-tune the details.' };
  if (score >= 60) return { title: 'Your sleep is on the right track', tag: 'Good', color: '#9BE27E', sub: 'A few small tweaks could take you from good to genuinely restorative.' };
  if (score >= 40) return { title: 'There’s real room to grow', tag: 'Fair', color: '#FFC46B', sub: 'Some nights are working against you — the right changes will add up fast.' };
  return { title: 'Your sleep needs some care', tag: 'Needs work', color: CORAL, sub: 'You’re losing more rest than you should. The good news: this is very fixable.' };
}

function ScoreBody({ score, band }: { score: number; band: Band }) {
  return (
    <div style={{ padding: '14px 24px 8px', textAlign: 'center' }}>
      <div style={{ fontSize: 15, color: W.weak, lineHeight: 1.5 }}>
        Based on your answers, your sleep quality is
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
        <GaugeRing pct={score} color={band.color} />
      </div>
      <div style={{
        display: 'inline-block', marginTop: 22, padding: '5px 14px', borderRadius: 999,
        background: hexA(band.color, 0.16), border: `1px solid ${hexA(band.color, 0.4)}`,
        color: band.color, fontSize: 12, fontWeight: 700, letterSpacing: 0.3,
      }}>{band.tag}</div>
      <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.01em', marginTop: 14, lineHeight: 1.25 }}>
        {band.title}
      </div>
      <div style={{ fontSize: 15, color: W.weak, lineHeight: 1.55, marginTop: 10, maxWidth: 330, marginLeft: 'auto', marginRight: 'auto' }}>
        {band.sub}
      </div>
    </div>
  );
}

function GaugeRing({ pct, color }: { pct: number; color: string }) {
  const R = 82, STROKE = 14;
  const C = 2 * Math.PI * R;
  const [reveal, setReveal] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setReveal(true), 80);
    return () => clearTimeout(t);
  }, []);
  const offset = C * (1 - (reveal ? pct / 100 : 0));
  return (
    <div style={{ position: 'relative', width: 200, height: 200 }}>
      <svg width="200" height="200" viewBox="0 0 200 200" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="100" cy="100" r={R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={STROKE} />
        <circle cx="100" cy="100" r={R} fill="none" stroke={color} strokeWidth={STROKE}
          strokeLinecap="round" strokeDasharray={C} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(.2,.7,.2,1)', filter: `drop-shadow(0 0 10px ${hexA(color, 0.5)})` }} />
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ fontSize: 52, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
          {reveal ? pct : 0}
        </div>
        <div style={{ fontSize: 13, color: W.weak, marginTop: 4 }}>out of 100</div>
      </div>
    </div>
  );
}

// ─── Analysis (social proof + projection chart) ──────────────────
function AnalysisBody({ band, accent }: { band: Band; accent: string }) {
  return (
    <div style={{ padding: '14px 20px 8px' }}>
      <Title size={24}>{'We’ve analyzed your\nanswers.'}</Title>

      <div style={{
        marginTop: 18, padding: '16px 16px', borderRadius: 18,
        background: hexA(band.color, 0.08), border: `1px solid ${hexA(band.color, 0.28)}`,
      }}>
        <div style={{ fontSize: 14, color: W.ink, lineHeight: 1.55 }}>
          You’re already doing some things right — and a handful of focused changes can take your
          sleep much further. We’ve built a plan around exactly that.
        </div>
      </div>

      <div style={{
        marginTop: 14, padding: '18px 18px', borderRadius: 18,
        background: W.paper, border: `1px solid ${W.fill}`,
      }}>
        <div style={{
          fontSize: 40, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1, color: W.ink,
        }}>9 in 10</div>
        <div style={{ fontSize: 14, color: W.weak, lineHeight: 1.5, marginTop: 8 }}>
          people who stick with night feel more rested within their first three weeks.*
        </div>
        <ProjectionChart accent={accent} />
        <div style={{ fontSize: 11, color: W.veryweak, marginTop: 12 }}>
          *Based on self-reported check-ins. Your results will vary.
        </div>
      </div>
    </div>
  );
}

function ProjectionChart({ accent }: { accent: string }) {
  return (
    <div style={{ marginTop: 18, position: 'relative' }}>
      <svg width="100%" height="150" viewBox="0 0 300 150" preserveAspectRatio="none" style={{ display: 'block' }}>
        <defs>
          <linearGradient id="ob-line" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#F2724B" />
            <stop offset="0.5" stopColor="#F2B84B" />
            <stop offset="1" stopColor="#34C77B" />
          </linearGradient>
          <linearGradient id="ob-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={hexA(accent, 0.18)} />
            <stop offset="1" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
        </defs>
        <line x1="20" y1="120" x2="288" y2="120" stroke="rgba(255,255,255,0.10)" strokeWidth="1" />
        <path d="M20 112 C90 108 120 86 158 74 S250 36 288 24 L288 120 L20 120 Z" fill="url(#ob-fill)" />
        <path d="M20 112 C90 108 120 86 158 74 S250 36 288 24" fill="none" stroke="url(#ob-line)"
          strokeWidth="4" strokeLinecap="round"
          strokeDasharray="420" strokeDashoffset="420"
          style={{ animation: 'ob-draw 1.5s ease .15s forwards' }} />
        <circle cx="20" cy="112" r="4" fill="#F2724B" />
        <circle cx="288" cy="24" r="6" fill="#34C77B" stroke="#fff" strokeWidth="2.5" />
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
        <span style={{ fontSize: 11, color: W.weak, fontWeight: 600 }}>Now</span>
        <span style={{ fontSize: 11, color: '#34C77B', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
          Your ideal sleep
          <CheckIcon size={12} stroke="#34C77B" strokeWidth={3} />
        </span>
      </div>
    </div>
  );
}

// ─── Plan ────────────────────────────────────────────────────────
function PlanBody({ answers, multi, goalH, wake }: {
  answers: Record<string, number>;
  multi: Record<string, number[]>;
  goalH: number;
  wake: string;
}) {
  const sc = (id: string) => {
    const ai = answers[id];
    const q = SLEEP.find((x) => x.id === id);
    return ai != null && q ? (q.options[ai].score ?? 0) : 0;
  };
  const goals = multi['goals'] ?? [];

  const items: { icon: ReactNode; accent: string; title: string; desc: string }[] = [];
  items.push({ icon: <MusicIcon size={18} stroke={PERIWINKLE} />, accent: PERIWINKLE, title: 'Soundscapes for sleep', desc: 'A calming mix ready for tonight.' });
  if (sc('mind') >= 2 || goals.includes(2)) {
    items.push({ icon: <WindIcon size={18} stroke={CORAL} />, accent: CORAL, title: '4-7-8 wind-down breathing', desc: 'To quiet a busy mind before bed.' });
  }
  if (sc('screens') >= 2) {
    items.push({ icon: <PhoneOffIcon size={18} stroke={LAVENDER} />, accent: LAVENDER, title: 'Distraction blocking', desc: 'Less screen time in your last hour.' });
  }
  if (sc('consistency') >= 2 || sc('ritual') >= 2) {
    items.push({ icon: <MoonIcon size={18} stroke={MINT} />, accent: MINT, title: 'A smart sleep schedule', desc: 'Steady bed and wake times.' });
  }
  items.push({ icon: <PencilIcon size={18} stroke={MINT} />, accent: MINT, title: 'Nightly sleep journal', desc: 'Spot what truly helps you rest.' });

  return (
    <div style={{ padding: '14px 20px 8px' }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}>
        <div style={{
          width: 64, height: 64, borderRadius: 32,
          background: hexA(MINT, 0.16), border: `1px solid ${hexA(MINT, 0.4)}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'ob-pop .5s cubic-bezier(.2,.8,.2,1) both',
        }}>
          <CheckIcon size={30} stroke={MINT} strokeWidth={2.6} />
        </div>
      </div>
      <Title size={26}><span style={{ display: 'block', textAlign: 'center' }}>Your night is ready</span></Title>
      <div style={{ fontSize: 15, color: W.weak, lineHeight: 1.5, marginTop: 10, textAlign: 'center' }}>
        Here’s what we’ve set up for you, based on your answers.
      </div>

      <div style={{
        marginTop: 22, borderRadius: 18, overflow: 'hidden',
        background: W.paper, border: `1px solid ${W.fill}`,
      }}>
        {items.map((it, i) => (
          <div key={it.title} style={{
            display: 'flex', alignItems: 'center', gap: 13, padding: '14px 16px',
            borderTop: i === 0 ? 'none' : `1px solid ${W.fill}`,
          }}>
            <div style={{
              width: 38, height: 38, borderRadius: 11, flexShrink: 0,
              background: hexA(it.accent, 0.14), border: `1px solid ${hexA(it.accent, 0.3)}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>{it.icon}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{it.title}</div>
              <div style={{ fontSize: 12, color: W.weak, marginTop: 2 }}>{it.desc}</div>
            </div>
            <CheckIcon size={16} stroke={MINT} strokeWidth={2.4} />
          </div>
        ))}
      </div>

      <div style={{
        marginTop: 14, display: 'flex', gap: 10,
      }}>
        <TargetChip label="Sleep goal" value={`${goalH}h`} />
        <TargetChip label="Wake at" value={wake} />
      </div>
    </div>
  );
}

function TargetChip({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      flex: 1, padding: '12px 14px', borderRadius: 14,
      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
    }}>
      <div style={{ fontSize: 11, color: W.weak, fontWeight: 500 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 700, marginTop: 3, fontVariantNumeric: 'tabular-nums' }}>{value}</div>
    </div>
  );
}

// ─── Ambient backdrop ────────────────────────────────────────────
function Starfield({ accent }: { accent: string }) {
  return (
    <div aria-hidden style={{
      position: 'absolute', inset: 0, pointerEvents: 'none',
      background: `
        radial-gradient(80% 55% at 50% -5%, ${hexA(accent, 0.16)} 0%, ${hexA(accent, 0)} 70%),
        radial-gradient(1px 1px at 12% 18%, rgba(255,255,255,0.45), transparent 50%),
        radial-gradient(1px 1px at 82% 12%, rgba(255,255,255,0.4), transparent 50%),
        radial-gradient(1.2px 1.2px at 68% 26%, rgba(255,255,255,0.3), transparent 50%),
        radial-gradient(1px 1px at 32% 30%, rgba(255,255,255,0.28), transparent 50%),
        radial-gradient(1px 1px at 90% 34%, rgba(255,255,255,0.25), transparent 50%)
      `,
      transition: 'background .5s ease',
    }} />
  );
}

function Keyframes() {
  return (
    <style>{`
      @keyframes ob-rise { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
      @keyframes ob-fade { from { opacity: 0; } to { opacity: 1; } }
      @keyframes ob-spin { to { transform: rotate(360deg); } }
      @keyframes ob-draw { to { stroke-dashoffset: 0; } }
      @keyframes ob-pop { 0% { transform: scale(.6); opacity: 0; } 60% { transform: scale(1.05); } 100% { transform: scale(1); opacity: 1; } }
      @keyframes ob-breathe { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.07); } }
      @keyframes ob-glow { 0%, 100% { opacity: .55; transform: scale(1); } 50% { opacity: 1; transform: scale(1.08); } }
      @keyframes ob-ripple { 0% { transform: scale(.62); opacity: .5; } 80% { opacity: 0; } 100% { transform: scale(2); opacity: 0; } }
    `}</style>
  );
}
