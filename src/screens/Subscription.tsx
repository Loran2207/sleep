import { useEffect, useState, type ReactNode } from 'react';
import { W } from '../tokens';
import { back } from '../state/navigation';
import { TopPad } from '../components/shared';
import { GlyphChevDn } from '../components/icons';
import { useSubscription, type BillingPeriod } from '../state/store';

const PRICE = {
  monthly: { amount: 9.99, perLabel: '/ month', sub: 'Billed monthly' },
  yearly:  { amount: 47.88, perLabel: '/ year',  sub: '$3.99 / month · billed yearly' },
} as const;

type Feature = { title: string; desc: string; icon: ReactNode };

const FEATURES: Feature[] = [
  { title: 'Deep sleep analytics',   desc: 'Cycle breakdown, debt, weekly trends',           icon: <IconChart /> },
  { title: 'Unlimited schedules',    desc: 'Build presets for any rhythm or shift',          icon: <IconCalendar /> },
  { title: 'Full sound library',     desc: 'Layered mixes, binaural, brown noise',           icon: <IconWaves /> },
  { title: 'Smart wake alarm',       desc: 'Wakes you in a light phase, gently',             icon: <IconSunrise /> },
  { title: 'Guided wind-down',       desc: 'Breath, body scan, sleep stories',               icon: <IconLeaf /> },
  { title: 'Dream journal +',        desc: 'Tags, mood map, voice notes, search',            icon: <IconBook /> },
  { title: 'Cloud sync',             desc: 'Across iPhone, iPad and the web',                icon: <IconCloud /> },
];

const ANNUAL_SAVINGS = Math.round((1 - PRICE.yearly.amount / (PRICE.monthly.amount * 12)) * 100);

export function Subscription() {
  const [sub, setSub] = useSubscription();
  const [period, setPeriod] = useState<BillingPeriod>(sub.period);

  // Slow twinkle loop so the dark hero feels alive.
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 1400);
    return () => window.clearInterval(id);
  }, []);

  const price = PRICE[period];

  function subscribe() {
    const renew = new Date();
    if (period === 'monthly') renew.setMonth(renew.getMonth() + 1);
    else renew.setFullYear(renew.getFullYear() + 1);
    setSub({ active: true, period, renewsOn: renew.toISOString().slice(0, 10) });
  }

  function cancel() {
    setSub({ active: false });
  }

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      background: '#0B0C12', color: '#fff', fontFamily: W.font,
      position: 'relative', overflow: 'hidden',
    }}>
      <style>{KEYFRAMES}</style>
      <StarField tick={tick} />
      <TopPad />

      <div style={{
        position: 'relative', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', padding: '4px 16px 4px',
      }}>
        <div onClick={() => back()} style={{
          width: 36, height: 36, borderRadius: 18,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: 'rgba(255,255,255,0.9)',
        }}>
          <GlyphChevDn size={18} stroke="currentColor" />
        </div>
        <div style={{ fontSize: 13, fontWeight: 500, opacity: 0.7 }}>Sleep+</div>
        <div style={{ width: 36 }} />
      </div>

      <div style={{
        position: 'relative', flex: 1, overflowY: 'auto',
        padding: '4px 20px 24px',
      }}>
        <Hero active={sub.active} />

        {sub.active ? (
          <ActivePlan
            period={sub.period}
            renewsOn={sub.renewsOn}
            onSwitch={(p) => setSub({ period: p })}
            onCancel={cancel}
          />
        ) : (
          <>
            <PeriodToggle value={period} onChange={setPeriod} />
            <PricePlate price={price} period={period} />
            <FeatureList />
            <FineLinks />
            <div style={{ height: 130 }} />
          </>
        )}
      </div>

      {!sub.active && (
        <StickyCta
          onSubscribe={subscribe}
          period={period}
        />
      )}
    </div>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────
