/**
 * Seasonal Service
 * Detects the current Pakistani market season and returns relevance scores
 * for product categories based on upcoming/active seasonal events.
 */

// Seasonal calendar — months are 0-indexed (0 = January)
const SEASONS = [
  {
    name: 'Ramadan',
    // 2025: ~March 1 – March 30 (approx, shifts yearly)
    startMonth: 2, startDay: 1,
    endMonth: 3, endDay: 5,
    relevantCategories: {
      Fashion: 95,
      Beauty: 85,
      Grocery: 90,
      Home: 70,
      Electronics: 60,
      Toys: 50,
      Sports: 40,
      Books: 60,
    },
  },
  {
    name: 'Eid ul Fitr',
    // Follows Ramadan — ~April 1-15
    startMonth: 3, startDay: 1,
    endMonth: 3, endDay: 15,
    relevantCategories: {
      Fashion: 100,
      Beauty: 90,
      Grocery: 85,
      Home: 80,
      Electronics: 70,
      Toys: 80,
      Sports: 50,
      Books: 40,
    },
  },
  {
    name: 'Eid ul Adha',
    // ~June 5–15
    startMonth: 5, startDay: 5,
    endMonth: 5, endDay: 20,
    relevantCategories: {
      Fashion: 90,
      Beauty: 80,
      Grocery: 90,
      Home: 75,
      Electronics: 65,
      Toys: 70,
      Sports: 55,
      Books: 35,
    },
  },
  {
    name: 'Summer',
    // May – August
    startMonth: 4, startDay: 1,
    endMonth: 7, endDay: 31,
    relevantCategories: {
      Fashion: 70,
      Beauty: 75,
      Grocery: 65,
      Home: 80,  // Fans, ACs
      Electronics: 70,
      Toys: 75,
      Sports: 85,
      Books: 45,
    },
  },
  {
    name: 'Back to School',
    // August – September
    startMonth: 7, startDay: 1,
    endMonth: 8, endDay: 30,
    relevantCategories: {
      Fashion: 80,
      Beauty: 55,
      Grocery: 50,
      Home: 60,
      Electronics: 85,  // Laptops, tablets
      Toys: 65,
      Sports: 70,
      Books: 100,
    },
  },
  {
    name: 'Wedding Season',
    // November – February
    startMonth: 10, startDay: 1,
    endMonth: 1, endDay: 28,
    relevantCategories: {
      Fashion: 100,
      Beauty: 95,
      Grocery: 70,
      Home: 90,
      Electronics: 75,
      Toys: 50,
      Sports: 45,
      Books: 40,
    },
  },
  {
    name: 'Winter',
    // November – February
    startMonth: 10, startDay: 1,
    endMonth: 1, endDay: 28,
    relevantCategories: {
      Fashion: 85,  // Winter clothes
      Beauty: 80,   // Winter skincare
      Grocery: 70,
      Home: 90,     // Heaters, blankets
      Electronics: 65,
      Toys: 75,
      Sports: 55,
      Books: 60,
    },
  },
];

/**
 * Check if a date falls within a season's date range.
 * Handles year-wrap ranges (e.g. November–February).
 * @param {Date} date
 * @param {{ startMonth, startDay, endMonth, endDay }} season
 * @returns {boolean}
 */
function isInSeason(date, season) {
  const m = date.getMonth();
  const d = date.getDate();

  const start = season.startMonth * 100 + season.startDay;
  const end   = season.endMonth   * 100 + season.endDay;
  const cur   = m * 100 + d;

  if (start <= end) {
    return cur >= start && cur <= end;
  }
  // Year-wrap (e.g. Nov–Feb)
  return cur >= start || cur <= end;
}

/**
 * Get all currently active seasons.
 * @param {Date} [date]
 * @returns {string[]} Array of active season names
 */
export function getCurrentSeason(date = new Date()) {
  const active = SEASONS.filter((s) => isInSeason(date, s)).map((s) => s.name);
  return active.length > 0 ? active : ['Off-Peak'];
}

/**
 * Get seasonal relevance score (0-100) for a category.
 * If multiple seasons are active, returns the highest score.
 * @param {string} category
 * @param {Date} [date]
 * @returns {number}
 */
export function getSeasonalRelevance(category, date = new Date()) {
  const activeSeasons = SEASONS.filter((s) => isInSeason(date, s));
  if (activeSeasons.length === 0) return 30; // baseline off-peak

  const scores = activeSeasons.map((s) => s.relevantCategories[category] || 30);
  return Math.max(...scores);
}

/**
 * Get the next upcoming season and days until it starts.
 * @param {number} [withinDays=90] - Look ahead this many days
 * @param {Date} [date]
 * @returns {{ name: string, daysUntil: number } | null}
 */
export function getUpcomingSeason(withinDays = 90, date = new Date()) {
  let nearest = null;
  let minDays = Infinity;

  for (const season of SEASONS) {
    // Build start date for this year
    const startThisYear = new Date(date.getFullYear(), season.startMonth, season.startDay);
    let diff = Math.ceil((startThisYear - date) / (1000 * 60 * 60 * 24));

    // If the season already started this year, check next year
    if (diff < 0) {
      const startNextYear = new Date(date.getFullYear() + 1, season.startMonth, season.startDay);
      diff = Math.ceil((startNextYear - date) / (1000 * 60 * 60 * 24));
    }

    if (diff > 0 && diff <= withinDays && diff < minDays) {
      minDays = diff;
      nearest = { name: season.name, daysUntil: diff };
    }
  }

  return nearest;
}

export default { getCurrentSeason, getSeasonalRelevance, getUpcomingSeason };
