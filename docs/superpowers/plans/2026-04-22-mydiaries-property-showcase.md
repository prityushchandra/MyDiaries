# MyDiaries Property Showcase Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an immersive, full-screen property showcase website for MyDiaries using Next.js, Sanity CMS, and Framer Motion.

**Architecture:** Single-page Next.js app with SSG. Sanity provides content management and image CDN. The homepage fetches all properties at build time and renders them as full-viewport scroll-snapping sections with photo carousels. Sanity Studio is embedded at `/studio` for content management.

**Tech Stack:** Next.js 15 (App Router, SSG), Sanity v3, Framer Motion, TypeScript, CSS Modules

---

## File Structure

```
website/
├── sanity/
│   ├── sanity.config.ts          — Sanity Studio configuration
│   ├── sanity.cli.ts             — Sanity CLI config
│   ├── schema/
│   │   ├── index.ts              — Schema registry (exports all schemas)
│   │   ├── property.ts           — Property document schema
│   │   └── site-settings.ts      — Site settings singleton schema
│   └── lib/
│       ├── client.ts             — Sanity client instance
│       ├── queries.ts            — GROQ queries
│       └── image.ts              — Image URL builder + hotspot helper
├── src/
│   ├── app/
│   │   ├── layout.tsx            — Root layout (fonts, metadata)
│   │   ├── page.tsx              — Homepage (SSG, fetches properties)
│   │   └── studio/
│   │       └── [[...tool]]/
│   │           └── page.tsx      — Sanity Studio embed
│   ├── components/
│   │   ├── HeroSection.tsx       — Hero section (logo, tagline, scroll indicator)
│   │   ├── HeroSection.module.css
│   │   ├── PropertySection.tsx   — Single property full-screen section
│   │   ├── PropertySection.module.css
│   │   ├── PhotoCarousel.tsx     — Stories-style photo carousel with tap navigation
│   │   ├── PhotoCarousel.module.css
│   │   ├── PropertyInfo.tsx      — Animated property info overlay
│   │   ├── PropertyInfo.module.css
│   │   ├── PropertyCounter.tsx   — "02 / 03" fixed counter
│   │   ├── PropertyCounter.module.css
│   │   ├── InfiniteScroller.tsx  — Scroll-snap container with infinite loop
│   │   └── InfiniteScroller.module.css
│   ├── hooks/
│   │   └── useAspectRatio.ts     — Aspect ratio detection for cover/contain switching
│   └── types/
│       └── property.ts           — TypeScript types for property data
├── package.json
├── tsconfig.json
├── next.config.ts
├── .env.local.example
└── .gitignore
```

---

### Task 1: Project Scaffolding & Dependencies

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.ts`
- Create: `.env.local.example`
- Create: `.gitignore`

- [ ] **Step 1: Initialize Next.js project**

Run:
```bash
npx create-next-app@latest . --typescript --app --src-dir --no-tailwind --eslint --no-import-alias --use-npm
```

When prompted, accept defaults. This creates the Next.js 15 project with App Router, TypeScript, ESLint, and `src/` directory.

Expected: Project files created, `node_modules/` installed.

- [ ] **Step 2: Install dependencies**

Run:
```bash
npm install sanity @sanity/client @sanity/image-url next-sanity framer-motion
```

Expected: All packages added to `package.json` dependencies.

- [ ] **Step 3: Create environment variable template**

Create `.env.local.example`:

```env
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2026-04-22
```

- [ ] **Step 4: Update `.gitignore`**

Append to the existing `.gitignore`:

```
# Sanity
.sanity/

# Superpowers
.superpowers/

# Environment
.env.local
```

- [ ] **Step 5: Create `next.config.ts`**

Replace the generated `next.config.ts` with:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
    ],
  },
};

export default nextConfig;
```

- [ ] **Step 6: Verify project runs**

Run:
```bash
npm run dev
```

Expected: Dev server starts at `http://localhost:3000`, default Next.js page loads.

- [ ] **Step 7: Commit**

