import { useEffect, useState } from "react";
import { storageApi } from "../api/storage";

// Shared S3-config status — same cache + subscriber pattern as the other
// integration hooks. "configured" means the user has saved creds and they
// verify. Until then the sidebar hides and the gate shows the settings form.
let _cache = null;
const _subs = new Set();
let _inflight = null;

function emit() { for (const cb of _subs) cb(_cache); }

async function fetchStatus() {
  if (_inflight) return _inflight;
  _inflight = storageApi.config()
    .then((r) => { _cache = r; emit(); return r; })
    .catch(() => { _cache = { configured: false }; emit(); return _cache; })
    .finally(() => { _inflight = null; });
  return _inflight;
}

export function refreshStorageStatus() {
  _cache = null;
  return fetchStatus();
}

export function useStorageStatus() {
  const [status, setStatus] = useState(_cache);
  const [loading, setLoading] = useState(_cache == null);

  useEffect(() => {
    const cb = (v) => { setStatus(v); setLoading(false); };
    _subs.add(cb);
    if (_cache == null) fetchStatus().then(() => setLoading(false));
    else setLoading(false);
    return () => { _subs.delete(cb); };
  }, []);

  return { status, loading, refresh: refreshStorageStatus };
}
