import { Account } from "@lens-protocol/client";
import { fetchAccount } from "@lens-protocol/client/actions";
import { create } from "zustand";
import { getPublicClient } from "@/lib/lens/client";

interface CachedAccount {
  account: Account | null;
  timestamp: number;
  error?: Error;
}

interface AccountCacheStore {
  accounts: Map<string, CachedAccount>;
  pending: Map<string, Promise<Account | null>>;

  // Actions
  fetchAccount: (address: string) => Promise<Account | null>;
  fetchAccountsBatch: (addresses: string[]) => Promise<Map<string, Account | null>>;
  clearCache: () => void;
  clearExpired: () => void;
}

// 24 hours in milliseconds
const CACHE_TTL = 24 * 60 * 60 * 1000;

export const useAccountCacheStore = create<AccountCacheStore>((set, get) => ({
  accounts: new Map(),
  pending: new Map(),

  fetchAccount: async (address: string) => {
    const normalizedAddress = address.toLowerCase();
    const state = get();

    // Check cache first
    const cached = state.accounts.get(normalizedAddress);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.account;
    }

    // Check if already fetching
    const pending = state.pending.get(normalizedAddress);
    if (pending) {
      return pending;
    }

    // Create new fetch promise
    const fetchPromise = (async () => {
      try {
        const client = getPublicClient();
        const result = await fetchAccount(client, {
          address: address as `0x${string}`,
        });

        const account = result.isOk() ? result.value : null;

        // Update cache
        set((state) => ({
          accounts: new Map(state.accounts).set(normalizedAddress, {
            account,
            timestamp: Date.now(),
          }),
        }));

        // Remove from pending
        set((state) => {
          const newPending = new Map(state.pending);
          newPending.delete(normalizedAddress);
          return { pending: newPending };
        });

        return account;
      } catch (error) {
        console.error(`Error fetching account ${address}:`, error);

        // Cache the error
        set((state) => ({
          accounts: new Map(state.accounts).set(normalizedAddress, {
            account: null,
            timestamp: Date.now(),
            error: error as Error,
          }),
        }));

        // Remove from pending
        set((state) => {
          const newPending = new Map(state.pending);
          newPending.delete(normalizedAddress);
          return { pending: newPending };
        });

        return null;
      }
    })();

    // Add to pending
    set((state) => ({
      pending: new Map(state.pending).set(normalizedAddress, fetchPromise),
    }));

    return fetchPromise;
  },

  fetchAccountsBatch: async (addresses: string[]) => {
    const uniqueAddresses = [...new Set(addresses.map((a) => a.toLowerCase()))];
    const results = new Map<string, Account | null>();

    // Fetch all accounts in parallel
    const promises = uniqueAddresses.map(async (address) => {
      const account = await get().fetchAccount(address);
      results.set(address, account);
    });

    await Promise.all(promises);
    return results;
  },

  clearCache: () => {
    set({ accounts: new Map(), pending: new Map() });
  },

  clearExpired: () => {
    const now = Date.now();
    set((state) => {
      const newAccounts = new Map();
      state.accounts.forEach((cached, address) => {
        if (now - cached.timestamp < CACHE_TTL) {
          newAccounts.set(address, cached);
        }
      });
      return { accounts: newAccounts };
    });
  },
}));
