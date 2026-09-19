import { useState, useCallback } from 'react';
import { loginRequest, signupRequest } from '../api/auth';

const TOKEN_KEY = 'intimation_admin_token';
const USER_KEY  = 'intimation_admin_user';

/**
 * Reads the stored token from localStorage.
 * @returns {string|null}
 */
export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Reads the stored user from localStorage.
 * @returns {{ id, name, email }|null}
 */
export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * useAuth — owns login / signup / logout state.
 *
 * Returns:
 *   user, token            — current session (null if logged out)
 *   isAuthenticated        — boolean convenience
 *   login(credentials)     — calls API, stores token, returns user
 *   signup(payload)        — calls API, auto-logs in, returns user
 *   logout()               — clears storage
 *   loginLoading / signupLoading
 *   loginError / signupError
 */
export default function useAuth() {
  const [token, setToken]   = useState(() => getStoredToken());
  const [user, setUser]     = useState(() => getStoredUser());
  const [loginLoading,  setLoginLoading]  = useState(false);
  const [signupLoading, setSignupLoading] = useState(false);
  const [loginError,    setLoginError]    = useState(null);
  const [signupError,   setSignupError]   = useState(null);

  const persist = useCallback((responseData) => {
    localStorage.setItem(TOKEN_KEY, responseData.token);
    localStorage.setItem(USER_KEY, JSON.stringify(responseData.user));
    setToken(responseData.token);
    setUser(responseData.user);
  }, []);

  const login = useCallback(async (credentials) => {
    setLoginLoading(true);
    setLoginError(null);
    try {
      const data = await loginRequest(credentials);
      persist(data);
      return data.user;
    } catch (err) {
      setLoginError(err.message);
      throw err;
    } finally {
      setLoginLoading(false);
    }
  }, [persist]);

  const signup = useCallback(async (payload) => {
    setSignupLoading(true);
    setSignupError(null);
    try {
      const data = await signupRequest(payload);
      // Auto-login after successful signup
      persist(data);
      return data.user;
    } catch (err) {
      setSignupError(err.message);
      throw err;
    } finally {
      setSignupLoading(false);
    }
  }, [persist]);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  return {
    user,
    token,
    isAuthenticated: !!token,
    login,
    signup,
    logout,
    loginLoading,
    signupLoading,
    loginError,
    signupError,
    clearLoginError:  () => setLoginError(null),
    clearSignupError: () => setSignupError(null),
  };
}
