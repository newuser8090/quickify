const categories = [
  { name: "Fruits", emoji: "🍎" },
  { name: "Vegetables", emoji: "🥦" },
  { name: "Dairy", emoji: "🥛" },
  { name: "Snacks", emoji: "🍿" },
  { name: "Beverages", emoji: "🥤" },
  { name: "Medicine", emoji: "💊" },
  { name: "Bakery", emoji: "🍞" },
];

export default function CategorySection() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-10">
      
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Shop by Category
      </h2>

      <div className="flex gap-4 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <div
            key={cat.name}
            className="min-w-[100px] flex flex-col items-center justify-center rounded-2xl border bg-white p-4 shadow-sm hover:shadow-md transition cursor-pointer"
          >
            <div className="text-3xl">{cat.emoji}</div>
            <p className="mt-2 text-sm font-medium text-gray-700">
              {cat.name}
            </p>
          </div>
        ))}
      </div>
      
    </section>
  );
}