import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { W } from '../tokens';
import { go, back, replace } from '../state/navigation';
import { useAuth, completeOnboarding, useOnboardingDone } from '../state/store';
import { CheckIcon } from '../components/icons';
import { HeaderAmbient, BackButton } from '../components/shared';

// Passwordless auth. Step 1 picks a provider (Apple, Google, or email).
// With email we collect the address, send a 6-digit code, and verify it —
// there are no passwords anywhere in the app. Sign-up adds one final
// "what should we call you?" step after the code. The backdrop is the
// same warm glow used on Home / Course / Profile, so auth feels like
// part of the same world.

const PERIWINKLE = '#8AA1FF';
const CORAL = '#FF8E7C';
const MINT = '#5DDDB3';

// ─── Public screens ─────────────────────────────────────────────
export function AuthSignIn() {
  return <AuthShell><SignInFlow /></AuthShell>;
}
export function AuthSignUp() {
  return <AuthShell><SignUpFlow /></AuthShell>;
}

// ─── Shell ──────────────────────────────────────────────────────
function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      background: '#000', color: W.ink, fontFamily: W.font,
      position: 'relative', overflow: 'hidden',
    }}>
      <AuthKeyframes />
      <HeaderAmbient height={920} />
      <div style={{
        position: 'relative', zIndex: 2, flex: 1,
        display: 'flex', flexDirection: 'column',
      }}>
        {children}
      </div>
    </div>
  );
}

// ─── Sign-in ────────────────────────────────────────────────────
type SignInStep = 'method' | 'email' | 'code';

function SignInFlow() {
  const { signIn, signInWithApple } = useAuth();
  const onboardingDone = useOnboardingDone();
  const [step, setStep] = useState<SignInStep>('method');
  const [email, setEmail] = useState('');
  const [touched, setTouched] = useState(false);

  function finish() {
    if (!onboardingDone) {
      completeOnboarding();
      replace('home');
    } else {
      back();
    }
  }

  function leaveStep() {
    if (step === 'code') return setStep('email');
    if (step === 'email') return setStep('method');
    back();
  }

  return (
    <StepFrame
      stepKey={step}
      onBack={leaveStep}
      skipLabel={onboardingDone ? undefined : 'Continue as guest'}
      onSkip={onboardingDone ? undefined : () => { completeOnboarding(); replace('home'); }}
    >
      {step === 'method' && (
        <MethodStep
          eyebrow="Welcome back"
          title="Sign in to night"
          sub="Sync schedules, journal entries and your sound mixes across devices."
          onApple={() => { signInWithApple(); finish(); }}
          onGoogle={() => { signInWithApple(); finish(); }}
          onEmail={() => setStep('email')}
          foot={<FootLine label="Don't have an account?" linkText="Sign up" onLink={() => go('auth-sign-up')} />}
        />
      )}

      {step === 'email' && (
        <EmailStep
          eyebrow="Sign in"
          title="What's your email?"
          sub="We'll send a one-time code to confirm it's you — no password needed."
          email={email}
          setEmail={setEmail}
          touched={touched}
          setTouched={setTouched}
          onContinue={() => setStep('code')}
          continueLabel="Send code"
          foot={<FootLine label="Don't have an account?" linkText="Sign up" onLink={() => go('auth-sign-up')} />}
        />
      )}

      {step === 'code' && (
        <CodeStep
          email={email}
          onChangeEmail={() => setStep('email')}
          onVerified={() => { signIn(email.trim()); finish(); }}
        />
      )}
    </StepFrame>
  );
}

// ─── Sign-up ────────────────────────────────────────────────────
type SignUpStep = 'method' | 'email' | 'code' | 'name';

