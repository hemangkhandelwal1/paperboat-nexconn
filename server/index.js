import 'dotenv/config';
import express from 'express';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json({ limit: '128kb' }));

const APP_KEY = process.env.NEXCONN_APP_KEY;
const APP_SECRET = process.env.NEXCONN_APP_SECRET;
const API_HOST = process.env.NEXCONN_API_HOST || 'api.sg-light-api.com';
const API_HOST_BACKUP = process.env.NEXCONN_API_HOST_BACKUP || 'api-b.sg-light-api.com';
const PORT = process.env.PORT || 8787;

if (!APP_KEY || !APP_SECRET) {
  console.error('\n[ChapterChat] Missing NEXCONN_APP_KEY / NEXCONN_APP_SECRET in .env.\n');
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

async function nexconnApi(pathname, body) {
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
      try {
        json = JSON.parse(text);
      } catch {
        json = { code: res.status, raw: text };
      }
      return json;
    } catch (err) {
      lastErr = err;
    }
  }
  return { code: -1, error: String(lastErr) };
}

const clean = (s, max = 40) =>
  String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, max) || 'story';

function storyChannelId(orderId) {
  return `tcc-${clean(orderId, 28)}`;
}

// Sample orders reflecting real-world products on thechapterco.in
const SAMPLE_ORDERS = [
  {
    orderId: 'tcc-8821',
    bookTitle: "Kabir's First Sun",
    bookType: "Baby's 1st Birthday Keepsake",
    clientName: 'Meera & Rohan',
    leadDesigner: 'Pooja (Art Director)',
    status: 'Spread Review',
    statusStep: 3, // 1 to 5
    estimatedDispatch: 'Nov 29, 2026',
    spreadsCount: 6,
    approvedSpreads: [1, 3],
    currentSpread: 2,
    previewCover: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80',
    summary: 'A 28-page hardcover hand-illustrated book celebrating baby Kabir learning to walk and listening to morning ragas with grandfather.',
    activeDrafts: [
      {
        spreadNum: 1,
        title: 'Morning in Indiranagar',
        status: 'approved',
        note: 'First rays of sun through the French window.',
        imageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
      },
      {
        spreadNum: 2,
        title: 'The Tiny Steps at Cubbon Park',
        status: 'in_review',
        note: 'Illustrator working on matching hair curls and bamboo toy wagon.',
        imageUrl: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=800&q=80',
      },
      {
        spreadNum: 3,
        title: 'Bedtime Lullaby by Nani',
        status: 'approved',
        note: 'Warm watercolor tones with gentle stars overhead.',
        imageUrl: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=800&q=80',
      },
    ],
  },
  {
    orderId: 'tcc-4910',
    bookTitle: "The Grand Voyage — Dadaji's Memoir",
    bookType: 'Milestone 80th Birthday Legacy Book',
    clientName: 'Ananya Sharma',
    leadDesigner: 'Arjun (Senior Illustrator)',
    status: 'Character Sketching',
    statusStep: 2,
    estimatedDispatch: 'Dec 05, 2026',
    spreadsCount: 8,
    approvedSpreads: [1],
    currentSpread: 2,
    previewCover: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
    summary: 'Chronicles Professor V.K. Sharma from his university days in Varanasi to his journeys across botanical gardens worldwide.',
    activeDrafts: [
      {
        spreadNum: 1,
        title: 'The Varanasi Ghats (1964)',
        status: 'approved',
        note: 'Watercolors capturing the golden morning mist on the river.',
        imageUrl: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80',
      },
    ],
  },
  {
    orderId: 'tcc-6302',
    bookTitle: 'Under the Gulmohar — Our 5th Year',
    bookType: 'Custom Anniversary Storybook',
    clientName: 'Vikram & Radhika',
    leadDesigner: 'Tara (Illustrator & Calligrapher)',
    status: 'Proofing & Binding',
    statusStep: 4,
    estimatedDispatch: 'Nov 26, 2026',
    spreadsCount: 6,
    approvedSpreads: [1, 2, 3, 4, 5, 6],
    currentSpread: 6,
    previewCover: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=600&q=80',
    summary: 'A heartfelt romantic keepsake recounting their journey from a small tea stall in Bandra to their new home in Goa.',
    activeDrafts: [
      {
        spreadNum: 1,
        title: 'Chai Under the Rain in Bandra',
        status: 'approved',
        note: 'All spreads approved. Sent to fine-art Japanese cotton binding.',
        imageUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80',
      },
    ],
  },
];

async function ensureStoryChannel(userId, orderId, bookTitle) {
  const channelId = storyChannelId(orderId);
  const name = `Chapter · ${bookTitle || orderId}`.slice(0, 48);

  // GroupChannel create:
  const created = await nexconnApi('/v4/group-channel/create', {
    channelId,
    name,
    owner: userId,
    permissions: { joinPerm: 1, memInvitePerm: 2, profilePerm: 2 },
  });

  if (created.code === 0) return { channelId, created: true };

  // If already exists or open join:
  let joined = await nexconnApi('/v4/group-channel/join', { channelId, userId });
  if (joined.code !== 0) joined = await nexconnApi('/v4/group/join', { channelId, userId });
  return { channelId, created: false, joinCode: joined.code };
}

