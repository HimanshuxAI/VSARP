import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "../../lib/utils"

/**
 * Button component with interactive Framer Motion hover & tap scaling effects.
 * Supports multiple design themes: default, destructive, outline, secondary, ghost, link, nebula, glass.
 */
const Button = React.forwardRef(({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    const Comp = asChild ? motion.div : motion.button

    const variants = {
        // Default: Solid Deep Black/Charcoal (High Premium)
        default: "bg-slate-900 text-white hover:bg-slate-800 shadow-sm font-semibold border border-transparent",
        destructive: "bg-red-600 text-white hover:bg-red-700 shadow-sm",
        // Outline: Slate border
        outline: "border border-slate-300 bg-transparent hover:bg-slate-50 text-slate-700",
        secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200 border border-slate-200",
        ghost: "hover:bg-slate-100 text-slate-600 hover:text-slate-900",
        link: "text-blue-600 underline-offset-4 hover:underline",
        // 'nebula': Mapped to a soft Blue action
        nebula: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm shadow-blue-500/20",
        glass: "bg-white/50 backdrop-blur-md border border-slate-200 text-slate-900 hover:bg-white/80 shadow-sm",
    }

    const sizes = {
        default: "h-10 px-6 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-12 rounded-lg px-8 text-md",
        icon: "h-10 w-10",
    }

    return (
        <Comp
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }
            }
            className={
                cn(
                    "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                    variants[variant],
                    sizes[size],
                    className
                )
            }
            ref={ref}
            {...props}
        />
    )
})
Button.displayName = "Button"

export { Button }
