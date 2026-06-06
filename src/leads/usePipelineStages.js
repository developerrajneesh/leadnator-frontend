import { useEffect, useState } from "react";
import { api, getStoredOrg } from "../api/client";
import { DEFAULT_PIPELINE_STAGES, normalizePipelineStages } from "./constants";

let _cache = null;
let _cacheOrgId = null;
const _subs = new Set();
let _inflight = null;

function currentOrgKey() {
  return getStoredOrg()?.id || "none";
}

function emit() {
  for (const cb of _subs) cb(_cache);
}

function applyStages(stages) {
  _cache = Array.isArray(stages) && stages.length
    ? normalizePipelineStages(stages)
    : DEFAULT_PIPELINE_STAGES.map((s) => ({ ...s }));
  emit();
  return _cache;
}

export async function fetchPipelineStages(force = false) {
  const orgKey = currentOrgKey();
  if (!force && _cache && _cacheOrgId === orgKey) return _cache;
  if (force) _inflight = null;
  if (_inflight) return _inflight;
  _inflight = api.leads.settings()
    .then((r) => {
      _cacheOrgId = orgKey;
      return applyStages(r.settings?.pipelineStages);
    })
    .catch(() => {
      _cacheOrgId = orgKey;
      return applyStages(null);
    })
    .finally(() => { _inflight = null; });
  return _inflight;
}

/** Apply stages immediately (e.g. right after save) then optionally refetch. */
export function setPipelineStagesCache(stages) {
  return applyStages(stages);
}

export function refreshPipelineStages() {
  _cache = null;
  _cacheOrgId = null;
  _inflight = null;
  return fetchPipelineStages(true);
}

export function usePipelineStages() {
  const [stages, setStages] = useState(_cache || DEFAULT_PIPELINE_STAGES);
  const [loading, setLoading] = useState(_cache == null);

  useEffect(() => {
    const cb = (v) => {
      if (v) setStages(v);
      setLoading(false);
    };
    _subs.add(cb);
    if (_cache == null) {
      fetchPipelineStages().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
    return () => { _subs.delete(cb); };
  }, []);

  return { stages, loading, refresh: refreshPipelineStages };
}

export function stageByKey(stages, key) {
  return stages.find((s) => s.key === key) || { key, label: key, color: "#6b7280" };
}

export function stageLabel(stages, key) {
  return stageByKey(stages, key).label || key;
}

/** Inline badge styles for dynamic pipeline keys */
export function stageBadgeStyle(stages, key) {
  const c = stageByKey(stages, key).color || "#6b7280";
  return {
    background: `${c}22`,
    color: c,
    border: `1px solid ${c}44`,
  };
}