function Hero({ active }: { active: boolean }) {
  return (
    <div style={{
      position: 'relative', overflow: 'hidden',
      borderRadius: 24, padding: '26px 22px 24px',
      background: `
        radial-gradient(120% 100% at 50% 0%, rgba(139,114,255,0.45) 0%, rgba(139,114,255,0) 60%),
        linear-gradient(180deg, #181B2A 0%, #10121C 100%)`,
      border: '1px solid rgba(255,255,255,0.08)',
      boxShadow: '0 18px 50px rgba(0,0,0,0.45)',
    }}>
      <BigMoon />
      <div style={{ position: 'relative' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 7,
          padding: '5px 11px 5px 8px', borderRadius: 999,
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.14)',
          fontSize: 12, fontWeight: 600,
          color: 'rgba(255,255,255,0.9)',
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: 3,
            background: active ? '#7FE3A1' : '#B7C8FF',
            boxShadow: `0 0 8px ${active ? '#7FE3A1' : '#B7C8FF'}`,
          }} />
          {active ? 'Active' : 'Premium'}
        </div>
        <div style={{
          fontSize: 34, fontWeight: 700, letterSpacing: '-0.02em',
          marginTop: 14, lineHeight: 1,
        }}>
          Sleep<span style={{ color: '#B7C8FF' }}>+</span>
        </div>
        <div style={{
          fontSize: 14, color: 'rgba(255,255,255,0.7)',
          marginTop: 8, lineHeight: 1.5, maxWidth: 280,
        }}>
          {active
            ? 'Thanks for keeping the lights low. Every feature is yours.'
            : 'Sleep better, wake brighter. Unlock the full toolkit.'}
        </div>
      </div>
    </div>
  );
}

function BigMoon() {
  return (
    <svg
      width={180} height={180} viewBox="0 0 24 24" fill="none"
      stroke="rgba(255,255,255,0.55)" strokeWidth={0.5}
      style={{ position: 'absolute', top: -38, right: -42, opacity: 0.22 }}
      aria-hidden
    >
      <path d="M21 13.5A8.5 8.5 0 1 1 10.5 3a7 7 0 0 0 10.5 10.5z" />
    </svg>
  );
}

// ─── Period toggle ────────────────────────────────────────────────
function PeriodToggle({ value, onChange }: {
  value: BillingPeriod;
  onChange: (p: BillingPeriod) => void;
}) {
  return (
    <div style={{
      marginTop: 22, position: 'relative',
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.10)',
      borderRadius: 999, padding: 4,
      display: 'flex',
    }}>
      <div style={{
        position: 'absolute',
        top: 4, bottom: 4,
        left: value === 'monthly' ? 4 : '50%',
        width: 'calc(50% - 4px)',
        borderRadius: 999,
        background: 'linear-gradient(135deg, rgba(183,200,255,0.95), rgba(143,165,255,0.95))',
        boxShadow: '0 6px 16px rgba(143,165,255,0.30)',
        transition: 'left .25s cubic-bezier(.2,.7,.2,1)',
      }} />
      <TogglePill label="Monthly" active={value === 'monthly'} onClick={() => onChange('monthly')} />
      <TogglePill label="Yearly"  active={value === 'yearly'}  onClick={() => onChange('yearly')}  badge={`Save ${ANNUAL_SAVINGS}%`} />
    </div>
  );
}

function TogglePill({ label, active, onClick, badge }: {
  label: string; active: boolean; onClick: () => void; badge?: string;
}) {
  return (
    <div onClick={onClick} style={{
      flex: 1, position: 'relative', zIndex: 1,
      padding: '10px 0', textAlign: 'center',
      fontSize: 13, fontWeight: 600,
      color: active ? '#0B0C12' : 'rgba(255,255,255,0.75)',
      cursor: 'pointer',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      transition: 'color .2s ease',
    }}>
      {label}
      {badge && (
        <span style={{
          padding: '2px 8px', borderRadius: 999,
          background: active ? 'rgba(11,12,18,0.18)' : 'rgba(127,227,161,0.18)',
          color: active ? '#0B0C12' : '#7FE3A1',
          fontSize: 10, fontWeight: 700,
          transition: 'background .2s ease, color .2s ease',
        }}>{badge}</span>
      )}
    </div>
  );
}

// ─── Price plate ──────────────────────────────────────────────────
function PricePlate({ price, period }: {
  price: typeof PRICE[BillingPeriod];
  period: BillingPeriod;
}) {
  const [whole, fraction] = price.amount.toFixed(2).split('.');
  return (
    <div key={period} style={{
      marginTop: 14, padding: '20px 20px',
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.10)',
      borderRadius: 18,
      display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
      animation: 'priceIn .35s cubic-bezier(.2,.7,.2,1)',
    }}>
      <div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', fontWeight: 500 }}>
          {period === 'yearly' ? 'Best value' : 'Flexible'}
        </div>
        <div style={{
          marginTop: 4, display: 'flex', alignItems: 'baseline', gap: 2,
          fontVariantNumeric: 'tabular-nums',
        }}>
          <span style={{ fontSize: 20, fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>$</span>
          <span style={{ fontSize: 44, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1 }}>{whole}</span>
          <span style={{ fontSize: 20, fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>.{fraction}</span>
        </div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 4 }}>
          {price.sub}
        </div>
      </div>
      <div style={{
        fontSize: 12, color: 'rgba(255,255,255,0.65)',
        padding: '6px 12px', borderRadius: 999,
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.10)',
      }}>{price.perLabel}</div>
    </div>
  );
}

