"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check } from "lucide-react"

import { cn } from "./utils"

const Checkbox = ({ className, ref, ...props }: React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> & {
    ref?: React.Ref<React.ElementRef<typeof CheckboxPrimitive.Root>>
}) => (
    <CheckboxPrimitive.Root
        ref={ref}
        className={cn(
            "peer h-5 w-5 shrink-0 rounded-sm border border-[#E8E9E8] bg-gray-200 ring-offset-background focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-green-500 data-[state=checked]:text-white  data-[state=checked]:border-green-500",
            className
        )}
        {...props}
    >
        <CheckboxPrimitive.Indicator
            className={cn("flex items-center justify-center text-current")}
        >
            <Check className="h-5 w-5" />
        </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
)

export { Checkbox }
