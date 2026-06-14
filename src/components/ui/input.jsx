import * as React from "react"
import { cn } from "../../lib/utils"

/**
 * Generic single-line input field component with custom styles.
 * Fully supports type selection and native form validation props.
 */
const Input = React.forwardRef(({ className, type, ...props }, ref) => {
    return (
        <input
            type={type}
            className={cn(
                "flex h-12 w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 ring-offset-transparent file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/10 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 hover:border-slate-300 shadow-inner",
                className
            )}
            ref={ref}
            {...props}
        />
    )
})
Input.displayName = "Input"

export { Input }
