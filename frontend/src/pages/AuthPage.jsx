import useAuth from '../hooks/useAuth';
import AuthCard from '../components/auth/AuthCard';
import '../styles/auth.css';

/**
 * AuthPage
 *
 * A thin wrapper that instantiates useAuth and passes it into AuthCard.
 * On success it calls onAuthenticated(user) so App can switch views.
 *
 * Props:
 *   onAuthenticated(user) — fn called on both successful login and signup
 */
export default function AuthPage({ onAuthenticated }) {
  const auth = useAuth();

  // If already authenticated (e.g. page refresh with stored token), skip
  if (auth.isAuthenticated) {
    onAuthenticated(auth.user);
    return null;
  }

  return (
    <AuthCard
      useAuthHook={auth}
      onLoginSuccess={onAuthenticated}
      onSignupSuccess={onAuthenticated}
    />
  );
}
