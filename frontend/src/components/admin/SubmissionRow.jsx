import { TypeBadge, displayType } from './Badges';
import SubmissionDetailPanel from './SubmissionDetailPanel';

function empName(r) {
  return [r.firstName, r.middleName, r.surname].filter(Boolean).join(' ');
}

function fmt(dateStr) {
  if (!dateStr) return { date: '—', time: '—' };
  const d = new Date(dateStr);
  return {
    date: d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    time: d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
  };
}

export default function SubmissionRow({ record, isExpanded, onToggle }) {
  const { date, time } = fmt(record.submittedAt || record.createdAt);
  const type = displayType(record);

  return (
    <>
      <tr
        className={`submission-row${isExpanded ? ' is-expanded' : ''}`}
        onClick={onToggle}
        aria-expanded={isExpanded}
        tabIndex={0}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onToggle()}
        role="row"
      >
        <td data-label="Submitted" className="td-submitted">
          <span className="td-submitted__date">{date}</span>
          <span className="td-submitted__time">{time}</span>
        </td>

        <td data-label="Type"><TypeBadge type={type} /></td>

        <td data-label="Employee">
          <div className="td-employee__name">{empName(record)}</div>
          <div className="td-employee__code">{record.employeeCode}</div>
        </td>

        <td data-label="Policy No." className="td-mono">{record.policyNumber}</td>

        <td data-label="Patient">
          <div className="td-patient__name">{record.patientName}</div>
          <div className="td-patient__rel">{record.relationship}</div>
        </td>

        <td data-label="Email" className="td-email">
          {record.email || <span className="td-empty">—</span>}
        </td>

        <td
          className="td-chevron"
          onClick={(e) => { e.stopPropagation(); onToggle(); }}
        >
          <button
            className={`chevron-btn${isExpanded ? ' open' : ''}`}
            aria-label={isExpanded ? 'Collapse details' : 'Expand details'}
            tabIndex={-1}
            type="button"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.8"
                    strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </td>
      </tr>

      {isExpanded && (
        <tr className="detail-panel-row" aria-live="polite">
          <td colSpan={7}>
            <SubmissionDetailPanel record={record} />
          </td>
        </tr>
      )}
    </>
  );
}