// ─── Feature list ─────────────────────────────────────────────────
function FeatureList() {
  return (
    <div style={{ marginTop: 24 }}>
      <SectionLabel>What's included</SectionLabel>
      <div style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.10)',
        borderRadius: 16, overflow: 'hidden',
      }}>
        {FEATURES.map((f, i) => (
          <div key={f.title} style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: '14px 14px',
            borderTop: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.06)',
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, rgba(183,200,255,0.16) 0%, rgba(126,107,255,0.12) 100%)',
              border: '1px solid rgba(183,200,255,0.22)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, color: '#B7C8FF',
            }}>
              {f.icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{f.title}</div>
              <div style={{
                fontSize: 12, color: 'rgba(255,255,255,0.55)',
                marginTop: 2, lineHeight: 1.45,
              }}>{f.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Sticky CTA at bottom ─────────────────────────────────────────
function StickyCta({ onSubscribe, period }: {
  onSubscribe: () => void;
  period: BillingPeriod;
}) {
  const price = PRICE[period];
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      padding: '14px 20px 22px',
      background: 'linear-gradient(180deg, rgba(11,12,18,0) 0%, rgba(11,12,18,0.86) 30%, #0B0C12 100%)',
      pointerEvents: 'none',
    }}>
      <div style={{
        pointerEvents: 'auto',
        background: 'rgba(20,22,32,0.85)',
        border: '1px solid rgba(255,255,255,0.10)',
        borderRadius: 22, padding: '12px 14px 14px',
        backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.45)',
      }}>
        <div style={{
          display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
          padding: '0 4px 8px',
          fontSize: 12, color: 'rgba(255,255,255,0.6)',
        }}>
          <span>7-day free trial</span>
          <span style={{ fontVariantNumeric: 'tabular-nums' }}>
            then ${price.amount} {price.perLabel}
          </span>
        </div>
        <div onClick={onSubscribe} style={{
          padding: '15px 0', textAlign: 'center',
          borderRadius: 999,
          background: 'linear-gradient(135deg, #B7C8FF 0%, #8FA5FF 50%, #7E6BFF 100%)',
          color: '#0B0C12', fontSize: 15, fontWeight: 700,
          letterSpacing: '-0.01em', cursor: 'pointer',
          boxShadow: '0 14px 32px rgba(126,107,255,0.35), 0 0 0 1px rgba(255,255,255,0.10) inset',
          position: 'relative', overflow: 'hidden',
        }}>
          Start free trial
          <Shimmer />
        </div>
        <div style={{
          marginTop: 8, textAlign: 'center',
          fontSize: 11, color: 'rgba(255,255,255,0.4)',
        }}>Cancel anytime</div>
      </div>
    </div>
  );
}

function Shimmer() {
  return (
    <div style={{
      position: 'absolute', top: 0, bottom: 0, left: 0,
      width: '40%',
      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.45), transparent)',
      animation: 'shimmer 2.4s ease-in-out infinite',
      pointerEvents: 'none',
    }} />
  );
}

// ─── Active manage view ───────────────────────────────────────────
function ActivePlan({ period, renewsOn, onSwitch, onCancel }: {
  period: BillingPeriod;
  renewsOn: string;
  onSwitch: (p: BillingPeriod) => void;
  onCancel: () => void;
}) {
  const price = PRICE[period];
  return (
    <>
      <div style={{
        marginTop: 18, padding: '18px 18px',
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.10)',
        borderRadius: 18,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', fontWeight: 500 }}>Current plan</div>
            <div style={{ fontSize: 18, fontWeight: 700, marginTop: 4, letterSpacing: '-0.01em' }}>
              {period === 'monthly' ? 'Monthly' : 'Yearly'}
            </div>
          </div>
          <div style={{
            fontSize: 13, fontWeight: 600,
            fontVariantNumeric: 'tabular-nums', color: 'rgba(255,255,255,0.85)',
          }}>
            ${price.amount}{price.perLabel.replace('/ ', '/')}
          </div>
        </div>
        <div style={{
          marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.08)',
          fontSize: 12, color: 'rgba(255,255,255,0.55)',
        }}>
          Renews on <span style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>{prettyDate(renewsOn)}</span>
        </div>
      </div>

      <SectionLabel style={{ marginTop: 22 }}>Switch plan</SectionLabel>
      <PeriodToggle value={period} onChange={onSwitch} />

      <FeatureList />

      <div onClick={onCancel} style={{
        marginTop: 22, padding: '14px 0', textAlign: 'center',
        border: '1px solid rgba(255,255,255,0.14)',
        borderRadius: 999, color: 'rgba(255,255,255,0.85)',
        fontSize: 14, fontWeight: 600, cursor: 'pointer',
      }}>Cancel subscription</div>

      <FineLinks />
    </>
  );
}

