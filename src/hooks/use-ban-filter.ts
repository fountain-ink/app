import { useCallback, useState } from "react";

export interface BanInfo {
  checkBanStatus: (addresses: string[]) => Promise<Record<string, boolean>>;
  bannedCache: Map<string, boolean>;
}

export function useBanFilter(): BanInfo {
  const [bannedCache] = useState(() => new Map<string, boolean>());

  const checkBanStatus = useCallback(
    async (addresses: string[]): Promise<Record<string, boolean>> => {
      const validAddresses = addresses.filter((addr) => addr != null);
      const uncheckedAddresses = validAddresses.filter((addr) => !bannedCache.has(addr.toLowerCase()));

      if (uncheckedAddresses.length === 0) {
        const result: Record<string, boolean> = {};
        validAddresses.forEach((addr) => {
          result[addr] = bannedCache.get(addr.toLowerCase()) || false;
        });
        return result;
      }

      try {
        const response = await fetch("/api/ban/check", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ addresses: uncheckedAddresses }),
        });

        if (!response.ok) {
          throw new Error("Failed to check ban status");
        }

        const banStatusMap: Record<string, boolean> = await response.json();

        // Update cache with new results
        Object.entries(banStatusMap).forEach(([addr, isBanned]) => {
          bannedCache.set(addr.toLowerCase(), isBanned);
        });

        // Return combined results
        const result: Record<string, boolean> = {};
        validAddresses.forEach((addr) => {
          result[addr] = bannedCache.get(addr.toLowerCase()) || false;
        });
        return result;
      } catch (err) {
        console.error("Error checking ban status:", err);
        // Return false for all addresses on error
        const result: Record<string, boolean> = {};
        validAddresses.forEach((addr) => {
          result[addr] = false;
        });
        return result;
      }
    },
    [bannedCache],
  );

  return {
    checkBanStatus,
    bannedCache,
  };
}

export async function filterBannedPosts<T extends { author?: { address?: string } }>(
  posts: readonly T[] | T[],
  checkBanStatus: (addresses: string[]) => Promise<Record<string, boolean>>,
): Promise<T[]> {
  if (posts.length === 0) return [];

  // Extract unique addresses from posts
  const addresses = [...new Set(posts.map((post) => post.author?.address).filter((addr) => addr != null))] as string[];

  // Check ban status for all addresses
  const banStatusMap = await checkBanStatus(addresses);

  // Filter out posts from banned addresses
  return posts.filter((post) => {
    const addr = post.author?.address;
    return !addr || !banStatusMap[addr];
  });
}
