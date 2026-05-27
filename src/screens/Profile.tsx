import { useState } from 'react';
import { W } from '../tokens';
import { go } from '../state/navigation';
import { TopPad, LiquidGlassNav, HeaderAmbient } from '../components/shared';
import {
  CheckIcon, ChevronRightIcon, MoonIcon, BellIcon,
  NightShiftIcon, PhoneOffIcon, TrashIcon,
} from '../components/icons';
import { Avatar } from '../components/Avatar';
import {
  useSleepGoal, useLanguage, useNotifications,
  useSchedules, useSubscription, resetOnboarding,
  useAuth,
} from '../state/store';

const GUEST_NAME = 'Kirill Kuts';

const LANGUAGES = ['English', 'Español', 'Français', 'Deutsch', 'Italiano', '日本語', 'Русский'];

export function Profile() {
  const [goal, setGoal] = useSleepGoal();
  const [language, setLanguage] = useLanguage();
  const [notifications, setNotifications] = useNotifications();
  const { list: schedules } = useSchedules();
  const [subscription] = useSubscription();
  const { isAuthed, user, signOut, deleteAccount } = useAuth();

  const [sheet, setSheet] = useState<'goal' | 'language' | 'sign-out' | 'delete-account' | null>(null);

  const displayName = user?.name ?? GUEST_NAME;
  const heroSub = user
    ? `${user.email} · ${user.provider === 'apple' ? 'Apple ID' : 'Email'}`
    : 'Local profile · not signed in';

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: W.bg, color: W.ink, fontFamily: W.font, position: 'relative', overflow: 'hidden' }}>
      <HeaderAmbient />
      <TopPad />

      <div style={{ position: 'relative', zIndex: 1, flex: 1, overflowY: 'auto', padding: '8px 16px 190px' }}>
        <ProfileHero name={displayName} sub={heroSub} />

        {!isAuthed && <SignInBanner />}

        <SectionLabel>Subscription</SectionLabel>
        <Group>
          <PremiumRow active={subscription.active} period={subscription.period} />
        </Group>

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
            icon={(
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={W.ink}
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 1 0 2.6-6.3" /><path d="M3 4v4h4" />
              </svg>
            )}
            title="Retake sleep quiz"
            value=""
            onClick={resetOnboarding}
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

        {isAuthed && user && (
          <>
            <SectionLabel>Account</SectionLabel>
            <Group>
              <Row
                icon={<GlyphSquare>@</GlyphSquare>}
                title="Email"
                value={user.email}
                onClick={() => { /* read-only in this prototype */ }}
              />
              <Divider />
              <DestructiveRow
                label="Sign out"
                onClick={() => setSheet('sign-out')}
              />
              <Divider />
              <DestructiveRow
                label="Delete account"
                tone="danger"
                onClick={() => setSheet('delete-account')}
              />
            </Group>
          </>
        )}

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
      {sheet === 'sign-out' && (
        <SignOutSheet
          onConfirm={() => { signOut(); setSheet(null); }}
          onClose={() => setSheet(null)}
        />
      )}
      {sheet === 'delete-account' && (
        <DeleteAccountSheet
          onConfirm={() => { deleteAccount(); setSheet(null); }}
          onClose={() => setSheet(null)}
        />
      )}
    </div>
  );
}

