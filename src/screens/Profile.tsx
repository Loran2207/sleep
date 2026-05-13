import { useState } from 'react';
import { W } from '../tokens';
import { go } from '../state/navigation';
import { TopPad, HeaderBar, LiquidGlassNav } from '../components/shared';
import {
  CheckIcon, ChevronRightIcon, MoonIcon, BellIcon, MusicIcon,
  WindIcon, NightShiftIcon, PhoneOffIcon, ProfileFilled,
} from '../components/icons';
import {
  useSleepGoal, useLanguage, useNotifications,
  useSchedules,
} from '../state/store';

const LANGUAGES = ['English', 'Español', 'Français', 'Deutsch', 'Italiano', '日本語', 'Русский'];
const SLEEP_GOAL_OPTIONS = [6, 7, 8, 9, 10];

export function Profile() {
  const [goal, setGoal] = useSleepGoal();
  const [language, setLanguage] = useLanguage();
  const [notifications, setNotifications] = useNotifications();
  const { list: schedules } = useSchedules();

  const [sheet, setSheet] = useState<'goal' | 'language' | null>(null);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: W.bg, color: W.ink, fontFamily: W.font, position: 'relative' }}>
      <TopPad />
      <HeaderBar title="Profile" onBack={() => go('home')} />

      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 16px 130px' }}>
        <ProfileHero />

        <SignInBanner />

        <SectionLabel>Sleep</SectionLabel>
        <Group>
          <Row
            icon={<MoonIcon size={18} stroke={W.ink} />}
            title="Sleep goal"
            value={`${goal} h`}
            onClick={() => setSheet('goal')}
          />
          <Divider />
          <Row
            icon={<BellIcon size={18} stroke={W.ink} />}
            title="Schedule"
            value={`${schedules.length} preset${schedules.length === 1 ? '' : 's'}`}
            onClick={() => go('sleep-schedule')}
          />
          <Divider />
          <Row
            icon={<MusicIcon size={18} stroke={W.ink} />}
            title="Sounds catalog"
            value=""
            onClick={() => go('sounds')}
          />
        </Group>

        <SectionLabel>Wind down</SectionLabel>
        <Group>
          <Row
            icon={<NightShiftIcon size={18} stroke={W.ink} />}
            title="Night Shift"
            value=""
            onClick={() => go('night-shift-guide')}
          />
          <Divider />
          <Row
            icon={<PhoneOffIcon size={18} stroke={W.ink} />}
            title="Distraction blocking"
            value=""
            onClick={() => go('routine')}
          />
          <Divider />
          <Row
            icon={<WindIcon size={18} stroke={W.ink} />}
            title="Breathing practice"
            value=""
            onClick={() => go('practice-intro')}
          />
        </Group>

        <SectionLabel>Preferences</SectionLabel>
        <Group>
          <Row
            icon={<GlyphSquare>A</GlyphSquare>}
            title="Language"
            value={language}
            onClick={() => setSheet('language')}
          />
          <Divider />
          <ToggleRow
            icon={<BellIcon size={18} stroke={W.ink} />}
            title="Notifications"
            on={notifications}
            onChange={setNotifications}
          />
        </Group>

        <SectionLabel>About</SectionLabel>
        <Group>
          <Row icon={<GlyphSquare>?</GlyphSquare>} title="Help & support" value="" onClick={() => { /* mock */ }} />
          <Divider />
          <Row icon={<GlyphSquare>★</GlyphSquare>} title="Rate the app" value="" onClick={() => { /* mock */ }} />
          <Divider />
          <Row icon={<GlyphSquare>§</GlyphSquare>} title="Terms of service" value="" onClick={() => { /* mock */ }} />
          <Divider />
          <Row icon={<GlyphSquare>‹›</GlyphSquare>} title="Privacy policy" value="" onClick={() => { /* mock */ }} />
        </Group>

        <div style={{
          textAlign: 'center', padding: '22px 0 8px',
          fontSize: 11, color: W.veryweak, fontVariantNumeric: 'tabular-nums',
        }}>night · v1.0.0</div>
      </div>

      <LiquidGlassNav active="profile" />

      {sheet === 'goal' && (
        <SleepGoalSheet
          value={goal}
          onSelect={(v) => { setGoal(v); setSheet(null); }}
          onClose={() => setSheet(null)}
        />
      )}
      {sheet === 'language' && (
        <LanguageSheet
          value={language}
          onSelect={(v) => { setLanguage(v); setSheet(null); }}
          onClose={() => setSheet(null)}
        />
      )}
    </div>
  );
}

