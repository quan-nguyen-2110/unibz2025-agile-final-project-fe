export interface Apartment {
  id: string;
  title: string;
  address: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  area: number;
  description: string;
  images: string[];
  availableFrom: Date;
  amenities: string[];
}
