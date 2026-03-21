import * as React from "react"
import { cn } from "./lib/utils"

export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> { }

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, ...props }, ref) => {
        return (
            <input
                type={type}
                className={cn(
                    "flex h-11 w-full rounded-lg border border-border/40 bg-muted/40 px-4 py-2 text-base shadow-sm transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                    "autofill:shadow-[0_0_0_1000px_inset_hsl(var(--muted))] autofill:text-fill-foreground",
                    className
                )}
                ref={ref}
                {...props}
            />
        )
    }
)
Input.displayName = "Input"

interface InputWithIconProps extends InputProps {
    icon: React.ReactNode;
}

const InputWithIcon = React.forwardRef<HTMLInputElement, InputWithIconProps>(
    ({ className, icon, ...props }, ref) => {
        return (
            <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground select-none pointer-events-none">
                    {icon}
                </div>
                <Input
                    className={className}
                    style={{ paddingLeft: "3rem" }}
                    ref={ref}
                    {...props}
                />
            </div>
        )
    }
)
InputWithIcon.displayName = "InputWithIcon"

export { Input, InputWithIcon }


