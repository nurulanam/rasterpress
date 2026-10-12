# Rasterpress

**Free, unlimited PDF to image converter — JPG, PNG & WebP — right in your browser.**

🌐 **Live:** [rasterpress.vercel.app](https://rasterpress.vercel.app/)

> No uploads. No sign-up. No watermarks. No page limits. 100% private by architecture.

---

## ✨ Features

- 🆓 **Completely free** — no hidden fees, no premium tier, no daily quotas
- ♾️ **Unlimited** — no file-size caps, no page limits, convert as much as you need
- 🖼️ **Three output formats** — JPG (lossy), PNG (lossless), WebP (modern)
- 🔍 **Up to 216 DPI** — print-grade resolution (1×, 1.5×, 2×, 3× scale options)
- 🎚️ **Adjustable quality** — fine-tune compression for JPG and WebP
- 📦 **One-click ZIP export** — download all converted pages in a single archive
- 🔒 **100% client-side** — files are processed in your browser via PDF.js and the Canvas API; nothing ever leaves your device
- ⚡ **Fast** — ~0.2s per page
- 📄 **Single-file build** — the entire app ships as one self-contained `index.html`

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| UI Framework | React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Animations | Framer Motion |
| PDF Engine | PDF.js (`pdfjs-dist`) |
| ZIP Packing | JSZip |
| Build Tool | Vite + `vite-plugin-singlefile` |
| Icons | Lucide React |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm

### Install

```bash
npm install
```

### Development

```bash
npm run dev
```

Opens at `http://localhost:5173`.

### Production Build

```bash
npm run build
```

Outputs a single self-contained file at `dist/index.html` — JS, CSS, and the PDF.js worker are all inlined. Just drop it anywhere to serve it; no web server configuration needed.

### Preview Build

```bash
npm run preview
```

Serves the production build locally at `http://localhost:4173`.

---

## 📁 Project Structure

```
rasterpress/
├── index.html              # Entry point + all SEO meta tags
├── src/
│   ├── main.tsx            # React root
│   ├── App.tsx             # Application state & orchestration
│   ├── index.css           # Design tokens + global styles (Tailwind v4)
│   ├── components/
│   │   ├── Nav.tsx         # Top navigation bar
│   │   ├── Hero.tsx        # Landing page (drop zone, steps, FAQ, footer)
│   │   ├── Controls.tsx    # Format / quality / scale / selection sidebar
│   │   ├── PageCard.tsx    # Individual page preview card
│   │   └── BottomBar.tsx   # Sticky convert & download action bar
│   ├── lib/
│   │   └── pdf.ts          # PDF.js loading, rendering, ZIP export helpers
│   └── utils/
│       └── cn.ts           # clsx + tailwind-merge utility
├── public/                 # Static assets
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## 🔒 Privacy

Rasterpress is **private by architecture**, not just by policy:

- The PDF.js worker is bundled inline — no CDN requests
- No analytics, no tracking, no telemetry
- No server to upload to — the app has no backend
- Files exist only in your browser's memory for the duration of the session

---

## 📄 License

Copyright © 2025 [Oblique Code](https://github.com/Oblique-Code). All rights reserved.

Designed & developed by [nurulanam](https://github.com/nurulanam).
