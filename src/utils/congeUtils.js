import dayjs from 'dayjs';

/**
 * Calculates working days between two dates (inclusive), excluding:
 *   - Weekends (Saturday = 6, Sunday = 0 per dayjs)
 *   - Any date present in listeJoursFeries
 *
 * @param {string|Date} dateDebut  - Start date (ISO string or Date)
 * @param {string|Date} dateFin    - End date  (ISO string or Date)
 * @param {Array}       listeJoursFeries - Array of JourFerie objects ({ date: 'YYYY-MM-DD' })
 *                                         or plain 'YYYY-MM-DD' strings
 * @returns {number} Number of billable working days
 */
export function calculerJoursOuvrables(dateDebut, dateFin, listeJoursFeries = []) {
  const start = dayjs(dateDebut).startOf('day');
  const end   = dayjs(dateFin).startOf('day');

  // Guard 1: reject unparseable values before the loop
  if (!start.isValid() || !end.isValid()) return 0;
  // Guard 2: inverted range would make the while condition true forever
  if (start.isAfter(end)) return 0;

  // Build a Set of holiday date strings for O(1) lookup
  const ferieSet = new Set(
    listeJoursFeries.map((jf) => (typeof jf === 'string' ? jf : jf.date))
  );

  let count    = 0;
  let current  = start;
  let failsafe = 0;

  while (!current.isAfter(end)) {
    // Hard cap: 1000 iterations ≈ 2.7 years — should never be reached legitimately
    if (failsafe++ > 1000) break;

    const dow     = current.day(); // 0 = Sunday, 6 = Saturday
    const dateStr = current.format('YYYY-MM-DD');

    if (dow !== 0 && dow !== 6 && !ferieSet.has(dateStr)) {
      count++;
    }
    current = current.add(1, 'day');
  }

  return count;
}
