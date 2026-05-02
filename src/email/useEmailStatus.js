import { useEffect, useState } from "react";
import { emailApi } from "../api/email";

// Shared email-config status — same cache + subscriber pattern as the
// WhatsApp and Meta hooks so sidebar + gate stay in sync without hammering
// the API. "configured" means the user has saved AND verified SMTP creds.
let _cache = null;
const _subs = new Set();
let _inflight = null;

function emit() { for (const cb of _subs) cb(_cache); }

async function fetchStatus() {
  if (_inflight) return _inflight;
  _inflight = emailApi.stats()
    .then((r) => { _cache = { configured: !!r.configured }; emit(); return _cache; })
    .catch(() => { _cache = { configured: false }; emit(); return _cache; })
    .finally(() => { _inflight = null; });
  return _inflight;
}

export function refreshEmailStatus() {
  _cache = null;
  return fetchStatus();
}

export function useEmailStatus() {
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

  return { status, loading, refresh: refreshEmailStatus };
}
