import * as React from "react"

import {cn} from "./utils"
import {cva, type VariantProps} from "class-variance-authority"

const inputVariants = cva(
    "inline-flex items-center rounded-lg border focus-within:outline-hidden focus-within:border-primary",
    {
        variants: {
            variant: {
                default: "bg-secondary border-secondary",
                textCenter: "bg-secondary border-secondary [&>input]:text-center",
            },
            inputSize: {
                default: 'px-3 h-12 text-base',
                md:'px-2 h-10 text-sm',
                sm:'px-2 h-8 text-xs'
            }
        },
        defaultVariants: {
            variant: "default",
            inputSize: "default"
        },
    }
)

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement>, VariantProps<typeof inputVariants> {
    startAdornment?: React.ReactNode
    endAdornment?: React.ReactNode
}

const Input = ({className, variant, type, inputSize, startAdornment, endAdornment, ref, ...props}: InputProps & {ref?: React.Ref<HTMLInputElement>}) => {
    return (
        <div className={cn(inputVariants({variant, inputSize}), className)}>
            {startAdornment}
            <input
                type={type}
                className="w-full flex-1 h-full bg-transparent outline-hidden mx-1"
                ref={ref}
                {...props}
            />
            {endAdornment}
        </div>
    )
}

export {Input}