```bash
git init
git add .
git commit -m "chore: scaffold Next.js project with Sanity and Framer Motion dependencies"
```

---

### Task 2: Sanity Schema & Client

**Files:**
- Create: `sanity/schema/property.ts`
- Create: `sanity/schema/site-settings.ts`
- Create: `sanity/schema/index.ts`
- Create: `sanity/lib/client.ts`
- Create: `sanity/lib/queries.ts`
- Create: `sanity/lib/image.ts`
- Create: `sanity/sanity.config.ts`
- Create: `sanity/sanity.cli.ts`
- Create: `src/types/property.ts`

- [ ] **Step 1: Create TypeScript types**

Create `src/types/property.ts`:

```ts
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";

export interface SanityImageWithHotspot extends SanityImageSource {
  hotspot?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  crop?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  asset: {
    _ref: string;
    metadata?: {
      dimensions: {
        width: number;
        height: number;
        aspectRatio: number;
      };
    };
  };
}

export interface Property {
  _id: string;
  title: string;
  slug: string;
  location: string;
  tagline: string;
  photos: SanityImageWithHotspot[];
  bedrooms: number;
  sleeps: number;
  amenities: string[];
  order: number;
}

export interface SiteSettings {
  brandName: string;
  tagline: string;
  metaDescription: string;
}
```

- [ ] **Step 2: Create property schema**

Create `sanity/schema/property.ts`:

```ts
import { defineType, defineField } from "sanity";

export const property = defineType({
  name: "property",
  title: "Property",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Property Name",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "location",
      title: "Location",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "tagline",
      title: "Tagline",
      type: "string",
      description: "Short vibe description, displayed in italic",
    }),
    defineField({
      name: "photos",
      title: "Photos",
      type: "array",
      of: [
        {
          type: "image",
          options: { hotspot: true },
        },
      ],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: "bedrooms",
      title: "Bedrooms",
      type: "number",
      validation: (rule) => rule.required().min(0),
    }),
    defineField({
      name: "sleeps",
      title: "Sleeps",
      type: "number",
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: "amenities",
      title: "Amenities",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "order",
      title: "Display Order",
      type: "number",
      description: "Lower numbers appear first",
      validation: (rule) => rule.required(),
    }),
  ],
  orderings: [
    {
      title: "Display Order",
      name: "orderAsc",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "location",
      media: "photos.0",
    },
  },
});
```

- [ ] **Step 3: Create site settings schema**

Create `sanity/schema/site-settings.ts`:

```ts
import { defineType, defineField } from "sanity";

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  fields: [
    defineField({
      name: "brandName",
      title: "Brand Name",
      type: "string",
      initialValue: "MyDiaries",
    }),
    defineField({
      name: "tagline",
      title: "Tagline",
      type: "string",
      description: "Displayed on the hero section",
    }),
    defineField({
      name: "metaDescription",
      title: "Meta Description",
      type: "string",
      description: "For SEO",
    }),
  ],
});
```

- [ ] **Step 4: Create schema index**

Create `sanity/schema/index.ts`:

```ts
import { property } from "./property";
import { siteSettings } from "./site-settings";

export const schemaTypes = [property, siteSettings];
```

- [ ] **Step 5: Create Sanity client**

Create `sanity/lib/client.ts`:

```ts
import { createClient } from "@sanity/client";

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION!,
  useCdn: true,
});
```

- [ ] **Step 6: Create GROQ queries**

Create `sanity/lib/queries.ts`:

```ts
export const allPropertiesQuery = `
  *[_type == "property"] | order(order asc) {
    _id,
    title,
    "slug": slug.current,
    location,
    tagline,
    photos[] {
      hotspot,
      crop,
      asset-> {
        _ref,
        metadata {
          dimensions {
            width,
            height,
            aspectRatio
          }
        }
      }
    },
    bedrooms,
    sleeps,
    amenities,
    order
  }
`;

export const siteSettingsQuery = `
  *[_type == "siteSettings"][0] {
    brandName,
    tagline,
    metaDescription
  }
`;
```

- [ ] **Step 7: Create image URL builder**

