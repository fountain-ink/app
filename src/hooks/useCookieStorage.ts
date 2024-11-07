import { useCallback, useState } from "react";

import { getCookie, setCookie } from "cookies-next";
import { merge } from "lodash";

const isSsr = (): boolean => typeof window === "undefined";
const ssrCookies = isSsr() ? require("next/headers").cookies : undefined;

export function useCookieStorage<T>(key: string, initialValue?: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      return ssrCookies
        ? JSON.parse(ssrCookies().get(key)?.value)
        : // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
          JSON.parse(getCookie(key)?.toString()!);
    } catch {}

    return initialValue;
  });

  const setValue = useCallback(
    (value: Partial<T>, shouldMerge?: boolean) => {
      setStoredValue((prev) => {
        const newValue = shouldMerge && typeof value === "object" ? { ...merge(prev, value) } : value;

        // Save to cookies
        if (ssrCookies) {
          ssrCookies().set(key, JSON.stringify(newValue));
        } else {
          setCookie(key, JSON.stringify(newValue));
        }

        return newValue as T;
      });
    },
    [key],
  );

  return [storedValue, setValue] as const;
}
