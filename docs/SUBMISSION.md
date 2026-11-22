# Nexconn Build Challenge 2026 — Official Project Submission

## Project Information

- **Project Title:** ChapterChat — Real-Time Keepsake Studio Hub
- **Track:** Marketplace & Support (also applicable to Workplace & Collaboration / Open Innovation)
- **Production Partner:** [the Chapter Co.](https://thechapterco.in) (`thechapterco.in`)
- **Public GitHub Repository:** [https://github.com/hemangkhandelwal1/paperboat-nexconn](https://github.com/hemangkhandelwal1/paperboat-nexconn)
- **Platform:** Web Application (React 19 + Vite + Node.js/Express)
- **Nexconn App Key:** `z3v5yqkbzet10`
- **Data Center:** Singapore (`api.sg-light-api.com`)
- **SDK Packages Used:** `@nexconn/chat` (v26.5.1), `@nexconn/engine` (v26.5.1)

---

## 1. Problem Statement & Why ChapterChat Was Built

**the Chapter Co.** is an Indian brand that crafts personalized, hand-painted keepsake storybooks from real customer memories, family milestones, and wedding celebrations. Each book takes 2 to 4 weeks of intensive collaboration between families and in-house illustrators:
- Clients submit dozens of photos and personal stories.
- Studio illustrators sketch and paint multi-spread gouache layouts.
- Clients review drafts, request tweaks, and officially approve the proofs before the book goes to fine-art Japanese cotton binding.

### The Operational Bottleneck
Historically, this collaboration occurred across disjointed WhatsApp messages and long email threads:
1. **Lost Assets**: High-resolution reference photos got buried under conversational banter.
2. **Ambiguous Revisions**: Comments like *"Can you fix page 3?"* left illustrators guessing which element needed adjustment.
3. **Approval Bottlenecks**: Without a unified sign-off system, print production stalls while waiting for written confirmation.

**ChapterChat solves this by providing a dedicated real-time collaboration harbor for every storybook order.**

---

## 2. Nexconn Chat SDK Deep Integration

ChapterChat implements 10+ core capabilities of the **Nexconn Chat SDK**:

### A. Dynamic Token Issuance & Singleton Connection
- The backend generates cryptographically signed HTTP headers (`App-Key`, `Nonce`, `Timestamp`, `Signature` via HMAC-SHA1) and requests user access tokens via `POST /v4/auth/access-token/issue`.
- The browser client connects to the Nexconn edge network via `NCEngine.initialize({ appKey })` and `NCEngine.connect({ token })`.

### B. Order-Dedicated Group Channels
- Every storybook commission is mapped to an isolated channel: `tcc-tcc-{orderId}` using `new GroupChannel(channelId)` and backend channel creation (`/v4/group-channel/create`).
- Clients, art directors, and studio assistants communicate in a shared room with zero risk of cross-order noise.

### C. Rich Real-Time Message Exchange
- Messages are dispatched with `SendTextMessageParams` and listened to via `NCEngine.addMessageHandler(handlerKey, { onMessageReceived })`.
- Custom metadata identifies the sender role (`client` vs `designer` vs `ai`), timestamp, and delivery receipts.

### D. Inline Spread Proofing & Reactions
- Draft spreads are displayed as rich cards directly within the message feed.
- Clients can inspect spreads in a high-resolution modal and express instant emotional or editorial feedback using message reactions (`❤️ Love it`, `🔄 Needs tweak`).

### E. One-Click Archival Print Approval
- When a client is satisfied with a spread, clicking **"Approve for Print"** broadcasts an official sign-off message across the channel.
- The studio milestone progress bar updates automatically (e.g., *2 of 6 Spreads Approved*).

### F. ChapterBot AI Studio Copilot
- An AI-powered assistance endpoint parses recent client messages and extracts an actionable **Illustrator Action Brief** categorized into *Character Likeness*, *Color & Lighting*, and *Typography*.

---

## 3. User Experience & Design Polish

- **Aesthetic**: Tailored specifically for The Chapter Co., using warm literary serif typography (**Fraunces**), crisp clean body font (**Inter**), terracotta accents, and parchment paper backgrounds.
- **Role Switching**: Judges can effortlessly toggle between **"Client View"** (Meera & Rohan) and **"Lead Illustrator"** (Pooja) to experience both sides of the collaboration loop.
- **Order Switching**: Easily switch between sample real-world orders (*"Kabir's First Sun"*, *"The Grand Voyage — Dadaji's Memoir"*, *"Under the Gulmohar"*).

---

## 4. Business Viability & Market Traction

- **Real-World Implementation**: Unlike conceptual hackathon toys, ChapterChat directly solves an active business challenge for an operating company ([thechapterco.in](https://thechapterco.in)).
- **Immediate User Traction**: Real clients and in-house illustrators generate authentic, sustained active user sessions on the Nexconn Developer Console.
- **Commercial Expansion**: The platform can be commercialized as an off-the-shelf studio coordination SaaS for independent publishers, wedding album designers, and bespoke artisan ateliers worldwide.

---

## 5. Summary of Deliverables

1. **Source Code**: [GitHub Repository (Public)](https://github.com/hemangkhandelwal1/paperboat-nexconn)
2. **Nexconn App Key**: `z3v5yqkbzet10`
3. **Local Testing URL**: `http://localhost:8787` (Run `npm run build && npm start`)
4. **Demo Video URL**: Included in the submission portal.
