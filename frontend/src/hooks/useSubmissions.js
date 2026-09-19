import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchSubmissions, updateSubmissionStatus } from '../api/submissions';

const PAGE_SIZE = 6;
const DEBOUNCE_MS = 350;

export default function useSubmissions() {
  const [filters, setFilters] = useState({
    type:      '',
    dateFrom:  '',
    dateTo:    '',
    search:    '',
    page:      1,
  });

  const [records,    setRecords]    = useState([]);
  const [total,      setTotal]      = useState(0);
  const [typeCounts, setTypeCounts] = useState({});
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState(null);
  const [updatingIds, setUpdatingIds] = useState(new Set());

  // rawSearch holds the live input value; debounced into filters.search
  const [rawSearch, setRawSearch] = useState('');
  const debounceRef = useRef(null);
  const abortRef    = useRef(null);

  // ── debounce search ──
  // BUG FIX: do NOT trim rawSearch here — trimming strips trailing spaces and
  // makes the input feel broken when the user presses Space.
  // Trimming happens server-side in the controller.
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setFilters((f) => ({ ...f, search: rawSearch, page: 1 }));
    }, DEBOUNCE_MS);
    return () => clearTimeout(debounceRef.current);
  }, [rawSearch]);

  // ── fetch on any filter change ──
  useEffect(() => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchSubmissions({
          type:      filters.type,
          dateFrom:  filters.dateFrom,
          dateTo:    filters.dateTo,
          search:    filters.search,
          page:      filters.page,
          pageSize:  PAGE_SIZE,
        });
        if (!cancelled) {
          setRecords(data.records);
          setTotal(data.total);
          setTypeCounts(data.typeCounts || {});
        }
      } catch (err) {
        if (!cancelled && err.name !== 'AbortError') setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; controller.abort(); };
  }, [filters]);

  // ── setters ──
  const setType     = useCallback((v) => setFilters((f) => ({ ...f, type: v,     page: 1 })), []);
  const setDateFrom = useCallback((v) => setFilters((f) => ({ ...f, dateFrom: v, page: 1 })), []);
  const setDateTo   = useCallback((v) => setFilters((f) => ({ ...f, dateTo: v,   page: 1 })), []);
  const setPage     = useCallback((n) => setFilters((f) => ({ ...f, page: n })), []);
  const setSearch   = useCallback((v) => setRawSearch(v), []);

  const clearFilters = useCallback(() => {
    setRawSearch('');
    setFilters({ type: '', dateFrom: '', dateTo: '', search: '', page: 1 });
  }, []);

  // ── optimistic status update ──
  const updateStatus = useCallback(async (id, newStatus) => {
    if (updatingIds.has(id)) return;
    const prev = records;
    setRecords((rs) => rs.map((r) => (r._id === id ? { ...r, status: newStatus } : r)));
    setUpdatingIds((s) => new Set([...s, id]));
    try {
      const { record } = await updateSubmissionStatus(id, newStatus);
      setRecords((rs) => rs.map((r) => (r._id === id ? record : r)));
    } catch (err) {
      setRecords(prev);
      setError(err.message);
    } finally {
      setUpdatingIds((s) => { const n = new Set(s); n.delete(id); return n; });
    }
  }, [records, updatingIds]);

  return {
    records, total, typeCounts,
    loading, error,
    filters, rawSearch, pageSize: PAGE_SIZE,
    setType, setDateFrom, setDateTo, setSearch, setPage,
    clearFilters,
    updateStatus, updatingIds,
  };
}