function SignUpFlow() {
  const { signUp, signInWithApple } = useAuth();
  const onboardingDone = useOnboardingDone();
  const [step, setStep] = useState<SignUpStep>('method');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [touched, setTouched] = useState(false);

  function done() {
    if (!onboardingDone) {
      completeOnboarding();
      replace('home');
    } else {
      back();
    }
  }

  function leaveStep() {
    if (step === 'name') return setStep('code');
    if (step === 'code') return setStep('email');
    if (step === 'email') return setStep('method');
    back();
  }

  return (
    <StepFrame
      stepKey={step}
      onBack={leaveStep}
      skipLabel={onboardingDone ? undefined : 'Continue as guest'}
      onSkip={onboardingDone ? undefined : () => { completeOnboarding(); replace('home'); }}
    >
      {step === 'method' && (
        <MethodStep
          eyebrow="Create your account"
          title="A home for your nights"
          sub="Free to start. We'll back up your sleep data and sync it across devices."
          onApple={() => { signInWithApple(); done(); }}
          onGoogle={() => { signInWithApple(); done(); }}
          onEmail={() => setStep('email')}
          foot={
            <>
              <FootLine label="Already have an account?" linkText="Sign in" onLink={() => go('auth-sign-in')} />
              <TermsLine />
            </>
          }
        />
      )}

      {step === 'email' && (
        <EmailStep
          eyebrow="Sign up"
          title="What's your email?"
          sub="We'll send a 6-digit code to confirm it. No password to remember."
          email={email}
          setEmail={setEmail}
          touched={touched}
          setTouched={setTouched}
          onContinue={() => setStep('code')}
          continueLabel="Send code"
          foot={<FootLine label="Already have an account?" linkText="Sign in" onLink={() => go('auth-sign-in')} />}
        />
      )}

      {step === 'code' && (
        <CodeStep
          email={email}
          onChangeEmail={() => setStep('email')}
          onVerified={() => setStep('name')}
        />
      )}

      {step === 'name' && (
        <NameStep
          name={name}
          setName={setName}
          touched={touched}
          setTouched={setTouched}
          onSubmit={() => {
            if (!name.trim()) { setTouched(true); return; }
            signUp(name, email.trim());
            done();
          }}
        />
      )}
    </StepFrame>
  );
}

function NameStep({ name, setName, touched, setTouched, onSubmit }: {
  name: string;
  setName: (v: string) => void;
  touched: boolean;
  setTouched: (v: boolean) => void;
  onSubmit: () => void;
}) {
  const nameErr = touched && !name.trim() ? 'Add a name' : null;
  return (
    <StepBody
      eyebrow="Almost there"
      title="What should we call you?"
      sub="This is the name we'll greet you with each night."
      primaryLabel="Create account"
      primaryDisabled={false}
      onPrimary={onSubmit}
    >
      <FloatingInput
        label="Name"
        type="text"
        value={name}
        onChange={(v) => { setName(v); if (touched) setTouched(false); }}
        autoComplete="name"
        autoFocus
        error={nameErr}
        onEnter={onSubmit}
      />
    </StepBody>
  );
}

