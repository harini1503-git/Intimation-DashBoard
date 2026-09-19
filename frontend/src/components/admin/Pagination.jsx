/**
 * Pagination
 *
 * Props:
 *   total     — total records
 *   page      — current page (1-indexed)
 *   pageSize  — records per page
 *   onPage(n) — fn
 */
export default function Pagination({ total, page, pageSize, onPage }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1 && total <= pageSize) return null;

  const from = Math.min((page - 1) * pageSize + 1, total);
  const to   = Math.min(page * pageSize, total);

  // Build page number array with ellipsis
  const pages = buildPages(page, totalPages);

  return (
    <nav className="pagination" aria-label="Pagination">
      <span className="pagination__info">
        Showing {from}–{to} of {total} records
      </span>

      <div className="pagination__controls">
        <button
          className="page-btn"
          onClick={() => onPage(page - 1)}
          disabled={page === 1}
          aria-label="Previous page"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M7.5 2.5L4 6l3.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {pages.map((p, i) =>
          p === '…' ? (
            <span key={`ellipsis-${i}`} style={{ padding: '0 4px', color: 'var(--muted)', fontSize: 13 }}>…</span>
          ) : (
            <button
              key={p}
              className={`page-btn${p === page ? ' active' : ''}`}
              onClick={() => onPage(p)}
              aria-label={`Page ${p}`}
              aria-current={p === page ? 'page' : undefined}
            >
              {p}
            </button>
          )
        )}

        <button
          className="page-btn"
          onClick={() => onPage(page + 1)}
          disabled={page === totalPages}
          aria-label="Next page"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M4.5 2.5L8 6l-3.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </nav>
  );
}

/** Returns an array like [1, 2, 3, '…', 8, 9, 10] */
function buildPages(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages = [];
  const addPage = (n) => pages.push(n);
  const addEllipsis = () => { if (pages[pages.length - 1] !== '…') pages.push('…'); };

  addPage(1);
  if (current > 3) addEllipsis();
  for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) {
    addPage(p);
  }
  if (current < total - 2) addEllipsis();
  addPage(total);

  return pages;
}
