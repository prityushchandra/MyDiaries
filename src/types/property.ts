export interface MockImage {
  _type: "image";
  url: string;
  width: number;
  height: number;
}

export interface Property {
  _id: string;
  title: string;
  slug: string;
  location: string;
  tagline: string;
  photos: MockImage[];
  bedrooms: number;
  sleeps: number;
  amenities: string[];
  order: number;
}
