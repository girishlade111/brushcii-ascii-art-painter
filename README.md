# Brushcii — ASCII Art Painter

A browser-based ASCII art painting studio. Draw pixel-style artwork using a huge
palette of ASCII characters, brushes, and shape tools — then copy or download
your art as plain text.

## What it does

Brushcii gives you a grid canvas where every cell holds one ASCII character.
Pick characters from a searchable palette (blocks, arrows, shapes, symbols,
borders, and more), paint with multiple brush sizes, draw rectangles and
circles, move selections, undo/redo — and export the finished piece as text.

## Features

- **Grid canvas** — resizable pixel-style canvas (default 16×16), cell-by-cell painting
- **ASCII character palette** — hundreds of characters organized by category
  (shapes, arrows, borders, symbols) with tags
- **Fuzzy search** — find the right character by name or tag (`lib/fuzzy-search.ts`)
- **Brush & eraser** — multiple brush sizes (1–4) plus an eraser tool
- **Shape tools** — rectangle, circle, and move tools
- **Undo / redo** — full history of canvas states
- **Zoom & pan helpers** — zoom in/out and preview options
- **Dark / light themes** — theme provider with system support
- **Copy & download** — export artwork to clipboard or save as a text file
- **Responsive UI** — shadcn/ui components (dialogs, popovers, tooltips, toasts)

## Tech stack

- **Next.js 14** (App Router, client-side rendering)
- **React 18** + TypeScript
- **Tailwind CSS 4** + shadcn/ui (Radix primitives)
- **Lucide React** icons
- **next-themes** for dark/light mode

## Quick start

Prerequisites: Node.js 18+ and npm (or pnpm).

```bash
# Install dependencies
npm install --legacy-peer-deps

# Run the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser and start painting.

```bash
# Production build
npm run build
npm start
```

## Project structure

```
app/
  layout.tsx      # Root layout, theme provider, global CSS
  page.tsx        # Main painter page — canvas state, history, dialogs
  globals.css     # Tailwind + theme tokens
components/
  canvas.tsx      # The paintable grid canvas
  toolbar.tsx     # Brush/size/tool selection
  header.tsx      # Title bar, copy/download, settings, help
  theme-provider.tsx
  ui/             # shadcn/ui primitives (button, dialog, popover, ...)
hooks/
  use-toast.ts    # Toast notifications
lib/
  ascii-data.ts   # ASCII character database (char + tags + category)
  fuzzy-search.ts # Character search logic
  utils.ts        # class-name helpers
public/           # Static assets (placeholder images)
next.config.mjs   # Next.js config (images unoptimized)
```

## Environment variables

None. The app is fully client-side with no backend, no API keys, and no secrets.

## Deployment

Static-friendly. The app has no API routes and no server actions, so it can be
exported to static HTML:

1. Add `output: "export"` to `next.config.mjs`
2. `npm run build` → the static site is emitted to `out/`
3. Host `out/` on any static host (Cloudflare Pages, Netlify, GitHub Pages)

For dynamic hosting, deploy as a normal Next.js app to Vercel (`next build` + `next start`).

## Credits

Built by Girish Lade — https://ladestack.in
