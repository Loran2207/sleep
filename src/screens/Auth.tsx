import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { W } from '../tokens';
import { go, back, replace } from '../state/navigation';
import { useAuth, completeOnboarding, useOnboardingDone } from '../state/store';
import { ChevronLeftIcon } from '../components/icons';

// Sign-in / sign-up / forgot-password / reset-sent — share one chrome
// (the welcome-style spotlight backdrop) and one set of input atoms so
// the whole auth flow feels like one native iOS screen, just with the
// form swapped out.

const PERIWINKLE = '#8AA1FF';

// Stash a single email between forgot-password and the confirmation
// screen so the confirmation can address the right inbox.
let lastResetEmail = '';

// ─── Public screens ─────────────────────────────────────────────
export function AuthSignIn() {
  return <AuthShell><SignInForm /></AuthShell>;
}
export function AuthSignUp() {
  return <AuthShell><SignUpForm /></AuthShell>;
}
export function AuthForgot() {
  return <AuthShell><ForgotForm /></AuthShell>;
}
export function AuthResetSent() {
  return <AuthShell><ResetSentBody /></AuthShell>;
}

// ─── Chrome ─────────────────────────────────────────────────────
function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      background: '#000', color: W.ink, fontFamily: W.font,
      position: 'relative', overflow: 'hidden',
    }}>
      <AuthKeyframes />
      <SpotlightBackdrop />

      <div style={{
        position: 'relative', zIndex: 2, flex: 1,
        display: 'flex', flexDirection: 'column',
        animation: 'au-rise .42s cubic-bezier(.2,.7,.2,1) both',
      }}>
        {children}
      </div>
    </div>
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

// ─── Forms ──────────────────────────────────────────────────────
function SignInForm() {
  const { signIn, signInWithApple } = useAuth();
  const onboardingDone = useOnboardingDone();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const emailErr = touched && !isValidEmail(email) ? 'Enter a valid email' : null;
  const passwordErr = touched && password.length < 6 ? '6+ characters' : null;
  const formValid = isValidEmail(email) && password.length >= 6;

  function finish() {
    // Returning user from welcome: skip onboarding and land on home.
    // Returning user from profile (already onboarded): just close auth.
    if (!onboardingDone) {
      completeOnboarding();
      replace('home');
    } else {
      back();
    }
  }

  function submit() {
    if (!formValid) {
      setTouched(true);
      setSubmitError(null);
      return;
    }
    setSubmitError(null);
    signIn(email.trim());
    finish();
  }

  return (
    <FormLayout
      eyebrow="Welcome back"
      title="Sign in to night"
      sub="Sync schedules, journal entries and your sound mixes across devices."
      onBack={back}
      skipLabel="Continue as guest"
      onSkip={onboardingDone ? undefined : () => { completeOnboarding(); replace('home'); }}
      primary={{ label: 'Sign in', onClick: submit, disabled: false }}
      bottom={
        <FootLine
          label="Don't have an account?"
          linkText="Sign up"
          onLink={() => go('auth-sign-up')}
        />
      }
    >
      <AppleButton onClick={() => { signInWithApple(); finish(); }} />
      <Divider label="or sign in with email" />

      <FormGroup>
        <Field
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={setEmail}
          placeholder="you@example.com"
          error={emailErr}
        />
        <FieldDivider />
        <Field
          label="Password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={setPassword}
          placeholder="At least 6 characters"
          error={passwordErr}
        />
      </FormGroup>

      <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
        <div onClick={() => go('auth-forgot')} style={{
          fontSize: 13, color: PERIWINKLE, fontWeight: 500, cursor: 'pointer',
          padding: '4px 0',
        }}>Forgot password?</div>
      </div>

      {submitError && <ErrorBanner message={submitError} />}
    </FormLayout>
  );
}

