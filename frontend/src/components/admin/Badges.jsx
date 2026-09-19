/**
 * displayType(record)
 * Derives the dashboard label from the flat formType + intimationFor fields.
 * Exported so SubmissionRow and DetailPanel can use it without duplicating logic.
 */
export function displayType(r) {
  if (!r) return '';
  if (r.formType === 'GPA') {
    return r.intimationFor === 'GPABrillexStaff' ? 'GPA Brillex Staff' : 'Personal Accident';
  }
  // GMC variants
  if (r.intimationFor === 'Marketing')    return 'Marketing Mediclaim';
  if (r.intimationFor === 'BrillexStaff') return 'GMC Brillex Staff';
  return 'Staff Mediclaim';   // Staff, or any other GMC value
}

/**
 * TypeBadge — accepts the derived display-label string
 */
export function TypeBadge({ type }) {
  const map = {
    'Staff Mediclaim':      'badge--staff-mediclaim',
    'Marketing Mediclaim':  'badge--marketing-mediclaim',
    'Personal Accident':    'badge--personal-accident',
    'GMC Brillex Staff':    'badge--gmc-brillex',
    'GPA Brillex Staff':    'badge--gpa-brillex',
  };
  return <span className={`badge ${map[type] || ''}`}>{type}</span>;
}

/**
 * StatusBadge
 */
export function StatusBadge({ status }) {
  const map = {
    'Pending':      'badge--pending',
    'Under review': 'badge--under-review',
    'Approved':     'badge--approved',
    'Rejected':     'badge--rejected',
  };
  const dot = { 'Pending':'●','Under review':'●','Approved':'✓','Rejected':'✕' }[status] ?? '●';
  return (
    <span className={`badge ${map[status] || ''}`} aria-label={`Status: ${status}`}>
      <span aria-hidden="true" style={{ fontSize: '8px', verticalAlign: 'middle' }}>{dot}</span>
      {status}
    </span>
  );
}