// ─── Code step (passwordless verify) ────────────────────────────
// Replaces the old password screen. Six segmented boxes backed by one
// hidden numeric input. Any 6 digits verify in this prototype; a real
// build would check the code against the one we emailed.
function CodeStep({ email, onChangeEmail, onVerified }: {
  email: string;
  onChangeEmail: () => void;
  onVerified: () => void;
}) {
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<'idle' | 'error' | 'success'>('idle');
  const [seconds, setSeconds] = useState(45);
  const [resent, setResent] = useState(false);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  function resend() {
    if (seconds > 0) return;
    setSeconds(45);
    setCode('');
    setStatus('idle');
    setResent(true);
    setTimeout(() => setResent(false), 2200);
  }

  function onInput(v: string) {
    setCode(v);
    if (status === 'error') setStatus('idle');
  }

  // Prototype rule: 000000 is treated as a wrong code so the error state
  // is reachable; any other 6 digits verify. A real build would check the
  // entry against the code we emailed.
  function submit(val?: string) {
    const c = val ?? code;
    if (c.length < 6) return;
    if (c === '000000') { setStatus('error'); return; }
    setStatus('success');
    // __sleepHoldCode lets the capture harness freeze the success state.
    if (!(typeof window !== 'undefined' && (window as { __sleepHoldCode?: boolean }).__sleepHoldCode)) {
      setTimeout(onVerified, 850);
    }
  }

  const primaryLabel = status === 'success' ? 'Verified' : status === 'error' ? 'Try again' : 'Verify';

  return (
    <StepBody
      eyebrow="Check your inbox"
      title="Enter the code"
      sub={<>We sent a 6-digit code to{' '}
        <span style={{ color: '#fff', fontWeight: 600 }}>{email || 'your email'}</span>.</>}
      primaryLabel={primaryLabel}
      primaryDisabled={code.length < 6 || status === 'success'}
      onPrimary={() => submit()}
      topGlyph={<MailGlyph status={status} />}
      foot={
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div
            onClick={resend}
            style={{
              fontSize: 13.5, fontWeight: 500,
              color: seconds > 0 ? 'rgba(255,255,255,0.35)' : PERIWINKLE,
              cursor: seconds > 0 ? 'default' : 'pointer', padding: '4px 0',
            }}
          >{seconds > 0 ? `Resend code in ${seconds}s` : 'Resend code'}</div>
          {resent && (
            <div style={{ fontSize: 13, color: PERIWINKLE }}>New code sent — check your inbox.</div>
          )}
        </div>
      }
    >
      <CodeInput value={code} onChange={onInput} onComplete={(v) => submit(v)} status={status} />
      {status === 'error' ? (
        <div style={{ marginTop: 14, fontSize: 13, color: CORAL, fontWeight: 500 }}>
          That code isn't right. Check your inbox and try again.
        </div>
      ) : status === 'success' ? (
        <div style={{
          marginTop: 14, fontSize: 13, color: MINT, fontWeight: 600,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <CheckIcon size={14} stroke={MINT} strokeWidth={3} /> Code verified
        </div>
      ) : (
        <div onClick={onChangeEmail} style={{
          marginTop: 16, fontSize: 13, color: 'rgba(255,255,255,0.5)', cursor: 'pointer',
        }}>
          Wrong email? <span style={{ color: '#fff', fontWeight: 600 }}>Change it</span>
        </div>
      )}
    </StepBody>
  );
}

function CodeInput({ value, onChange, onComplete, status = 'idle' }: {
  value: string;
  onChange: (v: string) => void;
  onComplete?: (v: string) => void;
  status?: 'idle' | 'error' | 'success';
}) {
  const ref = useRef<HTMLInputElement>(null);
  const boxes = Array.from({ length: 6 }, (_, i) => value[i] ?? '');
  const focusIdx = Math.min(value.length, 5);
  const accent = status === 'error' ? CORAL : status === 'success' ? MINT : PERIWINKLE;

  return (
    <div onClick={() => ref.current?.focus()} style={{ position: 'relative', cursor: 'text' }}>
      <input
        ref={ref}
        value={value}
        inputMode="numeric"
        autoComplete="one-time-code"
        autoFocus
        maxLength={6}
        onChange={(e) => {
          const v = e.target.value.replace(/\D/g, '').slice(0, 6);
          onChange(v);
          if (v.length === 6) onComplete?.(v);
        }}
        style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          opacity: 0, border: 'none', background: 'transparent',
          color: 'transparent', caretColor: 'transparent', cursor: 'text',
        }}
      />
      <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between' }}>
        {boxes.map((d, i) => {
          const active = i === focusIdx && status === 'idle';
          const filled = !!d;
          const border = status === 'error' ? hexA(CORAL, 0.6)
            : status === 'success' ? hexA(MINT, 0.6)
            : filled ? hexA(PERIWINKLE, 0.5)
            : active ? PERIWINKLE
            : 'rgba(255,255,255,0.14)';
          return (
            <div key={i} style={{
              flex: 1, height: 62, borderRadius: 14,
              background: status === 'success' ? hexA(MINT, 0.08)
                : status === 'error' ? hexA(CORAL, 0.08)
                : 'rgba(255,255,255,0.03)',
              border: `1px solid ${border}`,
              boxShadow: active ? `0 0 0 4px ${hexA(accent, 0.1)}` : 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 26, fontWeight: 600, color: '#fff',
              fontVariantNumeric: 'tabular-nums',
            }}>{d}</div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Layout primitives ──────────────────────────────────────────
function StepFrame({
  children, stepKey, onBack, onSkip, skipLabel, showBack = true,
}: {
  children: ReactNode;
  stepKey: string;
  onBack: () => void;
  onSkip?: () => void;
  skipLabel?: string;
  showBack?: boolean;
}) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{
        position: 'relative', zIndex: 3,
        padding: 'calc(10px + env(safe-area-inset-top)) 16px 0',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        {showBack ? (
          <BackButton onClick={onBack} />
        ) : <div style={{ width: 36 }} />}
        {onSkip && skipLabel ? (
          <div onClick={onSkip} style={{
            padding: '8px 14px', borderRadius: 999,
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.14)',
            fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.78)', cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}>{skipLabel}</div>
        ) : (
          <div style={{ width: 56 }} />
        )}
      </div>

      <div
        key={stepKey}
        style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          animation: 'au-rise .42s cubic-bezier(.2,.7,.2,1) both',
        }}
      >
        {children}
      </div>
    </div>
  );
}

function StepBody({
  eyebrow, title, sub, children, primaryLabel, primaryDisabled, onPrimary, foot, topGlyph,
}: {
  eyebrow: string;
  title: ReactNode;
  sub: ReactNode;
  children: ReactNode;
  primaryLabel: string;
  primaryDisabled: boolean;
  onPrimary: () => void;
  foot?: ReactNode;
  topGlyph?: ReactNode;
}) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <div style={{
        flex: 1, padding: '20px 24px 0',
        overflowY: 'auto',
        display: 'flex', flexDirection: 'column',
      }}>
        {topGlyph && (
          <div style={{ marginTop: 4, marginBottom: 18, display: 'flex', justifyContent: 'flex-start' }}>
            {topGlyph}
          </div>
        )}
        <Eyebrow>{eyebrow}</Eyebrow>
        <Title>{title}</Title>
        <Sub>{sub}</Sub>

        <div style={{ marginTop: 26 }}>{children}</div>
      </div>

      <FooterBar>
        <PrimaryButton label={primaryLabel} onClick={onPrimary} disabled={primaryDisabled} />
        {foot && <div style={{ marginTop: 16 }}>{foot}</div>}
      </FooterBar>
    </div>
  );
}

function FooterBar({ children }: { children: ReactNode }) {
  return (
    <div style={{
      flexShrink: 0, position: 'relative', zIndex: 3,
      padding: '14px 22px calc(22px + env(safe-area-inset-bottom))',
      background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.85) 32%, #000 100%)',
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
      color: disabled ? 'rgba(255,255,255,0.4)' : '#000',
      cursor: disabled ? 'default' : 'pointer',
      boxShadow: disabled ? 'none' : '0 10px 28px rgba(0,0,0,0.5)',
      transition: 'background .15s ease, color .15s ease',
    }}>{label}</div>
  );
}

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <div style={{
      fontSize: 12, fontWeight: 600, letterSpacing: 0.4,
      color: PERIWINKLE,
    }}>{children}</div>
  );
}

