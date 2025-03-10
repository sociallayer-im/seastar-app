import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "./utils"

const badgeVariants = cva(
    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
    {
        variants: {
            variant: {
                default:
                    "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
                secondary:
                    "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
                destructive:
                    "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
                outline: "text-foreground border-foreground",
                ongoing: "border-transparent bg-[var(--ongoing-background)] text-[var(--ongoing-foreground)]",
                past: "border-transparent bg-[var(--past-background)] text-[var(--past-foreground)]",
                upcoming: "border-transparent bg-[var(--upcoming-background)] text-[var(--upcoming-foreground)]",
                hosting: 'border-transparent bg-[#e7f4ff] text-[#5992ff]',
                pending: 'border-transparent bg-[#fff7e8] text-[#e7c54e]',
                cancel: 'border-transparent bg-[#bdbdbd] text-[#fff]',
                joining: 'border-transparent bg-[#feeeee] text-[#ab2323]',
                private: 'border-transparent bg-[#f8f2ff] text-[#c863ff]',
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
        VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
    return (
        <div className={cn(badgeVariants({ variant }), className)} {...props} />
    )
}

export { Badge, badgeVariants }
