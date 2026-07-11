import { supabase } from "@/lib/supabase";
import { adjustProductStock } from "@/services/inventoryService";
import { Product } from "@/types/product";
import { notifyUsersForRestockedProduct } from "@/services/stockNotificationAdminService";

export type ProductFormValues = Omit<Product, "id">;

export async function createProduct(values: ProductFormValues) {
  const { error } = await supabase.from("products").insert({
    name: values.name,
    slug: values.slug,
    category: values.category,
    description: values.description,
    image: values.image,
    price: values.price,
    mrp: values.mrp,
    discount: values.discount,
    rating: values.rating,
    reviews: values.reviews,
    stock: values.stock,
    unit: values.unit,
    delivery_time: values.deliveryTime,
    featured: values.featured,
    bestseller: values.bestseller,
  });

  if (error) throw error;
}

export async function updateProduct(id: number, values: ProductFormValues) {
  const { data: existingProduct, error: fetchError } = await supabase
    .from("products")
    .select("id, name, stock, low_stock_threshold")
    .eq("id", id)
    .single();

  if (fetchError) throw fetchError;

  const { error } = await supabase
    .from("products")
    .update({
      name: values.name,
      slug: values.slug,
      category: values.category,
      description: values.description,
      image: values.image,
      price: values.price,
      mrp: values.mrp,
      discount: values.discount,
      rating: values.rating,
      reviews: values.reviews,
      stock: values.stock,
      unit: values.unit,
      delivery_time: values.deliveryTime,
      featured: values.featured,
      bestseller: values.bestseller,
    })
    .eq("id", id);

  if (error) throw error;

  const previousStock = existingProduct.stock ?? 0;
  const newStock = values.stock ?? 0;

  if (previousStock !== newStock) {
    await adjustProductStock({
      productId: id,
      productName: values.name,
      currentStock: previousStock,
      newStock,
      lowStockThreshold: existingProduct.low_stock_threshold ?? 5,
      changeType:
        newStock > previousStock
          ? "restock"
          : newStock < previousStock
            ? "deduct"
            : "adjustment",
      note: "Stock changed from product edit page",
    });
  }
  if (previousStock <= 0 && newStock > 0) {
  await notifyUsersForRestockedProduct(id, values.name);
}
}

export async function deleteProduct(id: number) {
  const { error: imagesError } = await supabase
    .from("product_images")
    .delete()
    .eq("product_id", id);

  if (imagesError) {
    throw imagesError;
  }

  const { data, error } = await supabase
    .from("products")
    .delete()
    .eq("id", id)
    .select("id");

  if (error) {
    throw error;
  }

  if (!data || data.length === 0) {
    throw new Error(
      "Product was not deleted. Check the product delete permission."
    );
  }

  return data[0];
}