import { useState, useRef, useLayoutEffect, useCallback } from 'react';
import AuthBackground from './AuthBackground';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';

/* ── logo mark ─────────────────────────────────────────── */
function LogoMark() {
  return (
    <div className="auth-card__logo-mark" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M12 2.5L4.5 5.5v6c0 4.5 3.3 8.5 7.5 9.7 4.2-1.2 7.5-5.2 7.5-9.7v-6L12 2.5z"
          stroke="white" strokeWidth="1.7" strokeLinejoin="round"
        />
        <path d="M9 12h6M12 9v6" stroke="white" strokeWidth="1.7" strokeLinecap="round"/>
      </svg>
    </div>
  );
}

function CardLogo({ sub }) {
  return (
    <div className="auth-card__logo">
      <LogoMark />
      <div>
        <span className="auth-card__logo-text">GMC / GPA Portal</span>
        <span className="auth-card__logo-sub">{sub}</span>
      </div>
    </div>
  );
}

/* ── animation state machine ────────────────────────────
   Each panel has one of these CSS classes at any time:
     is-active      → on screen, visible
     exit-left      → flying out to the left
     exit-right     → flying out to the right
     enter-right    → waiting off-screen to the right, about to enter
     enter-left     → waiting off-screen to the left, about to enter

   Transition flow  (login → signup):
     login:  is-active → exit-left
     signup: enter-right → is-active

   Transition flow  (signup → login):
     signup: is-active → exit-right
     login:  enter-left → is-active
────────────────────────────────────────────────────────── */

const INITIAL = {
  login:  'is-active entrance',   // entrance = one-shot load animation
  signup: 'enter-right',          // hidden off-screen to the right
};

export default function AuthCard({ onLoginSuccess, onSignupSuccess, useAuthHook }) {
  const {
    login, signup,
    loginLoading, signupLoading,
    loginError, signupError,
    clearLoginError, clearSignupError,
  } = useAuthHook;

  const [panelClass, setPanelClass]   = useState(INITIAL);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const stackRef  = useRef(null);
  const loginRef  = useRef(null);
  const signupRef = useRef(null);
  const isAnimating = useRef(false);

  /* ── keep stack height = height of whichever panel is active ──
     Since all panels are position:absolute, the stack has no intrinsic
     height. We measure both panels and always set min-height to the
     larger one so the page never collapses during transition. */
  useLayoutEffect(() => {
    const update = () => {
      if (!stackRef.current) return;
      const h1 = loginRef.current?.scrollHeight  ?? 0;
      const h2 = signupRef.current?.scrollHeight ?? 0;
      stackRef.current.style.minHeight = Math.max(h1, h2) + 'px';
    };
    // Run after paint
    update();
    const ro = new ResizeObserver(update);
    if (loginRef.current)  ro.observe(loginRef.current);
    if (signupRef.current) ro.observe(signupRef.current);
    return () => ro.disconnect();
  }, []);

  /* ── transition helper ── */
  const transition = useCallback((direction) => {
    if (isAnimating.current) return;
    isAnimating.current = true;

    const goingToSignup = direction === 'signup';

    // Step 1: set exit + enter-waiting classes simultaneously
    setPanelClass({
      login:  goingToSignup ? 'exit-left'  : 'enter-left',
      signup: goingToSignup ? 'enter-right': 'exit-right',
    });

    // Step 2: one frame later, trigger the entering panel to fly in
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setPanelClass({
          login:  goingToSignup ? 'exit-left'  : 'is-active',
          signup: goingToSignup ? 'is-active'  : 'exit-right',
        });
      });
    });

    // Step 3: after transition ends, mark offscreen as fully hidden
    setTimeout(() => {
      setPanelClass({
        login:  goingToSignup ? 'enter-left' : 'is-active',
        signup: goingToSignup ? 'is-active'  : 'enter-right',
      });
      isAnimating.current = false;
    }, 620); // slightly longer than CSS transition
  }, []);

  const goToSignup = useCallback(() => {
    clearLoginError();
    setSignupSuccess(false);
    transition('signup');
  }, [clearLoginError, transition]);

  const goToLogin = useCallback(() => {
    clearSignupError();
    transition('login');
  }, [clearSignupError, transition]);

  const handleLogin = async (creds) => {
    try { onLoginSuccess(await login(creds)); } catch { /* loginError handles UI */ }
  };

  const handleSignup = async (payload) => {
    try { onSignupSuccess(await signup(payload)); } catch { /* signupError handles UI */ }
  };

  const loginActive  = panelClass.login.includes('is-active');
  const signupActive = panelClass.signup.includes('is-active');

  return (
    <div className="auth-page">
      <AuthBackground />

      <div className="auth-viewport" role="main" aria-label="Authentication">
        <div className="auth-panel-stack" ref={stackRef}>

          {/* ── LOGIN PANEL ── */}
          <div
            ref={loginRef}
            className={`auth-panel ${panelClass.login}`}
            aria-hidden={!loginActive}
            inert={!loginActive ? '' : undefined}
          >
            <div className="auth-card">
              <CardLogo sub="Intimation Dashboard" />
              <h1 className="auth-card__heading">Welcome back</h1>
              <p className="auth-card__subheading">Sign in to the admin portal</p>

              <LoginForm
                onSubmit={handleLogin}
                loading={loginLoading}
                serverError={loginError}
                onClearError={clearLoginError}
                signupSuccess={signupSuccess}
              />

              <div className="auth-switch">
                Don't have an account?{' '}
                <button className="auth-switch__btn" onClick={goToSignup} type="button">
                  Sign up
                </button>
              </div>
            </div>
          </div>

          {/* ── SIGNUP PANEL ── */}
          <div
            ref={signupRef}
            className={`auth-panel ${panelClass.signup}`}
            aria-hidden={!signupActive}
            inert={!signupActive ? '' : undefined}
          >
            <div className="auth-card">
              <CardLogo sub="Create admin account" />
              <h1 className="auth-card__heading">Create account</h1>
              <p className="auth-card__subheading">Register a new admin user</p>

              <SignupForm
                onSubmit={handleSignup}
                loading={signupLoading}
                serverError={signupError}
                onClearError={clearSignupError}
              />

              <div className="auth-switch">
                Already have an account?{' '}
                <button className="auth-switch__btn" onClick={goToLogin} type="button">
                  Log in
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
