# MyDiaries — Property Showcase Website Design Spec

## Purpose

MyDiaries is a portfolio/pitch website for a short-rental startup. The site showcases properties already onboarded with MyDiaries to convince new property owners to partner. It is not a booking platform — there are no reviews, no pricing, no guest-facing features. The audience is prospective property owners evaluating the quality of MyDiaries' management.

## Tech Stack

- **Frontend:** Next.js (React) with Static Site Generation (SSG)
- **CMS:** Sanity (content management + image CDN + embedded Studio)
- **Animations:** Framer Motion
- **Hosting:** Vercel (free tier)
- **Rebuild:** Sanity webhook triggers Vercel deploy hook on content publish (~30s rebuild)

## Site Structure

The site is a single-page immersive experience with vertical scroll-snapping. No traditional navigation (no navbar, no hamburger menu, no sidebar).

### Section 1: Hero

- Full viewport height
- MyDiaries logo in large editorial typography (Georgia or similar serif, black on white)
- A short tagline below the logo (managed via Sanity Site Settings)
- A subtle animated scroll indicator (thin line or small arrow pulsing downward)
- Clean white background, black text, nothing else

### Section 2: Properties (repeating)

One full-viewport section per property, scroll-snapping between them. Each section:

- **Full-bleed photo** filling the entire viewport as background
- **Gradient overlay** at the bottom (~30-40% height, fading from transparent to semi-black)
- **Property info on the overlay:**
  - Location (small uppercase, letterspaced, lighter color)
  - Property name (large serif heading)
  - Details line: bedrooms, amenities summary
  - Tagline/vibe description (italic, muted)
- **Stories-style progress bars** at the top — thin horizontal segments, one per photo. Active segment fills with a smooth animation. Tap/click left half of screen for previous photo, right half for next.
- **Property counter** fixed on screen (e.g., "02 / 03") — monospace, subtle

### Infinite Scroll

After the last property, the sequence seamlessly loops back to the first property. No footer, no hard stop — the experience is an endless reel of properties on both mobile and desktop. The property counter (e.g., "02 / 03") provides orientation so users always know where they are in the sequence.

## Photo Carousel

Each property has multiple photos displayed as a full-screen carousel within its scroll-snap section.

- **Navigation:** Tap/click left half for previous, right half for next (no visible buttons)
- **Indicator:** Instagram stories-style progress bars at the top of the viewport
- **Transition:** Crossfade between photos (not slide)
- **Swipe support:** Horizontal swipe on touch devices

### Aspect Ratio Handling

Property photos come in varying aspect ratios. The system handles mismatches to avoid aggressive cropping:

- **Primary:** `object-fit: cover` using Sanity's hotspot/crop feature. When uploading a photo in Sanity Studio, the user sets a focal point (hotspot). The CDN crops around that point at any viewport aspect ratio, ensuring the important part of the image is always visible.
- **Fallback for extreme mismatches:** When the aspect ratio mismatch between image and viewport exceeds ~30%, switch from `cover` to `object-fit: contain` with a blurred version of the same image as the background fill. This shows the full image without black bars — the same technique Instagram uses for portrait photos in landscape contexts.
- **Detection:** Compare `image aspect ratio / viewport aspect ratio`. If the result is between 0.7 and 1.3 (within 30% of each other), use `cover` + hotspot. Outside that range, use `contain` + blurred backdrop. This is calculated client-side on mount and window resize.

## Animations & Motion

Library: Framer Motion

- **Property-to-property scroll:** Smooth vertical snap with subtle parallax on the background image during transition
- **Photo-to-photo:** Crossfade transition between images
- **Hero → first property:** Tagline fades out, first property fades in on scroll
- **Progress bars:** Active segment fills left-to-right with smooth animation
- **Property info:** Staggered fade-in with slight upward drift when a property section snaps into view (name first, then location, then details)
- **Philosophy:** Every animation is subtle and purposeful. No bouncing, no dramatic zooms. Magazine page turns, not PowerPoint transitions.

## Visual Identity

**Mood:** Neutral & editorial

- **Background:** White (#FFFFFF)
- **Primary text:** Near-black (#111111)
- **Secondary text:** Medium gray (#999999)
- **Subtle elements:** Light gray (#F5F5F5)
- **Typography:** Serif for headings/brand (Georgia or similar), system sans-serif for body/details
- **Color philosophy:** No accent color. Black, white, and grays only. The property photos provide all the color.
- **Spacing:** Generous whitespace. Let elements breathe.

## Mobile Experience

Identical layout to desktop — full-bleed photos, gradient overlay, info at the bottom, stories-style progress bars. The immersive experience is preserved across all screen sizes.

- Tap left/right halves for photo navigation
- Vertical scroll-snap for property navigation with Instagram Reels-like feel — fast swipe momentum with snap into place
- **Infinite scroll:** Same as desktop — seamless loop after the last property
- Touch swipe supported for photo carousel (horizontal) and property navigation (vertical)
- Info text sizes scale down proportionally but remain readable

## Sanity CMS Schema

### Property Document

| Field       | Type            | Description                                                    |
|-------------|-----------------|----------------------------------------------------------------|
| `title`     | string          | Property name (e.g., "Sunset Villa")                           |
| `slug`      | slug            | Auto-generated from title, for future deep-linking             |
| `location`  | string          | Display location (e.g., "Goa, India")                          |
| `tagline`   | string          | Short vibe description, displayed in italic                    |
| `photos`    | array of images | Sanity image type with hotspot/crop support and CDN delivery   |
| `bedrooms`  | number          | Number of bedrooms                                             |
| `sleeps`    | number          | Maximum guest capacity                                         |
| `amenities` | array of strings| e.g., ["Pool", "Sea View", "WiFi", "Parking"]                 |
| `order`     | number          | Controls scroll order on the site                              |

### Site Settings Singleton

| Field             | Type   | Description                        |
|-------------------|--------|------------------------------------|
| `brandName`       | string | Defaults to "MyDiaries"            |
| `tagline`         | string | Hero section tagline               |
| `metaDescription` | string | SEO meta description               |

## Admin Interface

Sanity Studio embedded in the Next.js app at the `/studio` route. Protected by Sanity's built-in authentication.

Capabilities:
- Add, edit, delete properties
- Upload, reorder, crop photos with hotspot selection
- Edit site settings (tagline, meta description)
- Publish triggers automatic site rebuild via webhook

## Deployment & Infrastructure

- **Vercel** free tier for hosting and SSG builds
- **Sanity Cloud** free tier (3 users, 500k API requests/month, 10GB assets)
- **Sanity CDN** for automatic responsive image optimization
- **Rebuild trigger:** Sanity webhook → Vercel deploy hook on content publish
- **No databases, no servers, no ongoing cost** at current scale (3-25 properties)

## Out of Scope

- Contact form or any CTA
- Guest booking flow
- Reviews or ratings
- Search or filtering
- Pricing information
- Authentication beyond Sanity Studio access
- Multi-language support
