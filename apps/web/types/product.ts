export type ProductImage = {
  id: number;
  image_url: string;
  sort_order: number;
};

export type ProductVariant = {
  id: number;
  product_id: number;
  name: string;
  unit: string;
  price: number;
  mrp: number;
  stock: number;
  is_default: boolean;
};

export type Product = {
  id: number;
  slug: string;
  name: string;
  category: string;
  description: string;
  image: string;
  images?: ProductImage[];
  variants?: ProductVariant[];
  price: number;
  mrp: number;
  discount: number;
  rating: number;
  reviews: number;
  stock: number;
  unit: string;
  deliveryTime: string;
  featured: boolean;
  bestseller: boolean;
};