Create `sanity/lib/image.ts`:

```ts
import imageUrlBuilder from "@sanity/image-url";
import { client } from "./client";
import type { SanityImageWithHotspot } from "@/types/property";

const builder = imageUrlBuilder(client);

export function urlForImage(source: SanityImageWithHotspot) {
  return builder.image(source);
}

export function getImageDimensions(image: SanityImageWithHotspot): {
  width: number;
  height: number;
  aspectRatio: number;
} {
  const dimensions = image.asset?.metadata?.dimensions;
  if (dimensions) {
    return dimensions;
  }
  return { width: 1920, height: 1080, aspectRatio: 16 / 9 };
}
```

- [ ] **Step 8: Create Sanity config**

Create `sanity/sanity.config.ts`:

```ts
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schemaTypes } from "./schema";

export default defineConfig({
  name: "mydiaries",
  title: "MyDiaries Studio",
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  basePath: "/studio",
  plugins: [structureTool()],
  schema: {
    types: schemaTypes,
  },
});
```

- [ ] **Step 9: Create Sanity CLI config**

Create `sanity/sanity.cli.ts`:

```ts
import { defineCliConfig } from "sanity/cli";

export default defineCliConfig({
  api: {
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  },
});
```

- [ ] **Step 10: Commit**

```bash
git add sanity/ src/types/
git commit -m "feat: add Sanity schemas, client, queries, and TypeScript types"
```

---

### Task 3: Sanity Studio Embed

**Files:**
- Create: `src/app/studio/[[...tool]]/page.tsx`

- [ ] **Step 1: Create Studio page**

Create `src/app/studio/[[...tool]]/page.tsx`:

```tsx
"use client";

import { NextStudio } from "next-sanity/studio";
import config from "../../../../sanity/sanity.config";

export default function StudioPage() {
  return <NextStudio config={config} />;
}
```

- [ ] **Step 2: Verify Studio loads**

Run:
```bash
npm run dev
```

Navigate to `http://localhost:3000/studio`.

Expected: Sanity Studio loads with "Property" and "Site Settings" document types in the sidebar. (Note: you must first create a Sanity project at sanity.io/manage and add the project ID to `.env.local` for this to work. Create `.env.local` from `.env.local.example` and fill in your project credentials.)

- [ ] **Step 3: Commit**

```bash
git add src/app/studio/
git commit -m "feat: embed Sanity Studio at /studio route"
```

---

### Task 4: Root Layout & Global Styles

**Files:**
- Modify: `src/app/layout.tsx`
- Create: `src/app/globals.css` (replace generated content)

- [ ] **Step 1: Write root layout**

Replace `src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { client } from "../../sanity/lib/client";
import { siteSettingsQuery } from "../../sanity/lib/queries";
import type { SiteSettings } from "@/types/property";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const settings: SiteSettings | null = await client.fetch(siteSettingsQuery);
  return {
    title: settings?.brandName || "MyDiaries",
    description: settings?.metaDescription || "Spaces worth returning to",
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 2: Write global styles**

Replace `src/app/globals.css`:

```css
*,
*::before,
*::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --color-bg: #ffffff;
  --color-primary: #111111;
  --color-secondary: #999999;
  --color-subtle: #f5f5f5;
  --font-serif: Georgia, "Times New Roman", serif;
  --font-sans: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
}

html {
  scroll-behavior: smooth;
}

