import useSubmissions from '../hooks/useSubmissions';
import FilterBar from '../components/admin/FilterBar';
import SubmissionTable from '../components/admin/SubmissionTable';
import Pagination from '../components/admin/Pagination';
import { exportToCsv } from '../utils/exportCsv';

/* ── avatar helpers ──────────────────────────────────────── */

/** Extract up to 2 initials from a full name: "Harini Mudaliar" → "HM" */
function getInitials(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

/**
 * Deterministic color from initials so the same user always gets the same hue.
 * Picks from a curated palette of saturated but professional colours.
 */
const AVATAR_COLORS = [
  '#1a56db', '#0d7a7a', '#7c3aed', '#b45309',
  '#0f766e', '#be185d', '#1d4ed8', '#047857',
  '#9333ea', '#c2410c', '#0369a1', '#65a30d',
];
function avatarColor(initials) {
  let hash = 0;
  for (let i = 0; i < initials.length; i++) hash = initials.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

/* ─────────────────────────────────────────────────────────── */

export default function AdminPage({ user, onLogout }) {
  const {
    records, total, typeCounts,
    loading, error,
    filters, rawSearch, pageSize,
    setType, setDateFrom, setDateTo, setSearch, setPage,
    clearFilters,
    updateStatus, updatingIds,
  } = useSubmissions();

  const initials = getInitials(user?.name || '');
  const bgColor  = avatarColor(initials);

  const handleExport = () => exportToCsv(records);

  return (
    <div className="admin-page">

      {/* ══ Header ══════════════════════════════════════════ */}
      <header className="admin-header">

        {/* Brand */}
        <div className="admin-header__brand">
          <div className="admin-header__logo" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 22 22" fill="none">
              <path
                d="M11 2.5L4 5.5v5.5c0 4 3.1 7.6 7 8.7 3.9-1.1 7-4.7 7-8.7V5.5L11 2.5z"
                stroke="white" strokeWidth="1.6" strokeLinejoin="round"
              />
              <path d="M8 11h6M11 8v6" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <span className="admin-header__title">GMC / GPA Portal</span>
            <span className="admin-header__subtitle">Intimation Dashboard</span>
          </div>
        </div>

        {/* User area */}
        <div className="admin-header__user">

          {/* Avatar circle with initials */}
          {initials && (
            <div
              className="admin-header__avatar"
              style={{ background: bgColor }}
              title={user?.name}
              aria-label={`Logged in as ${user?.name}`}
            >
              {initials}
            </div>
          )}

          {user && (
            <div className="admin-header__user-info">
              <span className="admin-header__user-name">{user.name}</span>
              <span className="admin-header__user-role">Admin</span>
            </div>
          )}

          <div className="admin-header__divider" aria-hidden="true" />

          <button className="admin-header__logout" onClick={onLogout} type="button">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
              <path d="M5 1.5H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              <path d="M9 9.5l2.5-3L9 3.5M11.5 6.5H5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Sign out</span>
          </button>
        </div>
      </header>

      {/* ══ Content ═════════════════════════════════════════ */}
      <main className="admin-content">

        <div className="admin-title-row">
          <h1>Intimation Submissions</h1>
          {!loading && (
            <span className="admin-record-count">
              {total} record{total !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        <FilterBar
          activeType={filters.type}
          onTypeChange={setType}
          typeCounts={typeCounts}
          dateFrom={filters.dateFrom}
          onDateFromChange={setDateFrom}
          dateTo={filters.dateTo}
          onDateToChange={setDateTo}
          search={rawSearch}
          onSearchChange={setSearch}
          onExport={handleExport}
        />

        <SubmissionTable
          records={records}
          loading={loading}
          error={error}
          onClearFilters={clearFilters}
        />

        <Pagination
          total={total}
          page={filters.page}
          pageSize={pageSize}
          onPage={setPage}
        />

      </main>
    </div>
  );
}
