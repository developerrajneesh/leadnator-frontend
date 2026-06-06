import { useCallback, useEffect, useState } from "react";
import { api } from "./client";

export const calApi = {
  events:        (q)        => api.get("/calendar/events", q || undefined),
  createEvent:   (body)     => api.post("/calendar/events", body),
  updateEvent:   (id, body) => api.put(`/calendar/events/${id}`, body),
  deleteEvent:   (id)       => api.del(`/calendar/events/${id}`),

  availability:        ()    => api.get("/calendar/availability"),
  saveAvailability:    (b)   => api.put("/calendar/availability", b),

  bookingTypes:        ()        => api.get("/calendar/booking-types"),
  createBookingType:   (b)       => api.post("/calendar/booking-types", b),
  updateBookingType:   (id, b)   => api.put(`/calendar/booking-types/${id}`, b),
  deleteBookingType:   (id)      => api.del(`/calendar/booking-types/${id}`),

  // Google Calendar / Meet
  googleStatus:        ()        => api.get("/calendar/google/status"),
  googleConnect:       ()        => api.get("/calendar/google/connect"),
  googleDisconnect:    ()        => api.post("/calendar/google/disconnect"),
};

// ---- shared in-memory events cache so multiple pages don't refetch ----
let _cache = null;
let _inFlight = null;
const _subs = new Set();

function emit() { _subs.forEach((cb) => cb(_cache)); }

async function fetchEvents(force = false) {
  if (!force && _cache) return _cache;
  if (_inFlight) return _inFlight;
  _inFlight = calApi.events()
    .then((res) => { _cache = res.events || []; emit(); return _cache; })
    .finally(() => { _inFlight = null; });
  return _inFlight;
}

export function useEvents() {
  const [events, setEvents] = useState(_cache || []);
  const [loading, setLoading] = useState(!_cache);
  const [error, setError] = useState("");

  useEffect(() => {
    const cb = (data) => setEvents(data || []);
    _subs.add(cb);
    if (!_cache) {
      fetchEvents().catch((e) => setError(e.message)).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
    return () => { _subs.delete(cb); };
  }, []);

  const reload = useCallback(async () => {
    setLoading(true); setError("");
    try { await fetchEvents(true); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  const addEvent = useCallback(async (payload) => {
    const r = await calApi.createEvent(payload);
    _cache = [...(_cache || []), r.event].sort((a, b) => new Date(a.start) - new Date(b.start));
    emit();
    return r.event;
  }, []);

  const updateEvent = useCallback(async (id, patch) => {
    const r = await calApi.updateEvent(id, patch);
    _cache = (_cache || []).map((e) => (e.id === id ? r.event : e));
    emit();
    return r.event;
  }, []);

  const removeEvent = useCallback(async (id) => {
    await calApi.deleteEvent(id);
    _cache = (_cache || []).filter((e) => e.id !== id);
    emit();
  }, []);

  return { events, loading, error, reload, addEvent, updateEvent, removeEvent };
}

export function invalidateEvents() { _cache = null; }
