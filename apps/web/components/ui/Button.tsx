import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
};

export default function Button({
  className,
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "rounded-xl px-5 py-3 font-semibold transition-all duration-200",
        variant === "primary"
          ? "bg-green-600 text-white hover:bg-green-700"
          : "bg-gray-100 text-gray-800 hover:bg-gray-200",
        className
      )}
      {...props}
    />
  );
}