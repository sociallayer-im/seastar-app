import * as React from "react"

import {cn} from "./utils"
import {cva, type VariantProps} from "class-variance-authority"

const inputVariants = cva(
    "inline-flex items-center rounded-lg border px-3 h-[3rem] focus-within:outline-none focus-within:border-primary",
    {
        variants: {
            variant: {
                default:
                    "bg-secondary border-secondary",
                textCenter: "bg-secondary border-secondary [&>input]:text-center",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement>, VariantProps<typeof inputVariants> {
    startAdornment?: React.ReactNode
    endAdornment?: React.ReactNode
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({className, variant, type, startAdornment, endAdornment, ...props}, ref) => {
        return (
            <div className={cn(inputVariants({variant}), className)}>
                {startAdornment}
                <input
                    type={type}
                    className="w-full flex-1 h-full bg-transparent outline-none mx-1"
                    ref={ref}
                    {...props}
                />
                {endAdornment}
            </div>
        )
    }
)
Input.displayName = "Input"

export {Input}
