/** Parse YYYY-MM-DD (or ISO string) as a local calendar date — avoids UTC day-shift bugs. */
export function parseCalendarDate(dateInput) {
  if (dateInput == null || dateInput === '') return null;
  const s = String(dateInput);
  const match = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return null;
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

export function formatCalendarDate(dateInput, locale = 'en-GB') {
  const d = parseCalendarDate(dateInput);
  if (!d) return '';
  return d.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function nightsBetween(checkIn, checkOut) {
  const a = parseCalendarDate(checkIn);
  const b = parseCalendarDate(checkOut);
  if (!a || !b) return 0;
  const d = Math.round((b - a) / (1000 * 60 * 60 * 24));
  return Math.max(0, d);
}
