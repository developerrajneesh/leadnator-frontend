import { useEffect, useState } from "react";
import { waApi } from "../api/whatsapp";

// Module-level cache + subscribers so every component that calls this hook
// shares the same status value. Saves a round-trip per render of the gate +
// sidebar + feature pages all mounting at the same time.
let _cache = null;
const _subs = new Set();
let _inflight = null;

function emit() { for (const cb of _subs) cb(_cache); }

async function fetchStatus() {
  if (_inflight) return _inflight;
  _inflight = waApi.status()
    .then((r) => { _cache = r; emit(); return r; })
    .catch(() => { _cache = { connected: false }; emit(); return _cache; })
    .finally(() => { _inflight = null; });
  return _inflight;
}

// Imperatively force a re-fetch (e.g. after Embedded Signup completes).
export function refreshWhatsAppStatus() {
  _cache = null;
  return fetchStatus();
}

// Hook — returns { status, loading, refresh }. Triggers a fetch on first mount
// and invalidates for every subscriber when the cache is refreshed elsewhere.
export function useWhatsAppStatus() {
  const [status, setStatus] = useState(_cache);
  const [loading, setLoading] = useState(_cache == null);

  useEffect(() => {
    const cb = (v) => { setStatus(v); setLoading(false); };
    _subs.add(cb);
    if (_cache == null) {
      fetchStatus().then(() => setLoading(false));
    } else {
      setLoading(false);
    }
    return () => { _subs.delete(cb); };
  }, []);

  return { status, loading, refresh: refreshWhatsAppStatus };
}