function Title({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <h1 style={{
      margin: '6px 0 0', fontSize: 30, fontWeight: 600, letterSpacing: '-0.02em',
      lineHeight: 1.12, color: '#fff', ...style,
    }}>{children}</h1>
  );
}

function Sub({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div style={{
      marginTop: 10, fontSize: 15, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5,
      maxWidth: 340, ...style,
    }}>{children}</div>
  );
}

// ─── Method picker ──────────────────────────────────────────────
function MethodStep({
  eyebrow, title, sub, onApple, onGoogle, onEmail, foot,
}: {
  eyebrow: string;
  title: string;
  sub: string;
  onApple: () => void;
  onGoogle: () => void;
  onEmail: () => void;
  foot: ReactNode;
}) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <div style={{
        flex: 1, padding: '20px 24px 0',
        overflowY: 'auto',
        display: 'flex', flexDirection: 'column',
      }}>
        <Eyebrow>{eyebrow}</Eyebrow>
        <Title>{title}</Title>
        <Sub>{sub}</Sub>

        <div style={{ marginTop: 30, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <ProviderButton variant="apple" label="Continue with Apple" onClick={onApple} />
          <ProviderButton variant="google" label="Continue with Google" onClick={onGoogle} />
          <DividerLine label="or" />
          <ProviderButton variant="email" label="Continue with email" onClick={onEmail} />
        </div>
      </div>

      <FooterBar>{foot}</FooterBar>
    </div>
  );
}

