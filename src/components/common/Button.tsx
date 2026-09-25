import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-violet-600 text-white hover:bg-violet-700 disabled:bg-violet-300",
  secondary:
    "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 disabled:text-gray-300",
  danger: "bg-red-500 text-white hover:bg-red-600 disabled:bg-red-200",
  ghost: "bg-transparent text-gray-500 hover:bg-gray-100",
};

export function Button({
  variant = "primary",
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled}
      className={`px-4 py-2 rounded-xl font-medium text-sm transition-colors disabled:cursor-not-allowed ${variantClasses[variant]} ${className}`}
      {...props}
    />
  );
}
