import type { Property } from "@/types/property";

export const mockProperties: Property[] = [
  {
    _id: "mock-1",
    title: "Sunset Villa",
    slug: "sunset-villa",
    location: "Goa, India",
    tagline: "A quiet coastal retreat with morning sunrises over the Arabian Sea",
    photos: [
      {
        _type: "image",
        url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=85",
        width: 1920,
        height: 1280,
      },
      {
        _type: "image",
        url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1920&q=85",
        width: 1920,
        height: 1280,
      },
      {
        _type: "image",
        url: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1920&q=85",
        width: 1920,
        height: 1280,
      },
    ],
    bedrooms: 2,
    sleeps: 4,
    amenities: ["Pool", "Sea View", "WiFi", "Parking"],
    order: 1,
  },
  {
    _id: "mock-2",
    title: "Mountain Hideaway",
    slug: "mountain-hideaway",
    location: "Manali, India",
    tagline: "Where the pine trees meet the clouds",
    photos: [
      {
        _type: "image",
        url: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=1920&q=85",
        width: 1920,
        height: 1280,
      },
      {
        _type: "image",
        url: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1920&q=85",
        width: 1920,
        height: 1280,
      },
      {
        _type: "image",
        url: "https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=1920&q=85",
        width: 1920,
        height: 1280,
      },
    ],
    bedrooms: 3,
    sleeps: 6,
    amenities: ["Fireplace", "Mountain View", "WiFi", "Garden"],
    order: 2,
  },
  {
    _id: "mock-3",
    title: "Urban Loft",
    slug: "urban-loft",
    location: "Mumbai, India",
    tagline: "City lights and skyline views from a designer penthouse",
    photos: [
      {
        _type: "image",
        url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1920&q=85",
        width: 1920,
        height: 1280,
      },
      {
        _type: "image",
        url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1920&q=85",
        width: 1920,
        height: 1280,
      },
      {
        _type: "image",
        url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=85",
        width: 1920,
        height: 1280,
      },
    ],
    bedrooms: 1,
    sleeps: 2,
    amenities: ["City View", "WiFi", "Gym Access", "Concierge"],
    order: 3,
  },
];
