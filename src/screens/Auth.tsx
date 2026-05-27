import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { W } from '../tokens';
import { go, back, replace } from '../state/navigation';
import { useAuth, completeOnboarding, useOnboardingDone } from '../state/store';
import { ChevronLeftIcon, CheckIcon } from '../components/icons';
import { HeaderAmbient } from '../components/shared';

// Multi-step sign-in / sign-up. Step 1 picks a provider (Apple, Google,
// or email); if the user picks email, step 2 collects the email, and
// step 3 collects the rest (password — plus name on sign-up). The
// backdrop is the same warm/cool glow + rising motes used on Home /
// Course / Profile, so auth feels like part of the same world.

const PERIWINKLE = '#8AA1FF';
const MINT = '#5DDDB3';
const CORAL = '#FF8E7C';

// Stash between forgot-password and the confirmation step.
let lastResetEmail = '';

// ─── Public screens ─────────────────────────────────────────────
export function AuthSignIn() {
  return <AuthShell><SignInFlow /></AuthShell>;
}
export function AuthSignUp() {
  return <AuthShell><SignUpFlow /></AuthShell>;
}
export function AuthForgot() {
  return <AuthShell><ForgotFlow /></AuthShell>;
}
export function AuthResetSent() {
  return <AuthShell><ResetSentBody /></AuthShell>;
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
type SignInStep = 'method' | 'email' | 'password';

function SignInFlow() {
  const { signIn, signInWithApple } = useAuth();
  const onboardingDone = useOnboardingDone();
  const [step, setStep] = useState<SignInStep>('method');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    if (step === 'password') return setStep('email');
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
          sub="We'll use it to find your account."
          email={email}
          setEmail={setEmail}
          touched={touched}
          setTouched={setTouched}
          onContinue={() => setStep('password')}
          continueLabel="Continue"
          foot={<FootLine label="Don't have an account?" linkText="Sign up" onLink={() => go('auth-sign-up')} />}
        />
      )}

      {step === 'password' && (
        <SignInPasswordStep
          email={email}
          password={password}
          setPassword={setPassword}
          touched={touched}
          setTouched={setTouched}
          onSubmit={() => {
            if (password.length < 6) { setTouched(true); return; }
            signIn(email.trim());
            finish();
          }}
        />
      )}
    </StepFrame>
  );
}

function SignInPasswordStep({
  email, password, setPassword, touched, setTouched, onSubmit,
}: {
  email: string;
  password: string;
  setPassword: (v: string) => void;
  touched: boolean;
  setTouched: (v: boolean) => void;
  onSubmit: () => void;
}) {
  const passErr = touched && password.length < 6 ? 'Use at least 6 characters' : null;

  return (
    <StepBody
      eyebrow={`Signing in as ${email}`}
      title="Enter your password"
      sub="Welcome back. Your data has been waiting for you."
      primaryLabel="Sign in"
      primaryDisabled={false}
      onPrimary={onSubmit}
      foot={
        <div style={{ textAlign: 'center' }}>
          <span
            onClick={() => go('auth-forgot')}
            style={{
              fontSize: 14, color: PERIWINKLE, fontWeight: 500, cursor: 'pointer',
            }}
          >Forgot password?</span>
        </div>
      }
    >
      <FloatingInput
        label="Password"
        type="password"
        value={password}
        onChange={(v) => { setPassword(v); if (!touched) setTouched(false); }}
        autoComplete="current-password"
        autoFocus
        error={passErr}
        onEnter={onSubmit}
      />
    </StepBody>
  );
}

// ─── Sign-up ────────────────────────────────────────────────────
type SignUpStep = 'method' | 'email' | 'profile';

function SignUpFlow() {
  const { signUp, signInWithApple } = useAuth();
  const onboardingDone = useOnboardingDone();
  const [step, setStep] = useState<SignUpStep>('method');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState(false);

  function finish() { back(); }

  function leaveStep() {
    if (step === 'profile') return setStep('email');
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
          onApple={() => { signInWithApple(); finish(); }}
          onGoogle={() => { signInWithApple(); finish(); }}
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
          sub="We'll send your reset link here if you ever need it."
          email={email}
          setEmail={setEmail}
          touched={touched}
          setTouched={setTouched}
          onContinue={() => setStep('profile')}
          continueLabel="Continue"
          foot={<FootLine label="Already have an account?" linkText="Sign in" onLink={() => go('auth-sign-in')} />}
        />
      )}

      {step === 'profile' && (
        <SignUpProfileStep
          name={name} setName={setName}
          password={password} setPassword={setPassword}
          touched={touched} setTouched={setTouched}
          onSubmit={() => {
            const rules = passwordRules(password);
            const allPass = rules.every((r) => r.ok);
            if (!name.trim() || !allPass) { setTouched(true); return; }
            signUp(name, email.trim());
            finish();
          }}
        />
      )}
    </StepFrame>
  );
}

