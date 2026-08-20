import { HTMLAttributes, forwardRef, memo } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

export const Card = memo(forwardRef<HTMLDivElement, CardProps>(
  ({ hover = true, className = "", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`rounded-xl border border-gym-border bg-gym-surface ${hover ? "transition-all duration-300 hover:border-gym-border-light hover:bg-gym-elevated hover:shadow-lg" : ""} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
));

Card.displayName = "Card";
