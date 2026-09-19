import { getStoredToken } from '../hooks/useAuth';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function authHeaders() {
  const token = getStoredToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/**
 * GET /api/admin/submissions
 * @param {{ type?, dateFrom?, dateTo?, search?, page?, pageSize? }} params
 */
export async function fetchSubmissions(params = {}) {
  const qs = new URLSearchParams();
  if (params.type)     qs.set('type',     params.type);
  if (params.dateFrom) qs.set('dateFrom', params.dateFrom);
  if (params.dateTo)   qs.set('dateTo',   params.dateTo);
  if (params.search)   qs.set('search',   params.search);
  if (params.page)     qs.set('page',     String(params.page));
  if (params.pageSize) qs.set('pageSize', String(params.pageSize));

  const res = await fetch(`${BASE_URL}/api/admin/submissions?${qs}`, {
    headers: authHeaders(),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch submissions.');
  return data;
}

/**
 * PATCH /api/admin/submissions/:id/status
 */
export async function updateSubmissionStatus(id, status) {
  const res = await fetch(`${BASE_URL}/api/admin/submissions/${id}/status`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ status }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update status.');
  return data;
}