function ProviderButton({ variant, label, onClick }: {
  variant: 'apple' | 'google' | 'email';
  label: string;
  onClick: () => void;
}) {
  const isPrimary = variant === 'apple';
  const isEmail = variant === 'email';
  const style: CSSProperties = isPrimary
    ? {
        background: '#fff', color: '#000',
        boxShadow: '0 10px 24px rgba(0,0,0,0.45)',
      }
    : isEmail
      ? {
          background: 'transparent', color: '#fff',
          border: '1px solid rgba(255,255,255,0.18)',
        }
      : {
          background: '#1A1A1F', color: '#fff',
          border: '1px solid rgba(255,255,255,0.10)',
        };
  return (
    <div
      onClick={onClick}
      style={{
        position: 'relative',
        height: 56, borderRadius: 16,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 10,
        fontSize: 15, fontWeight: 600, letterSpacing: '-0.01em',
        cursor: 'pointer',
        ...style,
      }}
    >
      {variant === 'apple' && <AppleGlyph dark />}
      {variant === 'google' && <GoogleGlyph />}
      {variant === 'email' && <EmailGlyph />}
      <span>{label}</span>
    </div>
  );
}

function DividerLine({ label }: { label: string }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      margin: '2px 4px',
    }}>
      <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.10)' }} />
      <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.45)', fontWeight: 500 }}>{label}</div>
      <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.10)' }} />
    </div>
  );
}

function TermsLine() {
  return (
    <div style={{
      fontSize: 11.5, color: 'rgba(255,255,255,0.4)', textAlign: 'center',
      lineHeight: 1.5, marginTop: 14, padding: '0 12px',
    }}>
      By continuing, you agree to night's{' '}
      <span style={{ color: 'rgba(255,255,255,0.62)', textDecoration: 'underline' }}>Terms</span>{' '}
      and{' '}
      <span style={{ color: 'rgba(255,255,255,0.62)', textDecoration: 'underline' }}>Privacy Policy</span>.
    </div>
  );
}

