import { useState, InputHTMLAttributes, forwardRef, memo } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = memo(forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", id, type, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
    const isPassword = type === "password";
    const [showPassword, setShowPassword] = useState(false);

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
          type={isPassword && showPassword ? "text" : type}
          className={`rounded-lg border bg-gym-surface px-4 py-2.5 text-sm text-gym-text-primary placeholder-gym-text-muted transition-all duration-200 focus:border-gym-gold focus:outline-none focus:ring-1 focus:ring-gym-gold ${
            error ? "border-gym-error" : "border-gym-border-light"
          } ${className}`}
          {...props}
        />
        {isPassword && (
          <label className="flex cursor-pointer items-center gap-2 text-xs text-gym-text-muted select-none">
            <input
              type="checkbox"
              checked={showPassword}
              onChange={() => setShowPassword((prev) => !prev)}
              className="h-3.5 w-3.5 rounded border-gym-border-light bg-gym-surface accent-gym-gold"
            />
            Show password
          </label>
        )}
        {error && <p className="text-xs text-gym-error">{error}</p>}
      </div>
    );
  }
));

Input.displayName = "Input";
