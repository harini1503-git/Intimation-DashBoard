/**
 * EmptyState
 *
 * Props:
 *   onReset() — fn, clears all filters
 */
export default function EmptyState({ onReset }) {
  return (
    <div className="empty-state" role="status" aria-live="polite">
      <div className="empty-state__icon" aria-hidden="true">
        <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
          <rect x="3" y="5" width="20" height="17" rx="2.5" stroke="currentColor" strokeWidth="1.8"/>
          <path d="M3 10h20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          <path d="M8 15h10M8 18.5h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" opacity=".5"/>
        </svg>
      </div>
      <h3>No records found</h3>
      <p>No submissions match the current filters.<br />Try adjusting your search or filter criteria.</p>
      <button className="empty-state__reset" onClick={onReset} type="button">
        Clear all filters
      </button>
    </div>
  );
}