function SignUpForm() {
  const { signUp, signInWithApple } = useAuth();
  const onboardingDone = useOnboardingDone();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState(false);

  const emailErr = touched && !isValidEmail(email) ? 'Enter a valid email' : null;
  const passwordErr = touched && password.length < 8 ? 'Use 8+ characters' : null;
  const formValid = name.trim().length > 0 && isValidEmail(email) && password.length >= 8;

  // For a new account: close auth and return where we came from.
  // From welcome → back to onboarding (gate still active until they finish).
  // From profile-banner → back to profile (now signed in).
  function finish() { back(); }

  function submit() {
    if (!formValid) { setTouched(true); return; }
    signUp(name, email.trim());
    finish();
  }

  return (
    <FormLayout
      eyebrow="Create your account"
      title="A home for your nights"
      sub="Free to start. We'll back up your sleep data and sync it across devices."
      onBack={back}
      skipLabel="Continue as guest"
      onSkip={onboardingDone ? undefined : () => { completeOnboarding(); replace('home'); }}
      primary={{ label: 'Create account', onClick: submit, disabled: false }}
      bottom={
        <>
          <FootLine
            label="Already have an account?"
            linkText="Sign in"
            onLink={() => go('auth-sign-in')}
          />
          <div style={{
            fontSize: 11.5, color: 'rgba(255,255,255,0.4)', textAlign: 'center',
            lineHeight: 1.5, marginTop: 12, padding: '0 12px',
          }}>
            By continuing, you agree to night's{' '}
            <span style={{ color: 'rgba(255,255,255,0.62)', textDecoration: 'underline' }}>Terms</span>{' '}
            and{' '}
            <span style={{ color: 'rgba(255,255,255,0.62)', textDecoration: 'underline' }}>Privacy Policy</span>.
          </div>
        </>
      }
    >
      <AppleButton onClick={() => { signInWithApple(); finish(); }} />
      <Divider label="or sign up with email" />

      <FormGroup>
        <Field
          label="Name"
          type="text"
          autoComplete="name"
          value={name}
          onChange={setName}
          placeholder="Your name"
          error={touched && !name.trim() ? 'Add a name' : null}
        />
        <FieldDivider />
        <Field
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={setEmail}
          placeholder="you@example.com"
          error={emailErr}
        />
        <FieldDivider />
        <Field
          label="Password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={setPassword}
          placeholder="At least 8 characters"
          error={passwordErr}
          hint={touched ? undefined : 'Use 8+ characters'}
        />
      </FormGroup>
    </FormLayout>
  );
}

