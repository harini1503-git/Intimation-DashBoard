const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * POST /api/auth/login
 * @param {{ email: string, password: string }} credentials
 * @returns {{ token: string, user: { id, name, email } }}
 */
export async function loginRequest({ email, password }) {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Login failed.');
  return data;
}

/**
 * POST /api/auth/signup
 * @param {{ name: string, email: string, password: string }} payload
 * @returns {{ token: string, user: { id, name, email } }}
 */
export async function signupRequest({ name, email, password }) {
  const res = await fetch(`${BASE_URL}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Sign up failed.');
  return data;
}
