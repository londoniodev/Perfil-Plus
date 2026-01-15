import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Button variants using class-variance-authority (cva)
 * Migrated from buttons.css to Tailwind CSS classes
 */
const buttonVariants = cva(
    // Base styles (from .btn)
    [
        "inline-flex items-center justify-center gap-3",
        "px-8 py-4 text-base font-semibold",
        "rounded-xl transition-all duration-300 cursor-pointer",
        "no-underline font-[family-name:var(--font-sans)] tracking-[0.01em]",
        "disabled:pointer-events-none disabled:opacity-50",
    ],
    {
        variants: {
            variant: {
                // .btn-primary - Gradient blue with shadow
                default: [
                    "bg-gradient-to-br from-primary to-primary-dark",
                    "text-white border border-white/10",
                    "shadow-[0_4px_15px_rgba(58,98,184,0.3)]",
                    "hover:brightness-110 hover:-translate-y-0.5",
                    "hover:shadow-[0_8px_25px_rgba(58,98,184,0.5)]",
                ],
                // .btn-secondary - Glassmorphism
                secondary: [
                    "bg-white/[0.03] text-foreground",
                    "border border-border backdrop-blur-sm",
                    "hover:bg-white/[0.08] hover:border-foreground-muted",
                    "hover:-translate-y-0.5",
                ],
                // .btn-accent - Golden gradient
                accent: [
                    "bg-gradient-to-br from-accent to-[#d49024]",
                    "text-[#0f1419] font-bold",
                    "shadow-[0_4px_15px_rgba(232,168,56,0.3)]",
                    "hover:brightness-110 hover:-translate-y-0.5",
                    "hover:shadow-[0_8px_25px_rgba(232,168,56,0.5)]",
                ],
                // .btn-ghost - Transparent
                ghost: [
                    "bg-transparent text-foreground-muted",
                    "border border-transparent",
                    "hover:text-foreground hover:bg-white/5",
                ],
                // .btn-outline-primary
                outline: [
                    "bg-transparent text-primary-light",
                    "border border-primary",
                    "hover:bg-primary/10 hover:-translate-y-0.5",
                ],
                // .btn-filter - For tab filters
                filter: [
                    "px-4 py-2 text-sm",
                    "bg-card-bg text-foreground",
                    "border border-border rounded-md",
                    "transition-all duration-150 shrink-0",
                    "hover:bg-card-bg-hover",
                    "data-[active=true]:bg-accent data-[active=true]:text-white",
                ],
                // .btn-pagination
                pagination: [
                    "px-4 py-2 text-sm",
                    "bg-card-bg text-foreground",
                    "border border-border rounded-md",
                    "transition-all duration-150",
                    "hover:bg-card-bg-hover",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                ],
                // Link style - no background
                link: [
                    "text-primary underline-offset-4",
                    "hover:underline",
                ],
                // Destructive - for dangerous actions
                destructive: [
                    "bg-error text-white",
                    "hover:bg-error/90",
                ],
            },
            size: {
                default: "px-8 py-4 text-base",
                sm: "px-5 py-2 text-sm rounded-lg",
                lg: "px-10 py-5 text-lg",
                icon: "h-10 w-10 p-0",
            },
            fullWidth: {
                true: "w-full",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    /** Render as a different element (e.g., Link) */
    asChild?: boolean;
    /** Active state for filter buttons */
    active?: boolean;
}

/**
 * Premium Button component with multiple variants and sizes.
 * Supports polymorphism via asChild prop for use with Next.js Link.
 *
 * @example
 * // Primary button
 * <Button>Click me</Button>
 *
 * // Accent button with icon
 * <Button variant="accent">
 *   <IconCalendar /> Schedule
 * </Button>
 *
 * // As a Next.js Link
 * <Button asChild variant="secondary">
 *   <Link href="/about">Learn More</Link>
 * </Button>
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, fullWidth, asChild = false, active, ...props }, ref) => {
        const Comp = asChild ? Slot : "button";
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, fullWidth, className }))}
                ref={ref}
                data-active={active}
                {...props}
            />
        );
    }
);
Button.displayName = "Button";

export { Button, buttonVariants };
