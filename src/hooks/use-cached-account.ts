import { useEffect, useState } from "react"
import { Account } from "@lens-protocol/client"
import { useAccountCacheStore } from "@/stores/account-cache-store"

export function useCachedAccount(address?: string) {
  const [account, setAccount] = useState<Account | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  
  const fetchAccount = useAccountCacheStore((state) => state.fetchAccount)
  const cachedAccount = useAccountCacheStore((state) => 
    address ? state.accounts.get(address.toLowerCase()) : undefined
  )

  useEffect(() => {
    if (!address) {
      setAccount(null)
      setLoading(false)
      return
    }

    const loadAccount = async () => {
      try {
        setLoading(true)
        setError(null)
        const result = await fetchAccount(address)
        setAccount(result)
      } catch (err) {
        setError(err as Error)
        setAccount(null)
      } finally {
        setLoading(false)
      }
    }

    // Always load - the store handles caching
    loadAccount()
  }, [address, fetchAccount])

  return { account, loading, error }
}

export function useCachedAccounts(addresses: string[]) {
  const [accounts, setAccounts] = useState<Map<string, Account | null>>(new Map())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  
  const fetchAccountsBatch = useAccountCacheStore((state) => state.fetchAccountsBatch)

  useEffect(() => {
    if (addresses.length === 0) {
      setAccounts(new Map())
      setLoading(false)
      return
    }

    const loadAccounts = async () => {
      try {
        setLoading(true)
        setError(null)
        const results = await fetchAccountsBatch(addresses)
        setAccounts(results)
      } catch (err) {
        setError(err as Error)
        setAccounts(new Map())
      } finally {
        setLoading(false)
      }
    }

    loadAccounts()
  }, [JSON.stringify(addresses), fetchAccountsBatch])

  return { accounts, loading, error }
}