import axios from 'axios';

const SOCKET_BASE = process.env.SOCKET_INTERNAL_URL || 'http://localhost:3002';

export async function GET() {
  try {
    const res = await axios.get(`${SOCKET_BASE}/scheduler/status`, { timeout: 5000 });
    return Response.json(res.data);
  } catch (err) {
    return Response.json({
      success: false,
      error:   err.message,
      scheduler: { enabled: false, startedAt: null },
    }, { status: 502 });
  }
}
