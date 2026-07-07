import Section from "@/components/ui/Section";
import ProductCard from "@/components/product/ProductCard";
import { Product } from "@/types/product";

type Props = {
  title: string;
  subtitle?: string;
  products: Product[];
};

export default function ProductSection({
  title,
  subtitle,
  products,
}: Props) {
  if (products.length === 0) return null;

  return (
    <Section
      title={title}
      subtitle={subtitle}
    >
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
          />
        ))}
      </div>
    </Section>
  );
}