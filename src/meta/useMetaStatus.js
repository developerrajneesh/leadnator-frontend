import { useEffect, useState } from "react";
import { metaApi } from "../api/meta";

// Shared Meta-connection status — mirrors useWhatsAppStatus. Module-level
// cache + subscriber pattern so the gate, sidebar, and feature pages share
// one network call and all stay in sync when the status changes.
let _cache = null;
const _subs = new Set();
let _inflight = null;

function emit() { for (const cb of _subs) cb(_cache); }

async function fetchStatus() {
  if (_inflight) return _inflight;
  _inflight = metaApi.status()
    .then((r) => { _cache = r; emit(); return r; })
    .catch(() => { _cache = { connected: false }; emit(); return _cache; })
    .finally(() => { _inflight = null; });
  return _inflight;
}

export function refreshMetaStatus() {
  _cache = null;
  return fetchStatus();
}

export function useMetaStatus() {
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

  return { status, loading, refresh: refreshMetaStatus };
}
