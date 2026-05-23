const draftKey = (roomId) => `booking-draft-${roomId}`;

export function saveBookingDraft(roomId, draft) {
  if (!roomId || !draft) return;
  try {
    sessionStorage.setItem(draftKey(roomId), JSON.stringify(draft));
  } catch {
    /* ignore quota errors */
  }
}

export function loadBookingDraft(roomId) {
  if (!roomId) return null;
  try {
    const raw = sessionStorage.getItem(draftKey(roomId));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearBookingDraft(roomId) {
  if (!roomId) return;
  sessionStorage.removeItem(draftKey(roomId));
}

/** Merge navigation state with saved draft (state wins). */
export function resolveBookingSelections(roomId, locationState) {
  const draft = loadBookingDraft(roomId) || {};
  const src = { ...draft, ...(locationState || {}) };
  return {
    checkIn: src.checkIn || null,
    checkOut: src.checkOut || null,
    guests: src.guests != null ? Number(src.guests) : 1,
    roomCount: src.roomCount != null ? Number(src.roomCount) : 1,
  };
}

export function parseLocalDate(dateStr) {
  if (!dateStr) return null;
  const m = String(dateStr).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return new Date(dateStr);
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

const SESSION_KEY = 'booking-active-session';

/** Full booking page state (survives refresh). */
export function saveBookingSession(session) {
  if (!session?.roomId) return;
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    /* ignore */
  }
}

export function loadBookingSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearBookingSession() {
  sessionStorage.removeItem(SESSION_KEY);
}

export function resolveBookingSession(locationState) {
  const saved = loadBookingSession() || {};
  const src = { ...saved, ...(locationState || {}) };
  return {
    roomId: src.roomId ?? null,
    price: src.price ?? null,
    roomName: src.roomName ?? '',
    roomImage: src.roomImage ?? '',
    checkIn: src.checkIn ?? null,
    checkOut: src.checkOut ?? null,
    guests: src.guests != null ? Number(src.guests) : 1,
    roomCount: src.roomCount != null ? Number(src.roomCount) : 1,
    formData: src.formData ?? null,
  };
}
