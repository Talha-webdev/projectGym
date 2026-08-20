import { ButtonHTMLAttributes, forwardRef, memo } from "react";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-gym-gold text-black font-semibold hover:bg-gym-gold-hover active:scale-[0.98] transition-all duration-200",
  secondary:
    "bg-gym-surface text-gym-text-primary font-medium hover:bg-gym-elevated active:scale-[0.98] transition-all duration-200",
  outline:
    "border border-gym-border text-gym-text-secondary font-medium hover:border-gym-gold hover:text-gym-gold active:scale-[0.98] transition-all duration-200",
  ghost:
    "text-gym-text-secondary font-medium hover:text-gym-gold hover:bg-gym-gold-muted active:scale-[0.98] transition-all duration-200",
  danger:
    "bg-gym-error/10 text-gym-error font-medium hover:bg-gym-error/20 active:scale-[0.98] transition-all duration-200",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm rounded-lg",
  md: "px-5 py-2.5 text-sm rounded-lg",
  lg: "px-7 py-3 text-base rounded-xl",
};

export const Button = memo(forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", isLoading, disabled, children, className = "", ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`inline-flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gym-gold focus-visible:ring-offset-2 focus-visible:ring-offset-gym-bg disabled:cursor-not-allowed disabled:opacity-50 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        {...props}
      >
        {isLoading && (
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
));

Button.displayName = "Button";
