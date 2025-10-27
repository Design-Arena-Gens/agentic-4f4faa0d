"use client";

import { forwardRef } from "react";
import { clsx } from "clsx";

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  assistiveText?: string;
  error?: string;
}

export const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  ({ label, assistiveText, error, className, required, ...props }, ref) => {
    const id = props.id ?? props.name;
    return (
      <div className="space-y-2">
        <label
          htmlFor={id}
          className="block text-sm font-medium text-ink-700"
        >
          {label}
          {required && <span className="text-accent-500">*</span>}
        </label>
        <input
          ref={ref}
          id={id}
          required={required}
          className={clsx(
            "focus-ring w-full rounded-2xl border border-cream-200 bg-white px-4 py-3 text-sm text-ink-900 shadow-sm transition placeholder:text-ink-500",
            error && "border-red-400 focus:border-red-500 focus:outline-red-500",
            className
          )}
          {...props}
        />
        {assistiveText && !error && (
          <p className="text-xs text-ink-500">{assistiveText}</p>
        )}
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);

AuthInput.displayName = "AuthInput";
