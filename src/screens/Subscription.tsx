import { useEffect, useState } from 'react';
import { W } from '../tokens';
import { back } from '../state/navigation';
import { TopPad } from '../components/shared';
import { GlyphChevDn, CheckIcon, MoonIcon } from '../components/icons';
import { useSubscription, type BillingPeriod } from '../state/store';

const PRICE = {
  monthly: { amount: 9.99, perLabel: '/ month', sub: 'Billed monthly' },
  yearly:  { amount: 47.88, perLabel: '/ year',  sub: '$3.99 / month · billed yearly' },
} as const;

const FEATURES: { title: string; desc: string }[] = [
  { title: 'Deep sleep analytics',   desc: 'Cycle breakdown, debt, weekly trends' },
  { title: 'Unlimited schedules',    desc: 'Build presets for any rhythm or shift' },
  { title: 'Full sound library',     desc: 'Layered mixes, binaural, brown noise' },
  { title: 'Smart wake alarm',       desc: 'Wakes you in a light phase, gently' },
  { title: 'Guided wind-down',       desc: 'Breath, body scan, sleep stories' },
  { title: 'Dream journal +',        desc: 'Tags, mood map, voice notes, search' },
  { title: 'Cloud sync',             desc: 'Across iPhone, iPad and the web' },
];

const ANNUAL_SAVINGS = Math.round((1 - PRICE.yearly.amount / (PRICE.monthly.amount * 12)) * 100);

export function Subscription() {
  const [sub, setSub] = useSubscription();
  const [period, setPeriod] = useState<BillingPeriod>(sub.period);

  // Star twinkle — pulse opacity on a slow loop.
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 1400);
    return () => window.clearInterval(id);
  }, []);

  const price = PRICE[period];

  function subscribe() {
    const now = new Date();
    const renew = new Date(now);
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

      <div style={{ position: 'relative', flex: 1, overflowY: 'auto', padding: '4px 20px 28px' }}>
        <Hero active={sub.active} />

        {sub.active ? (
          <ActivePlanCard
            period={sub.period}
            renewsOn={sub.renewsOn}
            onSwitch={(p) => setSub({ period: p })}
            onCancel={cancel}
          />
        ) : (
          <>
            <PeriodToggle value={period} onChange={setPeriod} />

            <PricePlate
              amount={price.amount}
              perLabel={price.perLabel}
              sub={price.sub}
              period={period}
            />

            <FeatureList />

            <div onClick={subscribe} style={{
              marginTop: 22, padding: '16px 0', textAlign: 'center',
              borderRadius: 999,
              background: 'linear-gradient(135deg, #B7C8FF 0%, #8FA5FF 50%, #7E6BFF 100%)',
              color: '#0B0C12', fontSize: 15, fontWeight: 700,
              letterSpacing: '-0.01em', cursor: 'pointer',
              boxShadow: '0 16px 38px rgba(126,107,255,0.35), 0 0 0 1px rgba(255,255,255,0.08) inset',
              position: 'relative', overflow: 'hidden',
            }}>
              Start 7‑day free trial
              <Shimmer />
            </div>

            <div style={{
              marginTop: 12, textAlign: 'center',
              fontSize: 11, color: 'rgba(255,255,255,0.45)', lineHeight: 1.55,
            }}>
              Cancel anytime. After the trial, {period === 'monthly' ? '$9.99 / month' : '$47.88 / year'}.
            </div>

            <FineLinks />
          </>
        )}
      </div>
    </div>
  );
}