// ─── Email-only step (used by sign-in + sign-up) ────────────────
function EmailStep({
  eyebrow, title, sub, email, setEmail, touched, setTouched,
  onContinue, continueLabel, foot,
}: {
  eyebrow: string;
  title: string;
  sub: string;
  email: string;
  setEmail: (v: string) => void;
  touched: boolean;
  setTouched: (v: boolean) => void;
  onContinue: () => void;
  continueLabel: string;
  foot?: ReactNode;
}) {
  const err = touched && !isValidEmail(email) ? 'Enter a valid email' : null;

  function submit() {
    if (!isValidEmail(email)) { setTouched(true); return; }
    onContinue();
  }

  return (
    <StepBody
      eyebrow={eyebrow}
      title={title}
      sub={sub}
      primaryLabel={continueLabel}
      primaryDisabled={false}
      onPrimary={submit}
      foot={foot}
    >
      <FloatingInput
        label="Email"
        type="email"
        value={email}
        onChange={(v) => { setEmail(v); if (touched) setTouched(false); }}
        autoComplete="email"
        autoFocus
        error={err}
        onEnter={submit}
      />
    </StepBody>
  );
}

// ─── Floating-label input (email / name) ────────────────────────
function FloatingInput({
  label, type, value, onChange, autoComplete, autoFocus, error, onEnter,
}: {
  label: string;
  type: 'email' | 'text';
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
  autoFocus?: boolean;
  error?: string | null;
  onEnter?: () => void;
}) {
  const [focused, setFocused] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  const labelUp = focused || value.length > 0;
  const accent = error ? CORAL : focused ? PERIWINKLE : 'rgba(255,255,255,0.14)';

  return (
    <div>
      <div
        onClick={() => ref.current?.focus()}
        style={{
          position: 'relative',
          height: 62, borderRadius: 14,
          background: 'rgba(255,255,255,0.03)',
          border: `1px solid ${accent}`,
          boxShadow: focused && !error ? `0 0 0 4px ${hexA(PERIWINKLE, 0.1)}` : 'none',
          transition: 'border-color .18s ease, box-shadow .18s ease',
          cursor: 'text',
          overflow: 'hidden',
        }}
      >
        <label
          style={{
            position: 'absolute',
            left: 16,
            top: labelUp ? 9 : '50%',
            transform: labelUp ? 'none' : 'translateY(-50%)',
            fontSize: labelUp ? 11 : 15,
            fontWeight: labelUp ? 600 : 500,
            letterSpacing: labelUp ? 0.4 : 0,
            color: error
              ? CORAL
              : labelUp
                ? (focused ? PERIWINKLE : 'rgba(255,255,255,0.55)')
                : 'rgba(255,255,255,0.5)',
            transition: 'all .18s cubic-bezier(.2,.7,.2,1)',
            pointerEvents: 'none',
          }}
        >{label}</label>
        <input
          ref={ref}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          autoCapitalize={type === 'email' ? 'none' : undefined}
          spellCheck={type === 'email' ? false : undefined}
          autoFocus={autoFocus}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={(e) => { if (e.key === 'Enter' && onEnter) onEnter(); }}
          style={{
            position: 'absolute',
            left: 16, right: 16, bottom: 10,
            background: 'transparent', border: 'none', outline: 'none',
            color: '#fff', fontFamily: W.font,
            fontSize: 16, fontWeight: 500, letterSpacing: '-0.01em',
            padding: 0,
            caretColor: PERIWINKLE,
            WebkitTextFillColor: '#fff',
          }}
        />
      </div>
      {error && (
        <div style={{
          marginTop: 8, marginLeft: 4, fontSize: 12.5, color: CORAL, fontWeight: 500,
        }}>{error}</div>
      )}
    </div>
  );
}

// ─── Glyphs ─────────────────────────────────────────────────────
function AppleGlyph({ dark }: { dark?: boolean }) {
  const fill = dark ? '#000' : '#fff';
  return (
    <svg width="16" height="18" viewBox="0 0 16 18" aria-hidden>
      <path d="M11.4 9.5c0-1.8 1.5-2.7 1.6-2.7-.9-1.3-2.2-1.5-2.7-1.5-1.2-.1-2.3.7-2.9.7-.6 0-1.5-.6-2.5-.6-1.3 0-2.5.7-3.1 1.9-1.3 2.3-.3 5.7 1 7.6.6.9 1.4 1.9 2.4 1.9 1 0 1.3-.6 2.5-.6s1.5.6 2.5.6c1 0 1.7-.9 2.3-1.9.7-1 1-2 1-2.1-.1 0-2.1-.8-2.1-3.3zM9.7 4c.5-.6.8-1.5.7-2.3-.7 0-1.6.4-2.1 1-.5.5-.9 1.4-.8 2.2.8.1 1.7-.4 2.2-.9z" fill={fill} />
    </svg>
  );
}

