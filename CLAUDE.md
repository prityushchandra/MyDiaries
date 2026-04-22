# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

MyDiaries — an immersive property showcase website for a short-rental startup. Portfolio/pitch site to attract property owners, not a booking platform.

## Tech Stack

- Next.js 15 (App Router, SSG) + TypeScript
- Sanity v3 (CMS + image CDN + embedded Studio at `/studio`)
- Framer Motion (animations)
- CSS Modules (styling)
- Deployed on Vercel, rebuilt via Sanity webhook

## Commands

- `npm run dev` — start dev server (http://localhost:3000)
- `npm run build` — production build (SSG)
- `npm run start` — serve production build
- `npm run lint` — ESLint

## Architecture

Single-page immersive experience with vertical scroll-snapping:

1. **HeroSection** — brand + tagline + scroll indicator
2. **InfiniteScroller** — scroll-snap container that triples properties for seamless infinite loop
3. **PropertySection** — full-viewport section per property (composes PhotoCarousel + PropertyInfo + gradient)
4. **PhotoCarousel** — stories-style progress bars, tap left/right halves, crossfade transitions, aspect ratio detection (cover vs contain+blur)
5. **PropertyCounter** — fixed "02 / 03" indicator

Data flows: `page.tsx` (SSG fetch from Sanity) → `InfiniteScroller` → `PropertySection` → child components.

## Key Directories

- `sanity/` — Sanity config, schemas, client, GROQ queries, image helpers
- `src/components/` — all UI components with co-located CSS Modules
- `src/hooks/` — custom React hooks (useAspectRatio)
- `src/types/` — TypeScript interfaces

## Sanity

- Schemas: `property` (document), `siteSettings` (singleton)
- Studio embedded at `/studio` via `next-sanity`
- Image hotspot/crop configured on photo fields
- Environment variables: `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, `NEXT_PUBLIC_SANITY_API_VERSION`

## Visual Identity

Neutral & editorial: black (#111), white (#FFF), gray (#999). Serif headings (Georgia), system sans-serif body. No accent colors — property photos provide all color.