body {
  font-family: var(--font-sans);
  color: var(--color-primary);
  background: var(--color-bg);
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

- [ ] **Step 3: Verify layout renders**

Run:
```bash
npm run dev
```

Navigate to `http://localhost:3000`. Expected: blank white page with no default Next.js content, correct fonts applied.

- [ ] **Step 4: Commit**

```bash
git add src/app/layout.tsx src/app/globals.css
git commit -m "feat: add root layout with Sanity metadata and editorial global styles"
```

---

### Task 5: HeroSection Component

**Files:**
- Create: `src/components/HeroSection.tsx`
- Create: `src/components/HeroSection.module.css`

- [ ] **Step 1: Write HeroSection component**

Create `src/components/HeroSection.tsx`:

```tsx
"use client";

import { motion } from "framer-motion";
import styles from "./HeroSection.module.css";

interface HeroSectionProps {
  brandName: string;
  tagline: string;
}

export default function HeroSection({ brandName, tagline }: HeroSectionProps) {
  return (
    <section className={styles.hero}>
      <motion.h1
        className={styles.brand}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {brandName}
      </motion.h1>
      <motion.p
        className={styles.tagline}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
      >
        {tagline}
      </motion.p>
      <motion.div
        className={styles.scrollIndicator}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.0 }}
      >
        <motion.div
          className={styles.scrollLine}
          animate={{ y: [0, 12, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
    </section>
  );
}
```

- [ ] **Step 2: Write HeroSection styles**

Create `src/components/HeroSection.module.css`:

```css
.hero {
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--color-bg);
  position: relative;
  scroll-snap-align: start;
}

.brand {
  font-family: var(--font-serif);
  font-size: clamp(3rem, 8vw, 6rem);
  font-weight: 300;
  letter-spacing: -0.02em;
  color: var(--color-primary);
}

.tagline {
  font-family: var(--font-sans);
  font-size: clamp(0.85rem, 1.5vw, 1.1rem);
  color: var(--color-secondary);
  margin-top: 1rem;
  letter-spacing: 0.3em;
  text-transform: uppercase;
}

.scrollIndicator {
  position: absolute;
  bottom: 3rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.scrollLine {
  width: 1px;
  height: 40px;
  background: var(--color-secondary);
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/HeroSection.tsx src/components/HeroSection.module.css
git commit -m "feat: add HeroSection with animated brand name, tagline, and scroll indicator"
```

---

### Task 6: Aspect Ratio Hook

**Files:**
- Create: `src/hooks/useAspectRatio.ts`

- [ ] **Step 1: Write the hook**

Create `src/hooks/useAspectRatio.ts`:

```ts
import { useState, useEffect } from "react";

interface AspectRatioResult {
  mode: "cover" | "contain";
}

export function useAspectRatio(
  imageWidth: number,
  imageHeight: number
): AspectRatioResult {
  const [mode, setMode] = useState<"cover" | "contain">("cover");

  useEffect(() => {
    function calculate() {
      const imageRatio = imageWidth / imageHeight;
      const viewportRatio = window.innerWidth / window.innerHeight;
      const mismatch = imageRatio / viewportRatio;
      setMode(mismatch >= 0.7 && mismatch <= 1.3 ? "cover" : "contain");
    }

    calculate();
    window.addEventListener("resize", calculate);
    return () => window.removeEventListener("resize", calculate);
  }, [imageWidth, imageHeight]);

  return { mode };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/hooks/useAspectRatio.ts
git commit -m "feat: add useAspectRatio hook for cover/contain switching"
```

---

### Task 7: PhotoCarousel Component

**Files:**
- Create: `src/components/PhotoCarousel.tsx`
- Create: `src/components/PhotoCarousel.module.css`

- [ ] **Step 1: Write PhotoCarousel component**

Create `src/components/PhotoCarousel.tsx`:

```tsx
"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { urlForImage, getImageDimensions } from "../../sanity/lib/image";
import { useAspectRatio } from "@/hooks/useAspectRatio";
import type { SanityImageWithHotspot } from "@/types/property";
import styles from "./PhotoCarousel.module.css";

interface PhotoCarouselProps {
  photos: SanityImageWithHotspot[];
  propertyTitle: string;
}

function CarouselImage({
  photo,
  propertyTitle,
}: {
  photo: SanityImageWithHotspot;
  propertyTitle: string;
}) {
  const { width, height } = getImageDimensions(photo);
  const { mode } = useAspectRatio(width, height);
  const imageUrl = urlForImage(photo).width(1920).quality(85).url();
  const blurUrl = urlForImage(photo).width(100).quality(30).blur(50).url();

  const hotspot = photo.hotspot;
  const objectPosition = hotspot
    ? `${hotspot.x * 100}% ${hotspot.y * 100}%`
    : "center center";

  return (
    <div className={styles.imageWrapper}>
      {mode === "contain" && (
        <div
          className={styles.blurBackdrop}
          style={{ backgroundImage: `url(${blurUrl})` }}
        />
      )}
      <img
        src={imageUrl}
        alt={propertyTitle}
        className={styles.image}
        style={{
          objectFit: mode,
          objectPosition: mode === "cover" ? objectPosition : "center center",
        }}
      />
    </div>
  );
}

export default function PhotoCarousel({
  photos,
  propertyTitle,
}: PhotoCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const goNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < photos.length - 1 ? prev + 1 : prev));
  }, [photos.length]);

  const goPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);

  function handleClick(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    if (clickX < rect.width / 2) {
      goPrev();
    } else {
      goNext();
    }
  }

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goNext();
      else goPrev();
    }
    touchStartX.current = null;
  }

  return (
    <div
      className={styles.carousel}
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Progress bars */}
      <div className={styles.progressBars}>
        {photos.map((_, index) => (
          <div key={index} className={styles.progressSegment}>
            <div
              className={styles.progressFill}
              style={{
                transform: `scaleX(${index < currentIndex ? 1 : index === currentIndex ? 1 : 0})`,
                transition:
                  index === currentIndex
                    ? "transform 0.3s ease-out"
                    : "transform 0.15s ease-out",
              }}
            />
          </div>
        ))}
      </div>

      {/* Photo with crossfade */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          className={styles.photoContainer}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        >
          <CarouselImage
            photo={photos[currentIndex]}
            propertyTitle={propertyTitle}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
```

- [ ] **Step 2: Write PhotoCarousel styles**

Create `src/components/PhotoCarousel.module.css`:

```css
.carousel {
  position: absolute;
  inset: 0;
  cursor: pointer;
  user-select: none;
  -webkit-user-select: none;
}

.progressBars {
  position: absolute;
  top: 12px;
  left: 12px;
  right: 12px;
  display: flex;
  gap: 4px;
  z-index: 3;
}

.progressSegment {
  flex: 1;
  height: 2px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 1px;
  overflow: hidden;
}

.progressFill {
  width: 100%;
  height: 100%;
  background: #ffffff;
  border-radius: 1px;
  transform-origin: left;
}

.photoContainer {
  position: absolute;
  inset: 0;
}

.imageWrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

.blurBackdrop {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  filter: blur(30px);
  transform: scale(1.1);
}

.image {
  position: relative;
  width: 100%;
  height: 100%;
  display: block;
  z-index: 1;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/PhotoCarousel.tsx src/components/PhotoCarousel.module.css
git commit -m "feat: add PhotoCarousel with stories-style progress bars, tap navigation, and aspect ratio handling"
```

---

### Task 8: PropertyInfo Component

**Files:**
- Create: `src/components/PropertyInfo.tsx`
- Create: `src/components/PropertyInfo.module.css`

- [ ] **Step 1: Write PropertyInfo component**

Create `src/components/PropertyInfo.tsx`:

```tsx
"use client";

import { motion } from "framer-motion";
import type { Property } from "@/types/property";
import styles from "./PropertyInfo.module.css";

interface PropertyInfoProps {
  property: Property;
  isActive: boolean;
}

const staggerChildren = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export default function PropertyInfo({
  property,
  isActive,
}: PropertyInfoProps) {
  return (
    <motion.div
      className={styles.info}
      variants={staggerChildren}
      initial="hidden"
      animate={isActive ? "visible" : "hidden"}
    >
      <motion.p className={styles.location} variants={fadeUp}>
        {property.location}
      </motion.p>
      <motion.h2 className={styles.title} variants={fadeUp}>
        {property.title}
      </motion.h2>
      <motion.p className={styles.details} variants={fadeUp}>
        {property.bedrooms} Bedroom{property.bedrooms !== 1 ? "s" : ""}
        {property.amenities?.length > 0 &&
          ` · ${property.amenities.join(" · ")}`}
      </motion.p>
      {property.tagline && (
        <motion.p className={styles.tagline} variants={fadeUp}>
          &ldquo;{property.tagline}&rdquo;
        </motion.p>
      )}
    </motion.div>
  );
}
```

- [ ] **Step 2: Write PropertyInfo styles**

Create `src/components/PropertyInfo.module.css`:

```css
.info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 2rem 2rem 2.5rem;
  z-index: 2;
}

.location {
  font-size: clamp(0.65rem, 1vw, 0.75rem);
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 0.5rem;
}

.title {
  font-family: var(--font-serif);
  font-size: clamp(1.8rem, 4vw, 3rem);
  font-weight: 400;
  color: #ffffff;
  line-height: 1.1;
  margin-bottom: 0.75rem;
}

.details {
  font-size: clamp(0.75rem, 1.2vw, 0.9rem);
  color: rgba(255, 255, 255, 0.6);
  letter-spacing: 0.05em;
}

.tagline {
  font-size: clamp(0.8rem, 1.2vw, 0.95rem);
  color: rgba(255, 255, 255, 0.5);
  font-style: italic;
  margin-top: 0.75rem;
  line-height: 1.5;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/PropertyInfo.tsx src/components/PropertyInfo.module.css
git commit -m "feat: add PropertyInfo overlay with staggered fade-up animations"
```

---

### Task 9: PropertyCounter Component

**Files:**
- Create: `src/components/PropertyCounter.tsx`
- Create: `src/components/PropertyCounter.module.css`

- [ ] **Step 1: Write PropertyCounter component**

Create `src/components/PropertyCounter.tsx`:

```tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import styles from "./PropertyCounter.module.css";

interface PropertyCounterProps {
  current: number;
  total: number;
}

export default function PropertyCounter({
  current,
  total,
}: PropertyCounterProps) {
  const padded = String(current).padStart(2, "0");
  const totalPadded = String(total).padStart(2, "0");

  return (
    <div className={styles.counter}>
      <AnimatePresence mode="wait">
        <motion.span
          key={current}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className={styles.current}
        >
          {padded}
        </motion.span>
      </AnimatePresence>
      <span className={styles.separator}>/</span>
      <span className={styles.total}>{totalPadded}</span>
    </div>
  );
}
```

- [ ] **Step 2: Write PropertyCounter styles**

Create `src/components/PropertyCounter.module.css`:

```css
.counter {
  position: fixed;
  top: 1.5rem;
  right: 1.5rem;
  z-index: 10;
  font-family: "SF Mono", "Fira Code", "Fira Mono", monospace;
  font-size: 0.8rem;
  letter-spacing: 0.15em;
  color: rgba(255, 255, 255, 0.6);
  display: flex;
  align-items: center;
  gap: 0.3em;
  pointer-events: none;
}

.current {
  display: inline-block;
}

.separator {
  opacity: 0.4;
}

.total {
  opacity: 0.4;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/PropertyCounter.tsx src/components/PropertyCounter.module.css
git commit -m "feat: add PropertyCounter with animated number transition"
```

---

### Task 10: PropertySection Component

**Files:**
- Create: `src/components/PropertySection.tsx`
- Create: `src/components/PropertySection.module.css`

- [ ] **Step 1: Write PropertySection component**

This is the container that composes PhotoCarousel, PropertyInfo, and the gradient overlay for each property.

Create `src/components/PropertySection.tsx`:

```tsx
"use client";

import type { Property } from "@/types/property";
import PhotoCarousel from "./PhotoCarousel";
import PropertyInfo from "./PropertyInfo";
import styles from "./PropertySection.module.css";

interface PropertySectionProps {
  property: Property;
  isActive: boolean;
}

export default function PropertySection({
  property,
  isActive,
}: PropertySectionProps) {
  return (
    <section className={styles.section}>
      <PhotoCarousel photos={property.photos} propertyTitle={property.title} />
      <div className={styles.gradient} />
      <PropertyInfo property={property} isActive={isActive} />
    </section>
  );
}
```

- [ ] **Step 2: Write PropertySection styles**

Create `src/components/PropertySection.module.css`:

```css
.section {
  height: 100vh;
  width: 100%;
  position: relative;
  overflow: hidden;
  scroll-snap-align: start;
}

.gradient {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 40%;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.65), transparent);
  pointer-events: none;
  z-index: 1;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/PropertySection.tsx src/components/PropertySection.module.css
git commit -m "feat: add PropertySection composing carousel, gradient, and info overlay"
```

---

### Task 11: InfiniteScroller Component

**Files:**
- Create: `src/components/InfiniteScroller.tsx`
- Create: `src/components/InfiniteScroller.module.css`

- [ ] **Step 1: Write InfiniteScroller component**

This component wraps the hero and property sections in a scroll-snap container. It implements infinite looping by tripling the property list (prepend + original + append) and silently resetting scroll position when the user reaches the boundary clones.

Create `src/components/InfiniteScroller.tsx`:

```tsx
"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import type { Property } from "@/types/property";
import HeroSection from "./HeroSection";
import PropertySection from "./PropertySection";
import PropertyCounter from "./PropertyCounter";
import styles from "./InfiniteScroller.module.css";

interface InfiniteScrollerProps {
  properties: Property[];
  brandName: string;
  tagline: string;
}

export default function InfiniteScroller({
  properties,
  brandName,
  tagline,
}: InfiniteScrollerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activePropertyIndex, setActivePropertyIndex] = useState(-1);
  const isResettingRef = useRef(false);
  const propertyCount = properties.length;

  // Layout: [hero] [clone of last N props] [original props] [clone of first N props]
  // We clone the full set on each side to allow seamless looping.
  const sections = [
    ...properties.map((p, i) => ({ ...p, _loopKey: `pre-${i}` })),
    ...properties.map((p, i) => ({ ...p, _loopKey: `main-${i}` })),
    ...properties.map((p, i) => ({ ...p, _loopKey: `post-${i}` })),
  ];

  // Hero is section 0, then pre-clones start at 1, main set starts at 1 + propertyCount
  const mainStartIndex = 1 + propertyCount; // index in the scroll container (including hero)

  const resetToMain = useCallback(() => {
    const container = containerRef.current;
    if (!container || isResettingRef.current) return;

    const sectionHeight = window.innerHeight;
    // Current scroll section index (0 = hero)
    const currentSection = Math.round(container.scrollTop / sectionHeight);

    // Skip if we're on the hero or within the main section
    const heroSections = 1;
    const scrollSection = currentSection - heroSections; // property index in the tripled list

    if (scrollSection < 0) return; // on hero

    if (scrollSection < propertyCount) {
      // In pre-clone zone — jump to same property in main zone
      isResettingRef.current = true;
      const mainSection = scrollSection + propertyCount;
      container.scrollTop = (mainSection + heroSections) * sectionHeight;
      isResettingRef.current = false;
    } else if (scrollSection >= propertyCount * 2) {
      // In post-clone zone — jump to same property in main zone
      isResettingRef.current = true;
      const mainSection = scrollSection - propertyCount * 2;
      container.scrollTop = (mainSection + heroSections + propertyCount) * sectionHeight;
      isResettingRef.current = false;
    }
  }, [propertyCount]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Initialize scroll position to the start of the main section (after hero)
    const sectionHeight = window.innerHeight;
    container.scrollTop = mainStartIndex * sectionHeight;
    // Actually start at hero
    container.scrollTop = 0;

    function handleScroll() {
      if (isResettingRef.current) return;

      const sectionHeight = window.innerHeight;
      const currentSection = Math.round(container!.scrollTop / sectionHeight);

      if (currentSection === 0) {
        setActivePropertyIndex(-1); // hero
      } else {
        const propertyIdx = (currentSection - 1) % propertyCount;
        setActivePropertyIndex(propertyIdx);
      }
    }

    function handleScrollEnd() {
      resetToMain();
    }

    container.addEventListener("scroll", handleScroll, { passive: true });
    container.addEventListener("scrollend", handleScrollEnd);

    return () => {
      container.removeEventListener("scroll", handleScroll);
      container.removeEventListener("scrollend", handleScrollEnd);
    };
  }, [propertyCount, mainStartIndex, resetToMain]);

  const showCounter = activePropertyIndex >= 0;

  return (
    <div className={styles.container} ref={containerRef}>
      <HeroSection brandName={brandName} tagline={tagline} />
      {sections.map((property, index) => (
        <PropertySection
          key={property._loopKey}
          property={property}
          isActive={
            activePropertyIndex >= 0 &&
            index % propertyCount === activePropertyIndex
          }
        />
      ))}
      {showCounter && (
        <PropertyCounter
          current={activePropertyIndex + 1}
          total={propertyCount}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 2: Write InfiniteScroller styles**

Create `src/components/InfiniteScroller.module.css`:

```css
.container {
  height: 100vh;
  overflow-y: scroll;
  scroll-snap-type: y mandatory;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/InfiniteScroller.tsx src/components/InfiniteScroller.module.css
git commit -m "feat: add InfiniteScroller with scroll-snap and seamless property looping"
```

---

### Task 12: Homepage (SSG Data Fetching)

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Write the homepage**

Replace `src/app/page.tsx`:

```tsx
import { client } from "../../sanity/lib/client";
import { allPropertiesQuery, siteSettingsQuery } from "../../sanity/lib/queries";
import type { Property, SiteSettings } from "@/types/property";
import InfiniteScroller from "@/components/InfiniteScroller";

export const revalidate = false; // Full SSG — only rebuilds on deploy

export default async function HomePage() {
  const [properties, settings] = await Promise.all([
    client.fetch<Property[]>(allPropertiesQuery),
    client.fetch<SiteSettings | null>(siteSettingsQuery),
  ]);

  const brandName = settings?.brandName || "MyDiaries";
  const tagline = settings?.tagline || "Spaces worth returning to";

  if (!properties || properties.length === 0) {
    return (
      <main
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "var(--font-serif)",
          fontSize: "1.5rem",
          color: "var(--color-secondary)",
        }}
      >
        No properties yet. Add some in{" "}
        <a href="/studio" style={{ marginLeft: "0.4em", color: "var(--color-primary)" }}>
          /studio
        </a>
      </main>
    );
  }

  return (
    <main>
      <InfiniteScroller
        properties={properties}
        brandName={brandName}
        tagline={tagline}
      />
    </main>
  );
}
```

- [ ] **Step 2: Delete default page styles if they exist**

Run:
```bash
rm -f src/app/page.module.css
```

- [ ] **Step 3: Verify the page renders**

Run:
```bash
npm run dev
```

Navigate to `http://localhost:3000`. Expected: If no properties exist in Sanity yet, you see the "No properties yet" message with a link to `/studio`. If properties exist, you see the full immersive experience.

- [ ] **Step 4: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: add homepage with SSG data fetching and InfiniteScroller"
```

---

### Task 13: Build Verification & Cleanup

**Files:**
- Modify: `src/app/layout.tsx` (if needed)
- Delete: any remaining unused generated files

- [ ] **Step 1: Remove unused generated files**

Run:
```bash
rm -f src/app/favicon.ico public/next.svg public/vercel.svg public/file.svg public/globe.svg public/window.svg
```

- [ ] **Step 2: Run production build**

Run:
```bash
npm run build
```

Expected: Build completes without errors. The homepage is statically generated.

- [ ] **Step 3: Run production server to verify**

Run:
```bash
npm run start
```

Navigate to `http://localhost:3000`. Expected: Site loads with the hero section, scroll-snapping works, properties display with photo carousels.

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "chore: remove unused generated files and verify production build"
```

---

### Task 14: CLAUDE.md

**Files:**
- Create: `CLAUDE.md`

- [ ] **Step 1: Create CLAUDE.md**

Create `CLAUDE.md`:

```markdown
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
```

- [ ] **Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: add CLAUDE.md for Claude Code context"
```