function GoogleGlyph() {
  return (
    <svg width="17" height="17" viewBox="0 0 18 18" aria-hidden>
      <path d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84c-.21 1.12-.84 2.07-1.79 2.71v2.26h2.9c1.7-1.56 2.69-3.87 2.69-6.61z" fill="#4285F4" />
      <path d="M9 18c2.43 0 4.47-.81 5.96-2.18l-2.9-2.26c-.81.54-1.83.86-3.06.86-2.36 0-4.36-1.59-5.07-3.74H.96v2.34A9 9 0 0 0 9 18z" fill="#34A853" />
      <path d="M3.93 10.68A5.41 5.41 0 0 1 3.64 9c0-.58.1-1.15.29-1.68V4.98H.96A8.99 8.99 0 0 0 0 9c0 1.45.35 2.83.96 4.02l2.97-2.34z" fill="#FBBC05" />
      <path d="M9 3.58c1.32 0 2.51.45 3.45 1.35l2.58-2.58A8.96 8.96 0 0 0 9 0 9 9 0 0 0 .96 4.98l2.97 2.34C4.64 5.17 6.64 3.58 9 3.58z" fill="#EA4335" />
    </svg>
  );
}

function EmailGlyph() {
  return (
    <svg width="18" height="14" viewBox="0 0 18 14" fill="none" aria-hidden>
      <rect x="1" y="1" width="16" height="12" rx="2.5" stroke="#fff" strokeWidth="1.5" />
      <path d="M1.6 2.5 9 8l7.4-5.5" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

function MailGlyph({ status = 'idle' }: { status?: 'idle' | 'error' | 'success' }) {
  const c = status === 'error' ? CORAL : status === 'success' ? MINT : PERIWINKLE;
  return (
    <div style={{
      width: 64, height: 64, borderRadius: 32,
      background: `radial-gradient(circle at 35% 30%, ${hexA(c, 0.55)}, ${hexA(c, 0.08)} 65%, transparent 80%)`,
      border: `1px solid ${hexA(c, 0.45)}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: `0 0 24px ${hexA(c, 0.3)}`,
    }}>
      {status === 'success'
        ? <CheckIcon size={26} stroke="#fff" strokeWidth={2.4} />
        : (
          <svg width="26" height="20" viewBox="0 0 34 26" fill="none">
            <rect x="1" y="1" width="32" height="24" rx="4" stroke="#fff" strokeWidth="1.6" />
            <path d="M2 4l15 10 15-10" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" />
          </svg>
        )}
    </div>
  );
}

// ─── Keyframes + utils ──────────────────────────────────────────
function AuthKeyframes() {
  return (
    <style>{`
      @keyframes au-rise { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
      @keyframes au-fade { from { opacity: 0; } to { opacity: 1; } }
      @keyframes au-pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.06); } }
      @keyframes au-caret { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; } }
    `}</style>
  );
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

function hexA(hex: string, a: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

function FootLine({ label, linkText, onLink }: { label: string; linkText: string; onLink: () => void }) {
  return (
    <div style={{
      textAlign: 'center', fontSize: 14,
      color: 'rgba(255,255,255,0.55)', lineHeight: 1.5,
    }}>
      {label}{' '}
      <span onClick={onLink} style={{
        color: '#fff', fontWeight: 600, cursor: 'pointer',
        textDecoration: 'underline', textUnderlineOffset: 2,
      }}>{linkText}</span>
    </div>
  );
}
