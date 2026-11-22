import 'dotenv/config';
import express from 'express';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json({ limit: '64kb' }));

const APP_KEY = process.env.NEXCONN_APP_KEY;
const APP_SECRET = process.env.NEXCONN_APP_SECRET;
const API_HOST = process.env.NEXCONN_API_HOST || 'api.sg-light-api.com';
const API_HOST_BACKUP = process.env.NEXCONN_API_HOST_BACKUP || 'api-b.sg-light-api.com';
const PORT = process.env.PORT || 8787;

if (!APP_KEY || !APP_SECRET) {
  console.error('\n[paperboat] Missing NEXCONN_APP_KEY / NEXCONN_APP_SECRET. Copy .env.example to .env.\n');
}

function signedHeaders() {
  const nonce = String(Math.floor(Math.random() * 1e9));
  const timestamp = String(Date.now());
  const signature = crypto.createHash('sha1').update(APP_SECRET + nonce + timestamp).digest('hex');
  return {
    'App-Key': APP_KEY,
    Nonce: nonce,
    Timestamp: timestamp,
    Signature: signature,
    'Content-Type': 'application/json',
    'X-Request-ID': crypto.randomUUID(),
  };
}

async function api(pathname, body) {
  let lastErr;
  for (const host of [API_HOST, API_HOST_BACKUP]) {
    try {
      const res = await fetch(`https://${host}${pathname}`, {
        method: 'POST',
        headers: signedHeaders(),
        body: JSON.stringify(body),
      });
      const text = await res.text();
      let json;
      try { json = JSON.parse(text); } catch { json = { code: res.status, raw: text }; }
      return json;
    } catch (err) {
      lastErr = err;
    }
  }
  return { code: -1, error: String(lastErr) };
}

const clean = (s, max = 40) =>
  String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, max) || 'neighbor';

function harborChannelId(harbor) {
  return `pb-harbor-${clean(harbor, 32)}`;
}

async function ensureHarbor(userId, harbor) {
  const channelId = harborChannelId(harbor);
  const name = `Paperboat · ${String(harbor).slice(0, 48)}`;
  // Create if missing. The creator becomes owner and joins automatically.
  const created = await api('/v4/group-channel/create', {
    channelId,
    name,
    owner: userId,
    permissions: { joinPerm: 1, memInvitePerm: 2, profilePerm: 2 },
  });
  if (created.code === 0) return { channelId, created: true };
  // Already exists (or creation failed): join openly.
  let joined = await api('/v4/group-channel/join', { channelId, userId });
  if (joined.code !== 0) joined = await api('/v4/group/join', { channelId, userId });
  return { channelId, created: false, joinCode: joined.code };
}

app.get('/api/config', (_req, res) => {
  res.json({ appKey: APP_KEY, harborChannelPrefix: 'pb-harbor-', realtime: true });
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, appKeyConfigured: Boolean(APP_KEY), time: new Date().toISOString() });
});

app.post('/api/session', async (req, res) => {
  try {
    const name = String(req.body?.name || '').trim().slice(0, 40);
    const harbor = String(req.body?.harbor || 'Indiranagar').trim().slice(0, 48);
    if (!name) return res.status(400).json({ error: 'A name helps neighbors know who is calling.' });

    const suffix = crypto.randomBytes(2).toString('hex');
    const userId = `pb-${clean(name, 24)}-${suffix}`;

    const issued = await api('/v4/auth/access-token/issue', { userId, name });
    if (issued.code !== 0 || !issued.result?.accessToken) {
      return res.status(502).json({ error: 'Nexconn token issue failed', detail: issued });
    }

    const harborResult = await ensureHarbor(userId, harbor);
    return res.json({
      userId,
      name,
      harbor,
      channelId: harborResult.channelId,
      token: issued.result.accessToken,
      created: harborResult.created,
      joinCode: harborResult.joinCode ?? 0,
    });
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

// Serve the built app in production.
const dist = path.join(__dirname, '..', 'dist');
app.use(express.static(dist));
app.get(/^(?!\/api).*/, (_req, res) => {
  res.sendFile(path.join(dist, 'index.html'), (err) => {
    if (err) res.status(404).send('Run `npm run build` first.');
  });
});

app.listen(PORT, () => {
  console.log(`[paperboat] http://localhost:${PORT}  (Nexconn ${API_HOST})`);
});