function ProfileHero({ name, sub }: { name: string; sub: string }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '12px 6px 22px', position: 'relative',
    }}>
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(60% 60% at 50% 30%, rgba(120,140,255,0.10), transparent 70%)',
      }} />
      <Avatar
        name={name}
        size={88}
        shadow="0 8px 28px rgba(0,0,0,0.35)"
        style={{ position: 'relative' }}
      />
      <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.01em', marginTop: 14, position: 'relative' }}>
        {name}
      </div>
      <div style={{ fontSize: 13, color: W.weak, marginTop: 4, position: 'relative', maxWidth: 260, textAlign: 'center' }}>
        {sub}
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
          <div onClick={() => go('auth-sign-up')} style={{
            flex: 1, padding: '11px 0', textAlign: 'center',
            background: '#fff', color: '#000000',
            borderRadius: 999, fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}>Create account</div>
          <div onClick={() => go('auth-sign-in')} style={{
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

function PremiumRow({ active, period }: { active: boolean; period: 'monthly' | 'yearly' }) {
  return (
    <div onClick={() => go('subscription')} style={{
      padding: '14px 14px',
      display: 'flex', alignItems: 'center', gap: 12,
      cursor: 'pointer',
    }}>
      <div style={{
        position: 'relative',
        width: 32, height: 32, borderRadius: 10,
        background: 'linear-gradient(155deg, #20232C 0%, #0A0B10 100%)',
        border: '1px solid rgba(255,255,255,0.14)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
        boxShadow: '0 6px 16px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.10)',
      }}>
        <MoonIcon size={15} stroke="#FFFFFF" strokeWidth={1.8} />
        <div aria-hidden style={{
          position: 'absolute', top: -1, right: -1,
          width: 6, height: 6, borderRadius: 3,
          background: '#A8C0E8',
          boxShadow: '0 0 6px rgba(168,192,232,0.85)',
        }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 500, color: W.ink }}>Sleep+</div>
        <div style={{ fontSize: 12, color: W.weak, marginTop: 1 }}>
          {active
            ? `${period === 'yearly' ? 'Yearly' : 'Monthly'} plan · active`
            : 'Unlock the full toolkit'}
        </div>
      </div>
      <div style={{
        fontSize: 11, fontWeight: 600,
        padding: '4px 10px', borderRadius: 999,
        background: active ? 'rgba(255,255,255,0.10)' : 'rgba(168,192,232,0.10)',
        color: active ? '#FFFFFF' : '#A8C0E8',
        border: `1px solid ${active ? 'rgba(255,255,255,0.22)' : 'rgba(168,192,232,0.34)'}`,
      }}>
        {active ? 'Active' : 'Upgrade'}
      </div>
      <ChevronRightIcon size={14} stroke={W.veryweak} />
    </div>
  );
}

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
  // Tick scale from 4 to 12 hours. The current value is drawn as a
  // circular thumb sitting on a horizontal tick line, with a small
  // stem dropping down to the active tick — same vibe as Apple's
  // "How many hours of sleep do you aim for?" picker.
  const min = 4;
  const max = 12;
  const range = max - min;
  const [draft, setDraft] = useState(value);
  const pct = (draft - min) / range;
  const ticks = Array.from({ length: range + 1 }, (_, i) => min + i);

  return (
    <Sheet onClose={onClose}>
      <div style={{
        position: 'relative', overflow: 'hidden',
        margin: '0 -20px', padding: '0 20px 12px',
      }}>
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(60% 50% at 50% 0%, rgba(120,140,255,0.12), transparent 70%)',
        }} />
        <div style={{ position: 'relative', textAlign: 'center', paddingTop: 4 }}>
          <div style={{ fontSize: 13, color: W.weak, fontWeight: 500 }}>Sleep goal</div>
          <div style={{
            fontSize: 22, fontWeight: 600, letterSpacing: '-0.01em', marginTop: 6, lineHeight: 1.25,
          }}>
            How many hours of sleep<br />do you aim for each night?
          </div>
          <div style={{
            fontSize: 13, color: W.weak, marginTop: 8, lineHeight: 1.5,
            maxWidth: 300, marginLeft: 'auto', marginRight: 'auto',
          }}>
            Getting <strong style={{ color: W.ink, fontWeight: 600 }}>7 to 9 hours</strong> of sleep can improve your health, mood and overall well-being.
          </div>
        </div>

        <div style={{
          position: 'relative', marginTop: 32, height: 180,
        }}>
          {/* Big circle indicator with the current value */}
          <div style={{
            position: 'absolute', left: `${pct * 100}%`, top: 0,
            transform: 'translateX(-50%)',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            transition: 'left .2s cubic-bezier(.2,.7,.2,1)',
            pointerEvents: 'none',
          }}>
            <div style={{
              width: 76, height: 76, borderRadius: 38,
              background: W.bg, border: `2px solid ${W.ink}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 12px 28px rgba(0,0,0,0.45)',
              fontSize: 24, fontWeight: 600, color: W.ink,
              letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums', lineHeight: 1,
            }}>{draft}h</div>
            <div style={{
              width: 2, height: 24, background: W.ink, opacity: 0.9, marginTop: -1,
            }} />
          </div>

          {/* Tick row */}
          <div style={{
            position: 'absolute', left: 0, right: 0, top: 102,
            display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
            height: 28,
          }}>
            {ticks.map((h) => {
              const sel = h === draft;
              return (
                <div
                  key={h}
                  onClick={() => setDraft(h)}
                  style={{
                    flex: 1, height: '100%',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{
                    width: 2, height: sel ? 22 : 14,
                    borderRadius: 1,
                    background: sel ? W.ink : W.veryweak,
                    transition: 'height .15s ease, background .15s ease',
                  }} />
                </div>
              );
            })}
          </div>

          {/* Labels */}
          <div style={{
            position: 'absolute', left: 0, right: 0, top: 138,
            display: 'flex', justifyContent: 'space-between',
          }}>
            {ticks.map((h) => {
              const showLabel = h % 2 === 0;
              return (
                <div key={h} style={{
                  flex: 1, textAlign: 'center',
                  fontSize: 11, color: h === draft ? W.ink : W.weak,
                  fontWeight: h === draft ? 600 : 500,
                  fontVariantNumeric: 'tabular-nums',
                }}>{showLabel ? h : ''}</div>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
        <div onClick={() => onSelect(draft)} style={{
          padding: '16px 0', textAlign: 'center',
          background: W.ink, color: W.bg,
          borderRadius: 999, fontSize: 15, fontWeight: 600, cursor: 'pointer',
          boxShadow: '0 6px 18px rgba(0,0,0,0.22)',
        }}>Save sleep goal</div>
        <div onClick={onClose} style={{
          padding: '10px 0', textAlign: 'center',
          color: W.weak, fontSize: 13, fontWeight: 500, cursor: 'pointer',
        }}>Not now</div>
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

// ─── Destructive row + auth sheets ───────────────────────────────
function DestructiveRow({ label, onClick, tone }: {
  label: string;
  onClick: () => void;
  tone?: 'danger';
}) {
  const color = tone === 'danger' ? '#FF6B5A' : '#FF8E7C';
  return (
    <div onClick={onClick} style={{
      padding: '14px 14px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      cursor: 'pointer',
    }}>
      <div style={{ fontSize: 15, fontWeight: 500, color }}>{label}</div>
    </div>
  );
}

function SignOutSheet({ onConfirm, onClose }: { onConfirm: () => void; onClose: () => void }) {
  return (
    <Sheet onClose={onClose}>
      <div style={{ textAlign: 'center', padding: '6px 6px 0' }}>
        <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-0.01em' }}>Sign out of night?</div>
        <div style={{
          fontSize: 13, color: W.weak, marginTop: 6, lineHeight: 1.5,
          maxWidth: 300, marginLeft: 'auto', marginRight: 'auto',
        }}>
          Your data stays on this device. Sign back in any time to keep syncing across devices.
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 20 }}>
        <div onClick={onConfirm} style={{
          padding: '15px 0', textAlign: 'center',
          background: 'rgba(255,107,90,0.10)', color: '#FF6B5A',
          border: '1px solid rgba(255,107,90,0.32)',
          borderRadius: 14, fontSize: 15, fontWeight: 600, cursor: 'pointer',
        }}>Sign out</div>
        <div onClick={onClose} style={{
          padding: '12px 0', textAlign: 'center',
          color: W.weak, fontSize: 13, fontWeight: 500, cursor: 'pointer',
        }}>Cancel</div>
      </div>
    </Sheet>
  );
}

function DeleteAccountSheet({ onConfirm, onClose }: { onConfirm: () => void; onClose: () => void }) {
  const [confirmed, setConfirmed] = useState(false);
  return (
    <Sheet onClose={onClose}>
      <div style={{ textAlign: 'center', padding: '6px 6px 0' }}>
        <div style={{
          width: 52, height: 52, borderRadius: 26,
          background: 'rgba(255,107,90,0.12)', border: '1px solid rgba(255,107,90,0.30)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '4px auto 14px',
        }}>
          <TrashIcon size={20} stroke="#FF6B5A" />
        </div>
        <div style={{ fontSize: 19, fontWeight: 600, letterSpacing: '-0.01em' }}>Delete your account?</div>
        <div style={{
          fontSize: 13.5, color: W.weak, marginTop: 8, lineHeight: 1.55,
          maxWidth: 320, marginLeft: 'auto', marginRight: 'auto',
        }}>
          This is permanent. Your schedules, journal entries, breathing history and sound mixes will be erased from our servers within 24 hours.
        </div>
      </div>

      <div
        onClick={() => setConfirmed((v) => !v)}
        style={{
          marginTop: 18, padding: '13px 14px',
          background: W.paper, border: `1px solid ${confirmed ? 'rgba(255,107,90,0.40)' : W.fill}`,
          borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12,
          cursor: 'pointer',
        }}
      >
        <div style={{
          width: 22, height: 22, borderRadius: 6,
          border: `1.5px solid ${confirmed ? '#FF6B5A' : W.veryweak}`,
          background: confirmed ? '#FF6B5A' : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          {confirmed && <CheckIcon size={14} stroke="#fff" />}
        </div>
        <div style={{ fontSize: 13, color: W.ink, lineHeight: 1.4 }}>
          I understand my account and data will be permanently deleted.
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 18 }}>
        <div
          onClick={confirmed ? onConfirm : undefined}
          style={{
            padding: '15px 0', textAlign: 'center',
            background: confirmed ? '#FF6B5A' : 'rgba(255,107,90,0.18)',
            color: confirmed ? '#fff' : 'rgba(255,107,90,0.5)',
            borderRadius: 14, fontSize: 15, fontWeight: 600,
            cursor: confirmed ? 'pointer' : 'default',
            boxShadow: confirmed ? '0 8px 22px rgba(255,107,90,0.30)' : 'none',
            transition: 'background .15s ease, color .15s ease',
          }}
        >Delete account</div>
        <div onClick={onClose} style={{
          padding: '12px 0', textAlign: 'center',
          color: W.ink, fontSize: 13, fontWeight: 600, cursor: 'pointer',
        }}>Cancel</div>
      </div>
    </Sheet>
  );
}
