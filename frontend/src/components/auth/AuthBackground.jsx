/**
 * AuthBackground
 *
 * Layered animated background:
 *   1. Deep navy base gradient
 *   2. Aurora bands  — large blurred ellipses that drift slowly
 *   3. Floating particles — tiny dots rising from bottom
 *   4. Fine grid overlay
 *   5. Moving scan-line shimmer
 *
 * Everything is CSS-driven.  The aurora bands use nth-child to get
 * different sizes / speeds / colours from a single class.
 */
export default function AuthBackground() {
  return (
    <div className="auth-bg" aria-hidden="true">
      {/* ── 1. base gradient ── */}
      <div className="auth-bg__gradient" />

      {/* ── 2. aurora bands (4 blobs) ── */}
      <div className="auth-bg__aurora">
        <div className="auth-bg__aurora-band" />
        <div className="auth-bg__aurora-band" />
        <div className="auth-bg__aurora-band" />
        <div className="auth-bg__aurora-band" />
      </div>

      {/* ── 3. rising particles ── */}
      <div className="auth-bg__particles">
        <div className="auth-particle" />
        <div className="auth-particle" />
        <div className="auth-particle" />
        <div className="auth-particle" />
        <div className="auth-particle" />
        <div className="auth-particle" />
        <div className="auth-particle" />
        <div className="auth-particle" />
      </div>

      {/* ── 4. fine grid ── */}
      <div className="auth-bg__grid" />

      {/* ── 5. scan-line shimmer ── */}
      <div className="auth-bg__scanline" />
    </div>
  );
}
