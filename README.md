# MyDiaries — Property Showcase Website

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:3000

---

## How to Update Properties

All property data lives in one file:

```
src/lib/mock-data.ts
```

---

### Update a Property's Images

Each property has a `photos` array. Replace the `url` values with your image URLs.

**Example — change Sunset Villa's first photo (line 13):**

```ts
{
  _type: "image",
  url: "https://your-new-image-url.com/photo.jpg",  // <-- change this
  width: 1920,   // <-- match your image's actual width
  height: 1280,  // <-- match your image's actual height
},
```

**Using local images:** Place your image in the `public/` folder and use:

```ts
url: "/my-property-photo.jpg",
```

**Where to find each property's photos in the file:**

| Property          | Photos array  |
|-------------------|---------------|
| Sunset Villa      | lines 10–29   |
| Mountain Hideaway | lines 41–59   |
| Urban Loft        | lines 72–90   |

---

### Update a Property's Details

Each property has these editable fields:

| Field      | What it does                              | Example                          |
|------------|-------------------------------------------|----------------------------------|
| `title`    | Property name shown on screen             | `"Sunset Villa"`                 |
| `slug`     | URL-friendly name (lowercase, hyphens)    | `"sunset-villa"`                 |
| `location` | Location text shown below the name        | `"Goa, India"`                   |
| `tagline`  | Italic description on the card            | `"A quiet coastal retreat..."`   |
| `bedrooms` | Number of bedrooms                        | `2`                              |
| `sleeps`   | Max guests                                | `4`                              |
| `amenities`| List of amenities shown on card           | `["Pool", "Sea View", "WiFi"]`   |
| `order`    | Scroll order (1 = first, 2 = second, ...) | `1`                              |

**Where to find each property's details:**

| Property          | Lines in file |
|-------------------|---------------|
| Sunset Villa      | 4–34          |
| Mountain Hideaway | 35–65         |
| Urban Loft        | 66–97         |

---

### Add a New Property (e.g., 4th property)

1. Open `src/lib/mock-data.ts`
2. Add a new object before the closing `];` at the end of the file:

```ts
  {
    _id: "mock-4",
    title: "Lakeside Cottage",
    slug: "lakeside-cottage",
    location: "Udaipur, India",
    tagline: "Wake up to the mirror-still waters of Lake Pichola",
    photos: [
      {
        _type: "image",
        url: "/cottage-1.jpg",
        width: 1920,
        height: 1280,
      },
      {
        _type: "image",
        url: "/cottage-2.jpg",
        width: 1920,
        height: 1280,
      },
    ],
    bedrooms: 2,
    sleeps: 3,
    amenities: ["Lake View", "WiFi", "Terrace"],
    order: 4,
  },
```

3. If using local images, place them in the `public/` folder.
4. Save. The site updates instantly via hot reload.

---

### Delete a Property

Remove the entire block `{ _id: "mock-X", ... },` from the array.

### Reorder Properties

Change the `order` field on each property. Lower numbers scroll first.

---

## Image Tips

- Use high-quality images (1920px wide recommended)
- Set `width` and `height` to the actual image dimensions for correct aspect ratio handling
- Landscape images (wider than tall) look best in the full-bleed layout
- You can use external URLs (Unsplash, Cloudinary, etc.) or local files in `public/`
- Each property should have at least 2–3 photos for the carousel

---

## Project Structure

```
src/
  lib/
    mock-data.ts       <-- ALL PROPERTY DATA LIVES HERE
  app/
    layout.tsx          root layout, fonts, metadata
    page.tsx            homepage
    globals.css         design tokens, global styles
  components/
    HeroSection.tsx     landing screen (feather, brand, taglines)
    InfiniteScroller    vertical Reels-style scroll with infinite loop
    PropertySection     full-screen property card
    PhotoCarousel       swipe photo navigation + lightbox
    PropertyInfo        animated text overlay on each card
  hooks/
    useAspectRatio.ts   cover vs contain display mode
  types/
    property.ts         TypeScript type definitions
public/
    feather.png         logo feather icon
    logo.png            full logo
```

## Commands

| Command         | What it does          |
|-----------------|-----------------------|
| `npm run dev`   | Start dev server      |
| `npm run build` | Production build      |
| `npm run start` | Serve production build|
| `npm run lint`  | Check code quality    |
