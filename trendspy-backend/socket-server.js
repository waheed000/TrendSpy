/**
 * TrendSpy Socket.io Server
 * Standalone Express + Socket.io server on port 3002.
 * Handles real-time product score updates, user alerts,
 * and Facebook Ad Library scraping (Puppeteer lives here,
 * away from Next.js webpack bundling).
 */

import { createServer } from 'http';
import { Server } from 'socket.io';
import express from 'express';
import jwt from 'jsonwebtoken';
import axios from 'axios';

// ─── Ad Extraction Helper (Node.js, not browser) ─────────────────────────────
function extractAdsFromHtml(html) {
  const results = [];
  const seenIds = new Set();

  // page.content() serialises <script> tag contents with escaped quotes:
  //   "collated_results\":[{\"ad_archive_id\":\"...
  // We need to find that escaped key, grab the raw JSON array string,
  // unescape it, then JSON.parse it.

  // Search for both escaped (\") and unescaped (") forms.
  const MARKERS = ['\\"collated_results\\"', '"collated_results"'];

  for (const MARKER of MARKERS) {
    let searchPos = 0;
    while (true) {
      const keyIdx = html.indexOf(MARKER, searchPos);
      if (keyIdx < 0) break;
      searchPos = keyIdx + 1;

      // Find the '[' that immediately follows the colon after the key
      const colonIdx = html.indexOf(':', keyIdx + MARKER.length);
      if (colonIdx < 0 || colonIdx > keyIdx + MARKER.length + 5) continue;
      const arrStart = html.indexOf('[', colonIdx);
      if (arrStart < 0 || arrStart > colonIdx + 5) continue;

      // Bracket counter to find the matching ']'.
      // Works for both escaped and unescaped forms because '[' and ']'
      // characters themselves are never escaped in this JSON-in-HTML context.
      let depth = 0, arrEnd = -1;
      for (let i = arrStart; i < html.length; i++) {
        if (html[i] === '[') depth++;
        else if (html[i] === ']') { depth--; if (depth === 0) { arrEnd = i; break; } }
      }
      if (arrEnd < 0) continue;

      let arrStr = html.slice(arrStart, arrEnd + 1);

      // If quotes are backslash-escaped (the serialised-HTML form), unescape them.
      if (MARKER.startsWith('\\"')) {
        arrStr = arrStr.replace(/\\"/g, '"').replace(/\\\//g, '/');
      }

      let arr;
      try { arr = JSON.parse(arrStr); } catch { continue; }
      if (!Array.isArray(arr)) continue;

      for (const item of arr) {
        const adId = String(item.ad_archive_id || item.adArchiveID || '');
        if (!adId || seenIds.has(adId)) continue;
        seenIds.add(adId);

        const snap        = item.snapshot || {};
        const page_name   = item.page_name || snap.page_name || snap.branded_content?.page_name || 'Unknown';
        const bodyText    = snap.body?.text || snap.caption || '';
        const title       = snap.title || snap.link_title || '';
        const linkDesc    = snap.link_description || '';
        const headline    = (bodyText || title || linkDesc).replace(/\n/g, ' ').trim().slice(0, 300);
        if (!headline || headline.length < 5) continue;

        const startTs     = item.start_date || snap.start_date || 0;
        const daysRunning = startTs ? Math.floor((Date.now() / 1000 - startTs) / 86400) : 0;

        const images      = snap.images || [];
        const videos      = snap.videos || [];
        const cards       = snap.cards  || [];
        const imageUrl    = images[0]?.original_image_url || images[0]?.url || '';
        const videoUrl    = videos[0]?.video_hd_url || videos[0]?.url || '';
        const creativeType = videos.length > 0 ? 'video' : (cards.length > 1 || images.length > 1 ? 'carousel' : 'image');

        results.push({
          adId,
          directUrl:      `https://www.facebook.com/ads/library/?id=${adId}`,
          advertiserName: page_name,
          headline,
          description:    linkDesc || '',
          daysRunning,
          creativeType,
          imageUrl,
          videoUrl,
          platform:       'facebook',
        });
      }
    }
  }
  return results;
}

const app = express();
app.use(express.json());

const httpServer = createServer(app);

const SOCKET_PORT   = parseInt(process.env.SOCKET_PORT || '3002', 10);
const SOCKET_SECRET = process.env.SOCKET_INTERNAL_SECRET || 'trendspy-socket-internal';

// In-memory map: socketId → { userId, socketId, connectedAt }
const connectedUsers = new Map();

const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// ─── Authentication Middleware ───────────────────────────────────────────────
io.use((socket, next) => {
  const token = socket.handshake.auth?.token || socket.handshake.query?.token;
  if (!token) {
    return next(new Error('Authentication required'));
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.userId;
    socket.email  = decoded.email;
    next();
  } catch {
    next(new Error('Invalid or expired token'));
  }
});

// ─── Connection Handlers ─────────────────────────────────────────────────────
io.on('connection', (socket) => {
  connectedUsers.set(socket.id, {
    userId:      socket.userId,
    socketId:    socket.id,
    connectedAt: new Date(),
  });

  console.log(`[Socket] Connected: userId=${socket.userId} socketId=${socket.id} total=${connectedUsers.size}`);
  socket.join(`user:${socket.userId}`);

  socket.on('subscribe', ({ productIds = [] }) => {
    productIds.forEach((id) => socket.join(`product:${id}`));
    console.log(`[Socket] userId=${socket.userId} subscribed to ${productIds.length} product(s)`);
  });

  socket.on('unsubscribe', ({ productIds = [] }) => {
    productIds.forEach((id) => socket.leave(`product:${id}`));
  });

  socket.on('disconnect', (reason) => {
    connectedUsers.delete(socket.id);
    console.log(`[Socket] Disconnected: userId=${socket.userId} reason=${reason} total=${connectedUsers.size}`);
  });
});

// ─── Internal Emit API ───────────────────────────────────────────────────────
app.post('/internal/emit', (req, res) => {
  const secret = req.headers['x-internal-secret'];
  if (secret !== SOCKET_SECRET) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const { event, data, userId, productId } = req.body;
  if (!event) return res.status(400).json({ error: 'event is required' });

  if (userId)       io.to(`user:${userId}`).emit(event, data);
  else if (productId) io.to(`product:${productId}`).emit(event, data);
  else              io.emit(event, data);

  res.json({ success: true, connectedClients: io.engine.clientsCount });
});

// ─── Status Endpoint ─────────────────────────────────────────────────────────
app.get('/socket/status', (req, res) => {
  res.json({
    status:  'online',
    clients: io.engine.clientsCount,
    users:   connectedUsers.size,
    uptime:  process.uptime(),
  });
});

// ─── Facebook Ad Library Scraper Endpoint ────────────────────────────────────
// Puppeteer lives here (plain Node.js) — Next.js calls this via HTTP.
// Protected by the same internal secret.

function parseCookies(cookieString) {
  return cookieString.split(';').map((part) => {
    const eqIdx = part.indexOf('=');
    if (eqIdx === -1) return null;
    const name  = part.slice(0, eqIdx).trim();
    const value = part.slice(eqIdx + 1).trim();
    return { name, value, domain: '.facebook.com', path: '/', httpOnly: false, secure: true };
  }).filter(Boolean);
}

function spendLevel(days) {
  if (days > 90) return 'high';
  if (days > 30) return 'medium';
  return 'low';
}

async function scrapeFbAdsWithCookie(searchTerm, category) {
  const cookieString = process.env.FB_SESSION_COOKIE;
  if (!cookieString) {
    console.log('[FB Scraper] FB_SESSION_COOKIE not set');
    return [];
  }

  let puppeteer;
  try {
    const pExtra  = (await import('puppeteer-extra')).default;
    const stealth = (await import('puppeteer-extra-plugin-stealth')).default;
    pExtra.use(stealth());
    puppeteer = pExtra;
  } catch (err) {
    console.warn('[FB Scraper] puppeteer-extra not available:', err.message);
    return [];
  }

  let browser;
  try {
    const executablePath = process.env.CHROMIUM_PATH
      || '/nix/store/qa9cnw4v5xkxyip6mb9kxqfq1z4x2dx1-chromium-138.0.7204.100/bin/chromium';

    browser = await puppeteer.launch({
      headless: 'new',
      executablePath,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-blink-features=AutomationControlled',
        '--window-size=1366,768',
        '--lang=en-US,en',
      ],
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1366, height: 768 });
    await page.setCookie(...parseCookies(cookieString));

    // ── Intercept FB GraphQL/XHR responses that carry ad data ─────────────
    // FB Ad Library loads ads via async XHR (not in the initial HTML).
    // We intercept every response whose body contains "collated_results".
    const interceptedChunks = [];

    page.on('response', async (response) => {
      const url = response.url();
      if (!url.includes('facebook.com')) return;
      // Only look at likely API/document responses
      const ct = response.headers()['content-type'] || '';
      if (!ct.includes('json') && !ct.includes('javascript') && !ct.includes('text')) return;
      try {
        const text = await response.text();
        if (text.includes('collated_results') || text.includes('ad_archive_id')) {
          interceptedChunks.push(text);
        }
      } catch { /* ignore */ }
    });

    const adLibUrl = `https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=PK&q=${encodeURIComponent(searchTerm)}&search_type=keyword_unordered`;
    console.log(`[FB Scraper] Navigating: "${searchTerm}"`);
    await page.goto(adLibUrl, { waitUntil: 'networkidle2', timeout: 45000 });

    // Give React time to fire its initial data fetch
    await new Promise((r) => setTimeout(r, 4000));

    console.log(`[FB Scraper] Intercepted ${interceptedChunks.length} response chunk(s) containing ad data`);

    // Extract ads from every intercepted chunk
    const seenIds = new Set();
    const ads = [];
    for (const chunk of interceptedChunks) {
      for (const ad of extractAdsFromHtml(chunk)) {
        if (!seenIds.has(ad.adId)) {
          seenIds.add(ad.adId);
          ads.push(ad);
        }
      }
    }

    console.log(`[FB Scraper] Extracted ${ads.length} ads for "${searchTerm}"`);
    return ads.map((a) => ({
      ...a,
      spendLevel: spendLevel(a.daysRunning),
      category,
      scrapedAt:  new Date().toISOString(),
    }));

  } catch (err) {
    console.error(`[FB Scraper] Puppeteer error: ${err.message}`);
    return [];
  } finally {
    if (browser) await browser.close().catch(() => {});
  }
}