function ForgotForm() {
  const [email, setEmail] = useState(lastResetEmail);
  const [touched, setTouched] = useState(false);
  const emailErr = touched && !isValidEmail(email) ? 'Enter a valid email' : null;
  const formValid = isValidEmail(email);

  function submit() {
    if (!formValid) { setTouched(true); return; }
    lastResetEmail = email.trim();
    replace('auth-reset-sent');
  }

  return (
    <FormLayout
      eyebrow="Forgot password"
      title="Reset your password"
      sub="Enter the email tied to your account and we'll send you a one-tap reset link."
      onBack={back}
      primary={{ label: 'Send reset link', onClick: submit, disabled: false }}
      bottom={
        <FootLine
          label="Remembered it?"
          linkText="Sign in"
          onLink={() => go('auth-sign-in')}
        />
      }
    >
      <FormGroup>
        <Field
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={setEmail}
          placeholder="you@example.com"
          error={emailErr}
        />
      </FormGroup>
    </FormLayout>
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
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{
        position: 'relative', zIndex: 3,
        padding: 'calc(10px + env(safe-area-inset-top)) 16px 0',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <RoundBtn onClick={back} label="Back"><ChevronLeftIcon size={16} stroke="#fff" /></RoundBtn>
        <div style={{ width: 56 }} />
      </div>

      <div style={{
        flex: 1, padding: '12px 24px 0',
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center' }}>
          <MailGlyph />
        </div>

        <Eyebrow>Check your inbox</Eyebrow>
        <Title style={{ textAlign: 'center', marginTop: 2 }}>One tap away</Title>
        <div style={{
          marginTop: 12, textAlign: 'center',
          fontSize: 15, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5,
          maxWidth: 320, marginLeft: 'auto', marginRight: 'auto',
        }}>
          We sent a reset link to{' '}
          <span style={{ color: '#fff', fontWeight: 600 }}>{lastResetEmail || 'your email'}</span>.
          Tap it to set a new password.
        </div>

        <div style={{
          marginTop: 22, padding: '14px 16px',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.10)',
          borderRadius: 14,
          fontSize: 13, color: 'rgba(255,255,255,0.62)', lineHeight: 1.5,
        }}>
          Didn't arrive in a minute? Check your spam folder, or resend below.
        </div>

        {resentNote && (
          <div style={{
            marginTop: 14, textAlign: 'center',
            fontSize: 13, color: PERIWINKLE, animation: 'au-fade .3s ease both',
          }}>Sent again — check your inbox.</div>
        )}
      </div>

      <FooterBar>
        <PrimaryButton label="Back to sign in" onClick={() => replace('auth-sign-in')} />
        <div onClick={resend} style={{
          padding: '12px 0', marginTop: 8, textAlign: 'center',
          fontSize: 13, fontWeight: 500,
          color: secondsLeft > 0 ? 'rgba(255,255,255,0.35)' : PERIWINKLE,
          cursor: secondsLeft > 0 ? 'default' : 'pointer',
        }}>
          {secondsLeft > 0 ? `Resend in ${secondsLeft}s` : 'Resend link'}
        </div>
      </FooterBar>
    </div>
  );
}

// ─── Layout helpers ─────────────────────────────────────────────
function FormLayout({
  eyebrow, title, sub, children, primary, bottom, onBack, onSkip, skipLabel,
}: {
  eyebrow: string;
  title: string;
  sub: string;
  children: ReactNode;
  primary: { label: string; onClick: () => void; disabled: boolean };
  bottom?: ReactNode;
  onBack: () => void;
  onSkip?: () => void;
  skipLabel?: string;
}) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{
        position: 'relative', zIndex: 3,
        padding: 'calc(10px + env(safe-area-inset-top)) 16px 0',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <RoundBtn onClick={onBack} label="Back"><ChevronLeftIcon size={16} stroke="#fff" /></RoundBtn>
        {onSkip ? (
          <div onClick={onSkip} style={{
            padding: '8px 14px', borderRadius: 999,
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.14)',
            fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.78)', cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}>{skipLabel ?? 'Skip'}</div>
        ) : (
          <div style={{ width: 56 }} />
        )}
      </div>

      <div style={{
        flex: 1, padding: '16px 24px 0',
        overflowY: 'auto',
        display: 'flex', flexDirection: 'column',
      }}>
        <Eyebrow>{eyebrow}</Eyebrow>
        <Title>{title}</Title>
        <Sub>{sub}</Sub>

        <div style={{ marginTop: 22 }}>{children}</div>
      </div>

      <FooterBar>
        <PrimaryButton label={primary.label} onClick={primary.onClick} disabled={primary.disabled} />
        {bottom && <div style={{ marginTop: 14 }}>{bottom}</div>}
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
      color: PERIWINKLE, textTransform: 'none',
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

function Sub({ children }: { children: ReactNode }) {
  return (
    <div style={{
      marginTop: 10, fontSize: 15, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5,
      maxWidth: 340,
    }}>{children}</div>
  );
}

// ─── Form atoms ─────────────────────────────────────────────────
function FormGroup({ children }: { children: ReactNode }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.10)',
      borderRadius: 14, overflow: 'hidden',
    }}>{children}</div>
  );
}

function FieldDivider() {
  return <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', marginLeft: 14 }} />;
}