function SignUpProfileStep({
  name, setName, password, setPassword, touched, setTouched, onSubmit,
}: {
  name: string;
  setName: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  touched: boolean;
  setTouched: (v: boolean) => void;
  onSubmit: () => void;
}) {
  const rules = passwordRules(password);
  const nameErr = touched && !name.trim() ? 'Add a name' : null;

  return (
    <StepBody
      eyebrow="Almost done"
      title="A few details"
      sub="So we know what to call you and how to keep your account safe."
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
      />
      <div style={{ height: 14 }} />
      <FloatingInput
        label="Password"
        type="password"
        value={password}
        onChange={setPassword}
        autoComplete="new-password"
        onEnter={onSubmit}
      />
      <PasswordChecklist rules={rules} />
    </StepBody>
  );
}

// ─── Forgot ─────────────────────────────────────────────────────
function ForgotFlow() {
  const [email, setEmail] = useState(lastResetEmail);
  const [touched, setTouched] = useState(false);
  return (
    <StepFrame stepKey="forgot" onBack={back}>
      <EmailStep
        eyebrow="Forgot password"
        title="Reset your password"
        sub="Enter the email tied to your account and we'll send you a one-tap reset link."
        email={email}
        setEmail={setEmail}
        touched={touched}
        setTouched={setTouched}
        onContinue={() => {
          if (!isValidEmail(email)) { setTouched(true); return; }
          lastResetEmail = email.trim();
          replace('auth-reset-sent');
        }}
        continueLabel="Send reset link"
        foot={<FootLine label="Remembered it?" linkText="Sign in" onLink={() => go('auth-sign-in')} />}
      />
    </StepFrame>
  );
}

function ResetSentBody() {
  const [secondsLeft, setSecondsLeft] = useState(45);
  const [resentNote, setResentNote] = useState(false);
  useEffect(() => {
    if (secondsLeft <= 0) return;
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft]);

  function resend() {
    if (secondsLeft > 0) return;
    setSecondsLeft(45);
    setResentNote(true);
    setTimeout(() => setResentNote(false), 2200);
  }

  return (
    <StepFrame stepKey="reset-sent" onBack={back} showBack={false}>
      <StepBody
        eyebrow="Check your inbox"
        title="One tap away"
        sub={
          <>
            We sent a reset link to{' '}
            <span style={{ color: '#fff', fontWeight: 600 }}>{lastResetEmail || 'your email'}</span>.
            Tap the link to set a new password.
          </>
        }
        primaryLabel="Back to sign in"
        onPrimary={() => replace('auth-sign-in')}
        primaryDisabled={false}
        topGlyph={<MailGlyph />}
        foot={
          <div
            onClick={resend}
            style={{
              textAlign: 'center', fontSize: 13.5, fontWeight: 500,
              color: secondsLeft > 0 ? 'rgba(255,255,255,0.35)' : PERIWINKLE,
              cursor: secondsLeft > 0 ? 'default' : 'pointer',
              padding: '6px 0',
            }}
          >{secondsLeft > 0 ? `Resend in ${secondsLeft}s` : 'Resend link'}</div>
        }
      >
        <div style={{
          padding: '14px 16px',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.10)',
          borderRadius: 14,
          fontSize: 13, color: 'rgba(255,255,255,0.62)', lineHeight: 1.5,
        }}>
          Didn't arrive in a minute? Check your spam folder, or resend below.
        </div>
        {resentNote && (
          <div style={{
            marginTop: 12, textAlign: 'center',
            fontSize: 13, color: PERIWINKLE, animation: 'au-fade .3s ease both',
          }}>Sent again — check your inbox.</div>
        )}
      </StepBody>
    </StepFrame>
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
          <RoundBtn onClick={onBack} label="Back"><ChevronLeftIcon size={16} stroke="#fff" /></RoundBtn>
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
          <div style={{ marginTop: 8, marginBottom: 18, display: 'flex', justifyContent: 'center' }}>
            {topGlyph}
          </div>
        )}
        <Eyebrow>{eyebrow}</Eyebrow>
        <Title style={topGlyph ? { textAlign: 'center' } : undefined}>{title}</Title>
        <Sub style={topGlyph ? { textAlign: 'center', marginLeft: 'auto', marginRight: 'auto' } : undefined}>{sub}</Sub>

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