function Hero({ active }: { active: boolean }) {
  return (
    <div style={{
      position: 'relative', overflow: 'hidden',
      borderRadius: 24, padding: '28px 22px 24px',
      background: `
        radial-gradient(120% 100% at 50% 0%, rgba(139,114,255,0.45) 0%, rgba(139,114,255,0) 60%),
        linear-gradient(180deg, #181B2A 0%, #10121C 100%)`,
      border: '1px solid rgba(255,255,255,0.08)',
      boxShadow: '0 18px 50px rgba(0,0,0,0.45)',
    }}>
      <div style={{ position: 'absolute', top: -40, right: -40, opacity: 0.25 }}>
        <MoonIcon size={180} stroke="rgba(255,255,255,0.6)" strokeWidth={0.6} />
      </div>
      <div style={{ position: 'relative' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '5px 10px', borderRadius: 999,
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.14)',
          fontSize: 11, fontWeight: 600, letterSpacing: 0.4,
          color: 'rgba(255,255,255,0.85)',
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: 3,
            background: active ? '#7FE3A1' : '#B7C8FF',
            boxShadow: `0 0 8px ${active ? '#7FE3A1' : '#B7C8FF'}`,
          }} />
          {active ? 'ACTIVE' : 'PREMIUM'}
        </div>
        <div style={{
          fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em',
          marginTop: 14, lineHeight: 1.1,
        }}>
          Sleep<span style={{ color: '#B7C8FF' }}>+</span>
        </div>
        <div style={{
          fontSize: 14, color: 'rgba(255,255,255,0.7)',
          marginTop: 6, lineHeight: 1.5, maxWidth: 280,
        }}>
          {active
            ? 'Thanks for keeping the lights low. Every feature is yours.'
            : 'Sleep better, wake brighter. Unlock the full toolkit.'}
        </div>
      </div>
    </div>
  );
}

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
      <TogglePill label="Yearly" active={value === 'yearly'}  onClick={() => onChange('yearly')}  badge={`-${ANNUAL_SAVINGS}%`} />
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
          padding: '2px 7px', borderRadius: 999,
          background: active ? 'rgba(11,12,18,0.18)' : 'rgba(127,227,161,0.18)',
          color: active ? '#0B0C12' : '#7FE3A1',
          fontSize: 10, fontWeight: 700, letterSpacing: 0.3,
          transition: 'background .2s ease, color .2s ease',
        }}>{badge}</span>
      )}
    </div>
  );
}

function PricePlate({ amount, perLabel, sub, period }: {
  amount: number; perLabel: string; sub: string; period: BillingPeriod;
}) {
  const [whole, fraction] = amount.toFixed(2).split('.');
  return (
    <div key={period} style={{
      marginTop: 14, padding: '20px 20px',
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.10)',
      borderRadius: 18,
      display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
      animation: 'priceIn .35s cubic-bezier(.2,.7,.2,1)',
    }}>
      <style>{`
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
      `}</style>
      <div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', fontWeight: 500 }}>
          {period === 'yearly' ? 'Best value' : 'Flexible'}
        </div>
        <div style={{
          marginTop: 4, display: 'flex', alignItems: 'baseline', gap: 2,
          fontVariantNumeric: 'tabular-nums',
        }}>
          <span style={{ fontSize: 20, fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>$</span>
          <span style={{ fontSize: 42, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1 }}>{whole}</span>
          <span style={{ fontSize: 20, fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>.{fraction}</span>
        </div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 4 }}>
          {sub}
        </div>
      </div>
      <div style={{
        fontSize: 13, color: 'rgba(255,255,255,0.6)',
        padding: '6px 12px', borderRadius: 999,
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.10)',
      }}>{perLabel}</div>
    </div>
  );
}

function FeatureList() {
  return (
    <div style={{ marginTop: 22 }}>
      <div style={{
        fontSize: 11, fontWeight: 600, letterSpacing: 0.5,
        color: 'rgba(255,255,255,0.55)', padding: '0 4px 10px',
      }}>EVERYTHING INSIDE</div>
      <div style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.10)',
        borderRadius: 16, overflow: 'hidden',
      }}>
        {FEATURES.map((f, i) => (
          <div key={f.title} style={{
            display: 'flex', alignItems: 'flex-start', gap: 12,
            padding: '12px 14px',
            borderTop: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.06)',
          }}>
            <div style={{
              width: 26, height: 26, borderRadius: 13,
              background: 'rgba(127,227,161,0.14)',
              border: '1px solid rgba(127,227,161,0.35)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, marginTop: 1,
            }}>
              <CheckIcon size={14} stroke="#7FE3A1" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{f.title}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 2, lineHeight: 1.45 }}>
                {f.desc}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActivePlanCard({ period, renewsOn, onSwitch, onCancel }: {
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

      <SectionLabel>Switch plan</SectionLabel>
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

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      padding: '20px 4px 10px',
      fontSize: 11, fontWeight: 600, letterSpacing: 0.5,
      color: 'rgba(255,255,255,0.55)',
    }}>{children}</div>
  );
}

function FineLinks() {
  return (
    <div style={{
      marginTop: 18, display: 'flex', justifyContent: 'center', gap: 18,
      fontSize: 11, color: 'rgba(255,255,255,0.45)',
    }}>
      <span style={{ cursor: 'pointer' }}>Restore</span>
      <span style={{ opacity: 0.4 }}>·</span>
      <span style={{ cursor: 'pointer' }}>Terms</span>
      <span style={{ opacity: 0.4 }}>·</span>
      <span style={{ cursor: 'pointer' }}>Privacy</span>
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

function StarField({ tick }: { tick: number }) {
  // A handful of stars, twinkling on a stagger so the dark background feels alive.
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

function prettyDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}
