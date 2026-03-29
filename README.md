# 🏏 BowlerStats.in

> IPL Bowler Run Analysis — Over-by-Over Histogram Website

---

## 📁 File Structure

```
bowler-stats/
├── index.html       ← Main page (SEO optimized, AdSense ready)
├── styles.css       ← All styles
├── app.js           ← All JavaScript logic
├── data.json        ← Match data — UPDATE THIS EVERY OVER
├── privacy.html     ← Required for AdSense
├── sitemap.xml      ← SEO sitemap
├── robots.txt       ← Search engine crawler rules
├── vercel.json      ← Vercel deployment config
└── README.md        ← This file
```

---

## 🚀 Deployment (GitHub → Vercel)

### Step 1: Push to GitHub
1. Create a new GitHub repo (e.g. `bowlerstats`)
2. Upload all files to the repo root
3. Push: `git push origin main`

### Step 2: Connect to Vercel
1. Go to [vercel.com](https://vercel.com) → Sign up free
2. Click **Add New Project** → Import your GitHub repo
3. Framework Preset: **Other** (it's a static site)
4. Root Directory: `/` (or wherever your files are)
5. Click **Deploy**

### Step 3: Custom Domain (optional)
- In Vercel Dashboard → Your Project → Settings → Domains
- Add `bowlerstats.in` or any domain you own

---

## ✏️ How to Update Match Data (Every Over)

Open `data.json` and update the overs array:

```json
{
  "meta": {
    "match": "RCB vs MI",
    "venue": "M. Chinnaswamy Stadium, Bangalore",
    "date": "2025-04-15",
    "season": "IPL 2025",
    "lastUpdated": "2025-04-15T20:00:00"
  },
  "rcb": {
    "label": "RCB Bowling (MI Innings)",
    "overs": [
      { "over": 1, "bowler": "Mohammed Siraj", "runs": 10, "wicket": false },
      { "over": 2, "bowler": "Josh Hazlewood",  "runs": 8,  "wicket": true  }
      ...
    ]
  },
  "mi": { ... }
}
```

- `over` — over number (1–20)
- `bowler` — bowler's full name
- `runs` — runs conceded in that over
- `wicket` — `true` if wicket taken, `false` otherwise

After editing, just **commit and push to GitHub**. Vercel auto-deploys in ~30 seconds.

---

## 💰 Google AdSense Setup

1. Apply at [adsense.google.com](https://adsense.google.com)
2. Once approved, get your **Publisher ID** (looks like `ca-pub-1234567890123456`)
3. In `index.html`, replace ALL instances of:
   ```
   ca-pub-XXXXXXXXXXXXXXXX
   ```
   with your actual publisher ID

4. Replace `data-ad-slot="XXXXXXXXXX"` with your actual ad slot IDs from AdSense dashboard

Ad placements already set up:
- **Top leaderboard** (728×90) — below hero
- **In-article** — between histogram and table
- **Sidebar rectangle** (300×250) — right sidebar
- **Footer leaderboard** (728×90) — above footer

---

## 🔍 SEO Checklist

- [x] Title tag with keywords
- [x] Meta description
- [x] Open Graph tags (Facebook/WhatsApp share)
- [x] Twitter Card tags
- [x] JSON-LD structured data (SportsEvent + WebSite)
- [x] Canonical URL
- [x] sitemap.xml
- [x] robots.txt
- [x] Mobile responsive
- [x] Fast loading (no heavy frameworks)
- [ ] Add your actual domain to canonical URL in `index.html`
- [ ] Submit sitemap to Google Search Console

---

## 📱 Mobile

Fully responsive. Tested breakpoints:
- 320px (small phones)
- 640px (large phones)
- 960px (tablets)
- 1200px (desktop)

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| HTML  | Semantic HTML5 |
| CSS   | Custom CSS with variables, no framework |
| JS    | Vanilla JavaScript (no dependencies) |
| Data  | JSON file |
| Hosting | Vercel (free tier) |
| Ads   | Google AdSense |
| Fonts | Google Fonts (Bebas Neue, Rajdhani, DM Sans) |
