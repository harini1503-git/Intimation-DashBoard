import { useState, useCallback } from 'react';
import SubmissionRow from './SubmissionRow';
import EmptyState from './EmptyState';

const COLUMNS = [
  { key: 'submitted', label: 'Submitted' },
  { key: 'type',      label: 'Type' },
  { key: 'employee',  label: 'Employee' },
  { key: 'policy',    label: 'Policy No.' },
  { key: 'patient',   label: 'Patient' },
  { key: 'email',     label: 'Email' },
  { key: 'expand',    label: '' },
];

/**
 * SubmissionTable
 *
 * Props:
 *   records         — array of submission objects
 *   loading         — bool
 *   error           — string | null
 *   onStatusChange(id, status) — fn
 *   updatingIds     — Set<string>
 *   onClearFilters  — fn (for empty state reset button)
 */
export default function SubmissionTable({
  records, loading, error,
  onClearFilters,
}) {
  const [expandedId, setExpandedId] = useState(null);

  const toggle = useCallback((id) => {
    setExpandedId((cur) => (cur === id ? null : id));
  }, []);

  // Close expanded row when records change (e.g. page/filter change)
  // Only close if the expanded record is no longer in the list
  const ids = new Set(records.map((r) => r._id));
  if (expandedId && !ids.has(expandedId)) {
    setExpandedId(null);
  }

  if (loading) {
    return (
      <div className="submissions-table-wrap">
        <div className="table-overlay" role="status" aria-label="Loading submissions">
          <div className="table-overlay__spinner" aria-hidden="true" />
          <p style={{ color: 'var(--muted)', fontSize: '13.5px', margin: 0 }}>Loading submissions…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="submissions-table-wrap">
        <div className="table-overlay">
          <div className="table-overlay__error" role="alert">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <circle cx="8" cy="8" r="7" stroke="#b91c1c" strokeWidth="1.5"/>
              <path d="M8 5v3.5M8 10.5v.5" stroke="#b91c1c" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="submissions-table-wrap">
        <EmptyState onReset={onClearFilters} />
      </div>
    );
  }

  return (
    <div className="submissions-table-wrap">
      <table className="submissions-table" aria-label="Submission records">
        <thead>
          <tr>
            {COLUMNS.map(({ key, label }) => (
              <th key={key} scope="col">{label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <SubmissionRow
              key={record._id}
              record={record}
              isExpanded={expandedId === record._id}
              onToggle={() => toggle(record._id)}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