function ProfileHero() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 16,
      padding: '8px 6px 18px',
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: 32,
        background: W.fill, border: `1px solid ${W.veryweak}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
        color: W.ink,
      }}>
        <ProfileFilled size={32} fill={W.ink} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.01em' }}>Sleeper</div>
        <div style={{ fontSize: 13, color: W.weak, marginTop: 2 }}>Local profile · not signed in</div>
      </div>
    </div>
  );
}

function SignInBanner() {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #1A1A1F 0%, #232328 60%, #2C2C32 100%)',
      border: `1px solid ${W.fill}`,
      borderRadius: 18, padding: '16px 16px',
      marginBottom: 18, position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: -30, right: -30, width: 120, height: 120,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0) 65%)',
        pointerEvents: 'none',
      }} />
      <div style={{ position: 'relative' }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: '#fff' }}>Back up your data</div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 4, lineHeight: 1.45 }}>
          Sign in to sync your schedules, journal and habits across devices.
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
          <div style={{
            flex: 1, padding: '11px 0', textAlign: 'center',
            background: '#fff', color: '#0E0E11',
            borderRadius: 999, fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}>Create account</div>
          <div style={{
            flex: 1, padding: '11px 0', textAlign: 'center',
            background: 'transparent', color: '#fff',
            border: '1px solid rgba(255,255,255,0.22)', borderRadius: 999,
            fontSize: 13, fontWeight: 500, cursor: 'pointer',
          }}>Log in</div>
        </div>
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      padding: '18px 6px 8px',
      fontSize: 11, color: W.weak, fontWeight: 600,
      letterSpacing: 0.5, textTransform: 'none',
    }}>{children}</div>
  );
}

function Group({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      background: W.paper, border: `1px solid ${W.fill}`,
      borderRadius: 14, overflow: 'hidden',
    }}>{children}</div>
  );
}

function Divider() {
  return <div style={{ height: 1, background: W.fill, marginLeft: 56 }} />;
}

function Row({ icon, title, value, onClick }: {
  icon: React.ReactNode;
  title: string;
  value: string;
  onClick: () => void;
}) {
  return (
    <div onClick={onClick} style={{
      padding: '14px 14px',
      display: 'flex', alignItems: 'center', gap: 12,
      cursor: 'pointer',
    }}>
      <div style={iconBoxStyle}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0, fontSize: 15, fontWeight: 500, color: W.ink }}>{title}</div>
      {value && (
        <div style={{ fontSize: 13, color: W.weak, fontVariantNumeric: 'tabular-nums' }}>{value}</div>
      )}
      <ChevronRightIcon size={14} stroke={W.veryweak} />
    </div>
  );
}

function ToggleRow({ icon, title, on, onChange }: {
  icon: React.ReactNode;
  title: string;
  on: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div style={{
      padding: '14px 14px',
      display: 'flex', alignItems: 'center', gap: 12,
    }}>
      <div style={iconBoxStyle}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0, fontSize: 15, fontWeight: 500, color: W.ink }}>{title}</div>
      <div
        onClick={() => onChange(!on)}
        style={{
          width: 44, height: 26, borderRadius: 13, padding: 2,
          background: on ? W.ink : W.fillDark,
          display: 'flex', alignItems: 'center',
          cursor: 'pointer',
          transition: 'background .15s ease',
        }}
      >
        <div style={{
          width: 22, height: 22, borderRadius: 11, background: '#fff',
          transform: on ? 'translateX(18px)' : 'translateX(0)',
          transition: 'transform .15s ease',
          boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
        }} />
      </div>
    </div>
  );
}

const iconBoxStyle: React.CSSProperties = {
  width: 30, height: 30, borderRadius: 8,
  background: W.fill, border: `1px solid ${W.veryweak}`,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  flexShrink: 0,
};

function GlyphSquare({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 14, fontWeight: 600, color: W.ink, lineHeight: 1,
      fontFamily: W.font, letterSpacing: 0,
    }}>{children}</div>
  );
}

// ─── Sheets ──────────────────────────────────────────────────────
function Sheet({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div onClick={onClose} style={{
      position: 'absolute', inset: 0, zIndex: 60,
      background: 'rgba(8,9,12,0.55)',
      backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'flex-end',
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: '100%', background: W.bg,
        borderTopLeftRadius: 24, borderTopRightRadius: 24,
        padding: '14px 20px 28px',
        boxShadow: '0 -10px 40px rgba(0,0,0,0.4)',
        color: W.ink, fontFamily: W.font,
      }}>
        <div style={{
          width: 40, height: 4, borderRadius: 2,
          background: W.fill, margin: '0 auto 14px',
        }} />
        {children}
      </div>
    </div>
  );
}

function SleepGoalSheet({ value, onSelect, onClose }: {
  value: number;
  onSelect: (v: number) => void;
  onClose: () => void;
}) {
  return (
    <Sheet onClose={onClose}>
      <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-0.01em' }}>Sleep goal</div>
      <div style={{ fontSize: 13, color: W.weak, marginTop: 4, lineHeight: 1.5 }}>
        Most adults feel best with 7–9 hours each night.
      </div>

      <div style={{ textAlign: 'center', padding: '20px 0 8px' }}>
        <div style={{
          fontSize: 64, fontWeight: 200, letterSpacing: '-0.04em',
          fontVariantNumeric: 'tabular-nums', lineHeight: 1,
        }}>{value}</div>
        <div style={{ fontSize: 13, color: W.weak, marginTop: 6 }}>hours per night</div>
      </div>

      <div style={{
        marginTop: 8, display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8,
      }}>
        {SLEEP_GOAL_OPTIONS.map((h) => {
          const active = h === value;
          return (
            <div key={h} onClick={() => onSelect(h)} style={{
              padding: '14px 0', textAlign: 'center', borderRadius: 14,
              background: active ? W.ink : W.paper,
              color: active ? W.bg : W.ink,
              border: `1px solid ${active ? W.ink : W.fill}`,
              fontSize: 14, fontWeight: 600, cursor: 'pointer',
              fontVariantNumeric: 'tabular-nums',
            }}>{h} h</div>
          );
        })}
      </div>
    </Sheet>
  );
}

function LanguageSheet({ value, onSelect, onClose }: {
  value: string;
  onSelect: (v: string) => void;
  onClose: () => void;
}) {
  return (
    <Sheet onClose={onClose}>
      <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-0.01em' }}>Language</div>
      <div style={{ fontSize: 13, color: W.weak, marginTop: 4, lineHeight: 1.5 }}>
        The selection is saved but the UI stays in English for now.
      </div>

      <div style={{
        marginTop: 16,
        background: W.paper, border: `1px solid ${W.fill}`,
        borderRadius: 14, overflow: 'hidden',
      }}>
        {LANGUAGES.map((l, i) => {
          const active = l === value;
          const last = i === LANGUAGES.length - 1;
          return (
            <div
              key={l}
              onClick={() => onSelect(l)}
              style={{
                padding: '14px 16px',
                borderBottom: last ? 'none' : `1px solid ${W.fill}`,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                cursor: 'pointer',
              }}
            >
              <span style={{ fontSize: 15, color: W.ink }}>{l}</span>
              {active && <CheckIcon size={16} stroke={W.ink} />}
            </div>
          );
        })}
      </div>
    </Sheet>
  );
}
