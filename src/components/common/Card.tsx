import type { HTMLAttributes } from "react";

export function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`bg-white rounded-2xl border border-gray-200 shadow-sm p-5 ${className}`}
      {...props}
    />
  );
}