function Field({
  label, type, value, onChange, placeholder, error, hint, autoComplete,
}: {
  label: string;
  type: 'email' | 'password' | 'text';
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  error?: string | null;
  hint?: string;
  autoComplete?: string;
}) {
  const [reveal, setReveal] = useState(false);
  const [focused, setFocused] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  const isPassword = type === 'password';
  const inputType = isPassword && reveal ? 'text' : type;

  return (
    <div style={{
      padding: '12px 14px 11px',
      transition: 'background .15s ease',
      background: focused ? 'rgba(255,255,255,0.02)' : 'transparent',
    }}>
      <div style={{
        display: 'flex', alignItems: 'baseline', gap: 12,
      }}>
        <label
          onClick={() => ref.current?.focus()}
          style={{
            width: 78, flexShrink: 0,
            fontSize: 13, color: 'rgba(255,255,255,0.55)', fontWeight: 500,
            cursor: 'text',
          }}
        >
          {label}
        </label>
        <input
          ref={ref}
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          autoCapitalize={type === 'email' ? 'none' : undefined}
          spellCheck={type === 'email' ? false : undefined}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            flex: 1, minWidth: 0,
            background: 'transparent', border: 'none', outline: 'none',
            color: '#fff', fontFamily: W.font,
            fontSize: 15, fontWeight: 500, letterSpacing: '-0.01em',
            padding: 0,
            // Use webkit text fill so iOS autofill yellow doesn't bleed in.
            WebkitTextFillColor: '#fff',
            caretColor: PERIWINKLE,
          }}
        />
        {isPassword && value.length > 0 && (
          <div onClick={() => setReveal((r) => !r)} style={{
            fontSize: 11, fontWeight: 600, letterSpacing: 0.4,
            color: 'rgba(255,255,255,0.65)', cursor: 'pointer',
            padding: '4px 6px', borderRadius: 6,
            background: 'rgba(255,255,255,0.06)',
            flexShrink: 0,
          }}>{reveal ? 'HIDE' : 'SHOW'}</div>
        )}
      </div>
      {(error || hint) && (
        <div style={{
          marginTop: 6, marginLeft: 90, fontSize: 11.5,
          color: error ? '#FF8E7C' : 'rgba(255,255,255,0.4)',
          fontWeight: 500,
        }}>{error ?? hint}</div>
      )}
    </div>
  );
}

function AppleButton({ onClick }: { onClick: () => void }) {
  return (
    <div onClick={onClick} style={{
      padding: '14px 0', borderRadius: 14,
      background: '#fff', color: '#000',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      fontSize: 15, fontWeight: 600, letterSpacing: '-0.01em',
      cursor: 'pointer',
      boxShadow: '0 8px 22px rgba(0,0,0,0.4)',
    }}>
      <AppleGlyph />
      <span>Continue with Apple</span>
    </div>
  );
}

function AppleGlyph() {
  return (
    <svg width="16" height="18" viewBox="0 0 16 18" aria-hidden>
      <path d="M11.4 9.5c0-1.8 1.5-2.7 1.6-2.7-.9-1.3-2.2-1.5-2.7-1.5-1.2-.1-2.3.7-2.9.7-.6 0-1.5-.6-2.5-.6-1.3 0-2.5.7-3.1 1.9-1.3 2.3-.3 5.7 1 7.6.6.9 1.4 1.9 2.4 1.9 1 0 1.3-.6 2.5-.6s1.5.6 2.5.6c1 0 1.7-.9 2.3-1.9.7-1 1-2 1-2.1-.1 0-2.1-.8-2.1-3.3zM9.7 4c.5-.6.8-1.5.7-2.3-.7 0-1.6.4-2.1 1-.5.5-.9 1.4-.8 2.2.8.1 1.7-.4 2.2-.9z" fill="#000" />
    </svg>
  );
}

function Divider({ label }: { label: string }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      margin: '18px 4px',
    }}>
      <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.10)' }} />
      <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.45)', fontWeight: 500 }}>{label}</div>
      <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.10)' }} />
    </div>
  );
}

