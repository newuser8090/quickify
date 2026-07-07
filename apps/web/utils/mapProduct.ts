import { Product } from "@/types/product";
import { SupabaseProduct } from "@/types/supabaseProduct";

export function mapProduct(product: SupabaseProduct): Product {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    category: product.category,
    description: product.description,
    image: product.image,
    price: Number(product.price),
    mrp: Number(product.mrp),
    discount: Number(product.discount),
    rating: Number(product.rating),
    reviews: product.reviews,
    stock: product.stock,
    unit: product.unit,
    deliveryTime: product.delivery_time,
    featured: product.featured,
    bestseller: product.bestseller,
  };
}