function RoundBtn({ children, onClick, label }: { children: ReactNode; onClick: () => void; label: string }) {
  return (
    <div onClick={onClick} aria-label={label} role="button" style={{
      width: 36, height: 36, borderRadius: 18,
      background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.14)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      cursor: 'pointer',
    }}>{children}</div>
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

// ─── Email-only step (used by sign-in, sign-up, forgot) ─────────
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

// ─── Floating-label input ────────────────────────────────────────
function FloatingInput({
  label, type, value, onChange, autoComplete, autoFocus, error, onEnter,
}: {
  label: string;
  type: 'email' | 'password' | 'text';
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
  autoFocus?: boolean;
  error?: string | null;
  onEnter?: () => void;
}) {
  const [focused, setFocused] = useState(false);
  const [reveal, setReveal] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  const isPassword = type === 'password';
  const labelUp = focused || value.length > 0;
  const inputType = isPassword && reveal ? 'text' : type;

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
          boxShadow: focused && !error ? `0 0 0 4px ${hexA(PERIWINKLE, 0.10)}` : 'none',
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
          type={inputType}
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
            left: 16, right: isPassword ? 60 : 16, bottom: 10,
            background: 'transparent', border: 'none', outline: 'none',
            color: '#fff', fontFamily: W.font,
            fontSize: 16, fontWeight: 500, letterSpacing: '-0.01em',
            padding: 0,
            caretColor: PERIWINKLE,
            WebkitTextFillColor: '#fff',
          }}
        />
        {isPassword && value.length > 0 && (
          <div
            onClick={(e) => { e.stopPropagation(); setReveal((r) => !r); }}
            style={{
              position: 'absolute', right: 12, top: '50%',
              transform: 'translateY(-50%)',
              fontSize: 11, fontWeight: 700, letterSpacing: 0.6,
              color: 'rgba(255,255,255,0.7)', cursor: 'pointer',
              padding: '6px 10px', borderRadius: 8,
              background: 'rgba(255,255,255,0.06)',
            }}
          >{reveal ? 'HIDE' : 'SHOW'}</div>
        )}
      </div>
      {error && (
        <div style={{
          marginTop: 8, marginLeft: 4, fontSize: 12.5, color: CORAL, fontWeight: 500,
        }}>{error}</div>
      )}
    </div>
  );
}

// ─── Password rules ─────────────────────────────────────────────
type Rule = { key: string; label: string; ok: boolean };

function passwordRules(password: string): Rule[] {
  return [
    { key: 'len', label: 'At least 8 characters', ok: password.length >= 8 },
    { key: 'num', label: 'Includes a number', ok: /\d/.test(password) },
    { key: 'case', label: 'Mixes upper and lowercase letters', ok: /[a-z]/.test(password) && /[A-Z]/.test(password) },
  ];
}

function PasswordChecklist({ rules }: { rules: Rule[] }) {
  return (
    <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {rules.map((r) => (
        <div key={r.key} style={{
          display: 'flex', alignItems: 'center', gap: 10,
          fontSize: 13,
          color: r.ok ? MINT : 'rgba(255,255,255,0.55)',
          transition: 'color .2s ease',
        }}>
          <RuleDot ok={r.ok} />
          <span style={{
            transition: 'color .2s ease',
            fontWeight: r.ok ? 500 : 400,
          }}>{r.label}</span>
        </div>
      ))}
    </div>
  );
}

function RuleDot({ ok }: { ok: boolean }) {
  return (
    <div style={{
      width: 18, height: 18, borderRadius: 9,
      background: ok ? MINT : 'transparent',
      border: ok ? `1.5px solid ${MINT}` : '1.5px solid rgba(255,255,255,0.22)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
      transition: 'all .2s ease',
      transform: ok ? 'scale(1)' : 'scale(0.96)',
    }}>
      {ok && <CheckIcon size={11} stroke="#0F1A14" strokeWidth={3} />}
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

function MailGlyph() {
  return (
    <div style={{
      width: 88, height: 88, borderRadius: 44,
      background: `radial-gradient(circle at 35% 30%, ${hexA(PERIWINKLE, 0.55)}, ${hexA(PERIWINKLE, 0.08)} 65%, transparent 80%)`,
      border: `1px solid ${hexA(PERIWINKLE, 0.45)}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: `0 0 24px ${hexA(PERIWINKLE, 0.30)}`,
      animation: 'au-pulse 3.4s ease-in-out infinite',
    }}>
      <svg width="34" height="26" viewBox="0 0 34 26" fill="none">
        <rect x="1" y="1" width="32" height="24" rx="4" stroke="#fff" strokeWidth="1.6" />
        <path d="M2 4l15 10 15-10" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
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

// Re-export only the public screens — internal helpers stay private.
// Note: `FootLine` is declared after its usage above, but JS function
// declarations are hoisted so this remains valid.
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
