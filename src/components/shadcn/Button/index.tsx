import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../utils"

const buttonVariants = cva(
    "font-semibold inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-semibold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
    {
        variants: {
            variant: {
                primary: "bg-primary text-primary-foreground hover:brightness-95",
                special: "bg-special text-special-foreground hover:opacity-80",
                normal: "bg-foreground text-white hover:opacity-80",
                warm: "bg-[#fff5df] text-[#ffb230] hover:brightness-95",
                destructive:
                    "bg-destructive text-destructive-foreground hover:bg-destructive/90",
                outline:
                    "border border-foreground bg-background hover:bg-accent hover:opacity-80",
                secondary:
                    "bg-secondary text-secondary-foreground hover:brightness-95",
                ghost: "hover:bg-secondary hover:text-accent-foreground",
                link: "text-primary underline-offset-4 hover:underline",
                white: "bg-white text-foreground hover:brightness-90",
            },
            size: {
                default: "h-11 px-4 py-2",
                xs: "h-7 px-3",
                sm: "h-9 rounded-lg px-3",
                lg: "h-13 rounded-lg px-8",
                icon: "h-11 w-10",
            },
        },
        defaultVariants: {
            variant: "normal",
            size: "default",
        },
    }
)

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof buttonVariants> {
    asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button"
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button, buttonVariants }
