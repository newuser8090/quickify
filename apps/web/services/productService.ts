import { products } from "@/constants/products";

export const getAllProducts = () => products;

export const getProductById = (id: number) => {
  return products.find((product) => product.id === id);
};

export const getProductsByCategory = (category: string) => {
  return products.filter((product) => product.category === category);
};