function FootLine({ label, linkText, onLink }: { label: string; linkText: string; onLink: () => void }) {
  return (
    <div style={{
      textAlign: 'center', fontSize: 13.5,
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

function ErrorBanner({ message }: { message: string }) {
  return (
    <div style={{
      marginTop: 14, padding: '11px 14px',
      background: 'rgba(255,142,124,0.10)',
      border: '1px solid rgba(255,142,124,0.30)',
      borderRadius: 12, fontSize: 13, color: '#FFB1A2', lineHeight: 1.4,
    }}>{message}</div>
  );
}

function MailGlyph() {
  return (
    <div style={{
      width: 88, height: 88, borderRadius: 44,
      background: `radial-gradient(circle at 35% 30%, rgba(138,161,255,0.55), rgba(138,161,255,0.08) 65%, transparent 80%)`,
      border: `1px solid rgba(138,161,255,0.45)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 0 24px rgba(138,161,255,0.30)',
      animation: 'au-pulse 3.4s ease-in-out infinite',
    }}>
      <svg width="34" height="26" viewBox="0 0 34 26" fill="none">
        <rect x="1" y="1" width="32" height="24" rx="4" stroke="#fff" strokeWidth="1.6" />
        <path d="M2 4l15 10 15-10" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

// ─── Spotlight backdrop (lighter cousin of WelcomeBody's) ───────
function SpotlightBackdrop() {
  const motes = [
    { x: '14%', bottom: 60, s: 2, dur: 12, d: 0 },
    { x: '28%', bottom: 30, s: 2.5, dur: 14, d: 2 },
    { x: '46%', bottom: 100, s: 2, dur: 13, d: 4 },
    { x: '64%', bottom: 50, s: 2.5, dur: 15, d: 1 },
    { x: '78%', bottom: 84, s: 2, dur: 11, d: 5.5 },
    { x: '88%', bottom: 30, s: 2.5, dur: 13, d: 3 },
  ];
  return (
    <div aria-hidden style={{
      position: 'absolute', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none',
    }}>
      <div style={{
        position: 'absolute', top: -130, right: -90, width: 360, height: 360, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,252,245,0.16), rgba(255,250,240,0.04) 42%, transparent 70%)',
        filter: 'blur(12px)', animation: 'au-aura 9s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute', top: -90, right: -50, width: 290, height: 290, borderRadius: '50%',
        background: 'radial-gradient(circle at 58% 42%, rgba(216,226,255,0.16), rgba(216,226,255,0) 60%)',
        filter: 'blur(10px)', animation: 'au-aura2 12s ease-in-out 1s infinite',
      }} />
      <div style={{
        position: 'absolute', bottom: '14%', left: '-15%', width: 460, height: 320, borderRadius: '50%',
        background: 'radial-gradient(ellipse at center, rgba(138,161,255,0.06), transparent 62%)',
        filter: 'blur(18px)',
      }} />
      {motes.map((m, i) => (
        <div key={i} style={{
          position: 'absolute', left: m.x, bottom: m.bottom,
          width: m.s, height: m.s, borderRadius: 3,
          background: 'rgba(255,255,255,0.6)',
          animation: `au-mote ${m.dur}s ease-in-out ${m.d}s infinite`,
        }} />
      ))}
    </div>
  );
}

function AuthKeyframes() {
  return (
    <style>{`
      @keyframes au-rise { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
      @keyframes au-fade { from { opacity: 0; } to { opacity: 1; } }
      @keyframes au-aura { 0%, 100% { opacity: .55; transform: scale(1); } 50% { opacity: .95; transform: scale(1.06); } }
      @keyframes au-aura2 { 0%, 100% { opacity: .35; transform: translate(0,0); } 50% { opacity: .9; transform: translate(-8px,6px); } }
      @keyframes au-mote { 0% { transform: translate3d(0,0,0); opacity: 0; } 14% { opacity: .7; } 72% { opacity: .5; } 100% { transform: translate3d(0,-160px,0); opacity: 0; } }
      @keyframes au-pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.06); } }
    `}</style>
  );
}

// ─── Utils ──────────────────────────────────────────────────────
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}
