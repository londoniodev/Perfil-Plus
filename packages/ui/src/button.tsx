import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./lib/utils";

/**
 * Button variants using class-variance-authority (cva)
 * Migrated from buttons.css to Tailwind CSS classes
 */
const buttonVariants = cva(
    // Base styles (from .btn)
    [
        "inline-flex items-center justify-center gap-2",
        "rounded-lg transition-all duration-200 cursor-pointer",
        "no-underline font-medium font-[family-name:var(--font-sans)]",
        "disabled:pointer-events-none disabled:opacity-50",
    ],
    {
        variants: {
            variant: {
                // Primary: Solid flat color, subtle interaction
                default: [
                    "bg-primary text-primary-foreground border border-transparent",
                    "shadow-[0_0_20px_hsl(var(--primary)/0.3)]",
                    "hover:bg-primary/90 hover:shadow-[0_0_25px_hsl(var(--primary)/0.4)]",
                    "active:scale-[0.98]",
                ],
                // Secondary: Clean border, transparent/dark background
                secondary: [
                    "bg-secondary/50 text-foreground",
                    "border border-border/40 backdrop-blur-sm",
                    "hover:bg-secondary/80 hover:border-foreground/20",
                    "active:scale-[0.98]",
                ],
                // Accent: Solid flat accent color
                accent: [
                    "bg-accent text-accent-foreground font-semibold",
                    "hover:bg-accent/90",
                    "active:scale-[0.98]",
                ],
                // Ghost: Minimalist hover effect
                ghost: [
                    "bg-transparent text-foreground",
                    "hover:bg-white/5",
                    "active:scale-[0.98]",
                ],
                // Outline: Clean border
                outline: [
                    "bg-transparent text-foreground",
                    "border border-border/40",
                    "hover:bg-white/5 hover:border-foreground/30",
                    "active:scale-[0.98]",
                ],
                // Filter: Flat pill style
                filter: [
                    "px-4 py-2 text-sm flex-shrink-0",
                    "bg-card text-foreground",
                    "border border-border/60 rounded-full",
                    "transition-colors duration-200",
                    "hover:bg-primary/10 hover:border-primary/50 hover:text-primary",
                    "data-[active=true]:bg-primary data-[active=true]:text-primary-foreground data-[active=true]:border-primary data-[active=true]:shadow-sm",
                ],
                // Pagination: Simple squared
                pagination: [
                    "px-4 py-2 text-sm",
                    "bg-card text-foreground",
                    "border border-border/40 rounded-md",
                    "hover:bg-secondary/50",
                    "disabled:opacity-40 disabled:hover:bg-card",
                ],
                // Link: Text only
                link: [
                    "text-primary underline-offset-4",
                    "hover:underline",
                    "p-0 h-auto",
                ],
                // Destructive: Flat red
                destructive: [
                    "bg-destructive text-destructive-foreground",
                    "hover:bg-destructive/90",
                ],
            },
            size: {
                default: "px-6 py-3 text-sm font-medium",
                sm: "px-4 py-2 text-sm rounded-lg",
                lg: "px-8 py-4 text-base rounded-xl",
                xl: "h-14 rounded-md px-8 text-lg",
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


