/**
 * FilterBar
 *
 * Tabs: All | Staff Mediclaim | Marketing Mediclaim | GMC Brillex Staff |
 *             Personal Accident | GPA Brillex Staff
 * Controls: search input, date-from, date-to, Export
 * Status filter removed per UX spec.
 */

const TYPES = [
  { value: '',                       label: 'All Types' },
  { value: 'Staff Mediclaim',        label: 'Staff Mediclaim' },
  { value: 'Marketing Mediclaim',    label: 'Marketing Mediclaim' },
  { value: 'GMC Brillex Staff',      label: 'GMC Brillex Staff' },
  { value: 'Personal Accident',      label: 'Personal Accident' },
  { value: 'GPA Brillex Staff',      label: 'GPA Brillex Staff' },
];

export default function FilterBar({
  activeType, onTypeChange, typeCounts,
  dateFrom, onDateFromChange,
  dateTo,   onDateToChange,
  search,   onSearchChange,
  onExport,
}) {
  const totalAll = Object.values(typeCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="filter-bar" role="navigation" aria-label="Submission filters">

      {/* ── Type tabs ── */}
      <div className="filter-bar__tabs" role="tablist" aria-label="Form type">
        {TYPES.map(({ value, label }) => {
          const count    = value === '' ? totalAll : (typeCounts[value] ?? 0);
          const isActive = activeType === value;
          return (
            <button
              key={value}
              role="tab"
              aria-selected={isActive}
              className={`filter-tab${isActive ? ' active' : ''}`}
              onClick={() => onTypeChange(value)}
              type="button"
            >
              {label}
              <span className="filter-tab__count">{count}</span>
            </button>
          );
        })}
      </div>

      {/* ── Controls row ── */}
      <div className="filter-bar__controls">

        {/* Search */}
        <div className="filter-bar__search-wrap">
          <span className="filter-bar__search-icon" aria-hidden="true">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="6" cy="6" r="4.5" stroke="#6b7a99" strokeWidth="1.5"/>
              <path d="M9.5 9.5l2.5 2.5" stroke="#6b7a99" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </span>
          <input
            type="search"
            className="filter-bar__search"
            placeholder="Search employee, policy no., patient…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Search submissions"
          />
        </div>

        {/* Date range */}
        <div className="filter-bar__date-wrap" role="group" aria-label="Date range filter">
          <span className="filter-bar__date-label">From</span>
          <input
            type="date"
            className="filter-bar__date"
            value={dateFrom}
            onChange={(e) => onDateFromChange(e.target.value)}
            aria-label="From date"
          />
          <span className="filter-bar__date-sep">—</span>
          <span className="filter-bar__date-label">To</span>
          <input
            type="date"
            className="filter-bar__date"
            value={dateTo}
            onChange={(e) => onDateToChange(e.target.value)}
            aria-label="To date"
          />
        </div>

        {/* Export */}
        <button
          className="filter-bar__export"
          onClick={onExport}
          type="button"
          aria-label="Export visible records as CSV"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M7 1v8M4 6l3 3 3-3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 11h10" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          Export
        </button>
      </div>
    </div>
  );
}
