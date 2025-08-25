"use client"

import * as React from "react"
import * as SwitchPrimitive from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        // Track
        "peer inline-flex h-6 w-10 shrink-0 items-center rounded-full border border-transparent transition-colors outline-none shadow-xs",
        // Visible states
        "bg-input data-[state=checked]:bg-primary dark:bg-input/80",
        // Focus ring
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        // Disabled
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          // Knob
          "pointer-events-none block h-5 w-5 rounded-full ring-0 shadow transition-transform",
          // Colors
          "bg-background dark:data-[state=unchecked]:bg-foreground dark:data-[state=checked]:bg-primary-foreground",
          // Position
          "translate-x-0 data-[state=checked]:translate-x-4"
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
