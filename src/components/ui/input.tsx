import * as React from "react";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className = "", ...props }, ref) => {
    return <input ref={ref} className={`border px-3 py-2 rounded-md bg-[var(--surface)] border-[var(--surface-border)] ${className}`} {...props} />;
  }
);
Input.displayName = "Input";
