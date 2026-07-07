type Props = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};

export default function Section({
  title,
  subtitle,
  children,
}: Props) {
  return (
    <section className="mx-auto mt-14 max-w-7xl px-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold">
          {title}
        </h2>

        {subtitle && (
          <p className="mt-2 text-gray-500">
            {subtitle}
          </p>
        )}
      </div>

      {children}
    </section>
  );
}