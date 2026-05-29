"use client"

import * as React from "react"

interface UseApiOptions<T> {
  /** URL to fetch from */
  url: string
  /** Whether to fetch immediately on mount */
  immediate?: boolean
  /** Default data value */
  defaultData?: T
  /** Query parameters */
  params?: Record<string, string | number | undefined>
}

interface UseApiReturn<T> {
  data: T | undefined
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useApi<T>({
  url,
  immediate = true,
  defaultData,
  params,
}: UseApiOptions<T>): UseApiReturn<T> {
  const [data, setData] = React.useState<T | undefined>(defaultData)
  const [loading, setLoading] = React.useState(immediate)
  const [error, setError] = React.useState<string | null>(null)

  const paramsString = React.useMemo(
    () => (params ? JSON.stringify(params) : ""),
    [params]
  )

  const buildUrl = React.useCallback(() => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== "") {
          searchParams.set(key, String(value))
        }
      })
    }
    const queryString = searchParams.toString()
    return queryString ? `${url}?${queryString}` : url
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, paramsString])

  const fetchData = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(buildUrl(), {
        headers: { "Content-Type": "application/json" },
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || `Request failed (${res.status})`)
      }
      const json = await res.json()
      setData(json)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }, [buildUrl])

  React.useEffect(() => {
    if (immediate) {
      fetchData()
    }
  }, [fetchData, immediate])

  return { data, loading, error, refetch: fetchData }
}

/** Mutation hook for POST/PATCH/DELETE operations */
interface UseMutationOptions {
  onSuccess?: (data: any) => void
  onError?: (error: string) => void
}

interface UseMutationReturn {
  mutate: (url: string, options?: RequestInit) => Promise<any>
  loading: boolean
  error: string | null
}

export function useMutation(opts?: UseMutationOptions): UseMutationReturn {
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const mutate = React.useCallback(
    async (url: string, fetchOpts?: RequestInit) => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(url, {
          headers: { "Content-Type": "application/json" },
          ...fetchOpts,
        })
        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          throw new Error(body.error || `Request failed (${res.status})`)
        }
        const data = await res.json().catch(() => ({}))
        opts?.onSuccess?.(data)
        return data
      } catch (err) {
        const message = err instanceof Error ? err.message : "An error occurred"
        setError(message)
        opts?.onError?.(message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [opts]
  )

  return { mutate, loading, error }
}
