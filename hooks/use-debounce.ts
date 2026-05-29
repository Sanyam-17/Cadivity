"use client"

import * as React from "react"

/**
 * Debounce hook — delays updating the value until after the specified delay.
 * Useful for search inputs to avoid firing API calls on every keystroke.
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value)

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}