async function tryJsonApiFallback(searchTerm, category) {
  const params = new URLSearchParams({
    q: searchTerm, count: '30', active_status: 'all',
    ad_type: 'all', media_type: 'all', search_type: 'keyword_unordered', source: 'nav-header',
  });
  params.append('countries[0]', 'PK');

  try {
    const res = await axios.get(`https://www.facebook.com/ads/library/async/search_ads/?${params}`, {
      headers: {
        'User-Agent':       'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept':           'application/json, text/javascript, */*; q=0.01',
        'Referer':          'https://www.facebook.com/ads/library/',
        'X-Requested-With': 'XMLHttpRequest',
      },
      timeout: 20000, responseType: 'text', validateStatus: () => true,
    });

    if (res.status !== 200) return [];
    let text = typeof res.data === 'string' ? res.data : JSON.stringify(res.data);
    text = text.replace(/^for\s*\(;;\s*\);/, '').trim();
    if (!text.startsWith('{') && !text.startsWith('[')) return [];

    const json   = JSON.parse(text);
    const rawAds = json.payload?.results || json.data?.ad_archive_main_table_data || json.results || [];
    if (!Array.isArray(rawAds) || rawAds.length === 0) return [];

    return rawAds.map((raw) => {
      const adId     = String(raw.adArchiveID || raw.ad_archive_id || raw.id || '');
      const snapshot = raw.snapshot || raw.creative || {};
      const imageUrl = snapshot.images?.[0]?.original_image_url || '';
      const videoUrl = snapshot.videos?.[0]?.video_hd_url || '';
      return {
        adId,
        directUrl:      adId ? `https://www.facebook.com/ads/library/?id=${adId}` : '',
        advertiserName: raw.pageName || raw.page_name || 'Unknown',
        headline:       (snapshot.title || snapshot.body?.text || raw.ad_creative_bodies?.[0] || '').slice(0, 300),
        description:    (snapshot.caption || raw.ad_creative_link_descriptions?.[0] || '').slice(0, 500),
        daysRunning:    0,
        creativeType:   videoUrl ? 'video' : (snapshot.images?.length > 1 ? 'carousel' : 'image'),
        imageUrl, videoUrl,
        spendLevel:     'low',
        platform:       'facebook',
        category,
        scrapedAt:      new Date().toISOString(),
      };
    }).filter((a) => a.adId && a.headline);
  } catch {
    return [];
  }
}

