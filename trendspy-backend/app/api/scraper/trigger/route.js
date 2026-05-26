import axios from 'axios';

const SOCKET_BASE   = process.env.SOCKET_INTERNAL_URL    || 'http://localhost:3002';
const SOCKET_SECRET = process.env.SOCKET_INTERNAL_SECRET || 'trendspy-socket-internal';

const VALID_SCRAPERS = ['facebookAds', 'daraz', 'olx', 'googleTrends', 'news', 'suppliers'];

export async function POST(request) {
  try {
    const body    = await request.json().catch(() => ({}));
    const scraper = body.scraper || 'facebookAds';

    if (!VALID_SCRAPERS.includes(scraper)) {
      return Response.json({
        success: false,
        error:   `Unknown scraper. Valid options: ${VALID_SCRAPERS.join(', ')}`,
      }, { status: 400 });
    }

    const res = await axios.post(
      `${SOCKET_BASE}/scheduler/trigger`,
      { scraper },
      { headers: { 'x-internal-secret': SOCKET_SECRET }, timeout: 10000 }
    );

    return Response.json(res.data);
  } catch (err) {
    return Response.json({ success: false, error: err.message }, { status: 502 });
  }
}
