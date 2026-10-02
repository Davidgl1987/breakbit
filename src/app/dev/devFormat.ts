/** "+1 d 2 h 5 min" / "−30 min" — compact, locale-neutral units for dev tools. */
export function formatOffset(ms: number): string {
  const sign = ms < 0 ? '−' : '+';
  let minutes = Math.round(Math.abs(ms) / 60_000);
  const days = Math.floor(minutes / 1440);
  minutes -= days * 1440;
  const hours = Math.floor(minutes / 60);
  minutes -= hours * 60;
  const parts = [days && `${days} d`, hours && `${hours} h`, minutes && `${minutes} min`].filter(
    Boolean,
  );
  return `${sign}${parts.length > 0 ? parts.join(' ') : '0 min'}`;
}

/** Value for <input type="datetime-local"> in local time. */
export function toDateTimeLocal(instant: number): string {
  const date = new Date(instant);
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
