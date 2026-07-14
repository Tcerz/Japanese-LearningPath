# Day One Kana — 7-Day N5/N4 Start

A single-page site: 7-day hiragana/katakana bootcamp + a 6-month roadmap to JLPT N5 and N4.
No build step, no dependencies — it's one `index.html` file. Progress is saved in your
browser's localStorage (nothing is sent to a server), so it works the same on any device
you open it from, but progress doesn't sync between devices.

## Deploy to Vercel (pick one)

**Option A — no install, drag and drop**
1. Go to https://vercel.com/new
2. Drag the whole `n5-n4-path` folder onto the page (or "Deploy" → upload).
3. Vercel detects it as a static site automatically. Click Deploy.
4. You'll get a URL like `your-project.vercel.app` — bookmark it, that's your daily link.

**Option B — Vercel CLI**
```bash
npm i -g vercel
cd n5-n4-path
vercel --prod
```
Follow the prompts (first deploy asks a few setup questions, defaults are fine for a
static site — no framework, no build command).

**Option C — GitHub**
1. Push this folder to a new GitHub repo.
2. In Vercel: New Project → Import the repo → Deploy (no config needed).
3. Every future push to `main` auto-redeploys.

## Files
- `index.html` — the whole site (HTML + CSS + JS, self-contained).
- `README.md` — this file.