app.post('/internal/scrape-fb-ads', async (req, res) => {
  const secret = req.headers['x-internal-secret'];
  if (secret !== SOCKET_SECRET) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const { searchTerm = 'smart watch Pakistan', category = 'Electronics' } = req.body;
  console.log(`[FB Scraper] Request: "${searchTerm}" category="${category}"`);

  try {
    let ads = await scrapeFbAdsWithCookie(searchTerm, category);

    if (ads.length === 0) {
      console.log('[FB Scraper] Trying JSON API fallback…');
      ads = await tryJsonApiFallback(searchTerm, category);
    }

    // Broadcast new ads via socket if any found
    if (ads.length > 0) {
      io.emit('newAdsDetected', { count: ads.length, category, searchTerm });
    }

    res.json({ success: true, ads, totalFound: ads.length });
  } catch (err) {
    console.error('[FB Scraper] Endpoint error:', err.message);
    res.status(500).json({ success: false, error: err.message, ads: [], totalFound: 0 });
  }
});

// ─── Exported Helpers (same process use) ─────────────────────────────────────
export function emitToUser(userId, event, data) {
  io.to(`user:${userId}`).emit(event, data);
}

export function emitToAll(event, data) {
  io.emit(event, data);
}

export function getConnectedUsers() {
  return connectedUsers.size;
}

// ─── Start ───────────────────────────────────────────────────────────────────
httpServer.listen(SOCKET_PORT, '0.0.0.0', () => {
  console.log(`[Socket] Server running on port ${SOCKET_PORT}`);
});

export default io;
