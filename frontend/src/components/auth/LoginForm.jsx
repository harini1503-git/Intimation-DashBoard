import { useState } from 'react';

const EMAIL_RE = /^\S+@\S+\.\S+$/;

/**
 * LoginForm
 *
 * Props:
 *   onSubmit(credentials)  — async fn returning the logged-in user
 *   loading                — bool
 *   serverError            — string | null
 *   onClearError           — fn
 *   signupSuccess          — bool  (shows "account created" toast)
 */
export default function LoginForm({ onSubmit, loading, serverError, onClearError, signupSuccess }) {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [touched,  setTouched]  = useState({ email: false, password: false });

  const emailErr    = touched.email    && !EMAIL_RE.test(email)   ? 'Enter a valid email address.' : '';
  const passwordErr = touched.password && password.length < 1     ? 'Password is required.' : '';
  const canSubmit   = EMAIL_RE.test(email) && password.length > 0 && !loading;

  const blur = (field) => setTouched((t) => ({ ...t, [field]: true }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    if (!canSubmit) return;
    onClearError();
    await onSubmit({ email, password });
  };

  return (
    <>
      {signupSuccess && (
        <div className="auth-success-toast" role="status">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M3 8l3.5 3.5L13 4.5" stroke="#065f46" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Account created successfully — please log in.
        </div>
      )}

      {serverError && (
        <div className="auth-error-banner" role="alert">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <circle cx="8" cy="8" r="7" stroke="#b91c1c" strokeWidth="1.5"/>
            <path d="M8 5v3.5M8 10.5v.5" stroke="#b91c1c" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          {serverError}
        </div>
      )}

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <div className="auth-field">
          <label className="auth-field__label" htmlFor="login-email">Email address</label>
          <input
            id="login-email"
            type="email"
            className={`auth-field__input${emailErr ? ' is-error' : ''}`}
            placeholder="you@example.com"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => blur('email')}
            disabled={loading}
            aria-describedby={emailErr ? 'login-email-err' : undefined}
            aria-invalid={!!emailErr}
          />
          {emailErr && (
            <span id="login-email-err" className="auth-field__error" role="alert">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <circle cx="6" cy="6" r="5.25" stroke="#e0433a" strokeWidth="1.5"/>
                <path d="M6 3.5v2.8M6 7.8v.5" stroke="#e0433a" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              {emailErr}
            </span>
          )}
        </div>

        <div className="auth-field">
          <label className="auth-field__label" htmlFor="login-password">Password</label>
          <input
            id="login-password"
            type="password"
            className={`auth-field__input${passwordErr ? ' is-error' : ''}`}
            placeholder="Enter your password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => blur('password')}
            disabled={loading}
            aria-describedby={passwordErr ? 'login-pw-err' : undefined}
            aria-invalid={!!passwordErr}
          />
          {passwordErr && (
            <span id="login-pw-err" className="auth-field__error" role="alert">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <circle cx="6" cy="6" r="5.25" stroke="#e0433a" strokeWidth="1.5"/>
                <path d="M6 3.5v2.8M6 7.8v.5" stroke="#e0433a" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              {passwordErr}
            </span>
          )}
        </div>

        <button type="submit" className="auth-btn" disabled={loading} aria-busy={loading}>
          {loading ? (
            <>
              <span className="auth-btn__spinner" aria-hidden="true" />
              Signing in…
            </>
          ) : 'Sign in'}
        </button>
      </form>
    </>
  );
}