function SectionLabel({ children, style }: { children: ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      padding: '0 4px 10px',
      fontSize: 12, fontWeight: 600,
      color: 'rgba(255,255,255,0.6)',
      ...style,
    }}>{children}</div>
  );
}

function FineLinks() {
  return (
    <div style={{
      marginTop: 18, display: 'flex', justifyContent: 'center', gap: 18,
      fontSize: 12, color: 'rgba(255,255,255,0.45)',
    }}>
      <span style={{ cursor: 'pointer' }}>Restore</span>
      <span style={{ opacity: 0.4 }}>·</span>
      <span style={{ cursor: 'pointer' }}>Terms</span>
      <span style={{ opacity: 0.4 }}>·</span>
      <span style={{ cursor: 'pointer' }}>Privacy</span>
    </div>
  );
}

// ─── Star field ───────────────────────────────────────────────────
function StarField({ tick }: { tick: number }) {
  const stars = [
    { x: 8,  y: 12, s: 1.5, d: 0 },
    { x: 22, y: 6,  s: 1,   d: 0.3 },
    { x: 38, y: 18, s: 1.2, d: 0.7 },
    { x: 58, y: 8,  s: 1,   d: 0.1 },
    { x: 74, y: 14, s: 1.4, d: 0.5 },
    { x: 86, y: 5,  s: 1,   d: 0.9 },
    { x: 92, y: 22, s: 1.2, d: 0.4 },
    { x: 14, y: 28, s: 1,   d: 0.6 },
    { x: 50, y: 30, s: 0.9, d: 0.8 },
  ];
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.6 }} aria-hidden>
      {stars.map((st, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: `${st.x}%`, top: `${st.y}%`,
          width: st.s * 2, height: st.s * 2, borderRadius: '50%',
          background: '#fff',
          boxShadow: `0 0 ${st.s * 6}px rgba(255,255,255,0.6)`,
          animation: `twinkle 2.6s ease-in-out infinite`,
          animationDelay: `${st.d + (tick % 3) * 0.05}s`,
        }} />
      ))}
    </div>
  );
}

// ─── Themed feature glyphs ────────────────────────────────────────
function FeatureIcon({ children }: { children: ReactNode }) {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={1.7}
      strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}

function IconChart()    { return <FeatureIcon><path d="M5 19V13"/><path d="M10 19V8"/><path d="M15 19v-5"/><path d="M20 19V5"/></FeatureIcon>; }
function IconCalendar() { return <FeatureIcon><rect x="4" y="5" width="16" height="15" rx="2.5"/><path d="M4 10h16"/><path d="M9 3v4M15 3v4"/><circle cx="12" cy="15" r="1.2" fill="currentColor" stroke="none"/></FeatureIcon>; }
function IconWaves()    { return <FeatureIcon><path d="M3 12c2-3 4-3 6 0s4 3 6 0 4-3 6 0"/><path d="M3 17c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/><path d="M3 7c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/></FeatureIcon>; }
function IconSunrise()  { return <FeatureIcon><path d="M3 18h18"/><path d="M6.5 14a5.5 5.5 0 0 1 11 0"/><path d="M12 4v2"/><path d="M4.5 8l1.4 1.4"/><path d="M19.5 8l-1.4 1.4"/></FeatureIcon>; }
function IconLeaf()     { return <FeatureIcon><path d="M5 19C5 11 11 5 19 5c0 8-6 14-14 14z"/><path d="M5 19c4-4 7-7 12-12"/></FeatureIcon>; }
function IconBook()     { return <FeatureIcon><path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z"/><path d="M5 17a3 3 0 0 1 3-3h11"/><path d="M9 8h6"/></FeatureIcon>; }
function IconCloud()    { return <FeatureIcon><path d="M7 18a4 4 0 0 1-.5-7.9 6 6 0 0 1 11.5 1.4A3.5 3.5 0 0 1 18 18z"/><path d="M12 13v4"/><path d="M10 15l2 2 2-2"/></FeatureIcon>; }

function prettyDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

const KEYFRAMES = `
  @keyframes priceIn {
    0% { opacity: 0; transform: translateY(6px); }
    100% { opacity: 1; transform: none; }
  }
  @keyframes shimmer {
    0% { transform: translateX(-150%); }
    100% { transform: translateX(250%); }
  }
  @keyframes twinkle {
    0%, 100% { opacity: 0.25; }
    50% { opacity: 0.85; }
  }
`;