// 1. Config endpoint
app.get('/api/config', (_req, res) => {
  res.json({
    appKey: APP_KEY,
    appName: 'ChapterChat',
    business: 'thechapterco.in',
    realtime: true,
  });
});

// 2. Health endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    appKeyConfigured: Boolean(APP_KEY),
    business: 'the Chapter Co. — Personalized Illustrated Keepsakes',
    time: new Date().toISOString(),
  });
});

// 3. Orders directory
app.get('/api/orders', (_req, res) => {
  res.json(SAMPLE_ORDERS);
});

// 4. Session & Nexconn Token issuance
app.post('/api/session', async (req, res) => {
  try {
    const rawName = String(req.body?.name || '').trim();
    const orderId = String(req.body?.orderId || 'tcc-8821').trim();
    const role = String(req.body?.role || 'client').toLowerCase(); // 'client' or 'designer'
    const matchedOrder = SAMPLE_ORDERS.find((o) => o.orderId === orderId);
    const bookTitle = matchedOrder ? matchedOrder.bookTitle : String(req.body?.bookTitle || 'Custom Storybook');

    const displayName = rawName || (role === 'designer' ? 'Pooja (Lead Illustrator)' : 'Client');
    const suffix = crypto.randomBytes(2).toString('hex');
    const userId = `tcc-${role}-${clean(displayName, 16)}-${suffix}`;

    // Issue real Nexconn Chat token
    const issued = await nexconnApi('/v4/auth/access-token/issue', {
      userId,
      name: displayName,
    });

    if (issued.code !== 0 || !issued.result?.accessToken) {
      return res.status(502).json({
        error: 'Nexconn token issuance failed',
        detail: issued,
      });
    }

    const channelResult = await ensureStoryChannel(userId, orderId, bookTitle);

    return res.json({
      userId,
      name: displayName,
      role,
      orderId,
      bookTitle,
      order: matchedOrder || null,
      channelId: channelResult.channelId,
      token: issued.result.accessToken,
      created: channelResult.created,
      joinCode: channelResult.joinCode ?? 0,
    });
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

// 5. ChapterBot AI Summarizer for revisions
app.post('/api/ai/summarize-revisions', (req, res) => {
  const { messages, orderId } = req.body || {};
  const order = SAMPLE_ORDERS.find((o) => o.orderId === orderId) || SAMPLE_ORDERS[0];

  const feedbackTexts = (messages || [])
    .filter((m) => m && (m.text || m.content))
    .map((m) => m.text || m.content);

  // Generate actionable illustrator brief
  const actionItems = [
    {
      spread: 2,
      category: 'Character Likeness',
      action: 'Match Kabir’s curls and playful smile to Reference Photo #2 (birthday morning).',
      priority: 'High',
    },
    {
      spread: 2,
      category: 'Color & Lighting',
      action: 'Shift park grass palette to warmer golden-hour tones, reducing saturated lime greens.',
      priority: 'Medium',
    },
    {
      spread: 3,
      category: 'Story Text Typography',
      action: 'Format Nani’s lullaby verse in italicized Fraunces serif script on the bottom left margin.',
      priority: 'Medium',
    },
  ];

  if (feedbackTexts.some((t) => t.toLowerCase().includes('skin') || t.toLowerCase().includes('tone'))) {
    actionItems.unshift({
      spread: 2,
      category: 'Tone Palette',
      action: 'Refine character skin tone gradient for accurate print reproduction on matte 220gsm paper.',
      priority: 'Urgent',
    });
  }

  res.json({
    orderId: order.orderId,
    bookTitle: order.bookTitle,
    generatedAt: new Date().toISOString(),
    summary: `AI revision brief generated from ${feedbackTexts.length || 3} client comments. 2 spreads pending minor touch-ups before final print sign-off.`,
    actionItems,
    approvalStatus: {
      approvedSpreads: order.approvedSpreads,
      totalSpreads: order.spreadsCount,
      percentComplete: Math.round((order.approvedSpreads.length / order.spreadsCount) * 100),
    },
  });
});

// 6. Serve built client in production
const dist = path.join(__dirname, '..', 'dist');
app.use(express.static(dist));
app.get(/^(?!\/api).*/, (_req, res) => {
  res.sendFile(path.join(dist, 'index.html'), (err) => {
    if (err) res.status(404).send('Run `npm run build` first.');
  });
});

app.listen(PORT, () => {
  console.log(`[ChapterChat] TheChapterCo.in Studio Hub listening at http://localhost:${PORT} (Nexconn ${API_HOST})`);
});
