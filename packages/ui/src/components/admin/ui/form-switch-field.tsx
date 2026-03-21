import * as React from "react"
import { 
    FormControl, 
    FormDescription, 
    FormField, 
    FormItem, 
    FormLabel 
} from "../../../form"
import { Switch } from "../../../switch"
import { cn } from "../../../lib/utils"

interface FormSwitchFieldProps {
    control: any
    name: string
    label: string
    description?: string
    className?: string
}

export function FormSwitchField({
    control,
    name,
    label,
    description,
    className
}: FormSwitchFieldProps) {
    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem className={cn(
                    "flex flex-row items-center justify-between rounded-lg border border-border/40 p-4 bg-primary/5 space-y-0 shadow-sm",
                    className
                )}>
                    <div className="space-y-0.5">
                        <FormLabel className="text-base font-medium cursor-pointer">
                            {label}
                        </FormLabel>
                        {description && (
                            <FormDescription className="text-sm">
                                {description}
                            </FormDescription>
                        )}
                    </div>
                    <FormControl>
                        <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                        />
                    </FormControl>
                </FormItem>
            )}
        />
    )
}
