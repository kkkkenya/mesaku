/** Number of days after an event's date before it is treated as past/archived. */
export const EVENT_GRACE_DAYS = 1;

/**
 * An event counts as "past" once a full day has elapsed since its date.
 * Events without a date are never considered past.
 */
export const isPastEvent = (eventDate: string | null | undefined): boolean => {
  if (!eventDate) return false;
  const cutoff = new Date(eventDate).getTime() + EVENT_GRACE_DAYS * 24 * 60 * 60 * 1000;
  return Date.now() > cutoff;
};

/** An event belongs in the archive if manually archived or past its grace period. */
export const isArchivedEvent = (event: { archived?: boolean | null; event_date?: string | null }) =>
  Boolean(event.archived) || isPastEvent(event.event_date);
