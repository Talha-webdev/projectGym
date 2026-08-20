import { InputHTMLAttributes, forwardRef, memo } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = memo(forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-gym-text-secondary">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`rounded-lg border bg-gym-surface px-4 py-2.5 text-sm text-gym-text-primary placeholder-gym-text-muted transition-all duration-200 focus:border-gym-gold focus:outline-none focus:ring-1 focus:ring-gym-gold ${
            error ? "border-gym-error" : "border-gym-border-light"
          } ${className}`}
          {...props}
        />
        {error && <p className="text-xs text-gym-error">{error}</p>}
      </div>
    );
  }
));

Input.displayName = "Input";
