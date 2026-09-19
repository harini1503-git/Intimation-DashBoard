import { useState } from 'react';

const EMAIL_RE = /^\S+@\S+\.\S+$/;

/**
 * SignupForm
 *
 * Props:
 *   onSubmit(payload)   — async fn returning the signed-up user
 *   loading             — bool
 *   serverError         — string | null
 *   onClearError        — fn
 */
export default function SignupForm({ onSubmit, loading, serverError, onClearError }) {
  const [fields, setFields] = useState({ name: '', email: '', password: '', confirm: '' });
  const [touched, setTouched] = useState({ name: false, email: false, password: false, confirm: false });

  const set = (field) => (e) => setFields((f) => ({ ...f, [field]: e.target.value }));
  const blur = (field) => () => setTouched((t) => ({ ...t, [field]: true }));

  const errors = {
    name:     touched.name     && fields.name.trim().length < 2   ? 'Full name is required.' : '',
    email:    touched.email    && !EMAIL_RE.test(fields.email)     ? 'Enter a valid email address.' : '',
    password: touched.password && fields.password.length < 8      ? 'Password must be at least 8 characters.' : '',
    confirm:  touched.confirm  && fields.confirm !== fields.password ? 'Passwords do not match.' : '',
  };

  const canSubmit =
    fields.name.trim().length >= 2 &&
    EMAIL_RE.test(fields.email) &&
    fields.password.length >= 8 &&
    fields.confirm === fields.password &&
    !loading;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ name: true, email: true, password: true, confirm: true });
    if (!canSubmit) return;
    onClearError();
    await onSubmit({ name: fields.name.trim(), email: fields.email, password: fields.password });
  };

  const renderField = ({ id, label, type = 'text', field, autocomplete, placeholder }) => (
    <div className="auth-field" key={field}>
      <label className="auth-field__label" htmlFor={id}>{label}</label>
      <input
        id={id}
        type={type}
        className={`auth-field__input${errors[field] ? ' is-error' : ''}`}
        placeholder={placeholder}
        autoComplete={autocomplete}
        value={fields[field]}
        onChange={set(field)}
        onBlur={blur(field)}
        disabled={loading}
        aria-describedby={errors[field] ? `${id}-err` : undefined}
        aria-invalid={!!errors[field]}
      />
      {errors[field] && (
        <span id={`${id}-err`} className="auth-field__error" role="alert">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <circle cx="6" cy="6" r="5.25" stroke="#e0433a" strokeWidth="1.5"/>
            <path d="M6 3.5v2.8M6 7.8v.5" stroke="#e0433a" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          {errors[field]}
        </span>
      )}
    </div>
  );

  return (
    <>
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
        {renderField({ id: 'su-name',     label: 'Full name',        field: 'name',     autocomplete: 'name',         placeholder: 'Your full name' })}
        {renderField({ id: 'su-email',    label: 'Email address',    field: 'email',    autocomplete: 'email',        placeholder: 'you@example.com',     type: 'email' })}
        {renderField({ id: 'su-password', label: 'Password',         field: 'password', autocomplete: 'new-password', placeholder: 'Min. 8 characters',    type: 'password' })}
        {renderField({ id: 'su-confirm',  label: 'Confirm password', field: 'confirm',  autocomplete: 'new-password', placeholder: 'Repeat your password', type: 'password' })}

        <button type="submit" className="auth-btn" disabled={loading} aria-busy={loading}>
          {loading ? (
            <>
              <span className="auth-btn__spinner" aria-hidden="true" />
              Creating account…
            </>
          ) : 'Create account'}
        </button>
      </form>
    </>
  );
}
