import { useState, useEffect } from 'react';
import AuthPage from './pages/AuthPage';
import AdminPage from './pages/AdminPage';
import { getStoredToken, getStoredUser } from './hooks/useAuth';
import './styles/auth.css';
import './styles/admin.css';

/**
 * App
 *
 * Simple client-side route guard:
 *   - If a valid token exists in localStorage → show AdminPage
 *   - Otherwise → show AuthPage (login/signup)
 *
 * No external router dependency needed for this single-protected-route setup.
 */
export default function App() {
  const [authed, setAuthed] = useState(false);
  const [user,   setUser]   = useState(null);

  // Rehydrate from localStorage on mount
  useEffect(() => {
    const token = getStoredToken();
    const storedUser = getStoredUser();
    if (token && storedUser) {
      setAuthed(true);
      setUser(storedUser);
    }
  }, []);

  const handleAuthenticated = (u) => {
    setUser(u);
    setAuthed(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('intimation_admin_token');
    localStorage.removeItem('intimation_admin_user');
    setAuthed(false);
    setUser(null);
  };

  if (!authed) {
    return <AuthPage onAuthenticated={handleAuthenticated} />;
  }

  return <AdminPage user={user} onLogout={handleLogout} />;
}
