import { useCallback, useEffect, useState } from "react";
import { api, getStoredUser } from "./client";

// ---------- CURRENT USER ----------
export function useCurrentUser() {
  return getStoredUser() || { name: "Guest", email: "", plan: "Starter", role: "user" };
}

// ---------- LEADS ----------
// Module-level cache so multiple pages don't re-fetch on every mount.
let _leadsCache = null;
let _leadsInFlight = null;
const _leadsSubs = new Set();

function emitLeads() {
  _leadsSubs.forEach((cb) => cb(_leadsCache));
}

async function fetchLeads(force = false) {
  if (!force && _leadsCache) return _leadsCache;
  if (_leadsInFlight) return _leadsInFlight;
  _leadsInFlight = api.leads.list()
    .then((res) => {
      _leadsCache = res.leads || [];
      emitLeads();
      return _leadsCache;
    })
    .finally(() => { _leadsInFlight = null; });
  return _leadsInFlight;
}

export function useLeads() {
  const [leads, setLeads] = useState(_leadsCache || []);
  const [loading, setLoading] = useState(!_leadsCache);
  const [error, setError] = useState("");

  useEffect(() => {
    const cb = (data) => setLeads(data || []);
    _leadsSubs.add(cb);

    if (!_leadsCache) {
      fetchLeads()
        .catch((e) => setError(e.message || "Failed to load leads."))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }

    return () => { _leadsSubs.delete(cb); };
  }, []);

  const reload = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      await fetchLeads(true);
    } catch (e) {
      setError(e.message || "Failed to reload leads.");
    } finally {
      setLoading(false);
    }
  }, []);

  const addLead = useCallback(async (payload) => {
    const res = await api.leads.create(payload);
    _leadsCache = [res.lead, ...(_leadsCache || [])];
    emitLeads();
    return res.lead;
  }, []);

  const updateLead = useCallback(async (id, patch) => {
    const res = await api.leads.update(id, patch);
    _leadsCache = (_leadsCache || []).map((l) => (l.id === id ? res.lead : l));
    emitLeads();
    return res.lead;
  }, []);

  const removeLead = useCallback(async (id) => {
    await api.leads.remove(id);
    _leadsCache = (_leadsCache || []).filter((l) => l.id !== id);
    emitLeads();
  }, []);

  return { leads, loading, error, reload, addLead, updateLead, removeLead };
}

export function invalidateLeads() {
  _leadsCache = null;
}
