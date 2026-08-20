import { HTMLAttributes } from "react";

type BadgeVariant = "default" | "premium" | "success" | "warning" | "error" | "info";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-gym-surface text-gym-text-secondary border border-gym-border",
  premium: "bg-gym-gold/15 text-gym-gold border border-gym-gold/30 uppercase tracking-wider text-[0.65rem] font-bold",
  success: "bg-gym-success/10 text-gym-success border border-gym-success/20",
  warning: "bg-gym-warning/10 text-gym-warning border border-gym-warning/20",
  error: "bg-gym-error/10 text-gym-error border border-gym-error/20",
  info: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
};

export function Badge({ variant = "default", className = "", children, ...props }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
