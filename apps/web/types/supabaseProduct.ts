export type SupabaseProduct = {
  id: number;
  name: string;
  slug: string;
  category: string;
  description: string;
  image: string;
  price: number;
  mrp: number;
  discount: number;
  rating: number;
  reviews: number;
  stock: number;
  unit: string;
  delivery_time: string;
  featured: boolean;
  bestseller: boolean;
  created_at: string;
};